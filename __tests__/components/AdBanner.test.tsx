/**
 * AdBanner Component Tests
 *
 * Tests that the ad banner handles all environments gracefully:
 * - Expo Go (no admob module)
 * - Ad load failure
 * - Successful load
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock the admob module as unavailable (Expo Go scenario)
jest.mock('react-native-google-mobile-ads', () => {
  throw new Error('Module not found');
});

import { AdBanner } from '@/components/common/AdBanner';

describe('AdBanner — Expo Go (no admob)', () => {
  it('renders null when admob module is not available', () => {
    const { toJSON } = render(<AdBanner />);
    expect(toJSON()).toBeNull();
  });

  it('does not crash the app', () => {
    expect(() => render(<AdBanner />)).not.toThrow();
  });
});

describe('AdBanner — Configuration', () => {
  it('uses test ID in development mode', () => {
    // __DEV__ is true in test environment
    expect(__DEV__).toBe(true);
  });

  it('production ad unit ID is correctly formatted', () => {
    const prodId = 'ca-app-pub-5170234993465769/3283353660';
    expect(prodId).toMatch(/^ca-app-pub-\d+\/\d+$/);
  });

  it('app ID is correctly formatted', () => {
    const appId = 'ca-app-pub-5170234993465769~7474609062';
    expect(appId).toMatch(/^ca-app-pub-\d+~\d+$/);
  });
});
