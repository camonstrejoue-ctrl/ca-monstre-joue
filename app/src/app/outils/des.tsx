import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MIN_DICE = 1;
const MAX_DICE = 10;

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

export default function DesScreen() {
  const theme = useTheme();
  const [numDice, setNumDice] = useState(2);
  const [results, setResults] = useState<number[] | null>(null);

  function handleRoll() {
    setResults(Array.from({ length: numDice }, rollDie));
  }

  const total = results?.reduce((sum, v) => sum + v, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Lanceur de dés' }} />
      <ThemedView style={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Nombre de dés
        </ThemedText>
        <ThemedView style={styles.stepper}>
          <Pressable
            onPress={() => setNumDice((n) => Math.max(MIN_DICE, n - 1))}
            disabled={numDice <= MIN_DICE}
            accessibilityLabel="Un dé de moins"
            accessibilityRole="button">
            <ThemedView type="backgroundElement" style={styles.stepperButton}>
              <Ionicons name="remove" size={22} color={theme.text} />
            </ThemedView>
          </Pressable>
          <ThemedText type="title" style={styles.stepperValue}>
            {numDice}
          </ThemedText>
          <Pressable
            onPress={() => setNumDice((n) => Math.min(MAX_DICE, n + 1))}
            disabled={numDice >= MAX_DICE}
            accessibilityLabel="Un dé de plus"
            accessibilityRole="button">
            <ThemedView type="backgroundElement" style={styles.stepperButton}>
              <Ionicons name="add" size={22} color={theme.text} />
            </ThemedView>
          </Pressable>
        </ThemedView>

        <Pressable onPress={handleRoll}>
          <ThemedView type="backgroundSelected" style={styles.rollButton}>
            <ThemedText type="smallBold">🎲 Lancer les dés</ThemedText>
          </ThemedView>
        </Pressable>

        {results ? (
          <>
            <View style={styles.diceRow}>
              {results.map((value, i) => (
                <ThemedView key={i} type="backgroundElement" style={styles.die}>
                  <ThemedText type="title">{value}</ThemedText>
                </ThemedView>
              ))}
            </View>
            <ThemedText type="subtitle" style={styles.total}>
              Total : {total}
            </ThemedText>
          </>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four, alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 32, minWidth: 48, textAlign: 'center' },
  rollButton: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
  diceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  die: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: { marginTop: Spacing.two },
});
