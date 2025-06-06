import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { Activity } from 'lucide-react';
import { getUsageMetrics } from '../../lib/usage-tracking';

interface UsageMetricsProps {
  organizationId: string;
}

export function UsageMetrics({ organizationId }: UsageMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, [organizationId]);

  const fetchMetrics = async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const data = await getUsageMetrics(
        organizationId,
        startDate.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load usage metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Activity className="h-6 w-6 text-primary-500 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">
          Usage Metrics (Last 30 Days)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600">Total Triages</p>
          <p className="text-2xl font-semibold text-gray-900">
            {metrics.filter(m => m.metric_type === 'triage_count')
              .reduce((sum, m) => sum + m.value, 0)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600">Video Minutes</p>
          <p className="text-2xl font-semibold text-gray-900">
            {metrics.filter(m => m.metric_type === 'video_minutes')
              .reduce((sum, m) => sum + m.value, 0)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-600">EHR API Calls</p>
          <p className="text-2xl font-semibold text-gray-900">
            {metrics.filter(m => m.metric_type === 'ehr_api_calls')
              .reduce((sum, m) => sum + m.value, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}