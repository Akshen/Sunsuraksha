/**
 * Hydration Service
 *
 * Log water intake and retrieve daily summaries from Supabase.
 */

import { supabase } from './supabase';
import type { HydrationLog } from '@/types';

/** Log a water intake entry */
export async function logWater(
  userId: string,
  amountMl: number
): Promise<HydrationLog | null> {
  const { data, error } = await supabase
    .from('hydration_logs')
    .insert({
      user_id: userId,
      amount_ml: amountMl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging water:', error.message);
    return null;
  }

  // Update daily summary
  await upsertDailySummary(userId, amountMl);

  return data as HydrationLog;
}

/** Get today's hydration logs */
export async function getTodayLogs(userId: string): Promise<HydrationLog[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error.message);
    return [];
  }

  return data as HydrationLog[];
}

/** Get today's total intake */
export async function getTodayTotal(userId: string): Promise<{
  total_ml: number;
  target_ml: number;
  log_count: number;
}> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('hydration_daily')
    .select('total_ml, target_ml, log_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error) {
    // No entry yet today — return defaults
    return { total_ml: 0, target_ml: 3000, log_count: 0 };
  }

  return data;
}

/** Upsert daily summary (called internally after each log) */
async function upsertDailySummary(
  userId: string,
  addedMl: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Try to get existing daily record
  const { data: existing } = await supabase
    .from('hydration_daily')
    .select('id, total_ml, log_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existing) {
    // Update existing
    await supabase
      .from('hydration_daily')
      .update({
        total_ml: existing.total_ml + addedMl,
        log_count: existing.log_count + 1,
      })
      .eq('id', existing.id);
  } else {
    // Create new daily record
    await supabase.from('hydration_daily').insert({
      user_id: userId,
      date: today,
      total_ml: addedMl,
      target_ml: 3000, // Will be personalized later based on weight + temp
      log_count: 1,
    });
  }
}

/** Delete a hydration log entry (undo) */
export async function deleteLog(
  logId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('hydration_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting log:', error.message);
    return false;
  }

  return true;
}
