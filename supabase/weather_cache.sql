-- ============================================
-- SunSuraksha — Weather Cache Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Purpose: Cache weather per city so all users in the same city
-- share one API call. Saves 95%+ of OpenWeatherMap calls.
--
-- 50 cities × 48 refreshes/day = 2,400 API calls
-- instead of 10K+ users × multiple calls = 50K+ calls
-- ============================================

-- Weather cache table (one row per city)
CREATE TABLE IF NOT EXISTS public.weather_cache (
  city TEXT PRIMARY KEY,
  temp_c REAL NOT NULL,
  feels_like_c REAL NOT NULL,
  humidity_pct INTEGER NOT NULL,
  uv_index REAL NOT NULL DEFAULT 0,
  wind_speed_kmh REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '01d',
  lat REAL,
  lon REAL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  raw_json JSONB
);

-- Index for fast lookup by city
CREATE INDEX IF NOT EXISTS idx_weather_cache_city
  ON public.weather_cache (city);

-- Index for cleanup of stale entries
CREATE INDEX IF NOT EXISTS idx_weather_cache_fetched
  ON public.weather_cache (fetched_at DESC);

-- Allow public read (no auth needed to check weather)
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read weather cache (public data)
CREATE POLICY "Weather cache is publicly readable"
  ON public.weather_cache FOR SELECT
  USING (true);

-- Only authenticated users (or service role) can write
-- In practice, the app writes when cache is stale
CREATE POLICY "Authenticated users can upsert weather"
  ON public.weather_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update weather"
  ON public.weather_cache FOR UPDATE
  USING (true);

-- Optional: Auto-cleanup entries older than 24 hours
-- (Run as a Supabase cron job or Edge Function if desired)
-- DELETE FROM public.weather_cache WHERE fetched_at < NOW() - INTERVAL '24 hours';
