/**
 * Profile Service
 *
 * Read and update user profile data in Supabase.
 * Profile is auto-created on signup via database trigger.
 */

import { supabase } from './supabase';
import type { UserProfile } from '@/types';

/** Get the current user's profile */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }

  return data as UserProfile;
}

/** Update profile (used after onboarding and in settings) */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    return null;
  }

  return data as UserProfile;
}

/** Mark onboarding as complete — all fields are optional */
export async function completeOnboarding(
  userId: string,
  profileData: {
    name?: string;
    city?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight_kg?: number;
    body_type?: 'slim' | 'average' | 'athletic' | 'heavy';
    diet_preference?: 'vegetarian' | 'vegan' | 'non-vegetarian';
  }
): Promise<UserProfile | null> {
  return updateProfile(userId, {
    ...profileData,
    onboarded: true,
  });
}
