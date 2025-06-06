import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { BarChart, LineChart, Calendar, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  triagesByDay: { date: string; count: number }[];
  urgencyDistribution: { level: string; count: number }[];
  avgResponseTime: number;
  completionRate: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<AnalyticsData>({
    triagesByDay: [],
    urgencyDistribution: [],
    avgResponseTime: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
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

      const daysToSubtract = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysToSubtract);

      // Fetch triage sessions for the period
      const { data: sessions } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('organization_id', adminData.organization_id)
        .gte('created_at', startDate.toISOString());

      if (!sessions) {
        throw new Error('Failed to fetch triage sessions');
      }

      // Process data for charts
      const triagesByDay = processTriagesByDay(sessions);
      const urgencyDistribution = processUrgencyDistribution(sessions);
      const avgResponseTime = calculateAvgResponseTime(sessions);
      const completionRate = calculateCompletionRate(sessions);

      setData({
        triagesByDay,
        urgencyDistribution,
        avgResponseTime,
        completionRate
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processTriagesByDay = (sessions: any[]) => {
    const counts = sessions.reduce((acc: any, session) => {
      const date = format(new Date(session.created_at), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([date, count]) => ({
      date,
      count: count as number
    }));
  };

  const processUrgencyDistribution = (sessions: any[]) => {
    const counts = sessions.reduce((acc: any, session) => {
      acc[session.urgency_level] = (acc[session.urgency_level] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([level, count]) => ({
      level,
      count: count as number
    }));
  };

  const calculateAvgResponseTime = (sessions: any[]) => {
    const responseTimes = sessions.map(session => {
      const start = new Date(session.start_time);
      const end = session.end_time ? new Date(session.end_time) : null;
      return end ? (end.getTime() - start.getTime()) / 1000 / 60 : null;
    }).filter(time => time !== null);

    return responseTimes.length > 0
      ? responseTimes.reduce((a, b) => (a || 0) + (b || 0), 0) / responseTimes.length
      : 0;
  };

  const calculateCompletionRate = (sessions: any[]) => {
    const completed = sessions.filter(s => s.status === 'resolved').length;
    return sessions.length > 0 ? (completed / sessions.length) * 100 : 0;
  };

  const handleExportData = async () => {
    try {
      // Generate CSV content
      const csvContent = generateCSVContent(data);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics_${timeframe}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  const generateCSVContent = (data: AnalyticsData) => {
    const headers = ['Date', 'Triage Count', 'Urgency Level', 'Count'];
    const rows = data.triagesByDay.map(day => [
      day.date,
      day.count,
      '',
      ''
    ]);
    
    data.urgencyDistribution.forEach((dist, i) => {
      if (rows[i]) {
        rows[i][2] = dist.level;
        rows[i][3] = dist.count;
      } else {
        rows.push(['', '', dist.level, dist.count]);
      }
    });

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-gray-600">Track your organization's performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === '7d'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === '30d'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setTimeframe('90d')}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeframe === '90d'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                90D
              </button>
            </div>
            <Button
              onClick={handleExportData}
              variant="secondary"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-primary-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Triages</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.triagesByDay.reduce((sum, day) => sum + day.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <BarChart className="h-8 w-8 text-semantic-high" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(data.avgResponseTime)} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <LineChart className="h-8 w-8 text-semantic-moderate" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(data.completionRate)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <BarChart className="h-8 w-8 text-semantic-low" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.urgencyDistribution.find(d => d.level === 'critical')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Triages by Day
                </h2>
                <div className="h-64">
                  {/* Implement chart visualization here */}
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(data.triagesByDay, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Urgency Distribution
                </h2>
                <div className="h-64">
                  {/* Implement chart visualization here */}
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(data.urgencyDistribution, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}