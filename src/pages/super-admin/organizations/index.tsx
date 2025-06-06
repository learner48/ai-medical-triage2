import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { Building2, Search, Edit, Trash2, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Organization {
  id: string;
  name: string;
  type: string;
  subscription_id: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function OrganizationManagement() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_subscriptions (
            status,
            plan_id
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrganizations(data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;
      
      // Refresh organization list
      fetchOrganizations();
    } catch (err) {
      console.error('Error deleting organization:', err);
      alert('Failed to delete organization');
    }
  };

  const handleApproveOrganization = async (orgId: string) => {
    try {
      // Update organization status
      const { error: orgError } = await supabase
        .from('organizations')
        .update({ approval_status: 'approved' })
        .eq('id', orgId);

      if (orgError) throw orgError;

      // Activate associated admin users
      const { error: userError } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('organization_id', orgId)
        .eq('role', 'admin');

      if (userError) throw userError;

      // TODO: Send approval notification email to organization admin

      // Refresh organization list
      fetchOrganizations();
    } catch (err) {
      console.error('Error approving organization:', err);
      alert('Failed to approve organization');
    }
  };

  const handleRejectOrganization = async (orgId: string) => {
    if (!confirm('Are you sure you want to reject this organization?')) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ approval_status: 'rejected' })
        .eq('id', orgId);

      if (error) throw error;

      // TODO: Send rejection notification email to organization admin

      // Refresh organization list
      fetchOrganizations();
    } catch (err) {
      console.error('Error rejecting organization:', err);
      alert('Failed to reject organization');
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_subscriptions (
            status,
            plan_id,
            start_date,
            end_date
          ),
          users (
            id
          )
        `);

      if (!data) return;

      const csvContent = generateCSV(data);
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `organizations_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  const generateCSV = (data: any[]) => {
    const headers = [
      'Organization Name',
      'Type',
      'Subscription Status',
      'Users Count',
      'Created Date'
    ];

    const rows = data.map(org => [
      org.name,
      org.type || 'N/A',
      org.organization_subscriptions?.[0]?.status || 'No Subscription',
      org.users?.length || 0,
      new Date(org.created_at).toLocaleDateString()
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || org.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || org.approval_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
            <p className="mt-2 text-gray-600">Manage all organizations in the platform</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleExportData}
              variant="secondary"
              className="flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={() => navigate('/super-admin/organizations/new')}
              className="flex items-center"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Add Organization
            </Button>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="hospital">Hospitals</option>
                    <option value="clinic">Clinics</option>
                    <option value="practice">Medical Practices</option>
                  </select>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {org.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {org.type || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          org.subscription_id
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {org.subscription_id ? 'Active' : 'No Subscription'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(org.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          org.approval_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : org.approval_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.approval_status.charAt(0).toUpperCase() + org.approval_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {org.approval_status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveOrganization(org.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectOrganization(org.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/super-admin/organizations/${org.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrganization(org.id)}
                          >
                            <Trash2 className="h-4 w-4 text-semantic-critical" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}