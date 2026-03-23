/**
 * Home Dashboard
 *
 * The main screen of SunSuraksha. Shows:
 * 1. Heat danger score ring (the hero)
 * 2. Weather mini stats (humidity, UV, wind)
 * 3. Action card ("do this now")
 * 4. Hourly safety timeline
 * 5. Quick action buttons
 *
 * Uses mock weather data for now — Step 7 will connect the real API.
 */

import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo, useCallback } from 'react';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { calculateHeatScore } from '@/utils/heatScore';
import { HeatScoreRing } from '@/components/home/HeatScoreRing';
import { ActionCard } from '@/components/home/ActionCard';
import { HourlyTimeline } from '@/components/home/HourlyTimeline';
import { QuickActions } from '@/components/home/QuickActions';
import { WeatherMini } from '@/components/home/WeatherMini';
import type { WeatherData } from '@/types';

// ---- Mock weather data (replaced by real API in Step 7) ----
const MOCK_WEATHER: WeatherData = {
  city: 'Delhi',
  temp_c: 42,
  feels_like_c: 46,
  humidity_pct: 35,
  uv_index: 9,
  wind_speed_kmh: 12,
  description: 'Clear sky',
  icon: '01d',
  updated_at: new Date().toISOString(),
};

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);
  const [refreshing, setRefreshing] = useState(false);

  // Compute heat score from weather data
  const heatScore = useMemo(
    () => calculateHeatScore(weather),
    [weather]
  );

  // Pull-to-refresh (will call real API in Step 7)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch real weather data in Step 7
    // For now, simulate a refresh with slight random variation
    setTimeout(() => {
      setWeather({
        ...MOCK_WEATHER,
        temp_c: MOCK_WEATHER.temp_c + Math.round((Math.random() - 0.5) * 4),
        feels_like_c: MOCK_WEATHER.feels_like_c + Math.round((Math.random() - 0.5) * 4),
        humidity_pct: MOCK_WEATHER.humidity_pct + Math.round((Math.random() - 0.5) * 10),
        updated_at: new Date().toISOString(),
      });
      setRefreshing(false);
    }, 1000);
  }, []);

  // Format last updated time
  const lastUpdated = useMemo(() => {
    const date = new Date(weather.updated_at);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [weather.updated_at]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>SunSuraksha</Text>
            <Text style={styles.tagline}>Stay safe in the heat</Text>
          </View>
          <Text style={styles.updated}>Updated {lastUpdated}</Text>
        </View>

        {/* Heat Score Ring */}
        <HeatScoreRing
          score={heatScore.score}
          feelsLikeC={weather.feels_like_c}
          tempC={weather.temp_c}
          city={weather.city}
        />

        <View style={styles.spacer} />

        {/* Weather Mini Stats */}
        <WeatherMini
          humidity={weather.humidity_pct}
          uvIndex={weather.uv_index}
          windSpeed={weather.wind_speed_kmh}
        />

        <View style={styles.spacer} />

        {/* Action Card */}
        <ActionCard
          action={heatScore.primaryAction}
          safeWindowStart={heatScore.safeWindowStart}
          safeWindowEnd={heatScore.safeWindowEnd}
          score={heatScore.score}
        />

        <View style={styles.spacer} />

        {/* Hourly Timeline */}
        <HourlyTimeline feelsLikeC={weather.feels_like_c} />

        <View style={styles.spacerLg} />

        {/* Quick Actions */}
        <QuickActions />

        <View style={styles.spacerLg} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  appName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  tagline: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  updated: {
    fontSize: Typography.size.xs,
    color: Colors.textLight,
    marginTop: 4,
  },
  spacer: {
    height: Spacing.lg,
  },
  spacerLg: {
    height: Spacing.xxl,
  },
});
