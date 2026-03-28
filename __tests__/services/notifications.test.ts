/**
 * Notification Service Tests
 *
 * Mock expo-notifications to prevent Expo Go warning in tests.
 */

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('expo-constants', () => ({
  appOwnership: 'standalone',
}));

import {
  requestNotificationPermissions,
  scheduleHydrationReminder,
  scheduleHeatAlert,
  cancelAllNotifications,
  setupDailyHydrationReminders,
} from '@/services/notifications';

describe('Notification Service', () => {
  it('requestNotificationPermissions returns a boolean', async () => {
    const result = await requestNotificationPermissions();
    expect(typeof result).toBe('boolean');
  });

  it('scheduleHydrationReminder returns a string ID', async () => {
    const result = await scheduleHydrationReminder(30, 42);
    expect(typeof result).toBe('string');
  });

  it('scheduleHeatAlert returns null for low scores', async () => {
    const result = await scheduleHeatAlert(30);
    expect(result).toBeNull();
  });

  it('scheduleHeatAlert returns ID for danger scores', async () => {
    const result = await scheduleHeatAlert(85);
    expect(typeof result).toBe('string');
  });

  it('cancelAllNotifications resolves without error', async () => {
    await expect(cancelAllNotifications()).resolves.toBeUndefined();
  });

  it('setupDailyHydrationReminders resolves without error', async () => {
    await expect(setupDailyHydrationReminders(45, 40)).resolves.toBeUndefined();
  });
});
