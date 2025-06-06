import { useState } from 'react';
import { Button } from './button';
import { supabase } from '../../lib/supabase';

interface ConsentFormProps {
  onConsent: () => void;
}

export function ConsentForm({ onConsent }: ConsentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // For registered users, store consent in database
        const { error: consentError } = await supabase
          .from('patient_consents')
          .insert([
            {
              patient_id: user.id,
              consent_type: 'data_privacy_policy',
              consent_version: '1.0',
              is_granted: true,
              ip_address: await fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => data.ip)
            }
          ]);

        if (consentError) throw consentError;
      }

      onConsent();
    } catch (err) {
      setError('Failed to record consent. Please try again.');
      console.error('Consent error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Consent & Privacy Notice
      </h2>

      <div className="prose prose-sm text-gray-600 mb-6">
        <p>
          Welcome to our AI Medical Triage Assistant. Before we begin, please review and accept our terms:
        </p>

        <ul className="list-disc pl-5 space-y-2">
          <li>
            This service provides preliminary medical guidance and is not a substitute for professional medical diagnosis or treatment.
          </li>
          <li>
            Your information will be handled in accordance with HIPAA guidelines and our privacy policy.
          </li>
          <li>
            In case of emergency, please dial 911 or visit your nearest emergency room immediately.
          </li>
          <li>
            The AI system will collect and process your symptoms to assess urgency levels.
          </li>
          <li>
            Your location data will be used to recommend nearby healthcare facilities when needed.
          </li>
        </ul>
      </div>

      {error && (
        <div className="text-semantic-critical text-sm mb-4">{error}</div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          variant="primary"
          onClick={handleConsent}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'I Understand & Accept'}
        </Button>
      </div>
    </div>
  );
}