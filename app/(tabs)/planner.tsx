/**
 * Daily Planner Screen v2
 *
 * Now uses temperature curve + humidity for accurate safety levels.
 * Shows drink tips, clothing advice, and estimated temp per block.
 */

import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ScreenHeader } from '@/components/common';
import { TimeBlockCard } from '@/components/planner/TimeBlockCard';
import { useWeather } from '@/hooks/useWeather';
import { useLocation } from '@/hooks/useLocation';
import { generateDailyPlan } from '@/utils/dailyPlan';
import { getMealPlan } from '@/data/foodData';

export default function PlannerScreen() {
  const location = useLocation();
  const { weather, heatScore } = useWeather({ city: location.city, coords: location.coords });

  const feelsLikeC = weather?.feels_like_c ?? 35;
  const humidity = weather?.humidity_pct ?? 50;
  const currentHour = new Date().getHours();

  // Generate plan based on temperature + humidity
  const plan = useMemo(
    () => generateDailyPlan(feelsLikeC, humidity),
    [feelsLikeC, humidity]
  );

  const mealPlan = useMemo(() => getMealPlan(feelsLikeC), [feelsLikeC]);

  function isCurrentBlock(startHour: number, endHour: number): boolean {
    if (endHour > startHour) {
      return currentHour >= startHour && currentHour < endHour;
    }
    return currentHour >= startHour || currentHour < endHour;
  }

  // Count danger + extreme hours
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

  const safeHours = 24 - dangerHours;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Daily Planner"
        subtitle={`${Math.round(feelsLikeC)}°C · ${humidity}% humidity · ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary banner */}
        <View style={[
          styles.summaryBanner,
          dangerHours > 8 ? styles.bannerExtreme : dangerHours > 4 ? styles.bannerDanger : dangerHours > 0 ? styles.bannerCaution : styles.bannerSafe,
        ]}>
          <Text style={styles.summaryEmoji}>
            {dangerHours > 8 ? '🔥' : dangerHours > 4 ? '🚨' : dangerHours > 0 ? '⚠️' : '✅'}
          </Text>
          <View style={styles.summaryTextCol}>
            <Text style={[
              styles.summaryTitle,
              dangerHours > 8 ? styles.textExtreme : dangerHours > 4 ? styles.textDanger : dangerHours > 0 ? styles.textCaution : styles.textSafe,
            ]}>
              {dangerHours > 8
                ? `Extreme day — only ${safeHours}h safe outdoors`
                : dangerHours > 4
                ? `Hot day — ${dangerHours}h of danger, plan carefully`
                : dangerHours > 0
                ? `Warm day — ${dangerHours}h to be cautious`
                : 'Comfortable day — safe to be outdoors'}
            </Text>
            <Text style={styles.summarySubtitle}>
              {heatScore ? `Heat score ${heatScore.score}/100` : ''}
              {humidity > 70 ? ' · High humidity makes it worse' : ''}
            </Text>
          </View>
        </View>

        {/* Time blocks */}
        <Text style={styles.sectionTitle}>Your day, block by block</Text>

        {plan.map((block) => (
          <View key={`${block.startHour}-${block.endHour}`}>
            <TimeBlockCard
              startHour={block.startHour}
              endHour={block.endHour}
              safety={block.safety}
              label={block.label}
              recommendation={block.recommendation}
              activities={block.activities}
              isNow={isCurrentBlock(block.startHour, block.endHour)}
            />
            {/* Extra tips below each card */}
            {(block.drinkTip || block.clothingTip || block.estTempRange) && (
              <View style={styles.tipsRow}>
                {block.estTempRange && (
                  <Text style={styles.tipItem}>🌡️ {block.estTempRange}</Text>
                )}
                {block.drinkTip && (
                  <Text style={styles.tipItem}>{block.drinkTip}</Text>
                )}
                {block.clothingTip && (
                  <Text style={styles.tipItem}>{block.clothingTip}</Text>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Meal suggestions */}
        {mealPlan && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>
              Meal plan for today
            </Text>
            <Text style={styles.sectionSubtitle}>
              {feelsLikeC >= 42
                ? 'Extreme heat — eat very light, skip heavy meals if not hungry'
                : feelsLikeC >= 37
                ? 'Hot day — prefer cooling foods, avoid spicy and oily'
                : 'Warm day — balanced meals with extra hydration'}
            </Text>

            <View style={styles.mealCard}>
              <MealRow
                emoji="🌅"
                label="Breakfast"
                time="7:00 – 8:30 AM"
                items={mealPlan.breakfast}
                drink={feelsLikeC >= 42 ? 'ORS or fruit juice' : 'Nimbu pani or milk'}
              />
              <MealRow
                emoji="☀️"
                label="Lunch"
                time="12:00 – 1:00 PM"
                items={mealPlan.lunch}
                drink={feelsLikeC >= 42 ? 'Buttermilk (mandatory)' : 'Buttermilk or chaas'}
              />
              <MealRow
                emoji="🍎"
                label="Snack"
                time="3:30 – 5:00 PM"
                items={mealPlan.snack}
                drink="Coconut water or aam panna"
              />
              <MealRow
                emoji="🌙"
                label="Dinner"
                time="7:30 – 8:30 PM"
                items={mealPlan.dinner}
                drink="Light buttermilk or plain water"
              />
            </View>

            {/* Quick hydration schedule */}
            <View style={styles.hydrationCard}>
              <Text style={styles.hydrationTitle}>💧 Today's hydration schedule</Text>
              <View style={styles.hydrationRow}>
                <HydrationSlot time="Wake up" amount="500ml" note="Before anything else" />
                <HydrationSlot time="9 AM" amount="300ml" note="With breakfast" />
                <HydrationSlot time="11 AM" amount="300ml" note="Mid-morning" />
                <HydrationSlot time="1 PM" amount="300ml" note="With lunch" />
                <HydrationSlot time="3 PM" amount="400ml" note="Coconut water / ORS" />
                <HydrationSlot time="5 PM" amount="300ml" note="Aam panna / nimbu pani" />
                <HydrationSlot time="7 PM" amount="300ml" note="Before dinner" />
                <HydrationSlot time="9 PM" amount="300ml" note="Before bed" />
              </View>
              <Text style={styles.hydrationTotal}>
                Daily total: ~3.0L (adjust based on body weight)
              </Text>
            </View>
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Sub-components ----

function MealRow({ emoji, label, time, items, drink }: {
  emoji: string; label: string; time: string; items: string[]; drink: string;
}) {
  return (
    <View style={mealStyles.row}>
      <Text style={mealStyles.emoji}>{emoji}</Text>
      <View style={mealStyles.info}>
        <View style={mealStyles.labelRow}>
          <Text style={mealStyles.label}>{label}</Text>
          <Text style={mealStyles.time}>{time}</Text>
        </View>
        <Text style={mealStyles.items}>{items.join(' · ')}</Text>
        <Text style={mealStyles.drink}>🥤 {drink}</Text>
      </View>
    </View>
  );
}

function HydrationSlot({ time, amount, note }: { time: string; amount: string; note: string }) {
  return (
    <View style={hydStyles.slot}>
      <Text style={hydStyles.time}>{time}</Text>
      <Text style={hydStyles.amount}>{amount}</Text>
      <Text style={hydStyles.note}>{note}</Text>
    </View>
  );
}

// ---- Styles ----

const hydStyles = StyleSheet.create({
  slot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  time: { fontSize: Typography.size.sm, color: Colors.text, fontWeight: Typography.weight.medium, width: 70 },
  amount: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: '#3B8BD4', width: 55 },
  note: { fontSize: Typography.size.xs, color: Colors.textSecondary, flex: 1, textAlign: 'right' },
});

const mealStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  emoji: { fontSize: 20, marginTop: 2 },
  info: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: Colors.text },
  time: { fontSize: Typography.size.xs, color: Colors.textLight },
  items: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 },
  drink: { fontSize: Typography.size.xs, color: '#3B8BD4', marginTop: 4, fontWeight: Typography.weight.medium },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.sm },

  summaryBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm,
  },
  bannerExtreme: { backgroundColor: Colors.extremeBg },
  bannerDanger: { backgroundColor: Colors.dangerBg },
  bannerCaution: { backgroundColor: Colors.moderateBg },
  bannerSafe: { backgroundColor: Colors.safeBg },
  summaryEmoji: { fontSize: 28 },
  summaryTextCol: { flex: 1 },
  summaryTitle: { fontSize: Typography.size.body, fontWeight: Typography.weight.semibold },
  textExtreme: { color: Colors.extreme },
  textDanger: { color: Colors.danger },
  textCaution: { color: Colors.moderate },
  textSafe: { color: Colors.safe },
  summarySubtitle: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },

  sectionTitle: {
    fontSize: Typography.size.body, fontWeight: Typography.weight.semibold,
    color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    marginBottom: Spacing.md, lineHeight: 19,
  },

  tipsRow: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    gap: 2, marginBottom: Spacing.xs,
  },
  tipItem: { fontSize: 11, color: Colors.textLight, lineHeight: 16 },

  mealCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight,
  },

  hydrationCard: {
    backgroundColor: '#E6F1FB', borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginTop: Spacing.lg,
  },
  hydrationTitle: {
    fontSize: Typography.size.sm, fontWeight: Typography.weight.bold,
    color: '#0C447C', marginBottom: Spacing.md,
  },
  hydrationRow: {},
  hydrationTotal: {
    fontSize: Typography.size.xs, color: '#185FA5',
    marginTop: Spacing.md, textAlign: 'center', fontWeight: Typography.weight.medium,
  },
});
