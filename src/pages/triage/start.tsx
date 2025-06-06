import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Mic, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export default function TriageStart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [interactionMode, setInteractionMode] = useState<'voice' | 'text' | null>(null);

  const handleStartTriage = async () => {
    if (!interactionMode) return;
    
    try {
      // Get user's location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString()
            };
            
            // Navigate to chat with location and mode
            navigate('/triage/chat', { 
              state: { 
                location,
                interactionMode 
              }
            });
          },
          () => {
            // Silently fall back to manual location input
            navigate('/triage/location');
          }
        );
      } else {
        // Fallback for browsers without geolocation
        navigate('/triage/location');
      }
    } catch (error) {
      console.error('Error starting triage:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-r from-blue-50 to-blue-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Start Your Medical Triage
          </h1>
          
          <p className="text-gray-600 mb-8">
            Please choose how you'd like to interact with our AI Medical Assistant.
            You can either speak or type your symptoms.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setInteractionMode('voice')}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                interactionMode === 'voice'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              <div className="flex items-center">
                <Mic className="h-6 w-6 text-primary-500" />
                <div className="ml-4 text-left">
                  <h3 className="font-semibold text-gray-900">Voice Chat</h3>
                  <p className="text-sm text-gray-600">
                    Speak naturally about your symptoms
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setInteractionMode('text')}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                interactionMode === 'text'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-primary-500" />
                <div className="ml-4 text-left">
                  <h3 className="font-semibold text-gray-900">Text Chat</h3>
                  <p className="text-sm text-gray-600">
                    Type your symptoms and concerns
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleStartTriage}
              disabled={!interactionMode}
            >
              Continue
            </Button>

            {!user && (
              <p className="text-sm text-gray-600 text-center">
                Note: You can continue as a guest, but signing in allows you to
                access your triage history and connect with doctors.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}