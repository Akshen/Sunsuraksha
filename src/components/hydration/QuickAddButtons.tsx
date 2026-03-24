/**
 * QuickAddButtons — Preset water intake buttons
 *
 * One-tap buttons for common amounts: 100ml, 250ml, 500ml, custom.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface QuickAddButtonsProps {
  onAdd: (amountMl: number) => void;
  onCustom: () => void;
}

const presets = [
  { ml: 100, label: '100ml', emoji: '🥛' },
  { ml: 250, label: '250ml', emoji: '🥤' },
  { ml: 500, label: '500ml', emoji: '🍶' },
];

export function QuickAddButtons({ onAdd, onCustom }: QuickAddButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log water</Text>
      <View style={styles.row}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset.ml}
            style={styles.button}
            onPress={() => onAdd(preset.ml)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{preset.emoji}</Text>
            <Text style={styles.label}>{preset.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.button, styles.customButton]}
          onPress={onCustom}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>✏️</Text>
          <Text style={styles.label}>Custom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
    ...Shadows.sm,
  },
  customButton: {
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.border,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
});
