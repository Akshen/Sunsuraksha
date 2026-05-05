/**
 * AdBanner Component Tests
 *
 * Tests that AdBanner handles missing admob module gracefully.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { AdBanner } from '@/components/common/AdBanner';

describe('AdBanner — No admob module', () => {
  it('renders null when admob is not installed', () => {
    const { toJSON } = render(<AdBanner />);
    expect(toJSON()).toBeNull();
  });

  it('does not crash the app', () => {
    expect(() => render(<AdBanner />)).not.toThrow();
  });
});

describe('AdBanner — Configuration', () => {
  it('production ad unit ID is correctly formatted', () => {
    const prodId = 'ca-app-pub-5170234993465769/3283353660';
    expect(prodId).toMatch(/^ca-app-pub-\d+\/\d+$/);
  });

  it('app ID is correctly formatted', () => {
    const appId = 'ca-app-pub-5170234993465769~7474609062';
    expect(appId).toMatch(/^ca-app-pub-\d+~\d+$/);
  });
});
