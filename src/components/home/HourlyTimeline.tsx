/**
 * HourlyTimeline — Hour-by-hour safety strip
 *
 * Scrollable horizontal timeline showing color-coded blocks
 * for each hour (green = safe, amber = caution, red = danger).
 */

import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface HourBlock {
  hour: number;
  safety: 'safe' | 'caution' | 'danger' | 'extreme';
}

interface HourlyTimelineProps {
  feelsLikeC: number;
}

const safetyColors = {
  safe: { bg: Colors.safeBg, dot: Colors.safe },
  caution: { bg: Colors.moderateBg, dot: Colors.moderate },
  danger: { bg: Colors.dangerBg, dot: Colors.danger },
  extreme: { bg: Colors.extremeBg, dot: Colors.extreme },
};

function getHourSafety(hour: number, feelsLikeC: number): HourBlock['safety'] {
  // Night hours are always safe
  if (hour >= 20 || hour <= 4) return 'safe';

  // Early morning and late evening
  if (hour <= 6 || hour >= 18) return 'safe';

  // Base safety on feels-like temperature + time
  if (feelsLikeC >= 45) {
    if (hour >= 10 && hour <= 16) return 'extreme';
    if (hour >= 8 && hour <= 17) return 'danger';
    return 'caution';
  }
  if (feelsLikeC >= 40) {
    if (hour >= 11 && hour <= 15) return 'danger';
    if (hour >= 9 && hour <= 17) return 'caution';
    return 'safe';
  }
  if (feelsLikeC >= 35) {
    if (hour >= 12 && hour <= 14) return 'caution';
    return 'safe';
  }
  return 'safe';
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

export function HourlyTimeline({ feelsLikeC }: HourlyTimelineProps) {
  const currentHour = new Date().getHours();

  // Generate 24 hours starting from current hour
  const hours: HourBlock[] = Array.from({ length: 24 }, (_, i) => {
    const hour = (currentHour + i) % 24;
    return {
      hour,
      safety: getHourSafety(hour, feelsLikeC),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Next 24 hours</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.safe }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.moderate }]} />
            <Text style={styles.legendText}>Caution</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.legendText}>Danger</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map((block, index) => {
          const colors = safetyColors[block.safety];
          const isNow = index === 0;

          return (
            <View key={`${block.hour}-${index}`} style={styles.hourBlock}>
              <View style={[styles.bar, { backgroundColor: colors.bg }]}>
                <View style={[styles.barDot, { backgroundColor: colors.dot }]} />
              </View>
              <Text style={[styles.hourLabel, isNow && styles.hourLabelNow]}>
                {isNow ? 'Now' : formatHour(block.hour)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
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
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  scrollContent: {
    gap: 6,
    paddingRight: Spacing.xl,
  },
  hourBlock: {
    alignItems: 'center',
    width: 38,
  },
  bar: {
    width: 32,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
