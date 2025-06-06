import { User } from 'lucide-react';

interface PatientInfoCardProps {
  patient: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    medical_history_json?: Record<string, any>;
    is_anonymous: boolean;
  };
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <User className="h-6 w-6 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 ml-2">
          Patient Information
        </h2>
      </div>

      {patient.is_anonymous ? (
        <div className="text-gray-500 italic">
          Anonymous Patient
        </div>
      ) : (
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="text-sm font-medium text-gray-900">
              {patient.first_name} {patient.last_name}
            </dd>
          </div>

          {patient.date_of_birth && (
            <div>
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </dd>
            </div>
          )}

          {patient.medical_history_json && (
            <div>
              <dt className="text-sm text-gray-500">Medical History</dt>
              <dd className="text-sm font-medium text-gray-900">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(patient.medical_history_json, null, 2)}
                </pre>
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}