/**
 * Config Tests
 *
 * Validates app configuration defaults and structure.
 */

import { Config } from '@/constants/config';

describe('Config', () => {
  it('has default city set to Mumbai', () => {
    expect(Config.defaults.city).toBe('Mumbai');
  });

  it('has default language as English', () => {
    expect(Config.defaults.language).toBe('en');
  });

  it('has celsius as default temp unit', () => {
    expect(Config.defaults.tempUnit).toBe('celsius');
  });

  it('has reasonable water goal', () => {
    expect(Config.defaults.waterGoalMl).toBeGreaterThanOrEqual(2000);
    expect(Config.defaults.waterGoalMl).toBeLessThanOrEqual(5000);
  });

  it('has reasonable reminder interval', () => {
    expect(Config.defaults.reminderIntervalMin).toBeGreaterThanOrEqual(15);
    expect(Config.defaults.reminderIntervalMin).toBeLessThanOrEqual(120);
  });

  it('has heat thresholds in ascending order', () => {
    expect(Config.heatThresholds.moderate).toBeLessThan(Config.heatThresholds.hot);
    expect(Config.heatThresholds.hot).toBeLessThan(Config.heatThresholds.extreme);
  });

  it('has valid OpenWeather base URL', () => {
    expect(Config.OPENWEATHER_BASE_URL).toContain('openweathermap.org');
  });

  it('has all feature flags defined', () => {
    expect(typeof Config.features.pushNotifications).toBe('boolean');
    expect(typeof Config.features.weatherApi).toBe('boolean');
    expect(typeof Config.features.supabaseAuth).toBe('boolean');
    expect(typeof Config.features.hydrationTracker).toBe('boolean');
    expect(typeof Config.features.sosScreen).toBe('boolean');
  });

  it('env vars return strings (empty or real)', () => {
    expect(typeof Config.SUPABASE_URL).toBe('string');
    expect(typeof Config.SUPABASE_ANON_KEY).toBe('string');
    expect(typeof Config.OPENWEATHER_API_KEY).toBe('string');
  });
});
