/**
 * useLocation — Get user's current city from GPS
 *
 * Requests location permission, gets coordinates,
 * then reverse-geocodes to a city name.
 * Falls back to 'Delhi' if permission denied or unavailable.
 *
 * Usage:
 *   const { city, loading } = useLocation();
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface UseLocationResult {
  city: string;
  loading: boolean;
  error: string | null;
  coords: { lat: number; lon: number } | null;
  refresh: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [city, setCity] = useState<string>('Delhi');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function detectLocation() {
    try {
      setLoading(true);
      setError(null);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lon: longitude });

      // Reverse geocode to get city name
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (place) {
        // Expo returns city in different fields depending on platform
        const detectedCity =
          place.city ||
          place.subregion ||
          place.region ||
          'Your location';

        setCity(detectedCity);
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
      setError('Could not detect location');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    detectLocation();
  }, []);

  return {
    city,
    loading,
    error,
    coords,
    refresh: detectLocation,
  };
}
