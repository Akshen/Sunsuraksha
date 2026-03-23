/**
 * WeatherMini — Compact weather stats row
 *
 * Shows humidity, UV index, and wind speed in a single row.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface WeatherMiniProps {
  humidity: number;
  uvIndex: number;
  windSpeed: number;
}

function StatItem({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function WeatherMini({ humidity, uvIndex, windSpeed }: WeatherMiniProps) {
  const uvLabel = uvIndex >= 11 ? 'Extreme' : uvIndex >= 8 ? 'Very high' : uvIndex >= 6 ? 'High' : uvIndex >= 3 ? 'Moderate' : 'Low';

  return (
    <View style={styles.container}>
      <StatItem emoji="💧" value={`${humidity}%`} label="Humidity" />
      <View style={styles.divider} />
      <StatItem emoji="☀️" value={`${uvIndex}`} label={uvLabel} />
      <View style={styles.divider} />
      <StatItem emoji="💨" value={`${Math.round(windSpeed)}`} label="km/h wind" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  label: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
});
