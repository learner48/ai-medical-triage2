# AI Medical Triage Assistant

A modern, AI-powered medical triage system that helps assess patient symptoms and determine urgency levels. Built with React, TypeScript, and Supabase.

## Features

- AI-powered symptom assessment
- Voice and text interaction
- Real-time urgency level updates
- Location-aware emergency recommendations
- HIPAA-compliant data handling
- Responsive design for all devices

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- OpenAI GPT-4
- ElevenLabs for voice interaction

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-medical-triage.git
   cd ai-medical-triage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
VITE_ELEVENLABS_VOICE_ID=your-elevenlabs-voice-id
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_DEFAULT_ORG_ID=your-default-organization-id
```

## License

MIT