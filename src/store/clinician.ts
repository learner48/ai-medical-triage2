import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { TriageSession } from '../types';

interface CaseFilters {
  urgency?: 'critical' | 'high' | 'moderate' | 'low';
  status?: TriageSession['status'];
  searchTerm?: string;
}

interface ClinicianState {
  cases: TriageSession[];
  loading: boolean;
  error: string | null;
  filters: CaseFilters;
  setFilters: (filters: CaseFilters) => void;
  fetchCases: () => Promise<void>;
  claimCase: (sessionId: string) => Promise<void>;
  updateCaseStatus: (sessionId: string, status: TriageSession['status']) => Promise<void>;
}

export const useClinicianStore = create<ClinicianState>((set, get) => ({
  cases: [],
  loading: false,
  error: null,
  filters: {},

  setFilters: (filters) => {
    set({ filters });
    get().fetchCases();
  },

  fetchCases: async () => {
    set({ loading: true, error: null });

    try {
      // Get clinician's location and licensing info
      const { data: { user } } = await supabase.auth.getUser();
      const { data: clinician } = await supabase
        .from('users')
        .select('primary_practice_address_json, licensing_jurisdictions')
        .eq('id', user?.id)
        .single();

      if (!clinician?.primary_practice_address_json || !clinician?.licensing_jurisdictions) {
        throw new Error('Clinician location or licensing information not found');
      }

      // Build query based on filters
      let query = supabase
        .from('triage_sessions')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            date_of_birth,
            medical_history_json,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: false });

      const { filters } = get();
      
      if (filters.urgency) {
        query = query.eq('urgency_level', filters.urgency);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter cases based on location and licensing
      const filteredCases = data.filter(session => {
        const patientLocation = session.patient_current_location_json;
        const clinicianLocation = clinician.primary_practice_address_json;

        // Check if patient is in a licensed state
        const isLicensedState = clinician.licensing_jurisdictions.includes(
          patientLocation.state
        );

        // Calculate distance (50-mile radius)
        const distance = calculateDistance(
          clinicianLocation.latitude,
          clinicianLocation.longitude,
          patientLocation.latitude,
          patientLocation.longitude
        );

        return isLicensedState && distance <= 50;
      });

      set({ cases: filteredCases, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cases', loading: false });
      console.error('Error fetching cases:', error);
    }
  },

  claimCase: async (sessionId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('triage_sessions')
        .update({
          status: 'assigned',
          assigned_clinician_user_id: user?.id
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Refresh cases list
      get().fetchCases();
    } catch (error) {
      console.error('Error claiming case:', error);
      throw error;
    }
  },

  updateCaseStatus: async (sessionId, status) => {
    try {
      const { error } = await supabase
        .from('triage_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Refresh cases list
      get().fetchCases();
    } catch (error) {
      console.error('Error updating case status:', error);
      throw error;
    }
  }
}));

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}