import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Player {
  id: string;
  name: string;
  score: number;
}

let nextId = 1;

function PlayerRow({
  player,
  onChangeName,
  onChangeScore,
  onRemove,
}: {
  player: Player;
  onChangeName: (name: string) => void;
  onChangeScore: (delta: number) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <TextInput
        value={player.name}
        onChangeText={onChangeName}
        placeholder="Nom du joueur"
        placeholderTextColor={theme.textSecondary}
        style={[styles.nameInput, { color: theme.text }]}
      />
      <Pressable
        onPress={() => onChangeScore(-1)}
        hitSlop={8}
        accessibilityLabel={`Retirer un point à ${player.name || 'ce joueur'}`}
        accessibilityRole="button">
        <Ionicons name="remove-circle-outline" size={26} color={theme.text} />
      </Pressable>
      <ThemedText type="title" style={styles.score}>
        {player.score}
      </ThemedText>
      <Pressable
        onPress={() => onChangeScore(1)}
        hitSlop={8}
        accessibilityLabel={`Ajouter un point à ${player.name || 'ce joueur'}`}
        accessibilityRole="button">
        <Ionicons name="add-circle-outline" size={26} color={theme.text} />
      </Pressable>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityLabel={`Retirer ${player.name || 'ce joueur'} de la partie`}
        accessibilityRole="button">
        <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
      </Pressable>
    </ThemedView>
  );
}

export default function ScoreScreen() {
  const [players, setPlayers] = useState<Player[]>([]);

  function addPlayer() {
    setPlayers((prev) => [...prev, { id: String(nextId++), name: '', score: 0 }]);
  }

  function updateName(id: string, name: string) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function updateScore(id: string, delta: number) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p)));
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function resetScores() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Compteur de points' }} />
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            Ajoute des joueurs pour commencer à compter les points.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <PlayerRow
            player={item}
            onChangeName={(name) => updateName(item.id, name)}
            onChangeScore={(delta) => updateScore(item.id, delta)}
            onRemove={() => removePlayer(item.id)}
          />
        )}
        ListFooterComponent={
          <ThemedView style={styles.footer}>
            <Pressable onPress={addPlayer}>
              <ThemedView type="backgroundSelected" style={styles.addButton}>
                <ThemedText type="smallBold">+ Ajouter un joueur</ThemedText>
              </ThemedView>
            </Pressable>
            {players.length > 0 ? (
              <Pressable onPress={resetScores}>
                <ThemedText type="link" style={styles.resetLink}>
                  Réinitialiser les scores
                </ThemedText>
              </Pressable>
            ) : null}
          </ThemedView>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  empty: { textAlign: 'center', marginTop: Spacing.six },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
  },
  nameInput: { flex: 1, fontSize: 16 },
  score: { fontSize: 22, minWidth: 40, textAlign: 'center' },
  footer: { gap: Spacing.three, marginTop: Spacing.two },
  addButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  resetLink: { textAlign: 'center' },
});
