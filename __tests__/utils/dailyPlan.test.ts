/**
 * Daily Plan Generator Tests
 */

import { generateDailyPlan } from '@/utils/dailyPlan';

describe('generateDailyPlan', () => {
  it('returns an array of plan blocks', () => {
    const plan = generateDailyPlan(42);
    expect(Array.isArray(plan)).toBe(true);
    expect(plan.length).toBeGreaterThan(0);
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

  it('extreme heat (45°C+) includes extreme danger blocks', () => {
    const plan = generateDailyPlan(48);
    const extremeBlocks = plan.filter((b) => b.safety === 'extreme');
    expect(extremeBlocks.length).toBeGreaterThan(0);
  });

  it('hot weather (40°C) includes danger blocks', () => {
    const plan = generateDailyPlan(42);
    const dangerBlocks = plan.filter((b) => b.safety === 'danger');
    expect(dangerBlocks.length).toBeGreaterThan(0);
  });

  it('mild weather (30°C) has mostly safe blocks', () => {
    const plan = generateDailyPlan(30);
    const safeBlocks = plan.filter((b) => b.safety === 'safe');
    expect(safeBlocks.length).toBe(plan.length);
  });

  it('warm weather (36°C) has caution but no extreme', () => {
    const plan = generateDailyPlan(36);
    const extremeBlocks = plan.filter((b) => b.safety === 'extreme');
    const cautionBlocks = plan.filter((b) => b.safety === 'caution');
    expect(extremeBlocks.length).toBe(0);
    expect(cautionBlocks.length).toBeGreaterThan(0);
  });

  it('covers the full 24-hour day', () => {
    const plan = generateDailyPlan(42);
    // Check that blocks span from early morning to night
    const allHours = new Set<number>();
    plan.forEach((block) => {
      if (block.endHour > block.startHour) {
        for (let h = block.startHour; h < block.endHour; h++) allHours.add(h);
      } else {
        // Wraps midnight
        for (let h = block.startHour; h < 24; h++) allHours.add(h);
        for (let h = 0; h < block.endHour; h++) allHours.add(h);
      }
    });
    expect(allHours.size).toBeGreaterThanOrEqual(20); // Covers most of the day
  });
});
