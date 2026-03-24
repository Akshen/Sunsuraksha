/**
 * Daily Plan — Scenario Tests
 *
 * Tests that the planner generates sensible advice
 * for every realistic Indian weather condition.
 */

import { generateDailyPlan } from '@/utils/dailyPlan';

describe('Daily Plan — Indian Weather Scenarios', () => {
  it('Nagpur 47°C: has extreme blocks during midday', () => {
    const plan = generateDailyPlan(47);
    const extreme = plan.filter((b) => b.safety === 'extreme');
    expect(extreme.length).toBeGreaterThan(0);
    // Extreme should cover midday hours
    const midday = extreme.find((b) => b.startHour <= 12 && b.endHour >= 14);
    expect(midday).toBeDefined();
  });

  it('Mumbai 38°C: has caution blocks but no extreme', () => {
    const plan = generateDailyPlan(38);
    const extreme = plan.filter((b) => b.safety === 'extreme');
    const caution = plan.filter((b) => b.safety === 'caution');
    expect(extreme.length).toBe(0);
    expect(caution.length).toBeGreaterThan(0);
  });

  it('Bangalore 32°C: mostly safe with some caution', () => {
    const plan = generateDailyPlan(32);
    const safe = plan.filter((b) => b.safety === 'safe');
    expect(safe.length).toBeGreaterThanOrEqual(plan.length - 1);
  });

  it('every block has activities array', () => {
    [30, 36, 42, 48].forEach((temp) => {
      const plan = generateDailyPlan(temp);
      plan.forEach((block) => {
        expect(Array.isArray(block.activities)).toBe(true);
        expect(block.activities.length).toBeGreaterThan(0);
      });
    });
  });

  it('every block has non-empty recommendation', () => {
    [30, 36, 42, 48].forEach((temp) => {
      const plan = generateDailyPlan(temp);
      plan.forEach((block) => {
        expect(block.recommendation.length).toBeGreaterThan(20);
      });
    });
  });

  it('no duplicate time ranges in a plan', () => {
    [30, 36, 42, 48].forEach((temp) => {
      const plan = generateDailyPlan(temp);
      const ranges = plan.map((b) => `${b.startHour}-${b.endHour}`);
      const unique = new Set(ranges);
      expect(unique.size).toBe(ranges.length);
    });
  });

  it('safe blocks always exist (early morning or night)', () => {
    [30, 36, 42, 48].forEach((temp) => {
      const plan = generateDailyPlan(temp);
      const safe = plan.filter((b) => b.safety === 'safe');
      expect(safe.length).toBeGreaterThan(0);
    });
  });
});
