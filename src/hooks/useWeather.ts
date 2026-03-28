/**
 * useWeather v2 — Offline-capable weather hook
 *
 * Strategy:
 * 1. Try live API fetch
 * 2. On failure → load cached weather from AsyncStorage
 * 3. On cache miss → return mock data
 *
 * Cache is valid for 6 hours.
 * Auto-refreshes every 15 minutes when online.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeather, fetchWeatherByCoords } from '@/services/weather';
import { calculateHeatScore } from '@/utils/heatScore';
import type { WeatherData, HeatScore } from '@/types';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const CACHE_KEY = 'sunsuraksha_weather_cache';
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

interface UseWeatherParams {
  city?: string;
  coords?: { lat: number; lon: number } | null;
}

interface UseWeatherResult {
  weather: WeatherData | null;
  heatScore: HeatScore | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

async function cacheWeather(data: WeatherData): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

async function loadCachedWeather(): Promise<WeatherData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: WeatherData = JSON.parse(raw);

    // Check age
    const age = Date.now() - new Date(data.updated_at).getTime();
    if (age > CACHE_MAX_AGE_MS) return null;

    return data;
  } catch {
    return null;
  }
}

export function useWeather(params: UseWeatherParams): UseWeatherResult {
  const { city = 'Mumbai', coords } = params;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
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
        data = await fetchWeatherByCoords(coords.lat, coords.lon);
      } else {
        data = await fetchWeather(city);
      }

      setWeather(data);
      setIsOffline(false);
      await cacheWeather(data);
    } catch (err) {
      // Network failed — try cache
      const cached = await loadCachedWeather();
      if (cached) {
        setWeather(cached);
        setIsOffline(true);
        setError('Using cached data — no internet');
      } else {
        // No cache either — use mock data so app still works
        const mockData: WeatherData = {
          city: city || 'Mumbai',
          temp_c: 35,
          feels_like_c: 38,
          humidity_pct: 60,
          uv_index: 6,
          wind_speed_kmh: 12,
          description: 'Data unavailable',
          icon: '01d',
          updated_at: new Date().toISOString(),
        };
        setWeather(mockData);
        setIsOffline(true);
        setError('Offline — showing estimated data');
      }
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadWeather]);

  return {
    weather,
    heatScore,
    loading,
    error,
    isOffline,
    refresh,
    lastUpdated,
  };
}
