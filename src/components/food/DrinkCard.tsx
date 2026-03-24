/**
 * DrinkCard — Displays a single drink recommendation
 *
 * Shows name, hydration score, prep time, ingredients preview,
 * and expandable recipe + why recommended.
 */

import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface DrinkCardProps {
  name: string;
  nameHi: string;
  imageUrl: string;
  hydrationScore: number;
  caloriesPerServing: number;
  servingSizeMl: number;
  prepTimeMin: number;
  ingredientNames: string[];
  whyRecommended: string;
  steps: string[];
}

export function DrinkCard({
  name,
  nameHi,
  imageUrl,
  hydrationScore,
  caloriesPerServing,
  servingSizeMl,
  prepTimeMin,
  ingredientNames,
  whyRecommended,
  steps,
}: DrinkCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          defaultSource={require('../../../assets/images/icon.png')}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.nameHi}>{nameHi}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{caloriesPerServing}</Text>
              <Text style={styles.statLabel}>kcal</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{servingSizeMl}ml</Text>
              <Text style={styles.statLabel}>serving</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{prepTimeMin}m</Text>
              <Text style={styles.statLabel}>prep</Text>
            </View>
          </View>
        </View>

        {/* Hydration score badge */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{hydrationScore}</Text>
          <Text style={styles.scoreLabel}>hydra</Text>
        </View>
      </View>

      {/* Ingredients preview */}
      <View style={styles.ingredientsRow}>
        <Text style={styles.ingredientsLabel}>Ingredients: </Text>
        <Text style={styles.ingredientsText} numberOfLines={1}>
          {ingredientNames.join(', ')}
        </Text>
      </View>

      {/* Expanded section */}
      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.sectionTitle}>Why it helps in summer</Text>
          <Text style={styles.sectionText}>{whyRecommended}</Text>

          <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>How to make</Text>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap for recipe & details'}
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
    backgroundColor: '#E6F1FB',
    borderRadius: BorderRadius.md,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.bold,
    color: '#185FA5',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#185FA5',
    fontWeight: Typography.weight.medium,
  },
  ingredientsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  ingredientsLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
  ingredientsText: {
    fontSize: Typography.size.xs,
    color: Colors.textLight,
    flex: 1,
  },
  expandedSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  sectionText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepNum: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    width: 16,
  },
  stepText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
  expandHint: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
