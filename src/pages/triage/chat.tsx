import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { UrgencyBadge } from '../../components/ui/urgency-badge';
import { EmergencyRecommendations } from '../../components/ui/emergency-recommendations';
import { Mic, Send, Loader2, StopCircle } from 'lucide-react';
import { useTriageStore } from '../../store/triage';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { textToSpeech } from '../../lib/elevenlabs';

export default function TriageChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    session,
    messages,
    isProcessing,
    error,
    initializeSession,
    sendMessage
  } = useTriageStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isRecording, error: recordingError, startRecording, stopRecording } = useVoiceRecording();

  useEffect(() => {
    if (!location.state?.location) {
      navigate('/triage/start');
      return;
    }

    initializeSession(location.state.location);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Play AI responses as speech
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      playAudioResponse(lastMessage.content);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playAudioResponse = async (text: string) => {
    try {
      const audioData = await textToSpeech(text);
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      try {
        const text = await stopRecording();
        setInput(text);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col">
      <audio ref={audioRef} className="hidden" />
      
      {session && (
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                Medical Triage Session
              </h1>
              <UrgencyBadge level={session.urgency_level} />
            </div>
            <EmergencyRecommendations session={session} />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'assistant'
                    ? 'bg-white text-gray-900'
                    : 'bg-primary-500 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {(error || recordingError) && (
        <div className="bg-semantic-critical/10 text-semantic-critical p-2 text-center">
          {error || recordingError}
        </div>
      )}

      <div className="bg-white border-t p-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={isRecording ? 'text-semantic-critical' : ''}
          >
            {isRecording ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={1}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}