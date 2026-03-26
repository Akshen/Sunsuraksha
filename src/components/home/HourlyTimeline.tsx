/**
 * HourlyTimeline — Hour-by-hour safety strip (v2)
 *
 * Models how temperature changes through a 24-hour cycle:
 * - Peak heat: 1 PM – 4 PM (highest)
 * - Coolest: 4 AM – 6 AM (lowest, ~60-70% of peak)
 * - Morning rise: 6 AM – 1 PM
 * - Evening drop: 4 PM – 10 PM
 *
 * Factors in humidity to compute a "heat index" per hour,
 * then maps to safety levels.
 */

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface HourlyTimelineProps {
  feelsLikeC: number;
  humidity: number;
}

type Safety = 'safe' | 'caution' | 'danger' | 'extreme';

interface HourData {
  hour: number;
  estTempC: number;
  heatIndex: number;
  safety: Safety;
}

const safetyColors = {
  safe: { bg: Colors.safeBg, bar: Colors.safe },
  caution: { bg: Colors.moderateBg, bar: Colors.moderate },
  danger: { bg: Colors.dangerBg, bar: Colors.danger },
  extreme: { bg: Colors.extremeBg, bar: Colors.extreme },
};

/**
 * Estimate temperature at a given hour based on current feels-like.
 * Uses a sinusoidal model: peak at 14:00, trough at 05:00.
 * The curve assumes daytime high = feelsLikeC, nighttime low = feelsLikeC × 0.65
 */
function estimateTempAtHour(hour: number, currentFeelsLike: number): number {
  // Peak hour = 14 (2 PM), trough hour = 5 (5 AM)
  // Map hour to a 0-2π cycle where 14 = peak, 5 = trough
  const peakHour = 14;
  const offset = ((hour - peakHour) / 24) * 2 * Math.PI;

  // Cosine gives 1 at peak, -1 at trough
  const factor = Math.cos(offset);

  // Range: night low is ~65% of peak, day high is 100%
  const nightRatio = 0.65;
  const midpoint = currentFeelsLike * ((1 + nightRatio) / 2);
  const amplitude = currentFeelsLike * ((1 - nightRatio) / 2);

  return midpoint + amplitude * factor;
}

/**
 * Simplified heat index: accounts for humidity making heat worse.
 * Above 40% humidity and 30°C, each 10% humidity adds ~1-2°C perceived heat.
 */
function computeHeatIndex(tempC: number, humidity: number): number {
  if (tempC < 27 || humidity < 40) return tempC;

  const humidityPenalty = ((humidity - 40) / 10) * 1.5;
  return tempC + humidityPenalty;
}

/**
 * Map heat index to safety level
 */
function getSafety(heatIndex: number): Safety {
  if (heatIndex >= 47) return 'extreme';
  if (heatIndex >= 40) return 'danger';
  if (heatIndex >= 33) return 'caution';
  return 'safe';
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

export function HourlyTimeline({ feelsLikeC, humidity }: HourlyTimelineProps) {
  const currentHour = new Date().getHours();

  // Generate 24 hours of data
  const hours: HourData[] = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHour + i) % 24;
    const estTempC = estimateTempAtHour(hour, feelsLikeC);
    const heatIndex = computeHeatIndex(estTempC, humidity);
    const safety = getSafety(heatIndex);

    return { hour, estTempC, heatIndex, safety };
  });

  // For bar height scaling
  const maxHI = Math.max(...hours.map((h) => h.heatIndex));
  const minHI = Math.min(...hours.map((h) => h.heatIndex));
  const range = Math.max(maxHI - minHI, 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Next 24 hours</Text>
        <View style={styles.legend}>
          <LegendDot color={Colors.safe} label="Safe" />
          <LegendDot color={Colors.moderate} label="Caution" />
          <LegendDot color={Colors.danger} label="Danger" />
          <LegendDot color={Colors.extreme} label="Extreme" />
        </View>
      </View>

      {/* Scrollable timeline */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map((data, index) => {
          const colors = safetyColors[data.safety];
          const isNow = index === 0;

          // Bar height: 20px min, 56px max — proportional to heat index
          const barHeight = 20 + ((data.heatIndex - minHI) / range) * 36;

          return (
            <View key={`${data.hour}-${index}`} style={styles.hourBlock}>
              {/* Estimated temp (shown on every 3rd block + Now) */}
              <Text style={styles.tempLabel}>
                {(isNow || index % 3 === 0) ? `${Math.round(data.estTempC)}°` : ''}
              </Text>

              {/* Variable-height bar */}
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: colors.bar,
                      opacity: isNow ? 1 : 0.7,
                    },
                    isNow && styles.barNow,
                  ]}
                />
              </View>

              {/* Hour label */}
              <Text style={[styles.hourLabel, isNow && styles.hourLabelNow]}>
                {isNow ? 'Now' : formatHour(data.hour)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  scrollContent: {
    gap: 4,
    paddingRight: Spacing.xl,
    alignItems: 'flex-end',
  },
  hourBlock: {
    alignItems: 'center',
    width: 36,
  },
  tempLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
    height: 14,
    textAlign: 'center',
  },
  barContainer: {
    height: 56,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 22,
    borderRadius: BorderRadius.sm,
    minHeight: 20,
  },
  barNow: {
    width: 26,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  hourLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: Typography.weight.medium,
  },
  hourLabelNow: {
    color: Colors.primary,
    fontWeight: Typography.weight.bold,
  },
});
