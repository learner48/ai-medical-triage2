import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { FileText, Download, Filter } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';

interface ReportFilters {
  startDate: string;
  endDate: string;
  urgencyLevel?: string;
  status?: string;
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: adminData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!adminData?.organization_id) {
        throw new Error('Organization not found');
      }

      // Build query
      let query = supabase
        .from('triage_sessions')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            date_of_birth
          ),
          users!assigned_clinician_user_id (
            id,
            full_name
          )
        `)
        .eq('organization_id', adminData.organization_id)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate);

      if (filters.urgencyLevel) {
        query = query.eq('urgency_level', filters.urgencyLevel);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data: sessions, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Generate CSV
      const csvContent = generateCSV(sessions);
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `triage_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (sessions: any[]) => {
    const headers = [
      'Date',
      'Patient Name',
      'Patient DOB',
      'Initial Symptoms',
      'Urgency Level',
      'Status',
      'Assigned Clinician',
      'Resolution Time (min)'
    ];

    const rows = sessions.map(session => [
      format(new Date(session.created_at), 'yyyy-MM-dd HH:mm:ss'),
      `${session.patients?.first_name} ${session.patients?.last_name}`,
      session.patients?.date_of_birth || 'N/A',
      session.initial_symptoms_description,
      session.urgency_level,
      session.status,
      session.users?.full_name || 'Unassigned',
      session.end_time
        ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000 / 60)
        : 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 text-gray-600">Generate detailed reports of your organization's activity</p>
          </div>
          <FileText className="h-8 w-8 text-gray-400" />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Report Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency Level
              </label>
              <select
                value={filters.urgencyLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, urgencyLevel: e.target.value || undefined }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Levels</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="initiated">Initiated</option>
                <option value="in_progress">In Progress</option>
                <option value="pending_review">Pending Review</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorMessage message={error} />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="sm\" className="mr-2" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Report Types
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Triage Activity Report</h3>
              <p className="mt-1 text-sm text-gray-600">
                Detailed breakdown of all triage sessions, including patient details, urgency levels, and outcomes.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Clinician Performance Report</h3>
              <p className="mt-1 text-sm text-gray-600">
                Analysis of clinician response times, case loads, and resolution rates.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Usage Metrics Report</h3>
              <p className="mt-1 text-sm text-gray-600">
                Overview of system usage, including API calls, video minutes, and notifications sent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}