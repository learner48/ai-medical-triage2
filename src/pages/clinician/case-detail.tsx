import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { UrgencyBadge } from '../../components/ui/urgency-badge';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorMessage } from '../../components/ui/error-message';
import { VideoCall } from '../../components/video/video-call';
import { MessageSquare, Video, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TriageSession } from '../../types';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<TriageSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      // Fetch triage session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('triage_sessions')
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            date_of_birth,
            medical_history_json,
            is_anonymous
          )
        `)
        .eq('id', id)
        .single();

      if (sessionError) throw sessionError;

      // Fetch chat messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('triage_chat_messages')
        .select('*')
        .eq('triage_session_id', id)
        .order('message_order', { ascending: true });

      if (messagesError) throw messagesError;

      setSession(sessionData);
      setMessages(messagesData);
    } catch (err) {
      setError('Failed to fetch case details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideoCall = () => {
    if (session?.patients?.is_anonymous) {
      alert('Video calls are only available for registered patients');
      return;
    }
    setShowVideoCall(true);
  };

  const handleSaveNotes = async () => {
    if (!notes.trim() || !session) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('video_consultations')
        .insert([
          {
            triage_session_id: session.id,
            patient_id: session.patients?.id,
            clinician_user_id: (await supabase.auth.getUser()).data.user?.id,
            clinician_notes: notes,
            consultation_type: 'asynchronous_message',
            status: 'completed'
          }
        ]);

      if (error) throw error;
      setNotes('');
      alert('Notes saved successfully');
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error || 'Case not found'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showVideoCall ? (
        <VideoCall
          sessionId={session.id}
          patientId={session.patients?.id || ''}
          onClose={() => setShowVideoCall(false)}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.patients?.first_name} {session.patients?.last_name}
                </h1>
                <p className="text-gray-500 mt-1">
                  Case ID: {session.id}
                </p>
              </div>
              <UrgencyBadge level={session.urgency_level} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Chat History
                  </h2>
                </div>
                <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'patient' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender_type === 'patient'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {message.message_content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Info & Actions */}
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Information
                </h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900">
                      {session.patients?.date_of_birth || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Medical History</dt>
                    <dd className="text-sm text-gray-900">
                      {session.patients?.medical_history_json
                        ? JSON.stringify(session.patients.medical_history_json, null, 2)
                        : 'No history available'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                <div className="space-y-4">
                  <Button
                    onClick={handleStartVideoCall}
                    className="w-full flex items-center justify-center"
                    disabled={session.patients?.is_anonymous}
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Start Video Call
                  </Button>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Clinical Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2"
                      placeholder="Enter your clinical notes..."
                    />
                    <Button
                      onClick={handleSaveNotes}
                      className="mt-2 w-full flex items-center justify-center"
                      disabled={isSaving || !notes.trim()}
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>
              </div>

              {session.patients?.is_anonymous && (
                <div className="bg-semantic-critical/10 rounded-lg p-4">
                  <div className="flex items-center text-semantic-critical">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p className="text-sm">
                      This is an anonymous patient. Video calls are only available
                      for registered patients.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}