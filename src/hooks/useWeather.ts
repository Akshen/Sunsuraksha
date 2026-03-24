/**
 * useWeather — Custom hook for weather data
 *
 * Accepts either a city name OR GPS coordinates.
 * If coords are provided, uses them for more accurate weather.
 * Auto-refreshes every 15 minutes.
 *
 * Usage:
 *   const { weather, heatScore, loading, refresh } = useWeather({ city: 'Mumbai' });
 *   const { weather } = useWeather({ coords: { lat: 19.07, lon: 72.87 } });
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchWeather, fetchWeatherByCoords } from '@/services/weather';
import { calculateHeatScore } from '@/utils/heatScore';
import type { WeatherData, HeatScore } from '@/types';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

interface UseWeatherParams {
  city?: string;
  coords?: { lat: number; lon: number } | null;
}

interface UseWeatherResult {
  weather: WeatherData | null;
  heatScore: HeatScore | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

export function useWeather(params: UseWeatherParams): UseWeatherResult {
  const { city = 'Delhi', coords } = params;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const heatScore = useMemo(() => {
    if (!weather) return null;
    return calculateHeatScore(weather);
  }, [weather]);

  const lastUpdated = useMemo(() => {
    if (!weather) return null;
    return new Date(weather.updated_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [weather]);

  const loadWeather = useCallback(async () => {
    try {
      setError(null);
      let data: WeatherData;

      if (coords) {
        // Use GPS coordinates for accurate location-based weather
        data = await fetchWeatherByCoords(coords.lat, coords.lon);
      } else {
        // Fall back to city name lookup
        data = await fetchWeather(city);
      }

      setWeather(data);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('useWeather error:', err);
    } finally {
      setLoading(false);
    }
  }, [city, coords?.lat, coords?.lon]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadWeather();
  }, [loadWeather]);

  useEffect(() => {
    loadWeather();

    intervalRef.current = setInterval(loadWeather, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadWeather]);

  return {
    weather,
    heatScore,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}
