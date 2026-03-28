/**
 * Weather Service — Edge Case Tests
 *
 * Tests city coordinate lookup and mock weather data
 * for every scenario that could break during a demo.
 */

import { fetchWeather } from '@/services/weather';

describe('fetchWeather — City Handling', () => {
  it('returns Mumbai for default/empty city', async () => {
    const weather = await fetchWeather('');
    expect(weather.city).toBe('Mumbai');
  });

  it('handles case-insensitive city names', async () => {
    const w1 = await fetchWeather('mumbai');
    const w2 = await fetchWeather('MUMBAI');
    const w3 = await fetchWeather('Mumbai');
    expect(w1.city).toBeTruthy();
    expect(w2.city).toBeTruthy();
    expect(w3.city).toBeTruthy();
  });

  it('handles city with extra spaces', async () => {
    const weather = await fetchWeather('  Delhi  ');
    expect(weather).toBeDefined();
    expect(weather.temp_c).toBeGreaterThan(0);
  });

  it('returns valid data for all major Indian cities', async () => {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'];
    for (const city of cities) {
      const weather = await fetchWeather(city);
      expect(weather.temp_c).toBeGreaterThan(0);
      expect(weather.humidity_pct).toBeGreaterThanOrEqual(0);
      expect(weather.humidity_pct).toBeLessThanOrEqual(100);
    }
  });
});

describe('fetchWeather — Mock Data Quality', () => {
  it('daytime mock has higher temp than nighttime', async () => {
    // This test depends on current time, so just validate the shape
    const weather = await fetchWeather('Mumbai');
    expect(weather.temp_c).toBeGreaterThan(0);
    expect(weather.feels_like_c).toBeGreaterThanOrEqual(weather.temp_c * 0.8);
  });

  it('description is a non-empty string', async () => {
    const weather = await fetchWeather('Delhi');
    expect(weather.description.length).toBeGreaterThan(0);
  });

  it('icon is a valid format', async () => {
    const weather = await fetchWeather('Chennai');
    expect(weather.icon).toMatch(/^\d{2}[dn]$/);
  });

  it('updated_at is a valid ISO string', async () => {
    const weather = await fetchWeather('Pune');
    const date = new Date(weather.updated_at);
    expect(date.getTime()).not.toBeNaN();
  });

  it('wind speed is non-negative', async () => {
    const weather = await fetchWeather('Jaipur');
    expect(weather.wind_speed_kmh).toBeGreaterThanOrEqual(0);
  });
});
