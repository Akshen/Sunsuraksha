/**
 * AvoidCard — Foods to avoid during heat
 *
 * Shows the item, why to avoid it, severity level, and healthier alternatives.
 */

import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface AvoidCardProps {
  name: string;
  nameHi: string;
  imageUrl: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  whyToAvoid: string;
  alternatives: string[];
}

const severityConfig = {
  low: { label: 'Limit intake', bg: Colors.moderateBg, color: Colors.moderate },
  moderate: { label: 'Reduce', bg: Colors.moderateBg, color: Colors.moderate },
  high: { label: 'Avoid', bg: Colors.dangerBg, color: Colors.danger },
  critical: { label: 'Do not consume', bg: Colors.extremeBg, color: Colors.extreme },
};

export function AvoidCard({
  name,
  nameHi,
  imageUrl,
  severity,
  whyToAvoid,
  alternatives,
}: AvoidCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const config = severityConfig[severity];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        {imgError ? (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.fallbackEmoji}>🚫</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => setImgError(true)}
          />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.nameHi}>{nameHi}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.severityText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.whyTitle}>Why to avoid</Text>
          <Text style={styles.whyText}>{whyToAvoid}</Text>

          <Text style={[styles.whyTitle, { marginTop: Spacing.md }]}>Try instead</Text>
          {alternatives.map((alt, i) => (
            <View key={i} style={styles.altRow}>
              <Text style={styles.altBullet}>✓</Text>
              <Text style={styles.altText}>{alt}</Text>
            </View>
          ))}
        </View>
      )}

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
    alignItems: 'center',
    gap: Spacing.md,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.cardAlt,
  },
  imageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    fontSize: 24,
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
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  severityBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: Typography.weight.semibold,
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
    color: Colors.danger,
    marginBottom: Spacing.xs,
  },
  whyText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  altRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  altBullet: {
    fontSize: Typography.size.sm,
    color: Colors.safe,
    fontWeight: Typography.weight.bold,
  },
  altText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  expandHint: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
