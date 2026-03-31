/**
 * Open-Meteo Weather Service
 *
 * FREE, no API key, unlimited calls, any GPS coordinate.
 * Uses GFS/ECMWF models — same data sources as IMD.
 *
 * API: https://api.open-meteo.com/v1/forecast
 * Docs: https://open-meteo.com/en/docs
 *
 * Returns current weather: temperature, feels-like, humidity,
 * wind speed, UV index, and WMO weather code.
 */

import type { WeatherData } from '@/types';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch current weather from Open-Meteo for any GPS coordinate.
 * No API key needed. Throws on network failure.
 */
export async function fetchFromOpenMeteo(
  lat: number,
  lon: number,
  cityName?: string
): Promise<WeatherData> {
  const params = [
    `latitude=${lat}`,
    `longitude=${lon}`,
    'current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,weather_code',
    'timezone=auto',
  ].join('&');

  const response = await fetch(`${OPEN_METEO_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;

  if (!current) {
    throw new Error('Open-Meteo returned no current weather data');
  }

  const weatherCode = current.weather_code ?? 0;

  return {
    city: cityName || 'Your location',
    temp_c: Math.round(current.temperature_2m * 10) / 10,
    feels_like_c: Math.round(current.apparent_temperature * 10) / 10,
    humidity_pct: current.relative_humidity_2m ?? 50,
    uv_index: current.uv_index ?? estimateUV(),
    wind_speed_kmh: Math.round(current.wind_speed_10m ?? 0),
    description: wmoCodeToDescription(weatherCode),
    icon: wmoCodeToIcon(weatherCode),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Map WMO weather codes (0-99) to human-readable descriptions.
 * https://open-meteo.com/en/docs — WMO Weather interpretation codes
 */
function wmoCodeToDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Clear sky';
}

/**
 * Map WMO weather codes to OpenWeatherMap-style icon codes.
 * Our UI already renders these icon codes.
 */
function wmoCodeToIcon(code: number): string {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 19;
  const suffix = isDay ? 'd' : 'n';

  if (code === 0 || code === 1) return `01${suffix}`;       // Clear
  if (code === 2) return `02${suffix}`;                      // Partly cloudy
  if (code === 3) return `04${suffix}`;                      // Overcast
  if (code === 45 || code === 48) return `50${suffix}`;      // Fog
  if (code >= 51 && code <= 57) return `09${suffix}`;        // Drizzle
  if (code >= 61 && code <= 67) return `10${suffix}`;        // Rain
  if (code >= 71 && code <= 77) return `13${suffix}`;        // Snow
  if (code >= 80 && code <= 82) return `09${suffix}`;        // Rain showers
  if (code >= 85 && code <= 86) return `13${suffix}`;        // Snow showers
  if (code >= 95) return `11${suffix}`;                      // Thunderstorm

  return `01${suffix}`;
}

function estimateUV(): number {
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) return 9;
  if (hour >= 9 && hour <= 16) return 6;
  if (hour >= 7 && hour <= 18) return 3;
  return 0;
}
