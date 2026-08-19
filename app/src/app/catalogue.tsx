import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useContent } from '@/lib/content';

export default function CatalogueScreen() {
  const { content, loading, error, refresh } = useContent();
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !content) return [];
    return content.games.filter((g) => g.name.toLowerCase().includes(q));
  }, [query, content]);

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  const games = [...content.games].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Blog
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.searchBar}>
              <Ionicons name="search" size={18} color={theme.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Recherche un jeu"
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </ThemedView>

            {query.trim() ? (
              <ThemedView style={styles.searchResults}>
                {matches.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.noResults}>
                    Aucun jeu ne correspond à « {query.trim()} ».
                  </ThemedText>
                ) : (
                  matches.map((game) => (
                    <Link
                      key={game.slug}
                      href={{ pathname: '/jeu/[slug]', params: { slug: game.slug } }}
                      asChild>
                      <Pressable style={styles.searchRow}>
                        <CoverImage path={game.thumbnail || game.cover} style={styles.searchRowImage} />
                        <ThemedText type="smallBold">{game.name}</ThemedText>
                      </Pressable>
                    </Link>
                  ))
                )}
              </ThemedView>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/jeu/[slug]', params: { slug: item.slug } }} asChild>
            <Pressable style={styles.gameCard}>
              <CoverImage path={item.thumbnail || item.cover} style={styles.gameImage} />
              <ThemedView style={styles.gameInfo}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.identity.players} joueurs · {item.identity.duration}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: { flex: 1, fontSize: 16 },
  searchResults: { gap: Spacing.two },
  noResults: { paddingVertical: Spacing.two },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 4 },
  searchRowImage: { width: 44, height: 44, borderRadius: Spacing.two },
  pressed: { opacity: 0.7 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  gameImage: { width: 72, height: 72, borderRadius: Spacing.two },
  gameInfo: { flex: 1, gap: 2 },
});
