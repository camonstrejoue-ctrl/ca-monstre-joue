import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverImage } from '@/components/cover-image';
import { FormField } from '@/components/form-field';
import { SignedOutPrompt } from '@/components/signed-out-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { isBggConfigured, searchBgg, type BggGame } from '@/lib/bgg';
import { useContent } from '@/lib/content';
import {
  addGameToListePereNoel,
  removeGameFromListePereNoel,
  useListePereNoel,
  type PereNoelEntry,
} from '@/lib/liste-pere-noel';
import { findGameByBggId } from '@/lib/queries';

function AddGameSearch({ uid, onAdded }: { uid: string; onAdded: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BggGame[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      setResults(await searchBgg(query.trim()));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(game: BggGame) {
    setAddingId(game.bggId);
    try {
      await addGameToListePereNoel(uid, game);
      onAdded();
    } finally {
      setAddingId(null);
    }
  }

  if (!isBggConfigured) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.notConfigured}>
        Recherche de jeux non configurée (en attente de validation BGG — voir
        app/.env.example).
      </ThemedText>
    );
  }

  return (
    <View style={styles.searchBox}>
      <View style={styles.bggBadge}>
        <Image
          source={require('@/assets/images/powered-by-bgg.jpeg')}
          style={styles.bggBadgeImage}
          contentFit="contain"
        />
      </View>
      <FormField
        label="Nom du jeu"
        value={query}
        onChangeText={setQuery}
        placeholder="ex: Catan"
        onSubmitEditing={handleSearch}
      />
      <Pressable onPress={handleSearch} disabled={searching || !query.trim()}>
        <ThemedView type="backgroundSelected" style={styles.searchButton}>
          <ThemedText type="smallBold">Rechercher</ThemedText>
        </ThemedView>
      </Pressable>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      {results && results.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Aucun jeu trouvé.
        </ThemedText>
      ) : null}
      {(results ?? []).map((game) => (
        <Pressable key={game.bggId} onPress={() => handleAdd(game)} disabled={addingId !== null}>
          <ThemedView type="backgroundElement" style={styles.resultRow}>
            <CoverImage path={game.thumbnail} style={styles.resultImage} />
            <View style={styles.resultInfo}>
              <ThemedText type="smallBold">{game.name}</ThemedText>
              {game.yearPublished ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {game.yearPublished}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText type="small">{addingId === game.bggId ? '...' : '+ Ajouter'}</ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </View>
  );
}

function PereNoelRow({
  entry,
  siteSlug,
  uid,
}: {
  entry: PereNoelEntry;
  siteSlug: string | undefined;
  uid: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    setBusy(true);
    try {
      await removeGameFromListePereNoel(uid, entry.bggId);
    } finally {
      setBusy(false);
    }
  }

  function confirmRemove() {
    Alert.alert('Retirer ce jeu ?', `« ${entry.name} » sera retiré de ta liste au Père Noël.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: handleRemove },
    ]);
  }

  const content = (
    <View style={styles.gameLink}>
      <CoverImage path={entry.thumbnail} style={styles.gameImage} />
      <View style={styles.gameInfo}>
        <ThemedText type="smallBold">{entry.name}</ThemedText>
        {entry.yearPublished ? (
          <ThemedText type="small" themeColor="textSecondary">
            {entry.yearPublished}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.gameCard}>
      {siteSlug ? (
        <Link href={{ pathname: '/jeu/[slug]', params: { slug: siteSlug } }} asChild>
          <Pressable style={styles.gameLinkTouchable}>{content}</Pressable>
        </Link>
      ) : (
        content
      )}
      <Pressable onPress={confirmRemove} disabled={busy}>
        <ThemedView type="backgroundElement" style={styles.removeButton}>
          <ThemedText type="small">Retirer</ThemedText>
        </ThemedView>
      </Pressable>
    </View>
  );
}

export default function ListePereNoelScreen() {
  const { user, initializing } = useAuth();
  const { content } = useContent();
  const { entries, loading } = useListePereNoel(user?.uid);
  const [showSearch, setShowSearch] = useState(false);

  if (initializing) return null;
  if (!user) {
    return (
      <SignedOutPrompt text="Note ici les jeux que tu ne possèdes pas encore mais que tu aimerais recevoir." />
    );
  }

  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Liste au Père Noël' }} />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.bggId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              Les jeux que tu ne possèdes pas encore, mais que tu aimerais recevoir — visible sur
              ton profil public comme ta ludothèque.
            </ThemedText>
            <Pressable onPress={() => setShowSearch((v) => !v)}>
              <ThemedView type="backgroundSelected" style={styles.addButton}>
                <ThemedText type="smallBold">
                  {showSearch ? 'Fermer la recherche' : '+ Ajouter un jeu à ma liste'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            {showSearch ? (
              <AddGameSearch uid={user.uid} onAdded={() => setShowSearch(false)} />
            ) : null}

            {!loading && entries.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun jeu dans ta liste pour l’instant.
              </ThemedText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <PereNoelRow
            entry={item}
            siteSlug={content ? findGameByBggId(content, item.bggId)?.slug : undefined}
            uid={user.uid}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  addButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  searchBox: { gap: Spacing.two },
  bggBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
  bggBadgeImage: { width: 120, height: 30 },
  searchButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  notConfigured: { fontStyle: 'italic' },
  error: { color: '#D14343' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  resultImage: { width: 44, height: 44, borderRadius: Spacing.two },
  resultInfo: { flex: 1, gap: 2 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  gameLinkTouchable: { flex: 1 },
  gameLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  gameImage: { width: 56, height: 56, borderRadius: Spacing.two },
  gameInfo: { flex: 1, gap: 2 },
  removeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
});
