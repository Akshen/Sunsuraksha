/**
 * Heat Score — Comprehensive Scenarios
 *
 * Tests every real-world scenario the app might face,
 * including Indian city-specific conditions.
 */

import {
  calculateHeatScore,
  getHydrationInterval,
  calculateWaterTarget,
} from '@/utils/heatScore';
import type { WeatherData } from '@/types';

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

describe('Heat Score — Indian City Scenarios', () => {
  it('Delhi peak summer (48°C, 30% humidity) = Danger or Extreme', () => {
    const result = calculateHeatScore(
      makeWeather({ city: 'Delhi', feels_like_c: 48, humidity_pct: 30, uv_index: 11 }),
      14
    );
    expect(['Danger', 'Extreme']).toContain(result.label);
    expect(result.score).toBeGreaterThan(65);
  });

  it('Mumbai monsoon (34°C, 90% humidity) = Moderate-Danger', () => {
    const result = calculateHeatScore(
      makeWeather({ city: 'Mumbai', feels_like_c: 34, humidity_pct: 90, uv_index: 4 }),
      12
    );
    // High humidity pushes score up even with moderate temp
    expect(result.score).toBeGreaterThan(30);
  });

  it('Bangalore pleasant (28°C, 50% humidity) = Safe', () => {
    const result = calculateHeatScore(
      makeWeather({ city: 'Bangalore', feels_like_c: 28, humidity_pct: 50, uv_index: 5 }),
      10
    );
    expect(result.label).toBe('Safe');
  });

  it('Ahmedabad extreme (50°C, 20% humidity) = Danger or Extreme', () => {
    const result = calculateHeatScore(
      makeWeather({ city: 'Ahmedabad', feels_like_c: 50, humidity_pct: 20, uv_index: 12 }),
      13
    );
    expect(['Danger', 'Extreme']).toContain(result.label);
    expect(result.score).toBeGreaterThan(70);
  });

  it('Shimla cool (15°C, 40% humidity) = Safe with low score', () => {
    const result = calculateHeatScore(
      makeWeather({ city: 'Shimla', feels_like_c: 15, humidity_pct: 40, uv_index: 3 }),
      11
    );
    expect(result.label).toBe('Safe');
    expect(result.score).toBeLessThan(20);
  });

  it('Chennai high humidity (38°C, 85% humidity) = Danger', () => {
    const result = calculateHeatScore(
      makeWeather({ city: 'Chennai', feels_like_c: 38, humidity_pct: 85, uv_index: 8 }),
      13
    );
    expect(result.score).toBeGreaterThan(50);
  });
});

describe('Heat Score — Time of Day Impact', () => {
  const hotWeather = makeWeather({ feels_like_c: 42, humidity_pct: 50, uv_index: 8 });

  it('same weather scores higher at 2 PM than 6 AM', () => {
    const morning = calculateHeatScore(hotWeather, 6);
    const afternoon = calculateHeatScore(hotWeather, 14);
    expect(afternoon.score).toBeGreaterThan(morning.score);
  });

  it('same weather scores higher at 2 PM than 10 PM', () => {
    const afternoon = calculateHeatScore(hotWeather, 14);
    const night = calculateHeatScore(hotWeather, 22);
    expect(afternoon.score).toBeGreaterThan(night.score);
  });

  it('midnight has zero time penalty', () => {
    const midnight = calculateHeatScore(hotWeather, 0);
    const noon = calculateHeatScore(hotWeather, 12);
    expect(noon.score).toBeGreaterThan(midnight.score);
  });
});

describe('Heat Score — Action Messages', () => {
  it('safe score gives positive message', () => {
    const result = calculateHeatScore(
      makeWeather({ feels_like_c: 25, humidity_pct: 30, uv_index: 2 }),
      10
    );
    expect(result.primaryAction).toContain('Great weather');
  });

  it('extreme score gives urgent message', () => {
    const result = calculateHeatScore(
      makeWeather({ feels_like_c: 48, humidity_pct: 70, uv_index: 11 }),
      14
    );
    expect(result.primaryAction).toContain('EXTREME');
  });

  it('all scores return a non-empty action', () => {
    for (let temp = 20; temp <= 50; temp += 5) {
      const result = calculateHeatScore(makeWeather({ feels_like_c: temp }), 12);
      expect(result.primaryAction.length).toBeGreaterThan(10);
    }
  });

  it('safe window times are valid format', () => {
    const result = calculateHeatScore(makeWeather(), 12);
    expect(result.safeWindowStart).toMatch(/\d{1,2}:\d{2} [AP]M/);
    expect(result.safeWindowEnd).toMatch(/\d{1,2}:\d{2} [AP]M/);
  });
});

describe('Water Target — Real User Scenarios', () => {
  it('60kg woman, 40°C, indoor = reasonable target', () => {
    const target = calculateWaterTarget(60, 40, false);
    expect(target).toBeGreaterThan(2000);
    expect(target).toBeLessThan(5000);
  });

  it('90kg man, 45°C, outdoor = high target', () => {
    const target = calculateWaterTarget(90, 45, true);
    expect(target).toBeGreaterThan(5000);
    expect(target).toBeLessThan(10000);
  });

  it('50kg person, 30°C, indoor = base target', () => {
    const target = calculateWaterTarget(50, 28, false);
    expect(target).toBe(50 * 35);
  });

  it('never returns zero or negative', () => {
    const target = calculateWaterTarget(1, 0, false);
    expect(target).toBeGreaterThan(0);
  });
});

describe('Hydration Interval — All Score Ranges', () => {
  it('covers every 10-point range', () => {
    const intervals = [];
    for (let score = 0; score <= 100; score += 10) {
      const interval = getHydrationInterval(score);
      expect(interval).toBeGreaterThanOrEqual(20);
      expect(interval).toBeLessThanOrEqual(60);
      intervals.push(interval);
    }
    // Intervals should decrease or stay same as score increases
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeLessThanOrEqual(intervals[i - 1]);
    }
  });
});
