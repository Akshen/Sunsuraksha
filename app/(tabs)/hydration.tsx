/**
 * Hydration Tracker Screen
 *
 * Track daily water intake with:
 * 1. Progress ring showing consumed vs target
 * 2. Quick-add buttons (100ml, 250ml, 500ml, custom)
 * 3. Today's log history with undo
 * 4. Hydration tip based on temperature
 *
 * Uses local state for MVP. Will connect to Supabase later.
 */

import { useState, useMemo, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ScreenHeader } from '@/components/common';
import { WaterProgressRing } from '@/components/hydration/WaterProgressRing';
import { QuickAddButtons } from '@/components/hydration/QuickAddButtons';
import { HydrationLogList } from '@/components/hydration/HydrationLogList';
import { CustomAmountModal } from '@/components/hydration/CustomAmountModal';
import { calculateWaterTarget, getHydrationInterval } from '@/utils/heatScore';

interface LocalLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}

export default function HydrationScreen() {
  const [logs, setLogs] = useState<LocalLog[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // TODO: Get from user profile (Step 5 onboarding data) + weather API (Step 7)
  const userWeightKg = 70;
  const currentTempC = 42;
  const isOutdoor = false;
  const currentHeatScore = 68;

  // Calculate personalized target
  const targetMl = useMemo(
    () => calculateWaterTarget(userWeightKg, currentTempC, isOutdoor),
    [userWeightKg, currentTempC, isOutdoor]
  );

  // Total consumed today
  const totalMl = useMemo(
    () => logs.reduce((sum, log) => sum + log.amount_ml, 0),
    [logs]
  );

  // Reminder interval
  const reminderMin = useMemo(
    () => getHydrationInterval(currentHeatScore),
    [currentHeatScore]
  );

  // Add water log
  const addWater = useCallback((amountMl: number) => {
    const newLog: LocalLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      amount_ml: amountMl,
      logged_at: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  // Delete water log (undo)
  const deleteLog = useCallback((logId: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== logId));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Hydration"
        subtitle={`Target: ${(targetMl / 1000).toFixed(1)}L for ${Math.round(currentTempC)}°C`}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress ring */}
        <WaterProgressRing totalMl={totalMl} targetMl={targetMl} />

        <View style={styles.spacer} />

        {/* Hydration tip */}
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>⏱️</Text>
          <Text style={styles.tipText}>
            Drink every {reminderMin} min in this heat. Next glass:{' '}
            <Text style={styles.tipBold}>
              {logs.length > 0
                ? formatNextReminder(logs[0].logged_at, reminderMin)
                : 'Now!'}
            </Text>
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Quick add buttons */}
        <QuickAddButtons
          onAdd={addWater}
          onCustom={() => setShowCustomModal(true)}
        />

        <View style={styles.spacerLg} />

        {/* Today's log */}
        <HydrationLogList logs={logs} onDelete={deleteLog} />

        <View style={styles.spacerLg} />

        {/* Daily recommendation */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Your daily target explained</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base (weight)</Text>
            <Text style={styles.infoValue}>{userWeightKg} kg × 35ml = {userWeightKg * 35}ml</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Heat multiplier</Text>
            <Text style={styles.infoValue}>
              {currentTempC >= 42 ? '×1.8' : currentTempC >= 37 ? '×1.5' : '×1.2'} (for {Math.round(currentTempC)}°C)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity</Text>
            <Text style={styles.infoValue}>{isOutdoor ? '×1.4 (outdoor)' : '×1.0 (indoor)'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowTotal]}>
            <Text style={styles.infoTotalLabel}>Daily target</Text>
            <Text style={styles.infoTotalValue}>{(targetMl / 1000).toFixed(1)}L</Text>
          </View>
        </View>

        <View style={styles.spacerLg} />
      </ScrollView>

      {/* Custom amount modal */}
      <CustomAmountModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onAdd={addWater}
      />
    </SafeAreaView>
  );
}

/** Calculate when the next glass is due */
function formatNextReminder(lastLogIso: string, intervalMin: number): string {
  const lastLog = new Date(lastLogIso);
  const next = new Date(lastLog.getTime() + intervalMin * 60 * 1000);
  const now = new Date();

  if (next <= now) return 'Now!';

  const diffMin = Math.round((next.getTime() - now.getTime()) / 60000);
  if (diffMin < 1) return 'Now!';
  if (diffMin === 1) return 'in 1 min';
  return `in ${diffMin} min`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  spacer: {
    height: Spacing.lg,
  },
  spacerLg: {
    height: Spacing.xxl,
  },

  // Tip
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#E6F1FB',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
  },
  tipEmoji: {
    fontSize: 16,
  },
  tipText: {
    fontSize: Typography.size.sm,
    color: '#185FA5',
    flex: 1,
    lineHeight: 19,
  },
  tipBold: {
    fontWeight: Typography.weight.bold,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
  },
  infoLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Typography.size.sm,
    color: Colors.text,
    fontWeight: Typography.weight.medium,
  },
  infoRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  infoTotalLabel: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  infoTotalValue: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.bold,
    color: '#3B8BD4',
  },
});
