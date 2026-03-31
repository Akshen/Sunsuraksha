/**
 * Weather Service v4 Tests
 *
 * Tests the full fallback chain:
 *   Cache → Open-Meteo → OpenWeatherMap → mock
 */

// Mock all external dependencies
jest.mock('@/services/weatherCache', () => ({
  readWeatherCache: jest.fn().mockResolvedValue(null),
  writeWeatherCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/openMeteo', () => ({
  fetchFromOpenMeteo: jest.fn().mockRejectedValue(new Error('mocked - no network in tests')),
}));

import { fetchWeather, fetchWeatherByCoords, getMockWeather } from '@/services/weather';
import { readWeatherCache } from '@/services/weatherCache';
import { fetchFromOpenMeteo } from '@/services/openMeteo';

const mockReadCache = readWeatherCache as jest.MockedFunction<typeof readWeatherCache>;
const mockOpenMeteo = fetchFromOpenMeteo as jest.MockedFunction<typeof fetchFromOpenMeteo>;

describe('fetchWeather — Fallback Chain', () => {
  beforeEach(() => {
    mockReadCache.mockResolvedValue(null);
    mockOpenMeteo.mockRejectedValue(new Error('no network'));
  });

  it('falls through to error when all sources fail (no API key)', async () => {
    await expect(fetchWeather('Mumbai')).rejects.toThrow();
  });

  it('returns cached data when Supabase has fresh entry', async () => {
    const cached = {
      city: 'Delhi',
      temp_c: 44,
      feels_like_c: 48,
      humidity_pct: 25,
      uv_index: 9,
      wind_speed_kmh: 18,
      description: 'Clear sky',
      icon: '01d',
      updated_at: new Date().toISOString(),
    };
    mockReadCache.mockResolvedValue(cached);

    const weather = await fetchWeather('Delhi');
    expect(weather.city).toBe('Delhi');
    expect(weather.temp_c).toBe(44);

    mockReadCache.mockResolvedValue(null);
  });

  it('returns Open-Meteo data when cache is empty', async () => {
    const openMeteoData = {
      city: 'Pune',
      temp_c: 36,
      feels_like_c: 39,
      humidity_pct: 50,
      uv_index: 7,
      wind_speed_kmh: 14,
      description: 'Partly cloudy',
      icon: '02d',
      updated_at: new Date().toISOString(),
    };
    mockOpenMeteo.mockResolvedValue(openMeteoData);

    const weather = await fetchWeather('Pune');
    expect(weather.city).toBe('Pune');
    expect(weather.temp_c).toBe(36);

    mockOpenMeteo.mockRejectedValue(new Error('no network'));
  });
});

describe('fetchWeatherByCoords', () => {
  beforeEach(() => {
    mockReadCache.mockResolvedValue(null);
    mockOpenMeteo.mockRejectedValue(new Error('no network'));
  });

  it('throws when all sources fail', async () => {
    await expect(fetchWeatherByCoords(19.076, 72.877)).rejects.toThrow();
  });

  it('returns Open-Meteo data for GPS coordinates', async () => {
    const data = {
      city: 'mumbai',
      temp_c: 34,
      feels_like_c: 38,
      humidity_pct: 80,
      uv_index: 6,
      wind_speed_kmh: 20,
      description: 'Mainly clear',
      icon: '01d',
      updated_at: new Date().toISOString(),
    };
    mockOpenMeteo.mockResolvedValue(data);

    const weather = await fetchWeatherByCoords(19.076, 72.877);
    expect(weather.temp_c).toBe(34);
    expect(weather.humidity_pct).toBe(80);

    mockOpenMeteo.mockRejectedValue(new Error('no network'));
  });
});

describe('getMockWeather', () => {
  it('returns valid WeatherData for any city', () => {
    const mock = getMockWeather('Jaipur');
    expect(mock.city).toBe('Jaipur');
    expect(mock.temp_c).toBeGreaterThan(0);
    expect(mock.humidity_pct).toBeGreaterThan(0);
    expect(mock.updated_at).toBeTruthy();
  });

  it('defaults to Mumbai when city is empty', () => {
    const mock = getMockWeather('');
    expect(mock.city).toBe('Mumbai');
  });

  it('has all required WeatherData fields', () => {
    const mock = getMockWeather('Chennai');
    expect(mock).toHaveProperty('city');
    expect(mock).toHaveProperty('temp_c');
    expect(mock).toHaveProperty('feels_like_c');
    expect(mock).toHaveProperty('humidity_pct');
    expect(mock).toHaveProperty('uv_index');
    expect(mock).toHaveProperty('wind_speed_kmh');
    expect(mock).toHaveProperty('description');
    expect(mock).toHaveProperty('icon');
    expect(mock).toHaveProperty('updated_at');
  });

  it('icon format matches OWM pattern', () => {
    const mock = getMockWeather('Delhi');
    expect(mock.icon).toMatch(/^\d{2}[dn]$/);
  });
});

describe('Open-Meteo WMO Code Mapping (via mock)', () => {
  it('Open-Meteo returns valid description strings', async () => {
    mockOpenMeteo.mockResolvedValue({
      city: 'Test',
      temp_c: 35,
      feels_like_c: 38,
      humidity_pct: 60,
      uv_index: 7,
      wind_speed_kmh: 10,
      description: 'Clear sky',
      icon: '01d',
      updated_at: new Date().toISOString(),
    });

    const weather = await fetchWeather('Test');
    expect(weather.description).toBeTruthy();
    expect(weather.description.length).toBeGreaterThan(0);

    mockOpenMeteo.mockRejectedValue(new Error('no network'));
  });
});
