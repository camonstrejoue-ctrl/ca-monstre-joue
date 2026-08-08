import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { searchPlayersByVille, type PlayerResult } from '@/lib/joueurs';

function SignedOutPrompt() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Connecte-toi pour trouver des joueurs
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Cherche des joueurs dans ta ville pour organiser une partie ou échanger des jeux.
      </ThemedText>
      <Link href="/profil" asChild>
        <Pressable>
          <ThemedView type="backgroundSelected" style={styles.loginButton}>
            <ThemedText type="smallBold">Aller à Profil</ThemedText>
          </ThemedView>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

export default function JoueursScreen() {
  const { user, initializing } = useAuth();
  const [ville, setVille] = useState('');
  const [results, setResults] = useState<PlayerResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!user || !ville.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const players = await searchPlayersByVille(ville, user.uid);
      setResults(players);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  if (initializing) return null;
  if (!user) return <SignedOutPrompt />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={results ?? []}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Joueurs
            </ThemedText>
            <FormField
              label="Ville"
              value={ville}
              onChangeText={setVille}
              placeholder="ex: Genève"
              onSubmitEditing={handleSearch}
            />
            <Pressable onPress={handleSearch} disabled={searching || !ville.trim()}>
              <ThemedView type="backgroundSelected" style={styles.searchButton}>
                <ThemedText type="smallBold">Rechercher</ThemedText>
              </ThemedView>
            </Pressable>
            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
            {results && results.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun joueur trouvé dans cette ville pour l’instant.
              </ThemedText>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/joueur/[uid]', params: { uid: item.uid } }} asChild>
            <Pressable style={({ pressed }) => [styles.playerCard, pressed && styles.pressed]}>
              <ThemedView type="backgroundElement" style={styles.avatar}>
                <ThemedText type="smallBold">{item.pseudo.charAt(0).toUpperCase()}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.playerInfo}>
                <ThemedText type="smallBold">{item.pseudo}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.ville}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  pageTitle: { fontSize: 32 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centerText: { textAlign: 'center' },
  loginButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  searchButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  error: { color: '#D14343' },
  pressed: { opacity: 0.7 },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: { flex: 1, gap: 2 },
});
