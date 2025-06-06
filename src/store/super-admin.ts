import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SuperAdminState {
  loading: boolean;
  error: string | null;
  stats: {
    totalOrganizations: number;
    totalUsers: number;
    totalTriages: number;
    activeSubscriptions: number;
  };
  billingModels: any[];
  subscriptionPlans: any[];
  fetchStats: () => Promise<void>;
  fetchBillingModels: () => Promise<void>;
  fetchSubscriptionPlans: () => Promise<void>;
  createBillingModel: (data: any) => Promise<void>;
  createSubscriptionPlan: (data: any) => Promise<void>;
}

export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  loading: false,
  error: null,
  stats: {
    totalOrganizations: 0,
    totalUsers: 0,
    totalTriages: 0,
    activeSubscriptions: 0
  },
  billingModels: [],
  subscriptionPlans: [],

  fetchStats: async () => {
    set({ loading: true, error: null });

    try {
      // Fetch organizations count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscriptions count
      const { count: subCount } = await supabase
        .from('organization_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total triages count
      const { count: triageCount } = await supabase
        .from('triage_sessions')
        .select('*', { count: 'exact', head: true });

      set({
        stats: {
          totalOrganizations: orgCount || 0,
          totalUsers: userCount || 0,
          totalTriages: triageCount || 0,
          activeSubscriptions: subCount || 0
        },
        loading: false
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      set({ 
        error: 'Failed to load dashboard statistics',
        loading: false
      });
    }
  },

  fetchBillingModels: async () => {
    try {
      const { data, error } = await supabase
        .from('billing_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ billingModels: data || [] });
    } catch (err) {
      console.error('Error fetching billing models:', err);
      set({ error: 'Failed to load billing models' });
    }
  },

  fetchSubscriptionPlans: async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select(`
          *,
          billing_models (*)
        `)
        .order('base_price_monthly', { ascending: true });

      if (error) throw error;
      set({ subscriptionPlans: data || [] });
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      set({ error: 'Failed to load subscription plans' });
    }
  },

  createBillingModel: async (data) => {
    try {
      const { error } = await supabase
        .from('billing_models')
        .insert([data]);

      if (error) throw error;
      get().fetchBillingModels();
    } catch (err) {
      console.error('Error creating billing model:', err);
      throw err;
    }
  },

  createSubscriptionPlan: async (data) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([data]);

      if (error) throw error;
      get().fetchSubscriptionPlans();
    } catch (err) {
      console.error('Error creating subscription plan:', err);
      throw err;
    }
  }
}));