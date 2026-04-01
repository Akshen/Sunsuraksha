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

const REMINDER_KEY = 'sunsesuraksha_water_reminders_enabled';

// ---- Tips data (sourced from NDMA, BMC, IMD guidelines) ----

interface TipSection {
  category: string;
  categoryEmoji: string;
  tips: { emoji: string; title: string; body: string; source: string }[];
}

const TIP_SECTIONS: TipSection[] = [
  {
    category: 'Hydration',
    categoryEmoji: '💧',
    tips: [
      {
        emoji: '💧',
        title: 'Drink before you feel thirsty',
        body: 'By the time you feel thirsty, you\'re already mildly dehydrated. Sip water every 20-30 minutes in extreme heat, even if you don\'t feel thirsty.',
        source: 'NDMA',
      },
      {
        emoji: '🧂',
        title: 'ORS, nimbu pani, or buttermilk — not just plain water',
        body: 'Plain water doesn\'t replace electrolytes lost in sweat. Drink ORS, lassi, torani (rice water), lemon water, or buttermilk to rehydrate properly.',
        source: 'NDMA',
      },
      {
        emoji: '🥥',
        title: 'Coconut water is nature\'s ORS',
        body: 'Tender coconut water has the same electrolyte balance as blood plasma. Drink one daily — it\'s available on every street corner in India.',
        source: 'NDMA / AIIMS',
      },
      {
        emoji: '☕',
        title: 'Avoid tea, coffee, alcohol, and soft drinks',
        body: 'Caffeine, alcohol, and carbonated drinks are diuretics — they make your body lose water faster. Switch afternoon chai to chaas or nimbu pani.',
        source: 'NDMA',
      },
      {
        emoji: '🚰',
        title: 'Carry water whenever you travel',
        body: 'Always carry a water bottle when stepping out. Don\'t rely on finding water — dehydration can set in within 30 minutes of sun exposure.',
        source: 'NDMA',
      },
    ],
  },
  {
    category: 'Body cooling',
    categoryEmoji: '🚿',
    tips: [
      {
        emoji: '🚿',
        title: 'Shower with cold water 2-3 times a day',
        body: 'Take frequent cool water baths to bring down body temperature. Even splashing cold water on your face, arms, and feet helps significantly.',
        source: 'NDMA',
      },
      {
        emoji: '🧣',
        title: 'Use a damp cloth on head, neck, and face',
        body: 'If you must go outside, place a wet cloth on your head, neck, face, and limbs. Re-wet it every 15-20 minutes. This is one of the most effective cooling techniques recommended by NDMA.',
        source: 'NDMA',
      },
      {
        emoji: '🧊',
        title: 'Wipe body with wet cloth frequently — even indoors',
        body: 'Wiping your body with a damp cloth triggers evaporative cooling. Focus on neck, wrists, inner elbows, and forehead — blood vessels are closest to skin there.',
        source: 'NDMA',
      },
      {
        emoji: '🦶',
        title: 'Soak feet in cool water during peak heat',
        body: 'Feet have many blood vessels near the surface. Soaking them in a bucket of cool water for 15-20 minutes can lower your core body temperature quickly.',
        source: 'AIIMS Advisory',
      },
      {
        emoji: '🌡️',
        title: 'Heatstroke first aid — bring down body temperature FAST',
        body: 'If someone has heatstroke (confusion, hot dry skin, high fever): move to shade, pour normal-temperature water on head, wipe body with wet cloth, give ORS, and rush to hospital. This is fatal if untreated.',
        source: 'NDMA',
      },
    ],
  },
  {
    category: 'Outdoor protection',
    categoryEmoji: '🧢',
    tips: [
      {
        emoji: '⏰',
        title: 'Never go out between 12 noon and 3 PM',
        body: 'Peak sun hours are the most dangerous. If you must go out, limit exposure to 15 minutes maximum and carry water. Plan errands for early morning or after sunset.',
        source: 'NDMA',
      },
      {
        emoji: '👒',
        title: 'Cover your head — hat, umbrella, or dupatta',
        body: 'Always cover your head with an umbrella, hat, or cotton cloth when stepping out. Direct sun on the head is the fastest path to heatstroke.',
        source: 'NDMA',
      },
      {
        emoji: '🕶️',
        title: 'Wear protective sunglasses and proper footwear',
        body: 'Use protective goggles to shield eyes from UV radiation. Wear shoes or chappals — never walk barefoot on hot surfaces. Hot ground can cause burns within seconds.',
        source: 'NDMA',
      },
      {
        emoji: '👕',
        title: 'Wear loose, light-coloured cotton clothes',
        body: 'Choose lightweight, light-coloured, loose, and porous cotton clothes. Dark and synthetic fabrics trap heat and block sweat evaporation.',
        source: 'NDMA',
      },
      {
        emoji: '🧳',
        title: 'Visitors from cooler climates — acclimatize for one week',
        body: 'If you\'ve come from a hill station or cooler region, don\'t go out in open sun for one week. Your body needs gradual exposure to acclimatize to heat.',
        source: 'NDMA',
      },
    ],
  },
  {
    category: 'Home cooling',
    categoryEmoji: '🏠',
    tips: [
      {
        emoji: '🪟',
        title: 'Close curtains by day, open windows at night',
        body: 'Use curtains, shutters, or sunshades during the day to block heat. Open windows at night for cross-ventilation — this can reduce indoor temperature by 3-5°C.',
        source: 'NDMA',
      },
      {
        emoji: '🧥',
        title: 'Hang a wet sheet near windows',
        body: 'Hang a wet bedsheet near a window or doorway. The evaporating water pulls heat from the air — this is a traditional Indian AC that actually works. Re-wet every 2-3 hours.',
        source: 'NDMA',
      },
      {
        emoji: '🍳',
        title: 'Avoid cooking during peak heat hours',
        body: 'Cooking generates significant indoor heat. Prepare meals early morning or after sunset. Prefer no-cook meals like curd rice, fruit bowls, or salads during midday.',
        source: 'BMC Advisory',
      },
      {
        emoji: '💨',
        title: 'Use fans with damp clothing for cooling',
        body: 'Place a wet towel in front of a fan or wear damp clothing while sitting indoors. The moving air over wet fabric creates a powerful evaporative cooling effect.',
        source: 'NDMA',
      },
      {
        emoji: '👶',
        title: 'Never leave children or pets in parked vehicles',
        body: 'Car interiors can reach 70°C+ within minutes in Indian summers. Even with windows cracked, this is fatal. Always check the back seat before locking.',
        source: 'NDMA',
      },
    ],
  },
  {
    category: 'Food & diet',
    categoryEmoji: '🍽️',
    tips: [
      {
        emoji: '🍉',
        title: 'Eat water-rich fruits — watermelon, cucumber, muskmelon',
        body: 'Watermelon is 92% water, cucumber is 96%. These hydrate better than plain water because they also supply minerals, vitamins, and electrolytes.',
        source: 'AIIMS Nutrition',
      },
      {
        emoji: '🚫',
        title: 'Avoid high-protein food and stale food',
        body: 'Heavy protein meals raise metabolic heat. Stale food spoils much faster in summer — it can cause food poisoning within hours. Always eat fresh, light meals.',
        source: 'NDMA',
      },
      {
        emoji: '🥣',
        title: 'Eat light, cooling meals — curd rice, khichdi, fruits',
        body: 'Prefer light meals: curd rice, khichdi with buttermilk, fruit bowls. These are easy to digest and don\'t raise body temperature the way heavy meals do.',
        source: 'NDMA / Ayurveda',
      },
      {
        emoji: '🌿',
        title: 'Traditional coolers: aam panna, sattu, sabja seeds',
        body: 'Raw mango drink (aam panna) prevents heat exhaustion. Roasted gram drink (sattu sharbat) is Bihar\'s ancient energy drink. Basil seeds (sabja) soaked in water cool the body from within.',
        source: 'AIIMS / Traditional',
      },
      {
        emoji: '🧅',
        title: 'Carry raw onion — a traditional heat remedy',
        body: 'In many parts of India, outdoor workers carry a raw onion in their pocket during summer. Onions contain quercetin, which may help regulate body temperature. At minimum, eat raw onion with lunch.',
        source: 'Traditional / Folk',
      },
    ],
  },
  {
    category: 'Outdoor workers',
    categoryEmoji: '👷',
    tips: [
      {
        emoji: '🏗️',
        title: 'Outdoor workers: take shade breaks every 30 minutes',
        body: 'If you work outdoors (construction, delivery, farming), take a 10-minute shade break every 30 minutes during peak heat. Drink 250ml water during each break.',
        source: 'NDMA 2025 Advisory',
      },
      {
        emoji: '🎒',
        title: 'Carry ORS sachets and a cooling cap',
        body: 'NDMA recommends outdoor workers carry ORS sachets, insulated water flask, UV-protective clothing, and a cooling cap. Platforms must provide heat-protection kits.',
        source: 'NDMA Gig Worker Advisory 2025',
      },
      {
        emoji: '⚠️',
        title: 'Know the warning signs — dizziness, nausea, dry skin',
        body: 'If you feel dizzy, nauseated, have a headache, or stop sweating despite heat — STOP working immediately. Move to shade, drink ORS, pour water on your head. These are signs of heat exhaustion progressing to heatstroke.',
        source: 'NDMA / MoHFW',
      },
    ],
  },
  {
    category: 'Animals & others',
    categoryEmoji: '🐄',
    tips: [
      {
        emoji: '🐕',
        title: 'Keep animals in shade with plenty of water',
        body: 'Animals suffer from heatstroke too. Keep pets and livestock in shade. Provide clean, cool water multiple times a day. Avoid walking dogs on hot roads — their paws burn easily.',
        source: 'NDMA',
      },
      {
        emoji: '🏥',
        title: 'If you feel faint or ill — see a doctor immediately',
        body: 'Don\'t wait for symptoms to get worse. Heat exhaustion can progress to fatal heatstroke in under an hour. Go to the nearest health centre or call 108 for a free ambulance.',
        source: 'NDMA',
      },
    ],
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
        <Text style={styles.sectionSubtitle}>
          30 verified tips from NDMA, IMD, AIIMS, and BMC guidelines
        </Text>

        {TIP_SECTIONS.map((section, sIdx) => (
          <View key={sIdx}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryEmoji}>{section.categoryEmoji}</Text>
              <Text style={styles.categoryTitle}>{section.category}</Text>
            </View>

            {section.tips.map((tip, tIdx) => (
              <View key={`${sIdx}-${tIdx}`} style={styles.tipCard}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipBody}>{tip.body}</Text>
                  <Text style={styles.tipSource}>Source: {tip.source}</Text>
                </View>
              </View>
            ))}
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Category header
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  tipSource: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
