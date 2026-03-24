/**
 * useWeather — Custom hook for weather data
 *
 * Fetches weather for the user's city, caches in state,
 * auto-refreshes every 15 minutes, and exposes a manual refresh.
 *
 * Usage:
 *   const { weather, heatScore, loading, refresh } = useWeather('Delhi');
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchWeather } from '@/services/weather';
import { calculateHeatScore } from '@/utils/heatScore';
import type { WeatherData, HeatScore } from '@/types';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

interface UseWeatherResult {
  weather: WeatherData | null;
  heatScore: HeatScore | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

export function useWeather(city: string): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute heat score from weather data
  const heatScore = useMemo(() => {
    if (!weather) return null;
    return calculateHeatScore(weather);
  }, [weather]);

  // Format last updated time
  const lastUpdated = useMemo(() => {
    if (!weather) return null;
    return new Date(weather.updated_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [weather]);

  // Fetch weather data
  const loadWeather = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('useWeather error:', err);
    } finally {
      setLoading(false);
    }
  }, [city]);

  // Manual refresh (for pull-to-refresh)
  const refresh = useCallback(async () => {
    setLoading(true);
    await loadWeather();
  }, [loadWeather]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    loadWeather();

    // Auto-refresh every 15 min
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
