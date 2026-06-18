import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isDummyClient = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('dummy') || supabaseUrl.includes('your-supabase');

if (isDummyClient) {
  console.warn('⚠️ Frontend is running in SANDBOX MOCK MODE. Supabase keys are not set in environment.');
}

export const supabase = !isDummyClient
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { isDummyClient };
