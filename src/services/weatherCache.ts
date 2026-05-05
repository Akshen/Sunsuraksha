/**
 * Weather Cache — Supabase Layer
 *
 * City-level weather caching in Supabase so all users
 * in the same city share one API call.
 *
 * Flow:
 *   1. Check Supabase cache for this city
 *   2. If fresh (< 30 min): return cached data
 *   3. If stale/missing: call OpenWeatherMap, save to Supabase
 *
 * 50 cities × 48 refreshes/day = 2,400 API calls
 * instead of N users × calls = N × thousands
 */

import { supabase } from './supabase';
import type { WeatherData } from '@/types';

const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface WeatherCacheRow {
  city: string;
  temp_c: number;
  feels_like_c: number;
  humidity_pct: number;
  uv_index: number;
  wind_speed_kmh: number;
  description: string;
  icon: string;
  lat: number | null;
  lon: number | null;
  fetched_at: string;
}

/**
 * Read cached weather for a city from Supabase.
 * Returns null if cache is stale, missing, or Supabase is not configured.
 */
export async function readWeatherCache(city: string): Promise<WeatherData | null> {
  try {
    if (!supabase) return null;

    const normalized = city.toLowerCase().trim();

    const { data, error } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('city', normalized)
      .single();

    if (error || !data) return null;

    const row = data as WeatherCacheRow;
    const age = Date.now() - new Date(row.fetched_at).getTime();

    if (age > CACHE_MAX_AGE_MS) return null; // Stale

    return {
      city: city || 'Mumbai',
      temp_c: row.temp_c,
      feels_like_c: row.feels_like_c,
      humidity_pct: row.humidity_pct,
      uv_index: row.uv_index,
      wind_speed_kmh: row.wind_speed_kmh,
      description: row.description,
      icon: row.icon,
      updated_at: row.fetched_at,
    };
  } catch {
    return null; // Supabase unavailable — fall through to API
  }
}

/**
 * Write weather data to Supabase cache.
 * Uses upsert so same city overwrites previous entry.
 */
export async function writeWeatherCache(
  city: string,
  weather: WeatherData,
  coords?: { lat: number; lon: number }
): Promise<void> {
  try {
    if (!supabase) return;

    const normalized = city.toLowerCase().trim();

    await supabase.from('weather_cache').upsert(
      {
        city: normalized,
        temp_c: weather.temp_c,
        feels_like_c: weather.feels_like_c,
        humidity_pct: weather.humidity_pct,
        uv_index: weather.uv_index,
        wind_speed_kmh: weather.wind_speed_kmh,
        description: weather.description,
        icon: weather.icon,
        lat: coords?.lat ?? null,
        lon: coords?.lon ?? null,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'city' }
    );
  } catch {
    // Cache write failure is non-critical — don't break the app
  }
}
