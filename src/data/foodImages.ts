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
