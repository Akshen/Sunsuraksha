/**
 * HeatScoreRing — Circular heat danger score display
 *
 * The centerpiece of the home dashboard.
 * Shows the 0-100 score with a colored ring, label, and feels-like temp.
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { getHeatColor, getHeatBgColor, getHeatLabel } from '@/constants/theme';

interface HeatScoreRingProps {
  score: number;
  feelsLikeC: number;
  tempC: number;
  city: string;
}

export function HeatScoreRing({ score, feelsLikeC, tempC, city }: HeatScoreRingProps) {
  const color = getHeatColor(score);
  const bgColor = getHeatBgColor(score);
  const label = getHeatLabel(score);

  // SVG circle math
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* City + time */}
      <Text style={styles.city}>{city || 'Your city'}</Text>

      {/* Ring */}
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
          {/* Score arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center text overlay */}
        <View style={styles.centerText}>
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
        </View>
      </View>

      {/* Temperature row */}
      <View style={styles.tempRow}>
        <View style={styles.tempItem}>
          <Text style={styles.tempValue}>{Math.round(tempC)}°C</Text>
          <Text style={styles.tempLabel}>Temperature</Text>
        </View>
        <View style={styles.tempDivider} />
        <View style={styles.tempItem}>
          <Text style={[styles.tempValue, { color }]}>{Math.round(feelsLikeC)}°C</Text>
          <Text style={styles.tempLabel}>Feels like</Text>
        </View>
      </View>
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
  city: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.md,
  },
  ringContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: Typography.size.hero,
    fontWeight: Typography.weight.bold,
    lineHeight: 52,
  },
  scoreLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    marginTop: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  tempItem: {
    alignItems: 'center',
  },
  tempValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  tempLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tempDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
});
