import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error('Invalid or missing VITE_SUPABASE_URL. Please check your .env file and ensure it contains a valid Supabase project URL.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. Please check your .env file and ensure it contains your Supabase anonymous key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);