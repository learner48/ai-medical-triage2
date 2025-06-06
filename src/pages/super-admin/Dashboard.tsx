import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorMessage } from '../../components/ui/error-message';
import { Building2, Users, Activity, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalTriages: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
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

      setStats({
        totalOrganizations: orgCount || 0,
        totalUsers: userCount || 0,
        totalTriages: triageCount || 0,
        activeSubscriptions: subCount || 0
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Global platform management and analytics</p>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-primary-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Organizations</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalOrganizations}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-semantic-high" />
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
                  <Activity className="h-8 w-8 text-semantic-moderate" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Triages</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalTriages}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-semantic-low" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.activeSubscriptions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Management</h2>
                <div className="space-y-4">
                  <Button
                    onClick={() => window.location.href = '/super-admin/organizations'}
                    className="w-full flex items-center justify-center"
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    Manage Organizations
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/super-admin/organizations/new'}
                    className="w-full flex items-center justify-center"
                  >
                    Add Organization
                  </Button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
                <div className="space-y-4">
                  <Button
                    onClick={() => window.location.href = '/super-admin/users'}
                    className="w-full flex items-center justify-center"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/super-admin/users/new'}
                    className="w-full flex items-center justify-center"
                  >
                    Add User
                  </Button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
                <div className="space-y-4">
                  <Button
                    onClick={() => window.location.href = '/super-admin/settings'}
                    className="w-full flex items-center justify-center"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Global Settings
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/super-admin/audit-logs'}
                    className="w-full flex items-center justify-center"
                  >
                    View Audit Logs
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}