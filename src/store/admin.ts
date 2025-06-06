import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AdminState {
  organizationId: string | null;
  loading: boolean;
  error: string | null;
  stats: {
    totalUsers: number;
    activeClinicians: number;
    totalPatients: number;
    triageSessionsToday: number;
  };
  fetchStats: () => Promise<void>;
  setOrganizationId: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  organizationId: null,
  loading: false,
  error: null,
  stats: {
    totalUsers: 0,
    activeClinicians: 0,
    totalPatients: 0,
    triageSessionsToday: 0,
  },

  setOrganizationId: (id) => set({ organizationId: id }),

  fetchStats: async () => {
    set({ loading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get organization ID for the admin
      const { data: adminData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!adminData?.organization_id) {
        throw new Error('Organization not found');
      }

      set({ organizationId: adminData.organization_id });

      // Fetch users count
      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .eq('organization_id', adminData.organization_id);

      // Fetch today's triage sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todaySessions } = await supabase
        .from('triage_sessions')
        .select('id')
        .eq('organization_id', adminData.organization_id)
        .gte('created_at', today.toISOString());

      set({
        stats: {
          totalUsers: users?.length || 0,
          activeClinicians: users?.filter(u => u.role === 'clinician').length || 0,
          totalPatients: users?.filter(u => u.role === 'patient').length || 0,
          triageSessionsToday: todaySessions?.length || 0
        },
        loading: false
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      set({ 
        error: 'Failed to load dashboard statistics',
        loading: false
      });
    }
  }
}));