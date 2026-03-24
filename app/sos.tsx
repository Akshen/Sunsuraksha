/**
 * SOS Emergency Screen
 *
 * Heatstroke symptom checker + immediate first aid steps +
 * one-tap emergency calling with correct helpline numbers.
 *
 * Opens as a modal from any screen via the Quick Actions button.
 *
 * Emergency numbers (all-India):
 *   112 — Universal emergency (police, fire, ambulance)
 *   108 — Ambulance / disaster management (free, 35 states)
 *   102 — Government ambulance
 *   104 — Health helpline (advice, not ambulance)
 *  1078 — NDMA disaster helpline
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

// ---- Symptom checker data ----
interface Symptom {
  id: string;
  label: string;
  emoji: string;
  severity: 'warning' | 'danger';
}

const SYMPTOMS: Symptom[] = [
  { id: 'headache', label: 'Severe headache', emoji: '🤕', severity: 'warning' },
  { id: 'dizzy', label: 'Dizziness or fainting', emoji: '😵', severity: 'danger' },
  { id: 'nausea', label: 'Nausea or vomiting', emoji: '🤢', severity: 'warning' },
  { id: 'hot_skin', label: 'Hot, red, dry skin', emoji: '🔴', severity: 'danger' },
  { id: 'no_sweat', label: 'Not sweating despite heat', emoji: '🚫', severity: 'danger' },
  { id: 'fast_pulse', label: 'Rapid, strong pulse', emoji: '💓', severity: 'danger' },
  { id: 'confusion', label: 'Confusion or slurred speech', emoji: '😶‍🌫️', severity: 'danger' },
  { id: 'high_temp', label: 'Body temperature above 40°C', emoji: '🌡️', severity: 'danger' },
  { id: 'cramps', label: 'Muscle cramps', emoji: '💪', severity: 'warning' },
  { id: 'fatigue', label: 'Extreme fatigue or weakness', emoji: '😩', severity: 'warning' },
];

// ---- Emergency helplines ----
const HELPLINES = [
  {
    number: '112',
    label: 'Universal Emergency',
    description: 'Police, Fire, Ambulance — connects all services. Works in all states and union territories.',
    primary: true,
  },
  {
    number: '108',
    label: 'Ambulance (Free)',
    description: 'Free emergency ambulance service operated by GVK EMRI. Available in 35 states/UTs including Delhi, Maharashtra, Gujarat, Tamil Nadu, Karnataka, Andhra Pradesh, UP, Rajasthan, Kerala, and more. Dispatches trained EMTs.',
    primary: true,
  },
  {
    number: '102',
    label: 'Govt Ambulance',
    description: 'Government ambulance service. Available nationwide. Especially for maternal emergencies but handles all medical emergencies.',
    primary: false,
  },
  {
    number: '104',
    label: 'Health Helpline',
    description: 'Medical advice over phone. Not an ambulance — call this if you need guidance on symptoms but are not in immediate danger.',
    primary: false,
  },
  {
    number: '1078',
    label: 'NDMA Disaster Helpline',
    description: 'National Disaster Management Authority. Call during declared heatwaves, floods, earthquakes, or other natural disasters.',
    primary: false,
  },
];

// ---- First aid steps ----
const FIRST_AID_STEPS = [
  { step: 1, emoji: '🏃', text: 'Move the person to a cool, shaded area immediately. Indoors with AC or fan is best.' },
  { step: 2, emoji: '📞', text: 'Call 112 or 108 for an ambulance. Do not wait to see if symptoms improve.' },
  { step: 3, emoji: '👕', text: 'Remove excess clothing. Loosen any tight garments.' },
  { step: 4, emoji: '💧', text: 'Cool the body: apply wet cloths to neck, armpits, and groin. Fan the person. Pour cool (not ice-cold) water on skin.' },
  { step: 5, emoji: '🚰', text: 'If conscious and able to swallow, give small sips of cool water or ORS. Do NOT force fluids if unconscious.' },
  { step: 6, emoji: '🧊', text: 'If available, place ice packs on neck, armpits, and groin — the areas where large blood vessels are close to the skin.' },
  { step: 7, emoji: '⏳', text: 'Stay with the person until help arrives. Monitor breathing. If they stop breathing, begin CPR if trained.' },
];

export default function SOSScreen() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());

  const dangerCount = Array.from(selectedSymptoms).filter(
    (id) => SYMPTOMS.find((s) => s.id === id)?.severity === 'danger'
  ).length;

  const totalSelected = selectedSymptoms.size;
  const isEmergency = dangerCount >= 2 || totalSelected >= 4;
  const isWarning = totalSelected >= 2;

  function toggleSymptom(id: string) {
    setSelectedSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function callNumber(number: string) {
    const url = `tel:${number}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Cannot make call', `Please dial ${number} manually from your phone.`);
      }
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeButton}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency call buttons — always visible at top */}
        <View style={styles.callSection}>
          <Text style={styles.callTitle}>Call for help</Text>
          <View style={styles.callButtonsRow}>
            <TouchableOpacity
              style={styles.callButtonPrimary}
              onPress={() => callNumber('112')}
              activeOpacity={0.7}
            >
              <Text style={styles.callButtonEmoji}>📞</Text>
              <Text style={styles.callButtonNumber}>112</Text>
              <Text style={styles.callButtonLabel}>Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callButtonPrimary}
              onPress={() => callNumber('108')}
              activeOpacity={0.7}
            >
              <Text style={styles.callButtonEmoji}>🚑</Text>
              <Text style={styles.callButtonNumber}>108</Text>
              <Text style={styles.callButtonLabel}>Ambulance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assessment result (if symptoms selected) */}
        {totalSelected > 0 && (
          <View style={[
            styles.assessmentBanner,
            isEmergency ? styles.bannerExtreme : isWarning ? styles.bannerDanger : styles.bannerWarning,
          ]}>
            <Text style={styles.assessmentEmoji}>
              {isEmergency ? '🚨' : isWarning ? '⚠️' : '⚡'}
            </Text>
            <View style={styles.assessmentTextCol}>
              <Text style={[
                styles.assessmentTitle,
                isEmergency ? styles.textExtreme : isWarning ? styles.textDanger : styles.textWarning,
              ]}>
                {isEmergency
                  ? 'LIKELY HEATSTROKE — Call 112 immediately'
                  : isWarning
                  ? 'Heat exhaustion warning — take action now'
                  : 'Mild heat stress — rest and hydrate'}
              </Text>
              <Text style={styles.assessmentSubtitle}>
                {totalSelected} symptom{totalSelected > 1 ? 's' : ''} selected
                {dangerCount > 0 ? ` (${dangerCount} critical)` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Symptom checker */}
        <Text style={styles.sectionTitle}>Check symptoms</Text>
        <Text style={styles.sectionSubtitle}>Tap all that apply to you or the person affected</Text>

        <View style={styles.symptomGrid}>
          {SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.has(symptom.id);
            return (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomChip,
                  isSelected && (symptom.severity === 'danger' ? styles.chipDanger : styles.chipWarning),
                ]}
                onPress={() => toggleSymptom(symptom.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                <Text style={[
                  styles.symptomLabel,
                  isSelected && (symptom.severity === 'danger' ? styles.labelDanger : styles.labelWarning),
                ]}>
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* First aid steps */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>
          Immediate first aid for heatstroke
        </Text>

        {FIRST_AID_STEPS.map((item) => (
          <View key={item.step} style={styles.stepRow}>
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNum}>{item.step}</Text>
            </View>
            <Text style={styles.stepText}>
              <Text style={styles.stepEmoji}>{item.emoji} </Text>
              {item.text}
            </Text>
          </View>
        ))}

        {/* All helplines */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>
          All emergency helplines
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoHeader}>About 108 ambulance service</Text>
          <Text style={styles.infoText}>
            108 is India's free emergency ambulance number, operated by EMRI (Emergency Management and Research Institute) in public-private partnership with state governments. Launched in 2005, it is now operational in 35 states and union territories, covering over 1 billion people with 10,000+ ambulances.
          </Text>
          <Text style={styles.infoText}>
            The service handles medical, police, and fire emergencies. Each ambulance comes with a trained Emergency Medical Technician (EMT). The service is completely free for emergency situations. Average response time for dispatch is 80-90 seconds after call connection.
          </Text>
          <Text style={styles.infoText}>
            States covered include: Andhra Pradesh, Telangana, Delhi, Gujarat, Tamil Nadu, Karnataka, Maharashtra, Uttar Pradesh, Rajasthan, Kerala, Odisha, Assam, Goa, Uttarakhand, Arunachal Pradesh, and more.
          </Text>
        </View>

        {HELPLINES.map((helpline) => (
          <TouchableOpacity
            key={helpline.number}
            style={[styles.helplineRow, helpline.primary && styles.helplinePrimary]}
            onPress={() => callNumber(helpline.number)}
            activeOpacity={0.7}
          >
            <View style={styles.helplineInfo}>
              <View style={styles.helplineTopRow}>
                <Text style={[styles.helplineNumber, helpline.primary && styles.helplineNumberPrimary]}>
                  {helpline.number}
                </Text>
                <Text style={styles.helplineLabel}>{helpline.label}</Text>
              </View>
              <Text style={styles.helplineDesc}>{helpline.description}</Text>
            </View>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This app provides general first aid guidance and is not a substitute for professional medical advice. In a medical emergency, always call 112 or 108 first. Response times and availability may vary by location.
          </Text>
        </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  headerTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.danger,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Call section
  callSection: {
    marginBottom: Spacing.lg,
  },
  callTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  callButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  callButtonPrimary: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  callButtonEmoji: { fontSize: 24 },
  callButtonNumber: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textOnPrimary,
  },
  callButtonLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },

  // Assessment
  assessmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  bannerExtreme: { backgroundColor: Colors.extremeBg },
  bannerDanger: { backgroundColor: Colors.dangerBg },
  bannerWarning: { backgroundColor: Colors.moderateBg },
  assessmentEmoji: { fontSize: 28 },
  assessmentTextCol: { flex: 1 },
  assessmentTitle: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold },
  textExtreme: { color: Colors.extreme },
  textDanger: { color: Colors.danger },
  textWarning: { color: Colors.moderate },
  assessmentSubtitle: { fontSize: Typography.size.xs, color: Colors.textSecondary, marginTop: 2 },

  // Sections
  sectionTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },

  // Symptoms
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipDanger: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.danger,
  },
  chipWarning: {
    backgroundColor: Colors.moderateBg,
    borderColor: Colors.moderate,
  },
  symptomEmoji: { fontSize: 14 },
  symptomLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  labelDanger: { color: Colors.danger },
  labelWarning: { color: Colors.moderate },

  // First aid steps
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNum: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.danger,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  stepEmoji: {
    fontSize: 14,
  },

  // Info card
  infoCard: {
    backgroundColor: Colors.cardAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoHeader: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },

  // Helplines
  helplineRow: {
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
  helplinePrimary: {
    borderColor: Colors.danger,
    borderWidth: 1.5,
  },
  helplineInfo: { flex: 1 },
  helplineTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  helplineNumber: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  helplineNumberPrimary: {
    color: Colors.danger,
  },
  helplineLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  helplineDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textLight,
    lineHeight: 16,
  },
  callIcon: { fontSize: 20 },

  // Disclaimer
  disclaimer: {
    backgroundColor: Colors.cardAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 16,
    textAlign: 'center',
  },
});
