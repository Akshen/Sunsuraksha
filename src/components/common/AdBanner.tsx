/**
 * AdBanner — Crash-proof Google AdMob banner
 *
 * Triple safety layer:
 * 1. Try/catch around require (Expo Go safety)
 * 2. Try/catch around initialization
 * 3. ErrorBoundary-style state to hide on any error
 *
 * If ANYTHING goes wrong, the banner silently disappears.
 * The app never crashes due to ads.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

const AD_UNIT_ID = 'ca-app-pub-5170234993465769/3283353660';
const TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

export function AdBanner() {
  const [AdComponent, setAdComponent] = useState<React.ComponentType<any> | null>(null);
  const [adSize, setAdSize] = useState<any>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    // Delay initialization to let the app fully load first
    const timer = setTimeout(() => {
      try {
        const admob = require('react-native-google-mobile-ads');

        // Initialize mobile ads SDK
        if (admob.default && admob.default.initialize) {
          admob.default.initialize().catch(() => {});
        } else if (admob.MobileAds) {
          admob.MobileAds().initialize().catch(() => {});
        }

        setAdComponent(() => admob.BannerAd);
        setAdSize(admob.BannerAdSize?.BANNER || 'BANNER');
      } catch {
        // Module not available — Expo Go or build issue
        setAdFailed(true);
      }
    }, 3000); // Wait 3 seconds after app loads

    return () => clearTimeout(timer);
  }, []);

  // Don't render if module unavailable or failed
  if (adFailed || !AdComponent) return null;

  const unitId = __DEV__ ? TEST_AD_UNIT_ID : AD_UNIT_ID;

  try {
    return (
      <View style={[styles.container, !adLoaded && styles.hidden]}>
        <AdComponent
          unitId={unitId}
          size={adSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={() => setAdFailed(true)}
        />
      </View>
    );
  } catch {
    // Render crashed — hide silently
    return null;
  }
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
