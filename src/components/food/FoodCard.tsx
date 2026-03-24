/**
 * FoodCard — Displays a single food or drink recommendation
 *
 * Shows image, name (English + Hindi), cooling score,
 * key nutrition facts, and a tap to expand details.
 */

import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface FoodCardProps {
  name: string;
  nameHi: string;
  imageUrl: string;
  category: string;
  coolingScore: number;
  waterContentPct?: number;
  caloriesPer100g?: number;
  prepTimeMin?: number;
  whyRecommended: string;
  tags: string[];
}

export function FoodCard({
  name,
  nameHi,
  imageUrl,
  category,
  coolingScore,
  waterContentPct,
  caloriesPer100g,
  prepTimeMin,
  whyRecommended,
  tags,
}: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      {/* Top row: image + info */}
      <View style={styles.topRow}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          defaultSource={require('../../../assets/images/icon.png')}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.nameHi}>{nameHi}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {waterContentPct != null && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{waterContentPct}%</Text>
                <Text style={styles.statLabel}>water</Text>
              </View>
            )}
            {caloriesPer100g != null && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{caloriesPer100g}</Text>
                <Text style={styles.statLabel}>kcal</Text>
              </View>
            )}
            {prepTimeMin != null && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{prepTimeMin}m</Text>
                <Text style={styles.statLabel}>prep</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cooling score badge */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{coolingScore}</Text>
          <Text style={styles.scoreLabel}>cool</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagRow}>
        {tags.slice(0, 4).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Expanded: why recommended */}
      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.whyTitle}>Why it helps in summer</Text>
          <Text style={styles.whyText}>{whyRecommended}</Text>
        </View>
      )}

      {/* Expand hint */}
      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap for details'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardAlt,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  nameHi: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  scoreBadge: {
    backgroundColor: Colors.safeBg,
    borderRadius: BorderRadius.md,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.bold,
    color: Colors.safe,
  },
  scoreLabel: {
    fontSize: 9,
    color: Colors.safe,
    fontWeight: Typography.weight.medium,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
  },
  tag: {
    backgroundColor: Colors.cardAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  expandedSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  whyTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  whyText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  expandHint: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
