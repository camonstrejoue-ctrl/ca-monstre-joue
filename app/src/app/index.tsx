import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';
import { recentArticles } from '@/lib/queries';

export default function AccueilScreen() {
  const { content, loading, error, refresh } = useContent();

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

        <Link href="/ptit-monstre" asChild>
          <Pressable style={({ pressed }) => [styles.ptitMonstreButton, pressed && styles.pressed]}>
            <ThemedView type="backgroundSelected" style={styles.ptitMonstreInner}>
              <Image
                source={require('@/assets/images/avatars/monstre-aucun.png')}
                style={styles.ptitMonstreAvatar}
              />
              <ThemedText type="smallBold" style={styles.ptitMonstreText}>
                P’tit Monstre, trouve mon prochain jeu
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>

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
  ptitMonstreButton: { borderRadius: Spacing.five, overflow: 'hidden' },
  ptitMonstreInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  ptitMonstreAvatar: { width: 40, height: 40, borderRadius: 20 },
  ptitMonstreText: { flex: 1 },
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
