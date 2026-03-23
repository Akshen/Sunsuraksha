/**
 * Home Screen — Dashboard
 * 
 * Placeholder for Step 1. Will be fully built in Step 6.
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>☀️</Text>
        <Text style={styles.title}>SunSuraksha</Text>
        <Text style={styles.subtitle}>Stay Safe, Stay Cool, Stay Ahead of the Sun</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Step 1 complete — app is running!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: Colors.safeBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: Typography.size.sm,
    color: Colors.safe,
    fontWeight: Typography.weight.medium,
  },
});
