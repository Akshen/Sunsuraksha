/**
 * TimeBlockCard — A single time block in the daily planner
 *
 * Shows time range, safety level (color-coded), and recommendation.
 * "Now" block is highlighted.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

type Safety = 'safe' | 'caution' | 'danger' | 'extreme';

interface TimeBlockCardProps {
  startHour: number;
  endHour: number;
  safety: Safety;
  label: string;
  recommendation: string;
  activities: string[];
  isNow: boolean;
}

const safetyConfig: Record<Safety, { bg: string; accent: string; emoji: string; tag: string }> = {
  safe: { bg: Colors.safeBg, accent: Colors.safe, emoji: '✅', tag: 'Safe to go out' },
  caution: { bg: Colors.moderateBg, accent: Colors.moderate, emoji: '⚠️', tag: 'Be careful' },
  danger: { bg: Colors.dangerBg, accent: Colors.danger, emoji: '🔴', tag: 'Stay indoors' },
  extreme: { bg: Colors.extremeBg, accent: Colors.extreme, emoji: '🚨', tag: 'Do not go out' },
};

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

export function TimeBlockCard({
  startHour,
  endHour,
  safety,
  label,
  recommendation,
  activities,
  isNow,
}: TimeBlockCardProps) {
  const config = safetyConfig[safety];

  return (
    <View style={[styles.container, isNow && styles.nowContainer]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: config.accent }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeText}>
              {formatHour(startHour)} — {formatHour(endHour)}
            </Text>
            {isNow && (
              <View style={styles.nowBadge}>
                <Text style={styles.nowText}>NOW</Text>
              </View>
            )}
          </View>
          <View style={[styles.safetyBadge, { backgroundColor: config.bg }]}>
            <Text style={styles.safetyEmoji}>{config.emoji}</Text>
            <Text style={[styles.safetyText, { color: config.accent }]}>{config.tag}</Text>
          </View>
        </View>

        {/* Label */}
        <Text style={styles.label}>{label}</Text>

        {/* Recommendation */}
        <Text style={styles.recommendation}>{recommendation}</Text>

        {/* Activities */}
        {activities.length > 0 && (
          <View style={styles.activitiesRow}>
            {activities.map((activity, i) => (
              <View key={i} style={[styles.activityChip, { backgroundColor: config.bg }]}>
                <Text style={[styles.activityText, { color: config.accent }]}>{activity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  nowContainer: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  nowBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  nowText: {
    fontSize: 9,
    fontWeight: Typography.weight.bold,
    color: Colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
  },
  safetyEmoji: {
    fontSize: 11,
  },
  safetyText: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
  },
  label: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  recommendation: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
  },
  activityChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  activityText: {
    fontSize: 11,
    fontWeight: Typography.weight.medium,
  },
});
