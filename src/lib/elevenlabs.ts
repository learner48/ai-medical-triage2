import { Voice } from 'elevenlabs-node';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const voice = new Voice(ELEVENLABS_API_KEY);
  return voice.textToSpeech(VOICE_ID, text);
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('model_id', 'whisper-1');

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Speech to text conversion failed');
  }

  const data = await response.json();
  return data.text;
}