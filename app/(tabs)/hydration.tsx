/**
 * Tips Screen
 *
 * Replaces the hydration tracker tab.
 * Shows heat survival tips + a toggle to enable/disable
 * automatic water reminder notifications.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { ScreenHeader } from '@/components/common';
import {
  requestNotificationPermissions,
  setupDailyHydrationReminders,
  cancelAllNotifications,
} from '@/services/notifications';
import { useWeather } from '@/hooks/useWeather';
import { useLocation } from '@/hooks/useLocation';
import { getHydrationInterval } from '@/utils/heatScore';

const REMINDER_KEY = 'sunsuraksha_water_reminders_enabled';

// ---- Tips data ----
const TIPS = [
  {
    emoji: '💧',
    title: 'Drink before you feel thirsty',
    body: 'By the time you feel thirsty, you\'re already mildly dehydrated. Sip water regularly throughout the day.',
  },
  {
    emoji: '🥛',
    title: 'Carry a water bottle everywhere',
    body: 'Keep a 1L bottle with you. Refill it 3 times a day for a healthy 3L target in summer.',
  },
  {
    emoji: '🧂',
    title: 'Add a pinch of salt to your water',
    body: 'Plain water isn\'t enough in extreme heat. Add black salt or drink nimbu pani to replenish electrolytes lost in sweat.',
  },
  {
    emoji: '🍉',
    title: 'Eat your water',
    body: 'Watermelon (92% water), cucumber (96%), and muskmelon (90%) hydrate better than plain water because they come with electrolytes.',
  },
  {
    emoji: '☕',
    title: 'Replace chai with chaas',
    body: 'Tea and coffee are diuretics — they make you lose more water. Switch your afternoon chai to buttermilk for cooling + hydration.',
  },
  {
    emoji: '🍺',
    title: 'Avoid alcohol in heat',
    body: 'Alcohol suppresses the hormone that helps your body retain water. One beer can cause a net loss of 350ml fluid.',
  },
  {
    emoji: '🌡️',
    title: 'Check your urine color',
    body: 'Pale yellow = hydrated. Dark yellow = drink water immediately. Clear = you\'re overhydrating (rare but possible).',
  },
  {
    emoji: '⏰',
    title: 'Front-load your water',
    body: 'Drink 500ml within the first hour of waking up. Your body is dehydrated after 7-8 hours of sleep.',
  },
  {
    emoji: '🥥',
    title: 'Coconut water > sports drinks',
    body: 'Tender coconut water has the same electrolyte balance as human blood plasma. It\'s nature\'s ORS — and available on every street corner.',
  },
  {
    emoji: '🧊',
    title: 'Cool, not ice-cold',
    body: 'Ayurveda and modern science agree: ice-cold water shocks your digestive system. Cool or room temperature water is absorbed faster.',
  },
];

export default function TipsScreen() {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { weather, heatScore } = useWeather({ city: location.city, coords: location.coords });

  const feelsLikeC = weather?.feels_like_c ?? 40;
  const score = heatScore?.score ?? 50;
  const intervalMin = getHydrationInterval(score);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then((value) => {
      setRemindersEnabled(value === 'true');
      setLoading(false);
    });
  }, []);

  // Toggle reminders
  const toggleReminders = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications blocked',
          'Please enable notifications in your phone settings to get water reminders.',
        );
        return;
      }
      await setupDailyHydrationReminders(intervalMin, feelsLikeC);
    } else {
      await cancelAllNotifications();
    }

    setRemindersEnabled(enabled);
    await AsyncStorage.setItem(REMINDER_KEY, enabled.toString());
  }, [intervalMin, feelsLikeC]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Tips & Reminders"
        subtitle="Stay hydrated, stay safe"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Water reminder card */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderTop}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>💧 Water reminders</Text>
              <Text style={styles.reminderDesc}>
                {remindersEnabled
                  ? `Reminding you every ${intervalMin} min (based on heat score: ${score})`
                  : 'Get notified to drink water throughout the day'}
              </Text>
            </View>
            {!loading && (
              <Switch
                value={remindersEnabled}
                onValueChange={toggleReminders}
                trackColor={{ false: Colors.borderLight, true: '#85B7EB' }}
                thumbColor={remindersEnabled ? '#3B8BD4' : Colors.textLight}
              />
            )}
          </View>

          {remindersEnabled && (
            <View style={styles.reminderDetail}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frequency</Text>
                <Text style={styles.detailValue}>Every {intervalMin} min</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Adapts to</Text>
                <Text style={styles.detailValue}>Current heat score</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Active for</Text>
                <Text style={styles.detailValue}>Next 12 hours</Text>
              </View>
            </View>
          )}
        </View>

        {/* Daily target info */}
        <View style={styles.targetCard}>
          <Text style={styles.targetEmoji}>🎯</Text>
          <View style={styles.targetInfo}>
            <Text style={styles.targetTitle}>Your daily water target</Text>
            <Text style={styles.targetValue}>
              {feelsLikeC >= 42 ? '4–5 liters' : feelsLikeC >= 37 ? '3–4 liters' : '2.5–3 liters'}
            </Text>
            <Text style={styles.targetHint}>
              Based on {Math.round(feelsLikeC)}°C feels-like temperature
            </Text>
          </View>
        </View>

        {/* Tips section */}
        <Text style={styles.sectionTitle}>Heat survival tips</Text>

        {TIPS.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.body}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // Reminder card
  reminderCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  reminderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  reminderDesc: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  reminderDetail: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
  },

  // Target card
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#E6F1FB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  targetEmoji: {
    fontSize: 32,
  },
  targetInfo: {
    flex: 1,
  },
  targetTitle: {
    fontSize: Typography.size.sm,
    color: '#185FA5',
    fontWeight: Typography.weight.medium,
  },
  targetValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: '#0C447C',
    marginTop: 2,
  },
  targetHint: {
    fontSize: Typography.size.xs,
    color: '#185FA5',
    marginTop: 2,
  },

  // Section
  sectionTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Tip cards
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tipEmoji: {
    fontSize: 22,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
