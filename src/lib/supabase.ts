import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'haify_admin_session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const supabaseHandler = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'haify_handler_session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'haify_user_session',
    persistSession: true,
    autoRefreshToken: true,
  }
});

// For backward compatibility, export supabase as supabaseUser
export const supabase = supabaseUser;

