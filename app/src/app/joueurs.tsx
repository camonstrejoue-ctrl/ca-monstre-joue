import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarMonster } from '@/components/avatar-monster';
import { FormField } from '@/components/form-field';
import { SignedOutPrompt } from '@/components/signed-out-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { listAllPlayers, searchPlayersByVille, type PlayerResult } from '@/lib/joueurs';
import { computeAge, MIN_CONTACT_AGE } from '@/lib/moderation';

export default function JoueursScreen() {
  const { user, profile, initializing } = useAuth();
  const [ville, setVille] = useState('');
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = useCallback(
    async (targetVille: string, { asRefresh = false } = {}) => {
      if (!user) return;
      if (asRefresh) setRefreshing(true);
      else setSearching(true);
      setError(null);
      try {
        const players = targetVille.trim()
          ? await searchPlayersByVille(targetVille, user.uid)
          : await listAllPlayers(user.uid);
        setResults(players);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSearching(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) runQuery(ville);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  if (initializing) return null;
  if (!user) {
    return (
      <SignedOutPrompt text="Cherche des joueurs dans ta ville pour organiser une partie ou échanger des jeux." />
    );
  }

  const ownProfileVisible = Boolean(profile?.visibleToPlayers);
  const ownAge = computeAge(profile?.birthdate);
  const isMinor = ownAge !== null && ownAge < MIN_CONTACT_AGE;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => runQuery(ville, { asRefresh: true })}
            tintColor={Brand.coral}
          />
        }
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Joueurs
            </ThemedText>
            {!ownProfileVisible && isMinor ? (
              <ThemedView type="backgroundElement" style={styles.visibilityHint}>
                <ThemedText type="small">
                  Réservé aux {MIN_CONTACT_AGE} ans et plus — tu ne peux pas encore être vu(e) ni
                  contacter d’autres joueurs. Ça se débloquera automatiquement le jour de tes{' '}
                  {MIN_CONTACT_AGE} ans.
                </ThemedText>
              </ThemedView>
            ) : !ownProfileVisible ? (
              <Link href="/profil" asChild>
                <Pressable>
                  <ThemedView type="backgroundElement" style={styles.visibilityHint}>
                    <ThemedText type="small">
                      Ton profil n’est pas visible par les autres joueurs. Active « Être visible
                      par les autres joueurs » dans ton Profil pour pouvoir contacter quelqu’un.
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </Link>
            ) : null}
            <FormField
              label="Ville (laisse vide pour voir tout le monde)"
              value={ville}
              onChangeText={setVille}
              placeholder="ex: Genève"
              onSubmitEditing={() => runQuery(ville)}
            />
            <Pressable onPress={() => runQuery(ville)} disabled={searching}>
              <ThemedView type="backgroundSelected" style={styles.searchButton}>
                <ThemedText type="smallBold">
                  {ville.trim() ? 'Rechercher' : 'Voir tous les joueurs'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
            {!searching && results.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                {ville.trim()
                  ? 'Aucun joueur trouvé dans cette ville pour l’instant.'
                  : 'Aucun autre joueur visible pour l’instant.'}
              </ThemedText>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/joueur/[uid]', params: { uid: item.uid } }} asChild>
            <Pressable style={styles.playerCard}>
              <AvatarMonster accessory={item.avatarAccessory} size={48} ring />
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
  visibilityHint: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
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
  playerInfo: { flex: 1, gap: 2 },
});
