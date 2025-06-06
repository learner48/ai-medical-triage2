import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { processUserMessage } from '../lib/openai';
import type { TriageSession } from '../types';

interface TriageState {
  session: TriageSession | null;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  isProcessing: boolean;
  error: string | null;
  initializeSession: (locationData: any) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  updateUrgencyLevel: (level: TriageSession['urgency_level']) => Promise<void>;
}

export const useTriageStore = create<TriageState>((set, get) => ({
  session: null,
  messages: [],
  isProcessing: false,
  error: null,

  initializeSession: async (locationData) => {
    try {
      const { data, error } = await supabase
        .from('triage_sessions')
        .insert([
          {
            patient_current_location_json: locationData,
            status: 'initiated',
            urgency_level: 'low',
            organization_id: import.meta.env.VITE_DEFAULT_ORG_ID
          }
        ])
        .select()
        .single();

      if (error) throw error;

      set({ session: data });

      // Add initial AI message
      const initialMessage = {
        id: '1',
        role: 'assistant' as const,
        content: 'Hello! I\'m here to help you understand your symptoms. To start, could you please describe your main symptom?',
        timestamp: new Date().toISOString()
      };

      set({ messages: [initialMessage] });

      // Store initial message
      await supabase
        .from('triage_chat_messages')
        .insert([
          {
            triage_session_id: data.id,
            message_order: 1,
            sender_type: 'ai',
            message_content: initialMessage.content
          }
        ]);

    } catch (error) {
      console.error('Error initializing session:', error);
      set({ error: 'Failed to initialize triage session' });
    }
  },

  sendMessage: async (content: string) => {
    const state = get();
    if (!state.session) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString()
    };

    set({ 
      messages: [...state.messages, userMessage],
      isProcessing: true,
      error: null
    });

    try {
      // Store user message
      await supabase
        .from('triage_chat_messages')
        .insert([
          {
            triage_session_id: state.session.id,
            message_order: state.messages.length + 1,
            sender_type: 'patient',
            message_content: content
          }
        ]);

      // Process with AI
      const conversationHistory = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await processUserMessage(content, conversationHistory);

      // Update session urgency if changed
      if (aiResponse.urgencyLevel !== state.session.urgency_level) {
        await get().updateUrgencyLevel(aiResponse.urgencyLevel);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: aiResponse.message,
        timestamp: new Date().toISOString()
      };

      // Store AI response
      await supabase
        .from('triage_chat_messages')
        .insert([
          {
            triage_session_id: state.session.id,
            message_order: state.messages.length + 2,
            sender_type: 'ai',
            message_content: aiResponse.message
          }
        ]);

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isProcessing: false
      }));

    } catch (error) {
      console.error('Error processing message:', error);
      set({ 
        isProcessing: false,
        error: 'Failed to process message'
      });
    }
  },

  updateUrgencyLevel: async (level) => {
    const state = get();
    if (!state.session) return;

    try {
      const { data, error } = await supabase
        .from('triage_sessions')
        .update({ urgency_level: level })
        .eq('id', state.session.id)
        .select()
        .single();

      if (error) throw error;
      set({ session: data });

    } catch (error) {
      console.error('Error updating urgency level:', error);
      set({ error: 'Failed to update urgency level' });
    }
  }
}));