/**
 * Weather Service v4 — Dual API with Supabase Cache
 *
 * Priority chain:
 *   1. Supabase city-level cache (< 2hr)
 *   2. Open-Meteo (FREE, no key, unlimited, any GPS coordinate)
 *   3. OpenWeatherMap (fallback, only if API key exists)
 *   4. Mock data (offline / both APIs down)
 *
 * Open-Meteo as primary = $0 cost at any scale.
 * OpenWeatherMap as fallback = extra reliability.
 */

import { Config } from '@/constants/config';
import { fetchFromOpenMeteo } from './openMeteo';
import { readWeatherCache, writeWeatherCache } from './weatherCache';
import type { WeatherData } from '@/types';

// 646 district headquarters across all Indian states/UTs
import DISTRICT_DATA from '@/data/indianDistricts.json';

const INDIAN_DISTRICTS: Record<string, { lat: number; lon: number }> = DISTRICT_DATA;

function getCityCoords(city: string): { lat: number; lon: number } {
  const normalized = city.toLowerCase().trim();
  return INDIAN_DISTRICTS[normalized] || INDIAN_DISTRICTS['mumbai'];
}

/**
 * Fetch weather for a city name.
 * Uses cache → Open-Meteo → OpenWeatherMap → mock.
 */
export async function fetchWeather(city: string): Promise<WeatherData> {
  const normalizedCity = city || 'Mumbai';

  // Step 1: Check Supabase cache
  try {
    const cached = await readWeatherCache(normalizedCity);
    if (cached) return cached;
  } catch {}

  // Step 2: Try Open-Meteo (free, no key)
  const coords = getCityCoords(normalizedCity);
  try {
    const weather = await fetchFromOpenMeteo(coords.lat, coords.lon, normalizedCity);
    writeWeatherCache(normalizedCity, weather, coords).catch(() => {});
    return weather;
  } catch {}

  // Step 3: Try OpenWeatherMap (fallback, needs key)
  const apiKey = Config.OPENWEATHER_API_KEY;
  if (apiKey && apiKey !== '') {
    try {
      const weather = await fetchFromOpenWeatherMap(normalizedCity, coords.lat, coords.lon, apiKey);
      writeWeatherCache(normalizedCity, weather, coords).catch(() => {});
      return weather;
    } catch {}
  }

  // Step 4: Everything failed — throw so useWeather triggers local cache
  throw new Error(`All weather sources failed for ${normalizedCity}`);
}

/**
 * Fetch weather by exact GPS coordinates.
 * Works for ANY location — not limited to known cities.
 */
export async function fetchWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const nearestCity = findNearestCity(lat, lon);

  // Step 1: Check Supabase cache
  try {
    const cached = await readWeatherCache(nearestCity);
    if (cached) return cached;
  } catch {}

  // Step 2: Try Open-Meteo with exact GPS coords
  try {
    const weather = await fetchFromOpenMeteo(lat, lon, nearestCity);
    writeWeatherCache(nearestCity, weather, { lat, lon }).catch(() => {});
    return weather;
  } catch {}

  // Step 3: Try OpenWeatherMap
  const apiKey = Config.OPENWEATHER_API_KEY;
  if (apiKey && apiKey !== '') {
    try {
      const weather = await fetchFromOpenWeatherMap(nearestCity, lat, lon, apiKey);
      writeWeatherCache(nearestCity, weather, { lat, lon }).catch(() => {});
      return weather;
    } catch {}
  }

  // Step 4: Everything failed
  throw new Error('All weather sources failed for coordinates');
}

// ---- OpenWeatherMap (fallback) ----

async function fetchFromOpenWeatherMap(
  cityName: string,
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData> {
  const url = `${Config.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenWeatherMap API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    city: cityName || data.name || 'Your location',
    temp_c: Math.round(data.main.temp * 10) / 10,
    feels_like_c: Math.round(data.main.feels_like * 10) / 10,
    humidity_pct: data.main.humidity,
    uv_index: data.uvi ?? estimateUV(),
    wind_speed_kmh: Math.round(data.wind.speed * 3.6),
    description: data.weather?.[0]?.description ?? 'Clear',
    icon: data.weather?.[0]?.icon ?? '01d',
    updated_at: new Date().toISOString(),
  };
}

// ---- Helpers ----

function findNearestCity(lat: number, lon: number): string {
  let nearest = 'mumbai';
  let minDist = Infinity;

  for (const [city, coords] of Object.entries(INDIAN_DISTRICTS)) {
    const dist = Math.sqrt(
      Math.pow(lat - coords.lat, 2) + Math.pow(lon - coords.lon, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return nearest;
}

function estimateUV(): number {
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) return 9;
  if (hour >= 9 && hour <= 16) return 6;
  if (hour >= 7 && hour <= 18) return 3;
  return 0;
}

/**
 * Get mock weather — used only when ALL sources fail AND local cache is empty.
 * Exported for tests.
 */
export function getMockWeather(city: string): WeatherData {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour <= 19;

  return {
    city: city || 'Mumbai',
    temp_c: isDaytime ? 42 : 32,
    feels_like_c: isDaytime ? 46 : 34,
    humidity_pct: 35,
    uv_index: estimateUV(),
    wind_speed_kmh: 12,
    description: isDaytime ? 'Clear sky' : 'Clear night',
    icon: isDaytime ? '01d' : '01n',
    updated_at: new Date().toISOString(),
  };
}
