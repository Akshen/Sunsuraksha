/**
 * Supabase Client
 * 
 * Initialize once, import everywhere.
 * Returns null if Supabase URL is not configured (app works without it).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

function initSupabase(): SupabaseClient | null {
  const url = Config.SUPABASE_URL;
  const key = Config.SUPABASE_ANON_KEY;

  if (!url || !key || url === '' || !url.startsWith('http')) {
    console.log('Supabase not configured — running without backend');
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch {
    console.log('Supabase init failed — running without backend');
    return null;
  }
}

export const supabase = initSupabase();
