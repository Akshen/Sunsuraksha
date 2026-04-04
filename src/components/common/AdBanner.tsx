/**
 * AdBanner — Minimal Google AdMob banner
 *
 * Shows a small banner ad at the bottom of a screen.
 * Gracefully hides if ads fail to load.
 *
 * Usage:
 *   <AdBanner />
 *
 * Note: Only works in production builds (not Expo Go).
 * Uses test IDs in development.
 */

import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Conditionally import to prevent crash in Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const admob = require('react-native-google-mobile-ads');
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
} catch {
  // react-native-google-mobile-ads not available (Expo Go)
}

const AD_UNIT_ID = __DEV__
  ? TestIds?.BANNER ?? 'ca-app-pub-3940256099942544/6300978111' // Google test banner
  : 'ca-app-pub-5170234993465769/3283353660'; // Production banner

export function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Don't render if admob isn't available (Expo Go)
  if (!BannerAd) return null;

  // Don't render if ad failed
  if (adError) return null;

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={() => setAdError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
