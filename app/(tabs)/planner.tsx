/**
 * Daily Planner Screen
 *
 * Shows the day broken into time blocks, each color-coded
 * by safety level with specific recommendations and activities.
 *
 * Adapts to current temperature — extreme heat days show
 * more danger blocks and stronger warnings.
 */

import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ScreenHeader } from '@/components/common';
import { TimeBlockCard } from '@/components/planner/TimeBlockCard';
import { useWeather } from '@/hooks/useWeather';
import { generateDailyPlan } from '@/utils/dailyPlan';
import { getMealPlan } from '@/data/foodData';

export default function PlannerScreen() {
  const userCity = 'Delhi';
  const { weather, heatScore } = useWeather(userCity);

  const feelsLikeC = weather?.feels_like_c ?? 42;
  const currentHour = new Date().getHours();

  // Generate plan based on temperature
  const plan = useMemo(() => generateDailyPlan(feelsLikeC), [feelsLikeC]);

  // Get meal plan for today
  const mealPlan = useMemo(() => getMealPlan(feelsLikeC), [feelsLikeC]);

  // Find which block the user is currently in
  function isCurrentBlock(startHour: number, endHour: number): boolean {
    if (endHour > startHour) {
      return currentHour >= startHour && currentHour < endHour;
    }
    // Wraps midnight (e.g., 23 → 5)
    return currentHour >= startHour || currentHour < endHour;
  }

  // Count danger hours
  const dangerHours = useMemo(() => {
    let count = 0;
    plan.forEach((block) => {
      if (block.safety === 'danger' || block.safety === 'extreme') {
        const hours = block.endHour > block.startHour
          ? block.endHour - block.startHour
          : (24 - block.startHour) + block.endHour;
        count += hours;
      }
    });
    return count;
  }, [plan]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Daily Planner"
        subtitle={`${Math.round(feelsLikeC)}°C feels like — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary banner */}
        <View style={[
          styles.summaryBanner,
          dangerHours > 6 ? styles.bannerExtreme : dangerHours > 3 ? styles.bannerDanger : styles.bannerSafe,
        ]}>
          <Text style={styles.summaryEmoji}>
            {dangerHours > 6 ? '🔥' : dangerHours > 3 ? '⚠️' : '✅'}
          </Text>
          <View style={styles.summaryTextCol}>
            <Text style={[
              styles.summaryTitle,
              dangerHours > 6 ? styles.textExtreme : dangerHours > 3 ? styles.textDanger : styles.textSafe,
            ]}>
              {dangerHours > 6
                ? `Extreme day — ${dangerHours} dangerous hours`
                : dangerHours > 3
                ? `Hot day — ${dangerHours} hours to avoid outdoors`
                : 'Comfortable day — mostly safe outside'}
            </Text>
            <Text style={styles.summarySubtitle}>
              {heatScore ? `Heat score: ${heatScore.score}/100` : ''}
            </Text>
          </View>
        </View>

        {/* Time blocks */}
        <Text style={styles.sectionTitle}>Your day, block by block</Text>

        {plan.map((block, index) => (
          <TimeBlockCard
            key={`${block.startHour}-${block.endHour}`}
            startHour={block.startHour}
            endHour={block.endHour}
            safety={block.safety}
            label={block.label}
            recommendation={block.recommendation}
            activities={block.activities}
            isNow={isCurrentBlock(block.startHour, block.endHour)}
          />
        ))}

        {/* Meal suggestions */}
        {mealPlan && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>
              Meal suggestions for today
            </Text>

            <View style={styles.mealCard}>
              <MealRow emoji="🌅" label="Breakfast" items={mealPlan.breakfast} />
              <MealRow emoji="☀️" label="Lunch" items={mealPlan.lunch} />
              <MealRow emoji="🍎" label="Snack" items={mealPlan.snack} />
              <MealRow emoji="🌙" label="Dinner" items={mealPlan.dinner} />
            </View>
          </>
        )}

        <View style={styles.spacerLg} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Meal row sub-component ----
function MealRow({ emoji, label, items }: { emoji: string; label: string; items: string[] }) {
  return (
    <View style={mealStyles.row}>
      <Text style={mealStyles.emoji}>{emoji}</Text>
      <View style={mealStyles.info}>
        <Text style={mealStyles.label}>{label}</Text>
        <Text style={mealStyles.items}>{items.join(' · ')}</Text>
      </View>
    </View>
  );
}

const mealStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  emoji: {
    fontSize: 18,
    marginTop: 2,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  items: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  // Summary
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  bannerExtreme: { backgroundColor: Colors.extremeBg },
  bannerDanger: { backgroundColor: Colors.dangerBg },
  bannerSafe: { backgroundColor: Colors.safeBg },
  summaryEmoji: { fontSize: 28 },
  summaryTextCol: { flex: 1 },
  summaryTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
  },
  textExtreme: { color: Colors.extreme },
  textDanger: { color: Colors.danger },
  textSafe: { color: Colors.safe },
  summarySubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Section
  sectionTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },

  // Meal card
  mealCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  spacerLg: {
    height: Spacing.xxl,
  },
});
