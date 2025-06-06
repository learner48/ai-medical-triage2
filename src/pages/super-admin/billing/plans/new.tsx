import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { ErrorMessage } from '../../../../components/ui/error-message';
import { ArrowLeft } from 'lucide-react';
import { useSuperAdminStore } from '../../../../store/super-admin';

export default function AddSubscriptionPlan() {
  const navigate = useNavigate();
  const { createSubscriptionPlan, billingModels, fetchBillingModels } = useSuperAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    billingModelId: '',
    features: JSON.stringify([
      'Unlimited triages',
      'Video consultations',
      'Email support'
    ], null, 2),
    canIntegrateEhr: false
  });

  useEffect(() => {
    fetchBillingModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createSubscriptionPlan({
        name: formData.name,
        description: formData.description,
        base_price_monthly: parseFloat(formData.basePrice),
        billing_model_id: formData.billingModelId,
        features_json: JSON.parse(formData.features),
        can_integrate_ehr: formData.canIntegrateEhr,
        is_active: true
      });

      navigate('/super-admin/billing/plans');
    } catch (err) {
      console.error('Error creating subscription plan:', err);
      setError('Failed to create subscription plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/super-admin/billing/plans')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Subscription Plans
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New Subscription Plan
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plan Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Base Price (Monthly USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Billing Model
              </label>
              <select
                value={formData.billingModelId}
                onChange={(e) => setFormData(prev => ({ ...prev, billingModelId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select a billing model</option>
                {billingModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.model_type} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Features (JSON Array)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="canIntegrateEhr"
                checked={formData.canIntegrateEhr}
                onChange={(e) => setFormData(prev => ({ ...prev, canIntegrateEhr: e.target.checked }))}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="canIntegrateEhr" className="ml-2 block text-sm text-gray-900">
                Can Integrate EHR
              </label>
            </div>

            {error && (
              <ErrorMessage message={error} />
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/super-admin/billing/plans')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}