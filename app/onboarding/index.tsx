/**
 * Onboarding Screen
 *
 * A friendly 3-step flow to personalize the experience.
 * ALL fields are optional — user can skip any step or the entire flow.
 *
 * Step 1: Name + City
 * Step 2: Gender + Age + Body type
 * Step 3: Weight + Diet preference
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

// ---- Types for form state ----
interface OnboardingData {
  name: string;
  city: string;
  gender: 'male' | 'female' | 'other' | null;
  age: string;
  body_type: 'slim' | 'average' | 'athletic' | 'heavy' | null;
  weight_kg: string;
  diet_preference: 'vegetarian' | 'vegan' | 'non-vegetarian' | null;
}

// ---- Chip selector component ----
function ChipGroup<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string; emoji?: string }[];
  selected: T | null;
  onSelect: (value: T | null) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(isSelected ? null : opt.value)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            activeOpacity={0.7}
          >
            {opt.emoji && <Text style={styles.chipEmoji}>{opt.emoji}</Text>}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---- Main component ----
export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    city: '',
    gender: null,
    age: '',
    body_type: null,
    weight_kg: '',
    diet_preference: null,
  });

  const totalSteps = 3;

  function handleNext() {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleSkip() {
    handleFinish();
  }

  function handleFinish() {
    // TODO: Save to Supabase via completeOnboarding() in Step 6
    // For now, just navigate to home
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.stepLabel}>Step {step} of {totalSteps}</Text>
            <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.skipText}>Skip all</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>Welcome to SunSuraksha</Text>
              <Text style={styles.subtitle}>
                Let's personalize your experience.{'\n'}
                Everything is optional — skip if you'd like.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>What should we call you?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={Colors.textLight}
                  value={data.name}
                  onChangeText={(text) => setData({ ...data, name: text })}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Which city are you in?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delhi, Mumbai, Ahmedabad"
                  placeholderTextColor={Colors.textLight}
                  value={data.city}
                  onChangeText={(text) => setData({ ...data, city: text })}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.emoji}>🧑</Text>
              <Text style={styles.title}>About you</Text>
              <Text style={styles.subtitle}>
                This helps us tailor food and hydration advice.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <ChipGroup
                  options={[
                    { value: 'male', label: 'Male', emoji: '👨' },
                    { value: 'female', label: 'Female', emoji: '👩' },
                    { value: 'other', label: 'Other', emoji: '🧑' },
                  ]}
                  selected={data.gender}
                  onSelect={(val) => setData({ ...data, gender: val })}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 28"
                  placeholderTextColor={Colors.textLight}
                  value={data.age}
                  onChangeText={(text) => setData({ ...data, age: text.replace(/[^0-9]/g, '') })}
                  keyboardType="number-pad"
                  maxLength={3}
                  returnKeyType="done"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Body type</Text>
                <ChipGroup
                  options={[
                    { value: 'slim', label: 'Slim' },
                    { value: 'average', label: 'Average' },
                    { value: 'athletic', label: 'Athletic' },
                    { value: 'heavy', label: 'Heavy' },
                  ]}
                  selected={data.body_type}
                  onSelect={(val) => setData({ ...data, body_type: val })}
                />
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.emoji}>🥗</Text>
              <Text style={styles.title}>Food & hydration</Text>
              <Text style={styles.subtitle}>
                We'll recommend cooling foods and drinks based on this.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 70"
                  placeholderTextColor={Colors.textLight}
                  value={data.weight_kg}
                  onChangeText={(text) => setData({ ...data, weight_kg: text.replace(/[^0-9]/g, '') })}
                  keyboardType="number-pad"
                  maxLength={3}
                  returnKeyType="done"
                />
                <Text style={styles.fieldHint}>
                  Used to calculate your daily water target
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Diet preference</Text>
                <ChipGroup
                  options={[
                    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
                    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
                    { value: 'non-vegetarian', label: 'Non-veg', emoji: '🍗' },
                  ]}
                  selected={data.diet_preference}
                  onSelect={(val) => setData({ ...data, diet_preference: val })}
                />
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          <TouchableOpacity onPress={handleNext} style={styles.nextButton} activeOpacity={0.7}>
            <Text style={styles.nextText}>
              {step === totalSteps ? "Let's go!" : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  skipText: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // Content
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
  },

  // Fields
  fieldGroup: {
    marginBottom: Spacing.xxl,
  },
  fieldLabel: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  fieldHint: {
    fontSize: Typography.size.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.body,
    color: Colors.text,
    minHeight: 48,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
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
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  chipTextSelected: {
    color: Colors.primaryDark,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minWidth: 80,
  },
  backText: {
    fontSize: Typography.size.body,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  nextText: {
    fontSize: Typography.size.body,
    color: Colors.textOnPrimary,
    fontWeight: Typography.weight.semibold,
  },
});
