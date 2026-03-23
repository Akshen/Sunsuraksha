import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

export default function FoodScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🥗</Text>
        <Text style={styles.title}>Food & Drinks</Text>
        <Text style={styles.subtitle}>Coming in Step 8</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: Spacing.lg },
  title: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.text },
  subtitle: { fontSize: Typography.size.body, color: Colors.textSecondary, marginTop: Spacing.sm },
});
