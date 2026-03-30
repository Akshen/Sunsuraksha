/**
 * Weather Service v3 — Supabase Cache + OpenWeatherMap
 *
 * Priority:
 *   1. Supabase city-level cache (shared across all users in same city)
 *   2. OpenWeatherMap API (if cache stale/missing)
 *   3. Mock data (if no API key or offline)
 *
 * Cache = 30 min freshness per city
 * 50 cities × 48 refreshes/day = 2,400 API calls total
 */

import { Config } from '@/constants/config';
import { readWeatherCache, writeWeatherCache } from './weatherCache';
import type { WeatherData } from '@/types';

// ---- Indian city coordinates ----
const INDIAN_CITIES: Record<string, { lat: number; lon: number }> = {
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'bengaluru': { lat: 12.9716, lon: 77.5946 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'patna': { lat: 25.6093, lon: 85.1376 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'chandigarh': { lat: 30.7333, lon: 76.7794 },
  'gurgaon': { lat: 28.4595, lon: 77.0266 },
  'noida': { lat: 28.5355, lon: 77.3910 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'ranchi': { lat: 23.3441, lon: 85.3096 },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245 },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
  'coimbatore': { lat: 11.0168, lon: 76.9558 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'agra': { lat: 27.1767, lon: 78.0081 },
  'madurai': { lat: 9.9252, lon: 78.1198 },
};

function getCityCoords(city: string): { lat: number; lon: number } {
  const normalized = city.toLowerCase().trim();
  return INDIAN_CITIES[normalized] || INDIAN_CITIES['mumbai'];
}

/**
 * Fetch current weather for a city.
 * Checks Supabase cache first, then hits API if stale.
 */
export async function fetchWeather(city: string): Promise<WeatherData> {
  const apiKey = Config.OPENWEATHER_API_KEY;
  const normalizedCity = city || 'Mumbai';

  // No API key = mock mode (development/testing)
  if (!apiKey || apiKey === '') {
    return getMockWeather(normalizedCity);
  }

  // Step 1: Check Supabase cache
  try {
    const cached = await readWeatherCache(normalizedCity);
    if (cached) return cached;
  } catch {
    // Supabase unavailable — continue to API
  }

  // Step 2: Call OpenWeatherMap
  const coords = getCityCoords(normalizedCity);

  try {
    const weather = await fetchFromOpenWeather(normalizedCity, coords.lat, coords.lon, apiKey);

    // Step 3: Write to Supabase cache (fire-and-forget)
    writeWeatherCache(normalizedCity, weather, coords).catch(() => {});

    return weather;
  } catch {
    throw new Error(`Network request failed for ${normalizedCity}`);
  }
}

/**
 * Fetch weather by exact GPS coordinates.
 * Checks Supabase cache using nearest known city, then hits API.
 */
export async function fetchWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const apiKey = Config.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === '') {
    return getMockWeather('Your location');
  }

  // Find nearest known city for cache lookup
  const nearestCity = findNearestCity(lat, lon);

  // Step 1: Check Supabase cache
  try {
    const cached = await readWeatherCache(nearestCity);
    if (cached) return cached;
  } catch {
    // Continue to API
  }

  // Step 2: Call OpenWeatherMap with exact coords
  try {
    const weather = await fetchFromOpenWeather(nearestCity, lat, lon, apiKey);

    // Step 3: Cache it
    writeWeatherCache(nearestCity, weather, { lat, lon }).catch(() => {});

    return weather;
  } catch {
    throw new Error('Network request failed for coordinates');
  }
}

// ---- Internal helpers ----

async function fetchFromOpenWeather(
  cityName: string,
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData> {
  const url = `${Config.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);

  if (!response.ok) {
    return getMockWeather(cityName);
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

/**
 * Find the nearest known Indian city to given coordinates.
 * Used for cache key when user is at a GPS position.
 */
function findNearestCity(lat: number, lon: number): string {
  let nearest = 'mumbai';
  let minDist = Infinity;

  for (const [city, coords] of Object.entries(INDIAN_CITIES)) {
    // Simple Euclidean distance (good enough for same-country)
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

function getMockWeather(city: string): WeatherData {
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
