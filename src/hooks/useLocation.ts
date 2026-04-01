/**
 * useLocation — GPS/Network location with offline cache
 *
 * Priority:
 * 1. GPS (high accuracy)
 * 2. Network/cell tower (works indoors)
 * 3. Last known position
 * 4. Cached city from AsyncStorage (24hr validity)
 * 5. Default: Mumbai
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'sunsesuraksha_last_location';

interface CachedLocation {
  city: string;
  coords: { lat: number; lon: number };
  timestamp: string;
}

interface UseLocationResult {
  city: string;
  loading: boolean;
  error: string | null;
  coords: { lat: number; lon: number } | null;
  source: 'gps' | 'network' | 'cache' | 'default';
  refresh: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [city, setCity] = useState<string>('Mumbai');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<UseLocationResult['source']>('default');

  async function cacheLocation(cityName: string, loc: { lat: number; lon: number }) {
    try {
      const data: CachedLocation = {
        city: cityName,
        coords: loc,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
  }

  async function loadCachedLocation(): Promise<CachedLocation | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data: CachedLocation = JSON.parse(raw);
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age > 24 * 60 * 60 * 1000) return null;
      return data;
    } catch {
      return null;
    }
  }

  const detectLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const cached = await loadCachedLocation();
        if (cached) {
          setCity(cached.city);
          setCoords(cached.coords);
          setSource('cache');
        } else {
          setError('Location permission denied');
          setSource('default');
        }
        setLoading(false);
        return;
      }

      // Try current position (GPS + network)
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lon: longitude };
        setCoords(loc);

        const isGPS = (position.coords.accuracy ?? 100) < 50;
        setSource(isGPS ? 'gps' : 'network');

        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const detectedCity = place?.city || place?.subregion || place?.region || 'Your location';
        setCity(detectedCity);
        await cacheLocation(detectedCity, loc);
      } catch {
        // GPS failed — try last known
        try {
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown) {
            const { latitude, longitude } = lastKnown.coords;
            const loc = { lat: latitude, lon: longitude };
            setCoords(loc);
            setSource('network');
            const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
            const detectedCity = place?.city || place?.subregion || place?.region || 'Your location';
            setCity(detectedCity);
            await cacheLocation(detectedCity, loc);
            setLoading(false);
            return;
          }
        } catch {}

        // Try cache
        const cached = await loadCachedLocation();
        if (cached) {
          setCity(cached.city);
          setCoords(cached.coords);
          setSource('cache');
        } else {
          setError('Could not detect location');
          setSource('default');
        }
      }
    } catch {
      const cached = await loadCachedLocation();
      if (cached) {
        setCity(cached.city);
        setCoords(cached.coords);
        setSource('cache');
      } else {
        setSource('default');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { city, loading, error, coords, source, refresh: detectLocation };
}
