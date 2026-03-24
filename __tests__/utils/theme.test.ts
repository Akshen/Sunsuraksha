/**
 * Theme Utility Tests
 *
 * Tests the heat score → color/label mapping functions
 * that drive the entire UI color system.
 */

import { getHeatColor, getHeatBgColor, getHeatLabel, Colors } from '@/constants/theme';

describe('getHeatColor', () => {
  it('returns safe color for score 0-30', () => {
    expect(getHeatColor(0)).toBe(Colors.safe);
    expect(getHeatColor(15)).toBe(Colors.safe);
    expect(getHeatColor(30)).toBe(Colors.safe);
  });

  it('returns moderate color for score 31-55', () => {
    expect(getHeatColor(31)).toBe(Colors.moderate);
    expect(getHeatColor(45)).toBe(Colors.moderate);
    expect(getHeatColor(55)).toBe(Colors.moderate);
  });

  it('returns danger color for score 56-75', () => {
    expect(getHeatColor(56)).toBe(Colors.danger);
    expect(getHeatColor(65)).toBe(Colors.danger);
    expect(getHeatColor(75)).toBe(Colors.danger);
  });

  it('returns extreme color for score 76-100', () => {
    expect(getHeatColor(76)).toBe(Colors.extreme);
    expect(getHeatColor(90)).toBe(Colors.extreme);
    expect(getHeatColor(100)).toBe(Colors.extreme);
  });
});

describe('getHeatBgColor', () => {
  it('returns corresponding bg colors', () => {
    expect(getHeatBgColor(20)).toBe(Colors.safeBg);
    expect(getHeatBgColor(40)).toBe(Colors.moderateBg);
    expect(getHeatBgColor(65)).toBe(Colors.dangerBg);
    expect(getHeatBgColor(85)).toBe(Colors.extremeBg);
  });
});

describe('getHeatLabel', () => {
  it('returns correct labels at boundaries', () => {
    expect(getHeatLabel(0)).toBe('Safe');
    expect(getHeatLabel(30)).toBe('Safe');
    expect(getHeatLabel(31)).toBe('Moderate');
    expect(getHeatLabel(55)).toBe('Moderate');
    expect(getHeatLabel(56)).toBe('Danger');
    expect(getHeatLabel(75)).toBe('Danger');
    expect(getHeatLabel(76)).toBe('Extreme');
    expect(getHeatLabel(100)).toBe('Extreme');
  });
});
