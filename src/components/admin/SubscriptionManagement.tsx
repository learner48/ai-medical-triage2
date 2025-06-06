import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { CreditCard, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getSubscriptionDetails, updateSubscription } from '../../lib/revenuecat';

interface SubscriptionManagementProps {
  organizationId: string;
}

export function SubscriptionManagement({ organizationId }: SubscriptionManagementProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscriptionDetails();
    fetchAvailablePlans();
  }, [organizationId]);

  const fetchSubscriptionDetails = async () => {
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('subscription_id')
        .eq('id', organizationId)
        .single();

      if (orgData?.subscription_id) {
        const subscriptionDetails = await getSubscriptionDetails(orgData.subscription_id);
        setSubscription(subscriptionDetails);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('base_price_monthly', { ascending: true });

      setAvailablePlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!subscription) return;

    try {
      setLoading(true);
      await updateSubscription(subscription.id, planId);
      await fetchSubscriptionDetails();
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to update subscription');
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-primary-500 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">
          Subscription Management
        </h2>
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="space-y-6">
          {/* Current Plan */}
          {subscription ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Current Plan
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {subscription.plan.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${subscription.plan.price}/month
                    </p>
                  </div>
                  <Package className="h-5 w-5 text-primary-500" />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">No active subscription</p>
          )}

          {/* Available Plans */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Available Plans
            </h3>
            <div className="grid gap-4">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border rounded-lg p-4 hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <p className="text-primary-500 font-medium">
                      ${plan.base_price_monthly}/month
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <Button
                    onClick={() => handleChangePlan(plan.id)}
                    variant="secondary"
                    className="w-full"
                    disabled={subscription?.plan.id === plan.id}
                  >
                    {subscription?.plan.id === plan.id
                      ? 'Current Plan'
                      : 'Switch to This Plan'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}