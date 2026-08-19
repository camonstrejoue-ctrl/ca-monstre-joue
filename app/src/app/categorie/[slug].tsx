import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';
import { findCategory, gamesInCategory } from '@/lib/queries';

export default function CategorieScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { content, loading, error, refresh } = useContent();

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  const category = findCategory(content, slug);
  const games = gamesInCategory(content, slug);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: category?.name ?? 'Catégorie' }} />
      <FlatList
        data={games}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            Aucun jeu dans cette catégorie pour l’instant.
          </ThemedText>
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
  empty: { textAlign: 'center', marginTop: Spacing.six },
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
