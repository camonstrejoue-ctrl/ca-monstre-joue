import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/ui/collapsible';
import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';
import { findArticle, findGame } from '@/lib/queries';
import { stripHtml } from '@/lib/strip-html';
import type { ArticleBlock } from '@/types/content';

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'p':
      return <ThemedText style={styles.paragraph}>{stripHtml(block.text)}</ThemedText>;
    case 'h2':
      return (
        <ThemedText type="subtitle" style={styles.h2}>
          {block.text}
        </ThemedText>
      );
    case 'list':
      return (
        <ThemedView style={styles.paragraph}>
          {block.items.map((item, i) => (
            <ThemedText key={i} style={styles.listItem}>
              • {stripHtml(item)}
            </ThemedText>
          ))}
        </ThemedView>
      );
    case 'image':
      return (
        <ThemedView style={styles.imageBlock}>
          <CoverImage path={block.src} style={styles.blockImage} />
          {block.caption ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
              {block.caption}
            </ThemedText>
          ) : null}
        </ThemedView>
      );
    case 'char':
      return (
        <ThemedView style={styles.charRow}>
          <CoverImage path={block.image} style={styles.charImage} />
          <ThemedView style={styles.charText}>
            <ThemedText type="smallBold">{block.name}</ThemedText>
            <ThemedText type="small">{block.text}</ThemedText>
          </ThemedView>
        </ThemedView>
      );
    case 'spoiler':
      return (
        <ThemedView style={styles.paragraph}>
          <Collapsible title={block.title}>
            <ThemedText type="small">{block.text}</ThemedText>
          </Collapsible>
        </ThemedView>
      );
    default:
      return null;
  }
}

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { content, loading, error, refresh } = useContent();

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  const article = findArticle(content, slug);
  if (!article) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>Cet article est introuvable.</ThemedText>
      </ThemedView>
    );
  }

  const game = findGame(content, article.gameSlug);
  const formattedDate = new Date(article.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: article.title }} />
      <ScrollView>
        <CoverImage path={article.hero || article.cover} style={styles.hero} />

        <ThemedView style={styles.body}>
          <ThemedText type="title" style={styles.title}>
            {article.title}
          </ThemedText>
          {article.subtitle ? (
            <ThemedText type="subtitle" themeColor="textSecondary" style={styles.subtitle}>
              {article.subtitle}
            </ThemedText>
          ) : null}
          <ThemedText type="small" themeColor="textSecondary" style={styles.date}>
            {formattedDate}
          </ThemedText>

          {article.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}

          {game ? (
            <Link href={{ pathname: '/jeu/[slug]', params: { slug: game.slug } }} asChild>
              <Pressable style={({ pressed }) => [styles.gameLink, pressed && styles.pressed]}>
                <CoverImage path={game.thumbnail || game.cover} style={styles.gameLinkImage} />
                <ThemedText type="link">Retour sur la page de {game.name}</ThemedText>
              </Pressable>
            </Link>
          ) : null}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', aspectRatio: 32 / 9 },
  body: { padding: Spacing.four, gap: Spacing.two },
  title: { fontSize: 26 },
  subtitle: { fontSize: 16 },
  date: { marginBottom: Spacing.three },
  paragraph: { marginBottom: Spacing.three },
  h2: { fontSize: 18, marginTop: Spacing.two, marginBottom: Spacing.two },
  listItem: { marginBottom: 4 },
  imageBlock: { marginBottom: Spacing.three },
  blockImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: Spacing.three },
  caption: { textAlign: 'center', marginTop: Spacing.two },
  charRow: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.three },
  charImage: { width: 96, height: 96, borderRadius: Spacing.two },
  charText: { flex: 1, gap: 4 },
  pressed: { opacity: 0.7 },
  gameLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  gameLinkImage: { width: 48, height: 48, borderRadius: Spacing.two },
});
