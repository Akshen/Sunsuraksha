/**
 * Weather Service
 *
 * Fetches current weather data from OpenWeatherMap.
 * Uses the FREE tier APIs:
 *   - /data/2.5/weather (current weather — temp, feels_like, humidity, wind)
 *   - /data/2.5/uvi (UV index — included in current weather response for 2.5)
 *
 * Free tier: 1000 calls/day, more than enough for MVP.
 *
 * Sign up: https://openweathermap.org/api
 */

import { Config } from '@/constants/config';
import type { WeatherData } from '@/types';

// ---- Indian city coordinates (for quick lookup without geocoding) ----
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
  'gurugram': { lat: 28.4595, lon: 77.0266 },
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

/**
 * Get coordinates for a city name
 * Falls back to Delhi if city not found
 */
function getCityCoords(city: string): { lat: number; lon: number } {
  const normalized = city.toLowerCase().trim();
  return INDIAN_CITIES[normalized] || INDIAN_CITIES['mumbai'];
}

/**
 * Fetch current weather for a city
 * Returns our standardized WeatherData type
 */
export async function fetchWeather(city: string): Promise<WeatherData> {
  const apiKey = Config.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === '') {
    console.warn('OpenWeather API key not set — returning mock data');
    return getMockWeather(city);
  }

  const coords = getCityCoords(city);

  try {
    const url = `${Config.OPENWEATHER_BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`);
      return getMockWeather(city);
    }

    const data = await response.json();

    return {
      city: city || 'Mumbai',
      temp_c: Math.round(data.main.temp * 10) / 10,
      feels_like_c: Math.round(data.main.feels_like * 10) / 10,
      humidity_pct: data.main.humidity,
      uv_index: data.uvi ?? estimateUV(),  // UV may not be in free 2.5 response
      wind_speed_kmh: Math.round(data.wind.speed * 3.6), // m/s → km/h
      description: data.weather?.[0]?.description ?? 'Clear',
      icon: data.weather?.[0]?.icon ?? '01d',
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return getMockWeather(city);
  }
}

/**
 * Fetch weather by exact coordinates (for GPS-based location)
 */
export async function fetchWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const apiKey = Config.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === '') {
    return getMockWeather('Your location');
  }

  try {
    const url = `${Config.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      return getMockWeather('Your location');
    }

    const data = await response.json();

    return {
      city: data.name || 'Your location',
      temp_c: Math.round(data.main.temp * 10) / 10,
      feels_like_c: Math.round(data.main.feels_like * 10) / 10,
      humidity_pct: data.main.humidity,
      uv_index: data.uvi ?? estimateUV(),
      wind_speed_kmh: Math.round(data.wind.speed * 3.6),
      description: data.weather?.[0]?.description ?? 'Clear',
      icon: data.weather?.[0]?.icon ?? '01d',
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch weather by coords:', error);
    return getMockWeather('Your location');
  }
}

/**
 * Estimate UV index based on time of day (fallback when API doesn't include it)
 */
function estimateUV(): number {
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) return 9;   // Peak
  if (hour >= 9 && hour <= 16) return 6;    // High
  if (hour >= 7 && hour <= 18) return 3;    // Moderate
  return 0;                                   // Night
}

/**
 * Mock weather data — used when API key is missing or API fails
 * Returns realistic Indian summer values
 */
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
