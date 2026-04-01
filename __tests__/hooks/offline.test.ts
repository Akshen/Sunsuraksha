/**
 * Offline Mode Tests
 *
 * Tests the weather caching and fallback logic.
 * Uses AsyncStorage mock (provided by jest-expo).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeather } from '@/services/weather';
import type { WeatherData } from '@/types';

// AsyncStorage is auto-mocked by jest-expo

const CACHE_KEY = 'sunsesuraksha_weather_cache';

const mockWeather: WeatherData = {
  city: 'Mumbai',
  temp_c: 35,
  feels_like_c: 38,
  humidity_pct: 75,
  uv_index: 7,
  wind_speed_kmh: 15,
  description: 'Partly cloudy',
  icon: '02d',
  updated_at: new Date().toISOString(),
};

describe('Weather Cache — AsyncStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('can store weather data in cache', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mockWeather));
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.city).toBe('Mumbai');
    expect(parsed.temp_c).toBe(35);
  });

  it('can retrieve cached weather', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mockWeather));
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const data: WeatherData = JSON.parse(raw!);
    expect(data.city).toBe('Mumbai');
    expect(data.feels_like_c).toBe(38);
    expect(data.humidity_pct).toBe(75);
  });

  it('returns null for empty cache', async () => {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    expect(raw).toBeNull();
  });

  it('can overwrite cached data', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mockWeather));
    const updated = { ...mockWeather, city: 'Delhi', temp_c: 45 };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const data = JSON.parse(raw!);
    expect(data.city).toBe('Delhi');
    expect(data.temp_c).toBe(45);
  });
});

describe('Weather Cache — Age Validation', () => {
  it('recent cache (1 hour old) is valid', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    const data = { ...mockWeather, updated_at: oneHourAgo };
    const age = Date.now() - new Date(data.updated_at).getTime();
    const maxAge = 6 * 60 * 60 * 1000; // 6 hours
    expect(age).toBeLessThan(maxAge);
  });

  it('old cache (8 hours old) is expired', () => {
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
    const data = { ...mockWeather, updated_at: eightHoursAgo };
    const age = Date.now() - new Date(data.updated_at).getTime();
    const maxAge = 6 * 60 * 60 * 1000;
    expect(age).toBeGreaterThan(maxAge);
  });
});

describe('Location Cache — AsyncStorage', () => {
  const LOCATION_KEY = 'sunsesuraksha_last_location';

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('can store location data', async () => {
    const locationData = {
      city: 'Pune',
      coords: { lat: 18.5204, lon: 73.8567 },
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locationData));
    const raw = await AsyncStorage.getItem(LOCATION_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.city).toBe('Pune');
    expect(parsed.coords.lat).toBeCloseTo(18.52, 1);
  });

  it('can check location cache age', () => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const age = Date.now() - new Date(twelveHoursAgo).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    expect(age).toBeLessThan(maxAge); // 12h < 24h = valid

    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    const oldAge = Date.now() - new Date(thirtyHoursAgo).getTime();
    expect(oldAge).toBeGreaterThan(maxAge); // 30h > 24h = expired
  });
});

describe('fetchWeather — No API Key (mock fallback)', () => {
  it('returns mock data without throwing', async () => {
    const weather = await fetchWeather('Mumbai');
    expect(weather).toBeDefined();
    expect(weather.city).toBe('Mumbai');
  });

  it('mock data has realistic Mumbai values', async () => {
    const weather = await fetchWeather('Mumbai');
    expect(weather.temp_c).toBeGreaterThan(20);
    expect(weather.temp_c).toBeLessThan(50);
    expect(weather.humidity_pct).toBeGreaterThan(0);
  });
});
