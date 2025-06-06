import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { ErrorMessage } from '../../../components/ui/error-message';
import { Save, Link, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Integration {
  id: string;
  integration_name: string;
  api_key_encrypted: string;
  base_url?: string;
  config_json?: Record<string, any>;
  is_active: boolean;
}

export default function IntegrationsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
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

      setOrganizationId(adminData.organization_id);

      const { data, error: fetchError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('organization_id', adminData.organization_id);

      if (fetchError) throw fetchError;
      setIntegrations(data || []);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('integration_configs')
        .update({ is_active: isActive })
        .eq('id', integrationId);

      if (updateError) throw updateError;

      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === integrationId
            ? { ...integration, is_active: isActive }
            : integration
        )
      );
    } catch (err) {
      console.error('Error updating integration:', err);
      alert('Failed to update integration status');
    }
  };

  const handleSaveApiKey = async (integrationId: string, apiKey: string) => {
    try {
      const { error: updateError } = await supabase
        .from('integration_configs')
        .update({ api_key_encrypted: apiKey })
        .eq('id', integrationId);

      if (updateError) throw updateError;

      alert('API key updated successfully');
    } catch (err) {
      console.error('Error updating API key:', err);
      alert('Failed to update API key');
    }
  };

  const handleAddIntegration = async (name: string) => {
    if (!organizationId) return;

    try {
      const { error: insertError } = await supabase
        .from('integration_configs')
        .insert([
          {
            organization_id: organizationId,
            integration_name: name,
            api_key_encrypted: '',
            is_active: false
          }
        ]);

      if (insertError) throw insertError;

      fetchIntegrations();
    } catch (err) {
      console.error('Error adding integration:', err);
      alert('Failed to add integration');
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="mt-2 text-gray-600">Manage your external service integrations</p>
          </div>
          <Link className="h-8 w-8 text-gray-400" />
        </div>

        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="space-y-6">
            {/* EHR Integration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">EHR Integration</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Connect with your Electronic Health Record system
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleAddIntegration('EHR')}
                  disabled={integrations.some(i => i.integration_name === 'EHR')}
                >
                  Configure
                </Button>
              </div>

              {integrations.find(i => i.integration_name === 'EHR') && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="password"
                        className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Enter API key"
                      />
                      <Button
                        className="rounded-l-none"
                        onClick={() => {/* Save API key */}}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Base URL
                    </label>
                    <input
                      type="url"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                      placeholder="https://api.ehr-provider.com"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-semantic-moderate mr-2" />
                      <span className="text-sm text-gray-600">
                        Integration status
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {/* Toggle status */}}
                    >
                      Enable
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Platform Integration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Video Platform</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure your video consultation platform
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleAddIntegration('VIDEO')}
                  disabled={integrations.some(i => i.integration_name === 'VIDEO')}
                >
                  Configure
                </Button>
              </div>

              {integrations.find(i => i.integration_name === 'VIDEO') && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Platform
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="tavus">Tavus</option>
                      <option value="twilio">Twilio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="password"
                        className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Enter API key"
                      />
                      <Button
                        className="rounded-l-none"
                        onClick={() => {/* Save API key */}}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-semantic-moderate mr-2" />
                      <span className="text-sm text-gray-600">
                        Integration status
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {/* Toggle status */}}
                    >
                      Enable
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Voice Integration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Voice Integration</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure ElevenLabs for voice interaction
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleAddIntegration('VOICE')}
                  disabled={integrations.some(i => i.integration_name === 'VOICE')}
                >
                  Configure
                </Button>
              </div>

              {integrations.find(i => i.integration_name === 'VOICE') && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="password"
                        className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Enter API key"
                      />
                      <Button
                        className="rounded-l-none"
                        onClick={() => {/* Save API key */}}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Voice ID
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Enter voice ID"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-semantic-moderate mr-2" />
                      <span className="text-sm text-gray-600">
                        Integration status
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {/* Toggle status */}}
                    >
                      Enable
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}