import { useState, useRef, useCallback } from 'react';
import { speechToText } from '../lib/elevenlabs';

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied');
      console.error('Error accessing microphone:', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder.current) {
        reject(new Error('No recording in progress'));
        return;
      }

      mediaRecorder.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          const text = await speechToText(audioBlob);
          resolve(text);
        } catch (err) {
          reject(err);
        } finally {
          setIsRecording(false);
          mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.current.stop();
    });
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}