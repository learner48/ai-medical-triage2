import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { UrgencyBadge } from '../ui/urgency-badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { Clock, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TriageSession } from '../../types';

export function CaseList() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');

  useEffect(() => {
    fetchTriageSessions();
  }, [filter]);

  const fetchTriageSessions = async () => {
    try {
      // Get current user's location and licensing jurisdictions
      const { data: { user } } = await supabase.auth.getUser();
      const { data: clinician } = await supabase
        .from('users')
        .select('primary_practice_address_json, licensing_jurisdictions')
        .eq('id', user?.id)
        .single();

      if (!clinician?.primary_practice_address_json || !clinician?.licensing_jurisdictions) {
        throw new Error('Clinician location or licensing information not found');
      }

      let query = supabase
        .from('triage_sessions')
        .select(`
          *,
          patients (
            first_name,
            last_name,
            date_of_birth
          )
        `)
        .in('status', ['initiated', 'in_progress', 'pending_review'])
        .order('created_at', { ascending: true });

      if (filter === 'critical') {
        query = query.eq('urgency_level', 'critical');
      } else if (filter === 'high') {
        query = query.eq('urgency_level', 'high');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filter cases based on 50-mile radius and licensing
      const filteredSessions = data?.filter(session => {
        const patientLocation = session.patient_current_location_json;
        const clinicianLocation = clinician.primary_practice_address_json;

        // Check if patient is in a licensed state
        const isLicensedState = clinician.licensing_jurisdictions.includes(
          patientLocation.state
        );

        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          clinicianLocation.latitude,
          clinicianLocation.longitude,
          patientLocation.latitude,
          patientLocation.longitude
        );

        return isLicensedState && distance <= 50;
      });

      setSessions(filteredSessions || []);
    } catch (err) {
      setError('Failed to fetch triage sessions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleClaimCase = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('triage_sessions')
        .update({
          status: 'assigned',
          assigned_clinician_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', sessionId);

      if (error) throw error;
      navigate(`/clinician/cases/${sessionId}`);
    } catch (err) {
      console.error('Error claiming case:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
          <p className="mt-2 text-gray-600">Review and manage patient triage cases within your jurisdiction</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-semantic-critical" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessions.filter(s => s.urgency_level === 'critical').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-semantic-moderate" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(sessions.map(s => s.patient_id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
            >
              All Cases
            </Button>
            <Button
              variant={filter === 'critical' ? 'primary' : 'secondary'}
              onClick={() => setFilter('critical')}
            >
              Critical Only
            </Button>
            <Button
              variant={filter === 'high' ? 'primary' : 'secondary'}
              onClick={() => setFilter('high')}
            >
              High Priority
            </Button>
          </div>
        </div>

        {/* Case List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {error ? (
            <div className="p-6">
              <ErrorMessage message={error} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No cases found matching the selected filter
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.patients?.first_name} {session.patients?.last_name}
                        </h3>
                        <UrgencyBadge level={session.urgency_level} />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Initial Symptoms: {session.initial_symptoms_description}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Started {new Date(session.start_time).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleClaimCase(session.id)}
                      size="sm"
                    >
                      Claim Case
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}