/**
 * Home Dashboard v3
 *
 * - Shows offline banner when using cached data
 * - Tappable city name opens city selector modal
 * - Location source indicator (GPS/Network/Cache/Manual)
 */

import { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, Modal, FlatList, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useLocation, INDIAN_CITIES } from '@/hooks/useLocation';
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
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const filteredCities = citySearch
    ? INDIAN_CITIES.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
    : INDIAN_CITIES;

  function selectCity(cityName: string) {
    location.setManualCity(cityName);
    setShowCityModal(false);
    setCitySearch('');
    refresh();
  }

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
            {/* Tappable city name */}
            <TouchableOpacity
              onPress={() => setShowCityModal(true)}
              style={styles.cityRow}
              activeOpacity={0.6}
            >
              <Text style={styles.cityText}>
                {sourceEmoji} {weather.city}
              </Text>
              <Text style={styles.changeCity}>Change</Text>
            </TouchableOpacity>
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

      {/* City selector modal */}
      <Modal visible={showCityModal} animationType="slide" transparent onRequestClose={() => setShowCityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select your city</Text>
              <TouchableOpacity onPress={() => { setShowCityModal(false); setCitySearch(''); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search city..."
              placeholderTextColor={Colors.textLight}
              value={citySearch}
              onChangeText={setCitySearch}
              autoFocus
            />

            {/* Auto-detect option */}
            <TouchableOpacity
              style={styles.detectButton}
              onPress={async () => {
                setShowCityModal(false);
                setCitySearch('');
                await location.refresh();
                await refresh();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.detectEmoji}>📍</Text>
              <Text style={styles.detectText}>Auto-detect my location</Text>
            </TouchableOpacity>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => selectCity(item)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.cityItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.cityList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  cityText: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  changeCity: { fontSize: Typography.size.xs, color: Colors.primary, fontWeight: Typography.weight.medium },
  updated: { fontSize: Typography.size.xs, color: Colors.textLight, marginTop: 4 },

  // Offline
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl,
    maxHeight: '70%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.text },
  modalClose: { fontSize: 20, color: Colors.textSecondary, padding: Spacing.sm },

  searchInput: {
    backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: Typography.size.body, color: Colors.text, marginBottom: Spacing.md,
  },

  detectButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  detectEmoji: { fontSize: 16 },
  detectText: { fontSize: Typography.size.sm, color: Colors.primaryDark, fontWeight: Typography.weight.semibold },

  cityList: { flex: 1 },
  cityItem: {
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  cityItemText: { fontSize: Typography.size.body, color: Colors.text },
});
