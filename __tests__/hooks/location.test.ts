/**
 * Location — City Selector & Coordinate Tests
 *
 * Tests the INDIAN_CITIES export and coordinate lookup.
 * (useLocation hook needs renderHook + native mocks, so we test the data layer)
 */

import { INDIAN_CITIES } from '@/hooks/useLocation';

describe('INDIAN_CITIES list', () => {
  it('exports a non-empty array of city names', () => {
    expect(Array.isArray(INDIAN_CITIES)).toBe(true);
    expect(INDIAN_CITIES.length).toBeGreaterThan(30);
  });

  it('all cities are capitalized strings', () => {
    INDIAN_CITIES.forEach((city) => {
      expect(typeof city).toBe('string');
      expect(city.length).toBeGreaterThan(2);
      expect(city[0]).toBe(city[0].toUpperCase());
    });
  });

  it('is sorted alphabetically', () => {
    const sorted = [...INDIAN_CITIES].sort();
    expect(INDIAN_CITIES).toEqual(sorted);
  });

  it('contains major Indian cities', () => {
    const majorCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'];
    majorCities.forEach((city) => {
      expect(INDIAN_CITIES).toContain(city);
    });
  });

  it('does not contain duplicate entries', () => {
    const unique = new Set(INDIAN_CITIES);
    expect(unique.size).toBe(INDIAN_CITIES.length);
  });

  it('does not contain alias duplicates (Bengaluru/Bangalore both)', () => {
    // We keep only one variant per city
    const lower = INDIAN_CITIES.map((c) => c.toLowerCase());
    expect(lower).not.toContain('bengaluru'); // Should only have Bangalore
    expect(lower).not.toContain('gurugram');  // Should only have Gurgaon
    expect(lower).not.toContain('new delhi'); // Should only have Delhi
  });
});
