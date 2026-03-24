/**
 * Notification Service
 *
 * Completely skips expo-notifications in Expo Go.
 * All functions are safe no-ops when notifications aren't available.
 */

import Constants from 'expo-constants';

// Detect if running in Expo Go (notifications not supported since SDK 53)
const isExpoGo = Constants.appOwnership === 'expo';

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) {
    console.log('Notifications not available in Expo Go — skipping');
    return false;
  }
  try {
    const N = require('expo-notifications');
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedule a hydration reminder
 */
export async function scheduleHydrationReminder(
  intervalMin: number,
  feelsLikeC: number
): Promise<string | null> {
  if (isExpoGo) return null;
  try {
    const N = require('expo-notifications');
    const messages = [
      `Time to drink water! It's ${Math.round(feelsLikeC)}°C outside.`,
      `Hydration check! Have 250ml water now.`,
      `Stay cool — drink a glass of water or nimbu pani.`,
      `Your body needs water. Take a sip now!`,
      `Heat alert: drink water every ${intervalMin} min in this weather.`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const id = await N.scheduleNotificationAsync({
      content: { title: '💧 Drink Water', body: message, sound: true },
      trigger: { type: 'timeInterval', seconds: intervalMin * 60, repeats: false },
    });
    return id;
  } catch (error) {
    console.warn('Failed to schedule reminder:', error);
    return null;
  }
}

/**
 * Schedule a heat danger alert
 */
export async function scheduleHeatAlert(score: number): Promise<string | null> {
  if (isExpoGo || score < 65) return null;
  try {
    const N = require('expo-notifications');
    const title = score >= 80 ? '🚨 EXTREME HEAT' : '⚠️ Heat Warning';
    const body = score >= 80
      ? 'Dangerous heat conditions. Stay indoors and hydrate immediately.'
      : 'High heat detected. Avoid going outside and drink water regularly.';
    const id = await N.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
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
  if (isExpoGo) return;
  try {
    const N = require('expo-notifications');
    await N.cancelAllScheduledNotificationsAsync();
  } catch {}
}

/**
 * Set up recurring hydration reminders for 12 hours
 */
export async function setupDailyHydrationReminders(
  intervalMin: number,
  feelsLikeC: number
): Promise<void> {
  if (isExpoGo) {
    console.log('Notifications not available in Expo Go — reminders will work in production build');
    return;
  }
  await cancelAllNotifications();
  const count = Math.min(Math.floor((12 * 60) / intervalMin), 24);
  for (let i = 1; i <= count; i++) {
    await scheduleHydrationReminder(intervalMin * i, feelsLikeC);
  }
}
