/**
 * Local Food Images
 *
 * Maps food/drink/avoid IDs to locally bundled images.
 * These load instantly (no network) and never break.
 *
 * Items not in this map fall back to remote URLs.
 */

import { ImageSourcePropType } from 'react-native';

export const LOCAL_FOOD_IMAGES: Record<string, ImageSourcePropType> = {
  // Original 11
  food_005: require('../../assets/images/food/food_005.png'),
  food_007: require('../../assets/images/food/food_007.png'),
  food_008: require('../../assets/images/food/food_008.png'),
  food_009: require('../../assets/images/food/food_009.png'),
  drink_002: require('../../assets/images/food/drink_002.png'),
  drink_003: require('../../assets/images/food/drink_003.png'),
  drink_004: require('../../assets/images/food/drink_004.png'),
  drink_005: require('../../assets/images/food/drink_005.png'),
  drink_006: require('../../assets/images/food/drink_006.png'),
  avoid_003: require('../../assets/images/food/avoid_003.png'),
  avoid_005: require('../../assets/images/food/avoid_005.png'),
  // New 13
  food_011: require('../../assets/images/food/food_011.png'),
  food_012: require('../../assets/images/food/food_012.png'),
  food_013: require('../../assets/images/food/food_013.png'),
  food_014: require('../../assets/images/food/food_014.png'),
  food_015: require('../../assets/images/food/food_015.png'),
  food_016: require('../../assets/images/food/food_016.png'),
  food_017: require('../../assets/images/food/food_017.png'),
  drink_007: require('../../assets/images/food/drink_007.png'),
  drink_008: require('../../assets/images/food/drink_008.png'),
  drink_009: require('../../assets/images/food/drink_009.png'),
  drink_010: require('../../assets/images/food/drink_010.png'),
  drink_011: require('../../assets/images/food/drink_011.png'),
  drink_012: require('../../assets/images/food/drink_012.png'),
};

/**
 * Get image source for a food/drink item.
 * Returns local asset if available, otherwise remote URL.
 */
export function getFoodImageSource(
  id: string,
  remoteUrl: string
): ImageSourcePropType {
  if (LOCAL_FOOD_IMAGES[id]) {
    return LOCAL_FOOD_IMAGES[id];
  }
  return { uri: remoteUrl };
}
