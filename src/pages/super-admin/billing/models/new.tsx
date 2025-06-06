import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { ErrorMessage } from '../../../../components/ui/error-message';
import { ArrowLeft } from 'lucide-react';
import { useSuperAdminStore } from '../../../../store/super-admin';

export default function AddBillingModel() {
  const navigate = useNavigate();
  const { createBillingModel } = useSuperAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    modelType: 'subscription',
    perTriageRate: '',
    includedTriages: '',
    volumeTiers: JSON.stringify([
      { min_triages: 100, rate_usd: 8.00 },
      { min_triages: 500, rate_usd: 6.00 },
      { min_triages: 1000, rate_usd: 4.00 }
    ], null, 2),
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createBillingModel({
        model_type: formData.modelType,
        per_triage_rate_usd: formData.perTriageRate ? parseFloat(formData.perTriageRate) : null,
        included_triages_quota: formData.includedTriages ? parseInt(formData.includedTriages) : null,
        volume_tier_definition_json: formData.modelType === 'volume_discount' ? JSON.parse(formData.volumeTiers) : null,
        description: formData.description
      });

      navigate('/super-admin/billing/models');
    } catch (err) {
      console.error('Error creating billing model:', err);
      setError('Failed to create billing model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/super-admin/billing/models')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Billing Models
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Add New Billing Model
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Model Type
              </label>
              <select
                value={formData.modelType}
                onChange={(e) => setFormData(prev => ({ ...prev, modelType: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="subscription">Subscription</option>
                <option value="pay_per_use">Pay Per Use</option>
                <option value="volume_discount">Volume Discount</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {(formData.modelType === 'pay_per_use' || formData.modelType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Per Triage Rate (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.perTriageRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, perTriageRate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            )}

            {(formData.modelType === 'subscription' || formData.modelType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Included Triages Quota
                </label>
                <input
                  type="number"
                  value={formData.includedTriages}
                  onChange={(e) => setFormData(prev => ({ ...prev, includedTriages: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            )}

            {formData.modelType === 'volume_discount' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Volume Tiers (JSON)
                </label>
                <textarea
                  value={formData.volumeTiers}
                  onChange={(e) => setFormData(prev => ({ ...prev, volumeTiers: e.target.value }))}
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
                />
              </div>
            )}

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

            {error && (
              <ErrorMessage message={error} />
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/super-admin/billing/models')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Billing Model'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}