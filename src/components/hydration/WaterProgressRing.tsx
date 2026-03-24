/**
 * WaterProgressRing — Daily hydration progress circle
 *
 * Shows total water consumed vs target with a blue ring.
 * Displays percentage, total ml, and target ml.
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface WaterProgressRingProps {
  totalMl: number;
  targetMl: number;
}

export function WaterProgressRing({ totalMl, targetMl }: WaterProgressRingProps) {
  const percentage = Math.min(Math.round((totalMl / targetMl) * 100), 100);
  const isComplete = totalMl >= targetMl;

  // SVG circle math
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totalMl / targetMl, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const ringColor = isComplete ? Colors.safe : '#3B8BD4';
  const bgTint = isComplete ? Colors.safeBg : '#E6F1FB';

  return (
    <View style={[styles.container, { backgroundColor: bgTint }]}>
      <View style={styles.ringContainer}>
        <Svg width={size} height={size}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center text */}
        <View style={styles.centerText}>
          <Text style={styles.emoji}>{isComplete ? '🎉' : '💧'}</Text>
          <Text style={[styles.percentage, { color: ringColor }]}>{percentage}%</Text>
        </View>
      </View>

      {/* Stats below ring */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: ringColor }]}>
            {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}ml`}
          </Text>
          <Text style={styles.statLabel}>consumed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {targetMl >= 1000 ? `${(targetMl / 1000).toFixed(1)}L` : `${targetMl}ml`}
          </Text>
          <Text style={styles.statLabel}>target</Text>
        </View>
      </View>

      {/* Motivational message */}
      <Text style={styles.message}>
        {isComplete
          ? 'Great job! You hit your target today!'
          : totalMl === 0
          ? 'Start logging your water intake'
          : `${targetMl - totalMl}ml more to reach your goal`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
  },
  ringContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  percentage: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  message: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
