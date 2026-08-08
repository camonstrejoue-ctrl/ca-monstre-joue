import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverImage } from '@/components/cover-image';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { isBggConfigured, searchBgg, type BggGame } from '@/lib/bgg';
import { useContent } from '@/lib/content';
import {
  addGameToLudotheque,
  removeGameFromLudotheque,
  useLudotheque,
  type LudothequeEntry,
} from '@/lib/ludotheque';
import { findGameByBggId } from '@/lib/queries';

function SignedOutPrompt() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Connecte-toi pour gérer ta ludothèque
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Retrouve ici les jeux que tu possèdes, pour les partager avec les autres joueurs.
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
      await addGameToLudotheque(uid, game);
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
    <ThemedView style={styles.searchBox}>
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
            <ThemedView style={styles.resultInfo}>
              <ThemedText type="smallBold">{game.name}</ThemedText>
              {game.yearPublished ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {game.yearPublished}
                </ThemedText>
              ) : null}
            </ThemedView>
            <ThemedText type="small">{addingId === game.bggId ? '...' : '+ Ajouter'}</ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ThemedView>
  );
}

function LudothequeRow({
  entry,
  siteSlug,
  uid,
}: {
  entry: LudothequeEntry;
  siteSlug: string | undefined;
  uid: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    setBusy(true);
    try {
      await removeGameFromLudotheque(uid, entry.bggId);
    } finally {
      setBusy(false);
    }
  }

  const content = (
    <ThemedView style={styles.gameLink}>
      <CoverImage path={entry.thumbnail} style={styles.gameImage} />
      <ThemedView style={styles.gameInfo}>
        <ThemedText type="smallBold">{entry.name}</ThemedText>
        {entry.yearPublished ? (
          <ThemedText type="small" themeColor="textSecondary">
            {entry.yearPublished}
          </ThemedText>
        ) : null}
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.gameCard}>
      {siteSlug ? (
        <Link href={{ pathname: '/jeu/[slug]', params: { slug: siteSlug } }} asChild>
          <Pressable style={styles.gameLinkTouchable}>{content}</Pressable>
        </Link>
      ) : (
        content
      )}
      <Pressable onPress={handleRemove} disabled={busy}>
        <ThemedView type="backgroundElement" style={styles.removeButton}>
          <ThemedText type="small">Retirer</ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

export default function LudothequeScreen() {
  const { user, initializing } = useAuth();
  const { content } = useContent();
  const { entries, loading } = useLudotheque(user?.uid);
  const [showSearch, setShowSearch] = useState(false);

  if (initializing) return null;
  if (!user) return <SignedOutPrompt />;

  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.bggId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Ma ludothèque
            </ThemedText>
            <Pressable onPress={() => setShowSearch((v) => !v)}>
              <ThemedView type="backgroundSelected" style={styles.addButton}>
                <ThemedText type="smallBold">
                  {showSearch ? 'Fermer la recherche' : '+ Ajouter un jeu à ma ludothèque'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            {showSearch ? (
              <AddGameSearch uid={user.uid} onAdded={() => setShowSearch(false)} />
            ) : null}
            {!loading && sorted.length === 0 && !showSearch ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun jeu dans ta ludothèque pour l’instant.
              </ThemedText>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => (
          <LudothequeRow
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
  addButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  searchBox: { gap: Spacing.two },
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
