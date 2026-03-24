/**
 * CustomAmountModal — Enter a custom water intake amount
 *
 * Simple modal with a number input and Add button.
 */

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface CustomAmountModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (amountMl: number) => void;
}

export function CustomAmountModal({ visible, onClose, onAdd }: CustomAmountModalProps) {
  const [amount, setAmount] = useState('');

  function handleAdd() {
    const ml = parseInt(amount, 10);
    if (ml > 0 && ml <= 2000) {
      onAdd(ml);
      setAmount('');
      onClose();
    }
  }

  function handleClose() {
    setAmount('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

        <View style={styles.modal}>
          <Text style={styles.title}>Custom amount</Text>
          <Text style={styles.subtitle}>Enter water intake in ml (max 2000)</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 350"
              placeholderTextColor={Colors.textLight}
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <Text style={styles.unit}>ml</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, !amount && styles.addButtonDisabled]}
              onPress={handleAdd}
              activeOpacity={0.7}
              disabled={!amount}
            >
              <Text style={styles.addText}>Add {amount ? `${amount}ml` : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '85%',
    maxWidth: 340,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  unit: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#3B8BD4',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addText: {
    fontSize: Typography.size.body,
    color: Colors.textOnPrimary,
    fontWeight: Typography.weight.semibold,
  },
});
