/**
 * QuickActions — Row of quick action buttons
 *
 * Four tappable buttons: Log water, Food tip, SOS, Share alert.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface QuickAction {
  emoji: string;
  label: string;
  onPress: () => void;
}

export function QuickActions() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      emoji: '💧',
      label: 'Log water',
      onPress: () => router.push('/(tabs)/hydration'),
    },
    {
      emoji: '🥗',
      label: 'Food tip',
      onPress: () => router.push('/(tabs)/food'),
    },
    {
      emoji: '🚨',
      label: 'SOS',
      onPress: () => router.push('/sos'),
    },
    {
      emoji: '📋',
      label: 'Day plan',
      onPress: () => router.push('/(tabs)/planner'),
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.button}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{action.emoji}</Text>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
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
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
});
