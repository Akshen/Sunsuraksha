/**
 * Food Local Images Tests
 *
 * Verifies the local image mapping system works correctly
 * and falls back to remote URLs for unmapped items.
 */

import { getFoodImageSource, LOCAL_FOOD_IMAGES } from '@/data/foodImages';

describe('LOCAL_FOOD_IMAGES map', () => {
  it('has exactly 24 bundled images', () => {
    expect(Object.keys(LOCAL_FOOD_IMAGES).length).toBe(24);
  });

  it('contains all expected IDs', () => {
    const expectedIds = [
      'food_005', 'food_007', 'food_008', 'food_009',
      'food_011', 'food_012', 'food_013', 'food_014', 'food_015', 'food_016', 'food_017',
      'drink_002', 'drink_003', 'drink_004', 'drink_005', 'drink_006',
      'drink_007', 'drink_008', 'drink_009', 'drink_010', 'drink_011', 'drink_012',
      'avoid_003', 'avoid_005',
    ];
    expectedIds.forEach((id) => {
      expect(LOCAL_FOOD_IMAGES[id]).toBeDefined();
    });
  });

  it('does not contain items that use remote URLs', () => {
    const remoteOnly = ['food_001', 'food_002', 'food_004', 'drink_001', 'avoid_001'];
    remoteOnly.forEach((id) => {
      expect(LOCAL_FOOD_IMAGES[id]).toBeUndefined();
    });
  });
});

describe('getFoodImageSource', () => {
  it('returns local source for bundled items', () => {
    const source = getFoodImageSource('food_007', 'https://example.com/fallback.jpg');
    // In Jest, require() returns a mock (number or string depending on transform)
    // Key check: it should NOT be a URI object
    expect(source).not.toEqual({ uri: 'https://example.com/fallback.jpg' });
  });

  it('returns remote URI for non-bundled items', () => {
    const url = 'https://images.unsplash.com/photo-123?w=400';
    const source = getFoodImageSource('food_001', url);
    expect(source).toEqual({ uri: url });
  });

  it('returns remote URI for unknown IDs', () => {
    const url = 'https://example.com/image.jpg';
    const source = getFoodImageSource('nonexistent_999', url);
    expect(source).toEqual({ uri: url });
  });

  it('every bundled image returns a non-URI source', () => {
    Object.keys(LOCAL_FOOD_IMAGES).forEach((id) => {
      const source = getFoodImageSource(id, 'https://fallback.com');
      expect(source).not.toEqual({ uri: 'https://fallback.com' });
    });
  });
});
