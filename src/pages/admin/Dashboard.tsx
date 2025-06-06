import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorMessage } from '../../components/ui/error-message';
import { Users, Building2, Activity, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeClinicians: 0,
    totalPatients: 0,
    triageSessionsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
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

      setStats({
        totalUsers: users?.length || 0,
        activeClinicians: users?.filter(u => u.role === 'clinician').length || 0,
        totalPatients: users?.filter(u => u.role === 'patient').length || 0,
        triageSessionsToday: todaySessions?.length || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your organization's users and settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-semantic-high" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clinicians</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeClinicians}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-semantic-moderate" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPatients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-semantic-low" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.triageSessionsToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/admin/users'}
                className="w-full flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/admin/users/new'}
                className="w-full flex items-center justify-center"
              >
                Add New User
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Settings</h2>
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/admin/settings'}
                className="w-full flex items-center justify-center"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configure Settings
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/admin/integrations'}
                className="w-full flex items-center justify-center"
              >
                Manage Integrations
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/admin/analytics'}
                className="w-full flex items-center justify-center"
              >
                <Activity className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/admin/reports'}
                className="w-full flex items-center justify-center"
              >
                Generate Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}