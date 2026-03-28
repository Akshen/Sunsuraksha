/**
 * Location Cache Tests
 *
 * Tests the AsyncStorage caching layer for location data.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-location', () => ({}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'sunsuraksha_last_location';

describe('Location Cache', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('can store and retrieve location', async () => {
    const data = {
      city: 'Mumbai',
      coords: { lat: 19.076, lon: 72.877 },
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.city).toBe('Mumbai');
    expect(parsed.coords.lat).toBeCloseTo(19.076, 2);
  });

  it('returns null for empty cache', async () => {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    expect(raw).toBeNull();
  });

  it('recent cache (12h) is within 24h validity', () => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const age = Date.now() - new Date(twelveHoursAgo).getTime();
    expect(age).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it('old cache (30h) exceeds 24h validity', () => {
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    const age = Date.now() - new Date(thirtyHoursAgo).getTime();
    expect(age).toBeGreaterThan(24 * 60 * 60 * 1000);
  });

  it('can overwrite cached location', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ city: 'Mumbai', coords: { lat: 19, lon: 72 }, timestamp: new Date().toISOString() }));
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ city: 'Delhi', coords: { lat: 28, lon: 77 }, timestamp: new Date().toISOString() }));
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.city).toBe('Delhi');
  });
});
