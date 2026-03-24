/**
 * Weather Service Tests
 *
 * Tests the mock fallback behavior and city coordinate lookup.
 * Real API tests would need network — these test the logic layer.
 */

import { fetchWeather } from '@/services/weather';

describe('fetchWeather', () => {
  it('returns weather data for Delhi (mock fallback — no API key)', async () => {
    const weather = await fetchWeather('Delhi');
    expect(weather).toBeDefined();
    expect(weather.city).toBe('Delhi');
    expect(weather.temp_c).toBeGreaterThan(0);
    expect(weather.feels_like_c).toBeGreaterThan(0);
    expect(weather.humidity_pct).toBeGreaterThan(0);
    expect(weather.updated_at).toBeTruthy();
  });

  it('returns mock data for unknown city', async () => {
    const weather = await fetchWeather('NonexistentCity');
    expect(weather).toBeDefined();
    expect(weather.temp_c).toBeGreaterThan(0);
  });

  it('returns all required fields', async () => {
    const weather = await fetchWeather('Mumbai');
    expect(weather).toHaveProperty('city');
    expect(weather).toHaveProperty('temp_c');
    expect(weather).toHaveProperty('feels_like_c');
    expect(weather).toHaveProperty('humidity_pct');
    expect(weather).toHaveProperty('uv_index');
    expect(weather).toHaveProperty('wind_speed_kmh');
    expect(weather).toHaveProperty('description');
    expect(weather).toHaveProperty('icon');
    expect(weather).toHaveProperty('updated_at');
  });

  it('uv_index is between 0 and 15', async () => {
    const weather = await fetchWeather('Chennai');
    expect(weather.uv_index).toBeGreaterThanOrEqual(0);
    expect(weather.uv_index).toBeLessThanOrEqual(15);
  });

  it('humidity is between 0 and 100', async () => {
    const weather = await fetchWeather('Jaipur');
    expect(weather.humidity_pct).toBeGreaterThanOrEqual(0);
    expect(weather.humidity_pct).toBeLessThanOrEqual(100);
  });
});
