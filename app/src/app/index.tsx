import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useContent } from '@/lib/content';
import { recentArticles } from '@/lib/queries';

export default function AccueilScreen() {
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

  const articles = recentArticles(content, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

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
                <Link key={game.slug} href={{ pathname: '/jeu/[slug]', params: { slug: game.slug } }} asChild>
                  <Pressable style={({ pressed }) => [styles.searchRow, pressed && styles.pressed]}>
                    <CoverImage path={game.thumbnail || game.cover} style={styles.searchRowImage} />
                    <ThemedText type="smallBold">{game.name}</ThemedText>
                  </Pressable>
                </Link>
              ))
            )}
          </ThemedView>
        ) : null}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Derniers articles
        </ThemedText>
        {articles.map((article) => (
          <Link key={article.slug} href={{ pathname: '/article/[slug]', params: { slug: article.slug } }} asChild>
            <Pressable style={({ pressed }) => [styles.articleCard, pressed && styles.pressed]}>
              <CoverImage path={article.banner || article.cover} style={styles.articleImage} />
              <ThemedView type="backgroundElement" style={styles.articleCaption}>
                <ThemedText type="smallBold">{article.title}</ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        ))}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Catégories
        </ThemedText>
        <FlatList
          data={content.categories}
          keyExtractor={(item) => item.slug}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoryGrid}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/categorie/[slug]', params: { slug: item.slug } }} asChild>
              <Pressable style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
                <CoverImage path={item.image} style={styles.categoryImage} />
                <ThemedView type="backgroundElement" style={styles.categoryCaption}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                </ThemedView>
              </Pressable>
            </Link>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
  logo: {
    width: '75%',
    aspectRatio: 971 / 489,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
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
  sectionTitle: { fontSize: 20, marginTop: Spacing.three, marginBottom: Spacing.two },
  pressed: { opacity: 0.7 },
  articleCard: { borderRadius: Spacing.three, overflow: 'hidden', marginBottom: Spacing.three },
  articleImage: { width: '100%', aspectRatio: 16 / 9 },
  articleCaption: { padding: Spacing.three },
  categoryGrid: { gap: Spacing.three },
  categoryRow: { gap: Spacing.three },
  categoryCard: { flex: 1, borderRadius: Spacing.three, overflow: 'hidden' },
  categoryImage: { width: '100%', aspectRatio: 1 },
  categoryCaption: { padding: Spacing.two },
});
