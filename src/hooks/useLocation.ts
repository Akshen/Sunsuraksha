/**
 * useLocation v2 — Multi-strategy location detection
 *
 * Priority:
 * 1. GPS (high accuracy)
 * 2. Network/cell tower (low accuracy, works indoors)
 * 3. Cached last-known city (from AsyncStorage)
 * 4. Manual city selection
 * 5. Default: Mumbai
 *
 * Caches the detected city so it works offline on next launch.
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'sunsuraksha_last_location';

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
  source: 'gps' | 'network' | 'cache' | 'manual' | 'default';
  refresh: () => Promise<void>;
  setManualCity: (city: string) => void;
}

export function useLocation(): UseLocationResult {
  const [city, setCity] = useState<string>('Mumbai');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<UseLocationResult['source']>('default');

  // Save location to cache
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

  // Load cached location
  async function loadCachedLocation(): Promise<CachedLocation | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data: CachedLocation = JSON.parse(raw);

      // Cache valid for 24 hours
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age > 24 * 60 * 60 * 1000) return null;

      return data;
    } catch {
      return null;
    }
  }

  // Main detection
  async function detectLocation() {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // Try cache first
        const cached = await loadCachedLocation();
        if (cached) {
          setCity(cached.city);
          setCoords(cached.coords);
          setSource('cache');
          setLoading(false);
          return;
        }
        setError('Location permission denied');
        setSource('default');
        setLoading(false);
        return;
      }

      // Step 2: Try GPS first (balanced accuracy — uses GPS + network + cell)
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        } as any);

        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lon: longitude };
        setCoords(loc);

        // Determine source based on accuracy
        const isGPS = (position.coords.accuracy ?? 100) < 50;
        setSource(isGPS ? 'gps' : 'network');

        // Reverse geocode
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const detectedCity = place?.city || place?.subregion || place?.region || 'Your location';

        setCity(detectedCity);
        await cacheLocation(detectedCity, loc);
      } catch (locError) {
        // Step 3: GPS/network failed — try last known location
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

        // Step 4: Try cache
        const cached = await loadCachedLocation();
        if (cached) {
          setCity(cached.city);
          setCoords(cached.coords);
          setSource('cache');
          setLoading(false);
          return;
        }

        setError('Could not detect location');
        setSource('default');
      }
    } catch (err) {
      // Final fallback: cache
      const cached = await loadCachedLocation();
      if (cached) {
        setCity(cached.city);
        setCoords(cached.coords);
        setSource('cache');
      } else {
        setError('Location unavailable');
        setSource('default');
      }
    } finally {
      setLoading(false);
    }
  }

  // Manual city selection
  const setManualCity = useCallback((cityName: string) => {
    // Look up coords from our Indian cities list
    const cityCoords = INDIAN_CITY_COORDS[cityName.toLowerCase().trim()];
    if (cityCoords) {
      setCity(cityName);
      setCoords(cityCoords);
      setSource('manual');
      cacheLocation(cityName, cityCoords);
    } else {
      setCity(cityName);
      setCoords(null);
      setSource('manual');
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, []);

  return {
    city,
    loading,
    error,
    coords,
    source,
    refresh: detectLocation,
    setManualCity,
  };
}

// City coordinates for manual selection
const INDIAN_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'bengaluru': { lat: 12.9716, lon: 77.5946 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'patna': { lat: 25.6093, lon: 85.1376 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'chandigarh': { lat: 30.7333, lon: 76.7794 },
  'gurgaon': { lat: 28.4595, lon: 77.0266 },
  'gurugram': { lat: 28.4595, lon: 77.0266 },
  'noida': { lat: 28.5355, lon: 77.3910 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'ranchi': { lat: 23.3441, lon: 85.3096 },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245 },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
  'coimbatore': { lat: 11.0168, lon: 76.9558 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'agra': { lat: 27.1767, lon: 78.0081 },
  'madurai': { lat: 9.9252, lon: 78.1198 },
  'guwahati': { lat: 26.1445, lon: 91.7362 },
  'dehradun': { lat: 30.3165, lon: 78.0322 },
  'shimla': { lat: 31.1048, lon: 77.1734 },
  'amritsar': { lat: 31.6340, lon: 74.8723 },
  'jodhpur': { lat: 26.2389, lon: 73.0243 },
  'udaipur': { lat: 24.5854, lon: 73.7125 },
};

/** Exportable list for city selector UI */
export const INDIAN_CITIES = Object.keys(INDIAN_CITY_COORDS)
  .filter((c) => !['new delhi', 'bengaluru', 'gurugram'].includes(c)) // Remove duplicates
  .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
  .sort();
