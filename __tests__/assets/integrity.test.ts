/**
 * Asset Integrity Tests
 *
 * Validates that all required image assets are properly
 * bundled and can be loaded by require().
 */

import { LOCAL_FOOD_IMAGES } from '@/data/foodImages';

describe('App Assets', () => {
  it('icon.png can be required', () => {
    const icon = require('../../assets/images/icon.png');
    expect(icon).toBeDefined();
  });

  it('adaptive-icon.png can be required', () => {
    const icon = require('../../assets/images/adaptive-icon.png');
    expect(icon).toBeDefined();
  });

  it('splash.png can be required', () => {
    const splash = require('../../assets/images/splash.png');
    expect(splash).toBeDefined();
  });

  it('logo-small.png can be required', () => {
    const logo = require('../../assets/images/logo-small.png');
    expect(logo).toBeDefined();
  });

  it('favicon.png can be required', () => {
    const favicon = require('../../assets/images/favicon.png');
    expect(favicon).toBeDefined();
  });
});

describe('Food Image Assets', () => {
  const expectedLocalImages = [
    'food_005', 'food_007', 'food_008', 'food_009',
    'drink_002', 'drink_003', 'drink_004', 'drink_005', 'drink_006',
    'avoid_003', 'avoid_005',
  ];

  it('all 11 local food images can be required', () => {
    expectedLocalImages.forEach((id) => {
      expect(LOCAL_FOOD_IMAGES[id]).toBeDefined();
    });
  });

  it('food images directory has correct count', () => {
    expect(Object.keys(LOCAL_FOOD_IMAGES).length).toBe(11);
  });
});
