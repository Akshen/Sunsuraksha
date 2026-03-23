/**
 * ActionCard — Primary recommendation card
 *
 * Shows the single most important action the user should take right now.
 * Tappable to mark as done or learn more.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface ActionCardProps {
  action: string;
  safeWindowStart: string;
  safeWindowEnd: string;
  score: number;
  onPress?: () => void;
}

export function ActionCard({
  action,
  safeWindowStart,
  safeWindowEnd,
  score,
  onPress,
}: ActionCardProps) {
  const isExtreme = score > 75;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, isExtreme && styles.extremeContainer]}
    >
      <Text style={styles.label}>
        {isExtreme ? '🚨 Right now' : '☀️ Right now'}
      </Text>
      <Text style={[styles.action, isExtreme && styles.extremeAction]}>
        {action}
      </Text>
      <View style={styles.safeWindow}>
        <Text style={styles.safeLabel}>Safe outdoor window</Text>
        <Text style={styles.safeTime}>
          {safeWindowStart} — {safeWindowEnd}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  extremeContainer: {
    backgroundColor: Colors.extremeBg,
    borderColor: Colors.danger,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  action: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  extremeAction: {
    color: Colors.extreme,
  },
  safeWindow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  safeLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  safeTime: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.safe,
  },
});
