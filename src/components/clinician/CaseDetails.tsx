import { useState } from 'react';
import { Button } from '../ui/button';
import { UrgencyBadge } from '../ui/urgency-badge';
import { CaseStatusBadge } from '../ui/case-status-badge';
import { PatientInfoCard } from '../ui/patient-info-card';
import { MessageSquare, Video, FileText } from 'lucide-react';
import type { TriageSession } from '../../types';

interface CaseDetailsProps {
  session: TriageSession;
  onStartVideoCall: () => void;
  onUpdateStatus: (status: TriageSession['status']) => void;
}

export function CaseDetails({ session, onStartVideoCall, onUpdateStatus }: CaseDetailsProps) {
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    
    setIsSavingNotes(true);
    try {
      // Save notes logic here
      setNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Case Details
            </h1>
            <div className="flex items-center gap-3">
              <UrgencyBadge level={session.urgency_level} />
              <CaseStatusBadge status={session.status} />
            </div>
          </div>
          
          <div className="text-gray-600">
            <p><strong>Initial Symptoms:</strong> {session.initial_symptoms_description}</p>
            {session.symptom_start_date && (
              <p><strong>Symptoms Started:</strong> {new Date(session.symptom_start_date).toLocaleDateString()}</p>
            )}
            {session.pain_level && (
              <p><strong>Pain Level:</strong> {session.pain_level}/10</p>
            )}
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Conversation History
            </h2>
          </div>
          <div className="p-4">
            {/* Chat messages would be rendered here */}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Clinical Notes
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your clinical notes..."
          />
          <Button
            onClick={handleSaveNotes}
            disabled={!notes.trim() || isSavingNotes}
            className="mt-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isSavingNotes ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Patient Info */}
        <PatientInfoCard patient={session.patients} />

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions
          </h2>
          <div className="space-y-4">
            <Button
              onClick={onStartVideoCall}
              disabled={session.patients.is_anonymous}
              className="w-full"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </Button>

            <Button
              onClick={() => onUpdateStatus('resolved')}
              variant="secondary"
              className="w-full"
            >
              Mark as Resolved
            </Button>

            {session.urgency_level !== 'critical' && (
              <Button
                onClick={() => onUpdateStatus('escalated')}
                variant="secondary"
                className="w-full"
              >
                Escalate Case
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}