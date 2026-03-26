/**
 * Daily Plan v2 — Scenario Tests
 *
 * Tests temperature curve + humidity-aware plan generation.
 */

import { generateDailyPlan } from '@/utils/dailyPlan';

describe('Daily Plan — Indian City Scenarios', () => {
  it('Nagpur 47°C dry: has extreme blocks during midday', () => {
    const plan = generateDailyPlan(47, 25);
    const extreme = plan.filter((b) => b.safety === 'extreme');
    expect(extreme.length).toBeGreaterThan(0);
  });

  it('Mumbai 34°C + 85% humidity: humidity pushes blocks into danger', () => {
    const plan = generateDailyPlan(34, 85);
    const dangerPlus = plan.filter((b) => b.safety === 'danger' || b.safety === 'extreme');
    expect(dangerPlus.length).toBeGreaterThan(0);
  });

  it('Mumbai 34°C + 30% humidity: no danger blocks (dry heat is tolerable)', () => {
    const plan = generateDailyPlan(34, 30);
    const danger = plan.filter((b) => b.safety === 'danger' || b.safety === 'extreme');
    expect(danger.length).toBe(0);
  });

  it('Delhi 45°C + 20% humidity: extreme midday despite low humidity', () => {
    const plan = generateDailyPlan(45, 20);
    const extreme = plan.filter((b) => b.safety === 'extreme' || b.safety === 'danger');
    expect(extreme.length).toBeGreaterThan(0);
  });

  it('Bangalore 28°C + 60% humidity: all safe or caution at most', () => {
    const plan = generateDailyPlan(28, 60);
    const danger = plan.filter((b) => b.safety === 'danger' || b.safety === 'extreme');
    expect(danger.length).toBe(0);
  });

  it('Shimla 20°C: all blocks are safe', () => {
    const plan = generateDailyPlan(20, 40);
    expect(plan.every((b) => b.safety === 'safe')).toBe(true);
  });
});

describe('Daily Plan — New v2 Fields', () => {
  it('every block has drinkTip', () => {
    const plan = generateDailyPlan(42, 50);
    plan.forEach((block) => {
      expect(block.drinkTip).toBeTruthy();
      expect(block.drinkTip!.length).toBeGreaterThan(5);
    });
  });

  it('danger/extreme blocks have clothingTip', () => {
    const plan = generateDailyPlan(46, 50);
    const dangerBlocks = plan.filter((b) => b.safety === 'danger' || b.safety === 'extreme');
    dangerBlocks.forEach((block) => {
      expect(block.clothingTip).toBeTruthy();
    });
  });

  it('safe blocks may not have clothingTip', () => {
    const plan = generateDailyPlan(25, 40);
    const safeBlocks = plan.filter((b) => b.safety === 'safe');
    safeBlocks.forEach((block) => {
      expect(block.clothingTip).toBeUndefined();
    });
  });

  it('every block has estTempRange', () => {
    const plan = generateDailyPlan(42, 50);
    plan.forEach((block) => {
      expect(block.estTempRange).toBeTruthy();
      expect(block.estTempRange).toMatch(/\d+–\d+°C/);
    });
  });

  it('recommendations contain actual temperature values', () => {
    const plan = generateDailyPlan(42, 50);
    plan.forEach((block) => {
      expect(block.recommendation).toMatch(/~\d+°C/);
    });
  });
});

describe('Daily Plan — Structure', () => {
  it('always returns exactly 8 time blocks', () => {
    [25, 35, 42, 48].forEach((temp) => {
      const plan = generateDailyPlan(temp);
      expect(plan.length).toBe(8);
    });
  });

  it('every block has activities array with items', () => {
    [30, 36, 42, 48].forEach((temp) => {
      generateDailyPlan(temp).forEach((block) => {
        expect(Array.isArray(block.activities)).toBe(true);
        expect(block.activities.length).toBeGreaterThan(0);
      });
    });
  });

  it('no duplicate time ranges', () => {
    [30, 42, 48].forEach((temp) => {
      const plan = generateDailyPlan(temp);
      const ranges = plan.map((b) => `${b.startHour}-${b.endHour}`);
      expect(new Set(ranges).size).toBe(ranges.length);
    });
  });

  it('safe blocks always exist (night is always safe)', () => {
    [30, 36, 42, 50].forEach((temp) => {
      const plan = generateDailyPlan(temp, 50);
      const safe = plan.filter((b) => b.safety === 'safe');
      expect(safe.length).toBeGreaterThan(0);
    });
  });
});
