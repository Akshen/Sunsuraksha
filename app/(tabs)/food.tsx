/**
 * Food & Drinks Screen
 *
 * Shows personalized food and drink recommendations.
 * Three pill tabs: Eat, Drink, Avoid.
 * All data comes from bundled JSON — works offline.
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ScreenHeader } from '@/components/common';
import { FoodCard } from '@/components/food/FoodCard';
import { DrinkCard } from '@/components/food/DrinkCard';
import { AvoidCard } from '@/components/food/AvoidCard';
import { getRecommendations, getAllFoods, getAllDrinks, getFoodsToAvoid } from '@/data/foodData';

type TabKey = 'eat' | 'drink' | 'avoid';

const tabs: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'eat', label: 'Eat', emoji: '🥗' },
  { key: 'drink', label: 'Drink', emoji: '🥤' },
  { key: 'avoid', label: 'Avoid', emoji: '🚫' },
];

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function FoodScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('eat');

  // TODO: Replace with real temperature from weather API (Step 7)
  const currentTempC = 42;
  const timeOfDay = getTimeOfDay();

  const recommendations = useMemo(
    () => getRecommendations({ tempC: currentTempC, timeOfDay }),
    [currentTempC, timeOfDay]
  );

  const allFoods = useMemo(() => getAllFoods(), []);
  const allDrinks = useMemo(() => getAllDrinks(), []);
  const allAvoids = useMemo(() => getFoodsToAvoid(), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Food & Drinks"
        subtitle={`${Math.round(currentTempC)}°C — ${timeOfDay} picks`}
      />

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        {activeTab !== 'avoid' && (
          <View style={styles.banner}>
            <Text style={styles.bannerEmoji}>
              {activeTab === 'eat' ? '✨' : '💧'}
            </Text>
            <Text style={styles.bannerText}>
              {activeTab === 'eat'
                ? `${recommendations.foods.length} foods recommended for ${Math.round(currentTempC)}°C`
                : `${recommendations.drinks.length} drinks sorted by hydration score`}
            </Text>
          </View>
        )}

        {activeTab === 'avoid' && (
          <View style={[styles.banner, styles.bannerDanger]}>
            <Text style={styles.bannerEmoji}>⚠️</Text>
            <Text style={[styles.bannerText, styles.bannerDangerText]}>
              These foods increase body heat or cause dehydration
            </Text>
          </View>
        )}

        {/* Food cards */}
        {activeTab === 'eat' &&
          allFoods.map((food) => (
            <FoodCard
              key={food.id}
              name={food.name}
              nameHi={food.name_hi}
              imageUrl={food.image_url}
              category={food.category}
              coolingScore={food.properties?.cooling_score ?? 0}
              waterContentPct={food.nutrition_per_100g?.water_g ? Math.round(food.nutrition_per_100g.water_g) : undefined}
              caloriesPer100g={food.nutrition_per_100g?.energy_kcal}
              prepTimeMin={food.preparation?.prep_time_min}
              whyRecommended={food.why_recommended_in_summer}
              tags={food.tags}
            />
          ))}

        {/* Drink cards */}
        {activeTab === 'drink' &&
          allDrinks.map((drink) => (
            <DrinkCard
              key={drink.id}
              name={drink.name}
              nameHi={drink.name_hi ?? ''}
              imageUrl={drink.image_url}
              hydrationScore={drink.hydration_score}
              caloriesPerServing={drink.calories_per_serving}
              servingSizeMl={drink.serving_size_ml}
              prepTimeMin={drink.preparation.prep_time_min}
              ingredientNames={
                drink.preparation.ingredients?.map((i: any) => i.item) ?? []
              }
              whyRecommended={drink.why_recommended_in_summer}
              steps={drink.preparation.steps}
            />
          ))}

        {/* Avoid cards */}
        {activeTab === 'avoid' &&
          allAvoids.map((item) => (
            <AvoidCard
              key={item.id}
              name={item.name}
              nameHi={item.name_hi}
              imageUrl={item.image_url}
              severity={item.severity}
              whyToAvoid={item.why_to_avoid}
              alternatives={item.alternatives}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primaryDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.safeBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  bannerDanger: {
    backgroundColor: Colors.dangerBg,
  },
  bannerEmoji: {
    fontSize: 16,
  },
  bannerText: {
    fontSize: Typography.size.sm,
    color: Colors.safe,
    fontWeight: Typography.weight.medium,
    flex: 1,
  },
  bannerDangerText: {
    color: Colors.danger,
  },
});
