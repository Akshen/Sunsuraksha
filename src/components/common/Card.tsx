/**
 * Card — Reusable card surface
 *
 * The primary container for content blocks throughout the app.
 * Supports default (white) and tinted (peach) variants.
 */

import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'tinted';
  style?: ViewStyle;
  noPadding?: boolean;
  testID?: string;
}

export function Card({
  children,
  variant = 'default',
  style,
  noPadding = false,
  testID,
}: CardProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.base,
        variant === 'tinted' && styles.tinted,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  tinted: {
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.border,
  },
  noPadding: {
    padding: 0,
  },
});
