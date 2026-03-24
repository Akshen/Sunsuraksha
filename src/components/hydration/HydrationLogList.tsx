/**
 * HydrationLogList — Today's water intake history
 *
 * Shows each logged entry with time and amount.
 * Swipe or tap to undo (delete) an entry.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface LogEntry {
  id: string;
  amount_ml: number;
  logged_at: string;
}

interface HydrationLogListProps {
  logs: LogEntry[];
  onDelete?: (logId: string) => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getEmojiForAmount(ml: number): string {
  if (ml >= 500) return '🍶';
  if (ml >= 250) return '🥤';
  return '🥛';
}

export function HydrationLogList({ logs, onDelete }: HydrationLogListProps) {
  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>💧</Text>
        <Text style={styles.emptyText}>No water logged today yet</Text>
        <Text style={styles.emptyHint}>Tap a button above to start tracking</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's log</Text>
      {logs.map((log) => (
        <View key={log.id} style={styles.row}>
          <Text style={styles.emoji}>{getEmojiForAmount(log.amount_ml)}</Text>
          <View style={styles.info}>
            <Text style={styles.amount}>{log.amount_ml}ml</Text>
            <Text style={styles.time}>{formatTime(log.logged_at)}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(log.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.undo}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  amount: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  time: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  undo: {
    fontSize: Typography.size.xs,
    color: Colors.danger,
    fontWeight: Typography.weight.medium,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  emptyHint: {
    fontSize: Typography.size.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
