/**
 * Badge — Colored status pill
 *
 * Used for heat level indicators, food tags, severity labels, etc.
 */

import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

type BadgeVariant = 'safe' | 'moderate' | 'danger' | 'extreme' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'default';
  style?: ViewStyle;
  testID?: string;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  safe: { bg: Colors.safeBg, text: Colors.safe },
  moderate: { bg: Colors.moderateBg, text: Colors.moderate },
  danger: { bg: Colors.dangerBg, text: Colors.danger },
  extreme: { bg: Colors.extremeBg, text: Colors.extreme },
  info: { bg: '#EDE9FE', text: '#6D28D9' },
  neutral: { bg: Colors.cardAlt, text: Colors.textSecondary },
};

export function Badge({
  label,
  variant = 'neutral',
  size = 'default',
  style,
  testID,
}: BadgeProps) {
  const colors = variantColors[variant];

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        size === 'small' && styles.small,
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'small' && styles.smallText,
          { color: colors.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  smallText: {
    fontSize: Typography.size.xs,
  },
});
