import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { useSuperAdminStore } from '../../../store/super-admin';

export default function BillingModels() {
  const navigate = useNavigate();
  const { billingModels, loading, error, fetchBillingModels } = useSuperAdminStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchBillingModels();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this billing model?')) return;

    try {
      const { error } = await supabase
        .from('billing_models')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBillingModels();
    } catch (err) {
      console.error('Error deleting billing model:', err);
      alert('Failed to delete billing model');
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing Models</h1>
            <p className="mt-2 text-gray-600">Manage billing models for subscription plans</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Billing Model
          </Button>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billingModels.map((model) => (
              <div
                key={model.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-primary-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {model.model_type}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/super-admin/billing/models/${model.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(model.id)}
                    >
                      <Trash2 className="h-4 w-4 text-semantic-critical" />
                    </Button>
                  </div>
                </div>

                <dl className="space-y-2">
                  {model.per_triage_rate_usd && (
                    <div>
                      <dt className="text-sm text-gray-500">Per Triage Rate</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        ${model.per_triage_rate_usd}
                      </dd>
                    </div>
                  )}

                  {model.included_triages_quota && (
                    <div>
                      <dt className="text-sm text-gray-500">Included Triages</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {model.included_triages_quota}
                      </dd>
                    </div>
                  )}

                  {model.volume_tier_definition_json && (
                    <div>
                      <dt className="text-sm text-gray-500">Volume Tiers</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(model.volume_tier_definition_json, null, 2)}
                        </pre>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}