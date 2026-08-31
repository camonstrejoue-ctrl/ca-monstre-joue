import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverImage } from '@/components/cover-image';
import { FormField } from '@/components/form-field';
import { SignedOutPrompt } from '@/components/signed-out-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { confirmAction } from '@/lib/confirm';
import { isBggConfigured, searchBgg, type BggGame } from '@/lib/bgg';
import { useContent } from '@/lib/content';
import {
  addGameToLudotheque,
  backfillEntryDetails,
  removeGameFromLudotheque,
  useLudotheque,
  type LudothequeEntry,
} from '@/lib/ludotheque';
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

  function confirmRemove() {
    confirmAction(
      'Retirer ce jeu ?',
      `« ${entry.name} » sera retiré de ta ludothèque.`,
      handleRemove,
      'Retirer'
    );
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

const PLAYER_RANGES: { label: string; range: [number, number] }[] = [
  { label: '1-2', range: [1, 2] },
  { label: '3-4', range: [3, 4] },
  { label: '5-6', range: [5, 6] },
  { label: '7+', range: [7, Infinity] },
];

type SortMode = 'name' | 'addedAt';

export default function LudothequeScreen() {
  const { user, initializing } = useAuth();
  const { content } = useContent();
  const { entries, loading } = useLudotheque(user?.uid);
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [playersFilter, setPlayersFilter] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('name');
  const backfilled = useRef(new Set<string>());

  // Complète en tâche de fond les entrées ajoutées avant qu'on récupère
  // catégories/nombre de joueurs depuis BGG, sinon elles restent invisibles
  // dans les filtres (qui ignorent les entrées sans cette donnée).
  useEffect(() => {
    if (!user) return;
    for (const entry of entries) {
      // `categories` vaut toujours au moins [] pour une entrée ajoutée avec
      // le code actuel : `undefined` signale donc à coup sûr une ancienne
      // entrée (avant qu'on récupère ces infos depuis BGG).
      const incomplete = entry.categories === undefined;
      if (incomplete && !backfilled.current.has(entry.bggId)) {
        backfilled.current.add(entry.bggId);
        backfillEntryDetails(user.uid, entry).catch(() => {
          backfilled.current.delete(entry.bggId);
        });
      }
    }
  }, [entries, user]);

  if (initializing) return null;
  if (!user) {
    return (
      <SignedOutPrompt text="Retrouve ici les jeux que tu possèdes, pour les partager avec les autres joueurs." />
    );
  }

  const availableCategories = Array.from(
    new Set(entries.flatMap((e) => e.categories ?? []))
  ).sort((a, b) => a.localeCompare(b, 'fr'));

  let filtered = entries;
  if (categoryFilter) {
    filtered = filtered.filter((e) => e.categories?.includes(categoryFilter));
  }
  if (playersFilter) {
    filtered = filtered.filter(
      (e) =>
        e.minPlayers != null &&
        e.maxPlayers != null &&
        e.minPlayers <= playersFilter[1] &&
        e.maxPlayers >= playersFilter[0]
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'addedAt') {
      return (b.addedAt?.toMillis() ?? 0) - (a.addedAt?.toMillis() ?? 0);
    }
    return a.name.localeCompare(b.name, 'fr');
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.bggId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
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
            <Link href="/liste-pere-noel" asChild>
              <Pressable>
                <ThemedView type="backgroundElement" style={styles.addButton}>
                  <ThemedText type="smallBold">🎁 Vers ma liste au Père Noël</ThemedText>
                </ThemedView>
              </Pressable>
            </Link>
            {showSearch ? (
              <AddGameSearch uid={user.uid} onAdded={() => setShowSearch(false)} />
            ) : null}

            {!showSearch && entries.length > 0 ? (
              <View style={styles.filters}>
                {/* Filtre "Catégorie" masqué à la demande de l'utilisateur —
                    state/logique de filtrage conservés (categoryFilter,
                    availableCategories) pour pouvoir le réafficher
                    facilement plus tard. */}

                <ThemedText type="small" themeColor="textSecondary">
                  Nombre de joueurs
                </ThemedText>
                <View style={styles.chipRow}>
                  {PLAYER_RANGES.map((p) => (
                    <Pressable
                      key={p.label}
                      onPress={() =>
                        setPlayersFilter((cur) => (cur === p.range ? null : p.range))
                      }>
                      <ThemedView
                        type="backgroundElement"
                        style={[styles.chip, playersFilter === p.range && styles.chipSelected]}>
                        <ThemedText type={playersFilter === p.range ? 'smallBold' : 'small'}>
                          {p.label}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  ))}
                </View>

                <ThemedText type="small" themeColor="textSecondary">
                  Trier par
                </ThemedText>
                <View style={styles.chipRow}>
                  <Pressable onPress={() => setSortBy('name')}>
                    <ThemedView
                      type="backgroundElement"
                      style={[styles.chip, sortBy === 'name' && styles.chipSelected]}>
                      <ThemedText type={sortBy === 'name' ? 'smallBold' : 'small'}>Nom</ThemedText>
                    </ThemedView>
                  </Pressable>
                  <Pressable onPress={() => setSortBy('addedAt')}>
                    <ThemedView
                      type="backgroundElement"
                      style={[styles.chip, sortBy === 'addedAt' && styles.chipSelected]}>
                      <ThemedText type={sortBy === 'addedAt' ? 'smallBold' : 'small'}>
                        Date d’ajout
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {!loading && entries.length === 0 && !showSearch ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun jeu dans ta ludothèque pour l’instant.
              </ThemedText>
            ) : null}
            {!loading && entries.length > 0 && sorted.length === 0 && !showSearch ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun jeu ne correspond à ces filtres.
              </ThemedText>
            ) : null}
          </View>
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
  filters: { gap: Spacing.two },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: { borderColor: Brand.ice },
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
