import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before validating
// This ensures .env is loaded even when this module is imported first
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with service role key for backend operations
// Service role key bypasses Row Level Security (RLS) - use carefully!
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Export database types for type safety
export type { Database };
