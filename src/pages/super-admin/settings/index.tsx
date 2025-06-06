import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { ErrorMessage } from '../../../components/ui/error-message';
import { Settings, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function GlobalSettings() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    aiModel: 'gpt-4',
    maxTriageTime: 30,
    maxVideoCallDuration: 20,
    defaultUrgencyLevel: 'low',
    enableGuestAccess: true,
    requireMfaForClinicians: true,
    dataRetentionDays: 90,
    enableEhrIntegration: true,
    maxRetryAttempts: 3,
    notificationSettings: {
      enableSms: true,
      enableEmail: true,
      enablePush: false
    },
    customization: {
      primaryColor: '#2979ff',
      enableCustomBranding: true
    }
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error: settingsError } = await supabase
        .from('system_settings')
        .upsert([
          {
            setting_key: 'global_settings',
            setting_value_json: settings,
            updated_by_user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (settingsError) throw settingsError;
      alert('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
            <p className="mt-2 text-gray-600">Configure platform-wide settings and defaults</p>
          </div>
          <Settings className="h-8 w-8 text-gray-400" />
        </div>

        <div className="space-y-6">
          {/* AI Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  AI Model
                </label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => setSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="gpt-4">GPT-4 (Recommended)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default Urgency Level
                </label>
                <select
                  value={settings.defaultUrgencyLevel}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultUrgencyLevel: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Session Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Triage Time (minutes)
                </label>
                <input
                  type="number"
                  value={settings.maxTriageTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTriageTime: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Video Call Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.maxVideoCallDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxVideoCallDuration: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableGuestAccess"
                  checked={settings.enableGuestAccess}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableGuestAccess: e.target.checked }))}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableGuestAccess" className="ml-2 block text-sm text-gray-900">
                  Enable Guest Access
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireMfaForClinicians"
                  checked={settings.requireMfaForClinicians}
                  onChange={(e) => setSettings(prev => ({ ...prev, requireMfaForClinicians: e.target.checked }))}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="requireMfaForClinicians" className="ml-2 block text-sm text-gray-900">
                  Require MFA for Clinicians
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableEhrIntegration"
                  checked={settings.enableEhrIntegration}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableEhrIntegration: e.target.checked }))}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableEhrIntegration" className="ml-2 block text-sm text-gray-900">
                  Enable EHR Integration
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Retry Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxRetryAttempts}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxRetryAttempts: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableSms"
                  checked={settings.notificationSettings.enableSms}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      enableSms: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableSms" className="ml-2 block text-sm text-gray-900">
                  Enable SMS Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableEmail"
                  checked={settings.notificationSettings.enableEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      enableEmail: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableEmail" className="ml-2 block text-sm text-gray-900">
                  Enable Email Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enablePush"
                  checked={settings.notificationSettings.enablePush}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      enablePush: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enablePush" className="ml-2 block text-sm text-gray-900">
                  Enable Push Notifications
                </label>
              </div>
            </div>
          </div>

          {error && (
            <ErrorMessage message={error} />
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}