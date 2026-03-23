/**
 * Heat Score Calculator Tests
 *
 * These are the most important tests in the app —
 * the heat score drives every recommendation, alert, and UI decision.
 */

import {
  calculateHeatScore,
  getHydrationInterval,
  calculateWaterTarget,
} from '../../src/utils/heatScore';
import type { WeatherData } from '../../src/types';

// Helper to create weather data with sensible defaults
function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    city: 'Delhi',
    temp_c: 35,
    feels_like_c: 38,
    humidity_pct: 50,
    uv_index: 6,
    wind_speed_kmh: 10,
    description: 'Clear sky',
    icon: '01d',
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('calculateHeatScore', () => {
  it('returns a score between 0 and 100', () => {
    const weather = makeWeather({ feels_like_c: 40, humidity_pct: 70, uv_index: 8 });
    const result = calculateHeatScore(weather, 14);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns low score for cool weather at night', () => {
    const weather = makeWeather({ feels_like_c: 25, humidity_pct: 30, uv_index: 0 });
    const result = calculateHeatScore(weather, 22); // 10 PM
    expect(result.score).toBeLessThanOrEqual(20);
    expect(result.label).toBe('Safe');
  });

  it('returns moderate score for warm weather', () => {
    const weather = makeWeather({ feels_like_c: 36, humidity_pct: 50, uv_index: 5 });
    const result = calculateHeatScore(weather, 10); // 10 AM
    expect(result.score).toBeGreaterThan(20);
    expect(result.score).toBeLessThan(65);
  });

  it('returns high score for extreme conditions', () => {
    const weather = makeWeather({ feels_like_c: 48, humidity_pct: 80, uv_index: 11 });
    const result = calculateHeatScore(weather, 14); // 2 PM
    expect(result.score).toBeGreaterThan(75);
    expect(result.label).toBe('Extreme');
  });

  it('peak hours (12-3 PM) increase the score', () => {
    const weather = makeWeather({ feels_like_c: 40, humidity_pct: 60, uv_index: 7 });
    const morningResult = calculateHeatScore(weather, 6);    // 6 AM
    const afternoonResult = calculateHeatScore(weather, 13); // 1 PM
    expect(afternoonResult.score).toBeGreaterThan(morningResult.score);
  });

  it('returns correct color for each heat level', () => {
    // Safe
    const safe = calculateHeatScore(makeWeather({ feels_like_c: 25, humidity_pct: 20, uv_index: 0 }), 22);
    expect(safe.color).toBe('#4A9B6E');

    // Extreme
    const extreme = calculateHeatScore(makeWeather({ feels_like_c: 48, humidity_pct: 85, uv_index: 11 }), 14);
    expect(extreme.color).toBe('#A63D2B');
  });

  it('returns a primary action string', () => {
    const result = calculateHeatScore(makeWeather(), 12);
    expect(result.primaryAction).toBeTruthy();
    expect(typeof result.primaryAction).toBe('string');
    expect(result.primaryAction.length).toBeGreaterThan(10);
  });

  it('returns safe window times as strings', () => {
    const result = calculateHeatScore(makeWeather(), 12);
    expect(result.safeWindowStart).toMatch(/\d{1,2}:\d{2} [AP]M/);
    expect(result.safeWindowEnd).toMatch(/\d{1,2}:\d{2} [AP]M/);
  });

  it('handles edge case: below 30°C feels-like', () => {
    const weather = makeWeather({ feels_like_c: 20, humidity_pct: 20, uv_index: 1 });
    const result = calculateHeatScore(weather, 10);
    expect(result.score).toBeLessThanOrEqual(15);
  });

  it('handles edge case: 50°C feels-like (max realistic)', () => {
    const weather = makeWeather({ feels_like_c: 50, humidity_pct: 90, uv_index: 12 });
    const result = calculateHeatScore(weather, 14);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThan(85);
  });
});

describe('getHydrationInterval', () => {
  it('returns 60 min for safe scores', () => {
    expect(getHydrationInterval(20)).toBe(60);
  });

  it('returns 45 min for moderate scores', () => {
    expect(getHydrationInterval(40)).toBe(45);
  });

  it('returns 30 min for danger scores', () => {
    expect(getHydrationInterval(65)).toBe(30);
  });

  it('returns 20 min for extreme scores', () => {
    expect(getHydrationInterval(85)).toBe(20);
  });

  it('returns 60 min for score of 0', () => {
    expect(getHydrationInterval(0)).toBe(60);
  });

  it('returns 20 min for score of 100', () => {
    expect(getHydrationInterval(100)).toBe(20);
  });
});

describe('calculateWaterTarget', () => {
  it('returns baseline for cool weather (70kg person)', () => {
    const target = calculateWaterTarget(70, 28, false);
    expect(target).toBe(70 * 35); // 2450ml
  });

  it('increases target for warm weather', () => {
    const cool = calculateWaterTarget(70, 28, false);
    const warm = calculateWaterTarget(70, 35, false);
    expect(warm).toBeGreaterThan(cool);
  });

  it('increases target for hot weather', () => {
    const warm = calculateWaterTarget(70, 35, false);
    const hot = calculateWaterTarget(70, 40, false);
    expect(hot).toBeGreaterThan(warm);
  });

  it('increases target for outdoor workers', () => {
    const indoor = calculateWaterTarget(70, 40, false);
    const outdoor = calculateWaterTarget(70, 40, true);
    expect(outdoor).toBeGreaterThan(indoor);
  });

  it('returns a round number', () => {
    const target = calculateWaterTarget(65, 38, true);
    expect(target).toBe(Math.round(target));
  });

  it('scales linearly with weight', () => {
    const light = calculateWaterTarget(50, 35, false);
    const heavy = calculateWaterTarget(100, 35, false);
    expect(heavy).toBe(light * 2);
  });

  it('outdoor + extreme heat returns max multiplier', () => {
    const target = calculateWaterTarget(70, 45, true);
    // 70 * 35 * 1.8 * 1.4 = 6174
    expect(target).toBe(6174);
  });
});
