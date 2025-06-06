import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useSuperAdminStore } from '../../../store/super-admin';

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { subscriptionPlans, loading, error, fetchSubscriptionPlans } = useSuperAdminStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSubscriptionPlans();
    } catch (err) {
      console.error('Error deleting subscription plan:', err);
      alert('Failed to delete subscription plan');
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
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="mt-2 text-gray-600">Manage available subscription plans</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Plan
          </Button>
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="h-6 w-6 text-primary-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/super-admin/billing/plans/${plan.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="h-4 w-4 text-semantic-critical" />
                    </Button>
                  </div>
                </div>

                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Monthly Price</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${plan.base_price_monthly}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm text-gray-500">Billing Model</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {plan.billing_models?.model_type || 'N/A'}
                    </dd>
                  </div>

                  {plan.features_json && (
                    <div>
                      <dt className="text-sm text-gray-500">Features</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        <ul className="list-disc list-inside">
                          {Object.entries(plan.features_json).map(([key, value]) => (
                            <li key={key}>{value}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm text-gray-500">EHR Integration</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {plan.can_integrate_ehr ? 'Available' : 'Not Available'}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}