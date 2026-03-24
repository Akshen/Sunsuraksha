/**
 * Notification Service
 *
 * Handles push notification permissions and scheduling.
 * Uses Expo Notifications for local notifications (no server needed for MVP).
 *
 * Notifications scheduled:
 * - Hydration reminders (every 20-60 min based on heat score)
 * - Heat danger alerts (when score crosses thresholds)
 *
 * NOTE: Notifications require a development build (not Expo Go).
 * Install with: npx expo install expo-notifications
 * Build with: eas build --profile development
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ---- Configure notification behavior ----
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 * Returns true if granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Notification permissions error:', error);
    return false;
  }
}

/**
 * Schedule a hydration reminder
 * @param intervalMin — minutes from now
 * @param feelsLikeC — current feels-like temperature for message context
 */
export async function scheduleHydrationReminder(
  intervalMin: number,
  feelsLikeC: number
): Promise<string | null> {
  try {
    const messages = [
      `Time to drink water! It's ${Math.round(feelsLikeC)}°C outside.`,
      `Hydration check! Have 250ml water now.`,
      `Stay cool — drink a glass of water or nimbu pani.`,
      `Your body needs water. Take a sip now!`,
      `Heat alert: drink water every ${intervalMin} min in this weather.`,
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Drink Water',
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalMin * 60,
        repeats: false,
      },
    });

    return id;
  } catch (error) {
    console.warn('Failed to schedule hydration reminder:', error);
    return null;
  }
}

/**
 * Schedule a heat danger alert
 * @param score — heat danger score 0-100
 */
export async function scheduleHeatAlert(score: number): Promise<string | null> {
  if (score < 65) return null; // Only alert for danger+

  try {
    const title = score >= 80 ? '🚨 EXTREME HEAT' : '⚠️ Heat Warning';
    const body = score >= 80
      ? 'Dangerous heat conditions. Stay indoors and hydrate immediately.'
      : 'High heat detected. Avoid going outside and drink water regularly.';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Send immediately
    });

    return id;
  } catch (error) {
    console.warn('Failed to schedule heat alert:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Set up recurring hydration reminders for the day
 * Schedules reminders at the given interval for the next 12 hours
 */
export async function setupDailyHydrationReminders(
  intervalMin: number,
  feelsLikeC: number
): Promise<void> {
  // Cancel existing reminders first
  await cancelAllNotifications();

  // Schedule reminders for next 12 hours
  const remindersCount = Math.floor((12 * 60) / intervalMin);

  for (let i = 1; i <= Math.min(remindersCount, 24); i++) {
    await scheduleHydrationReminder(intervalMin * i, feelsLikeC);
  }
}
