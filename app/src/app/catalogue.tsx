import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';

export default function CatalogueScreen() {
  const { content, loading, error, refresh } = useContent();

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
        ListHeaderComponent={
          <ThemedText type="title" style={styles.pageTitle}>
            Blog
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/jeu/[slug]', params: { slug: item.slug } }} asChild>
            <Pressable style={({ pressed }) => [styles.gameCard, pressed && styles.pressed]}>
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
  pageTitle: { fontSize: 32, marginBottom: Spacing.three },
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
