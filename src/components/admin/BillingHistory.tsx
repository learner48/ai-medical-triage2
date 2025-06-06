import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { Receipt } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BillingHistoryProps {
  organizationId: string;
}

export function BillingHistory({ organizationId }: BillingHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingRecords, setBillingRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchBillingHistory();
  }, [organizationId]);

  const fetchBillingHistory = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('triage_billing_records')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setBillingRecords(data || []);
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setError('Failed to load billing history');
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
        <Receipt className="h-6 w-6 text-primary-500 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">
          Billing History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billingRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.processed_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${record.billed_amount_usd}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.billing_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Processed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}