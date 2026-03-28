/**
 * Home Dashboard — GPS + Offline Cache
 *
 * No manual city selector. Location via GPS/network only.
 * Offline banner when using cached weather data.
 */

import {
  ScrollView, View, Text, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useLocation } from '@/hooks/useLocation';
import { useWeather } from '@/hooks/useWeather';
import { HeatScoreRing } from '@/components/home/HeatScoreRing';
import { ActionCard } from '@/components/home/ActionCard';
import { HourlyTimeline } from '@/components/home/HourlyTimeline';
import { QuickActions } from '@/components/home/QuickActions';
import { WeatherMini } from '@/components/home/WeatherMini';

export default function HomeScreen() {
  const location = useLocation();
  const { weather, heatScore, loading, refresh, lastUpdated, isOffline } = useWeather({
    city: location.city,
    coords: location.coords,
  });

  if ((loading || location.loading) && !weather) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {location.loading ? 'Detecting your location...' : 'Checking the heat...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!weather || !heatScore) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorEmoji}>☀️</Text>
          <Text style={styles.errorText}>Unable to load weather</Text>
          <Text style={styles.errorHint}>Pull down to retry</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sourceEmoji = {
    gps: '📍', network: '📶', cache: '💾', manual: '✏️', default: '🏙️',
  }[location.source];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={async () => {
              await location.refresh();
              await refresh();
            }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>SunSuraksha</Text>
            <Text style={styles.cityText}>{sourceEmoji} {weather.city}</Text>
          </View>
          <Text style={styles.updated}>
            {lastUpdated ? `Updated ${lastUpdated}` : ''}
          </Text>
        </View>

        {/* Offline banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              📴 Offline — showing cached weather data
            </Text>
          </View>
        )}

        <HeatScoreRing
          score={heatScore.score}
          feelsLikeC={weather.feels_like_c}
          tempC={weather.temp_c}
          city={weather.city}
        />

        <View style={styles.spacer} />

        <WeatherMini
          humidity={weather.humidity_pct}
          uvIndex={weather.uv_index}
          windSpeed={weather.wind_speed_kmh}
        />

        <View style={styles.spacer} />

        <ActionCard
          action={heatScore.primaryAction}
          safeWindowStart={heatScore.safeWindowStart}
          safeWindowEnd={heatScore.safeWindowEnd}
          score={heatScore.score}
        />

        <View style={styles.spacer} />

        <HourlyTimeline feelsLikeC={weather.feels_like_c} humidity={weather.humidity_pct} />

        <View style={styles.spacerLg} />

        <QuickActions />

        <View style={styles.spacerLg} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },
  appName: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.primary },
  cityText: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 4 },
  updated: { fontSize: Typography.size.xs, color: Colors.textLight, marginTop: 4 },

  offlineBanner: {
    backgroundColor: Colors.moderateBg, marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, padding: Spacing.sm + 2, marginBottom: Spacing.md,
  },
  offlineText: { fontSize: Typography.size.xs, color: Colors.moderate, textAlign: 'center', fontWeight: Typography.weight.medium },

  spacer: { height: Spacing.lg },
  spacerLg: { height: Spacing.xxl },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: Typography.size.body, color: Colors.textSecondary },
  errorEmoji: { fontSize: 48 },
  errorText: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: Colors.text },
  errorHint: { fontSize: Typography.size.sm, color: Colors.textSecondary },
});
