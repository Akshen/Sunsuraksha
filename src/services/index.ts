/**
 * Services — barrel export
 *
 * import { supabase } from '@/services';
 * import { signIn, signUp, signOut } from '@/services';
 * import { getProfile, updateProfile } from '@/services';
 * import { logWater, getTodayTotal } from '@/services';
 */

export { supabase } from './supabase';
export { signUp, signIn, signOut, getSession, getCurrentUserId, onAuthStateChange } from './auth';
export { getProfile, updateProfile, completeOnboarding } from './profile';
export { logWater, getTodayLogs, getTodayTotal, deleteLog } from './hydration';
export { fetchWeather, fetchWeatherByCoords } from './weather';
