import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VideoCallProps {
  sessionId: string;
  patientId: string;
  onClose: () => void;
}

export function VideoCall({ sessionId, patientId, onClose }: VideoCallProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      cleanupCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = peerConnection;

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Create and store consultation record
      const { error: consultationError } = await supabase
        .from('video_consultations')
        .insert([
          {
            triage_session_id: sessionId,
            patient_id: patientId,
            clinician_user_id: (await supabase.auth.getUser()).data.user?.id,
            start_time: new Date().toISOString(),
            consultation_type: 'live',
            status: 'in_progress'
          }
        ]);

      if (consultationError) throw consultationError;

      setLoading(false);
    } catch (err) {
      console.error('Error initializing call:', err);
      setError('Failed to initialize video call');
      setLoading(false);
    }
  };

  const cleanupCall = async () => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Update consultation record
    try {
      await supabase
        .from('video_consultations')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('triage_session_id', sessionId)
        .eq('consultation_type', 'live')
        .eq('status', 'in_progress');
    } catch (err) {
      console.error('Error updating consultation record:', err);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleEndCall = () => {
    cleanupCall();
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-center">Initializing video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <ErrorMessage message={error} />
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            You
          </div>
        </div>
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
            Patient
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={toggleMute}
          className={`rounded-full p-4 ${isMuted ? 'bg-semantic-critical' : ''}`}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={toggleVideo}
          className={`rounded-full p-4 ${!isVideoEnabled ? 'bg-semantic-critical' : ''}`}
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full p-4 bg-semantic-critical"
        >
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}