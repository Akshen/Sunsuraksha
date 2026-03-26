/**
 * Daily Plan Generator v2 — Basic Tests
 */

import { generateDailyPlan } from '@/utils/dailyPlan';

describe('generateDailyPlan', () => {
  it('returns an array of plan blocks', () => {
    const plan = generateDailyPlan(42);
    expect(Array.isArray(plan)).toBe(true);
    expect(plan.length).toBe(8); // v2 always returns 8 time slots
  });

  it('every block has required fields', () => {
    const plan = generateDailyPlan(40);
    plan.forEach((block) => {
      expect(block.startHour).toBeDefined();
      expect(block.endHour).toBeDefined();
      expect(['safe', 'caution', 'danger', 'extreme']).toContain(block.safety);
      expect(block.label).toBeTruthy();
      expect(block.recommendation).toBeTruthy();
      expect(Array.isArray(block.activities)).toBe(true);
    });
  });

  it('extreme heat (48°C) includes extreme or danger blocks', () => {
    const plan = generateDailyPlan(48);
    const dangerPlus = plan.filter((b) => b.safety === 'extreme' || b.safety === 'danger');
    expect(dangerPlus.length).toBeGreaterThan(0);
  });

  it('hot weather (42°C) includes danger or caution blocks', () => {
    const plan = generateDailyPlan(42);
    const notSafe = plan.filter((b) => b.safety !== 'safe');
    expect(notSafe.length).toBeGreaterThan(0);
  });

  it('mild weather (25°C) has all safe blocks', () => {
    const plan = generateDailyPlan(25);
    const safeBlocks = plan.filter((b) => b.safety === 'safe');
    expect(safeBlocks.length).toBe(plan.length);
  });

  it('accepts humidity parameter', () => {
    const dry = generateDailyPlan(35, 20);
    const humid = generateDailyPlan(35, 85);
    // Humid plan should have more non-safe blocks than dry
    const dryDanger = dry.filter((b) => b.safety !== 'safe').length;
    const humidDanger = humid.filter((b) => b.safety !== 'safe').length;
    expect(humidDanger).toBeGreaterThanOrEqual(dryDanger);
  });

  it('covers the full 24-hour day', () => {
    const plan = generateDailyPlan(42);
    const allHours = new Set<number>();
    plan.forEach((block) => {
      if (block.endHour > block.startHour) {
        for (let h = block.startHour; h < block.endHour; h++) allHours.add(h);
      } else {
        for (let h = block.startHour; h < 24; h++) allHours.add(h);
        for (let h = 0; h < block.endHour; h++) allHours.add(h);
      }
    });
    expect(allHours.size).toBe(24);
  });
});
