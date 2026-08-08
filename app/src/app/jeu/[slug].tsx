import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { HighlightedHeading } from '@/components/highlighted-heading';
import { StarRow } from '@/components/star-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';
import { findGame, galleryForGame, heroImagesForGame } from '@/lib/queries';

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.identityRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </ThemedView>
  );
}

export default function JeuScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { content, loading, error, refresh } = useContent();

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  const game = findGame(content, slug);
  if (!game) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>Ce jeu est introuvable.</ThemedText>
      </ThemedView>
    );
  }

  const intro = Array.isArray(game.intro) ? game.intro : [game.intro];
  const hero = heroImagesForGame(game)[0] ?? game.cover;
  const gallery = galleryForGame(content, game);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: game.name }} />
      <ScrollView>
        <CoverImage path={hero} style={styles.hero} />

        <ThemedView style={styles.body}>
          <HighlightedHeading size="title" style={styles.title}>
            {game.name}
          </HighlightedHeading>

          <ThemedView type="backgroundElement" style={styles.identityCard}>
            <IdentityRow label="Joueurs" value={game.identity.players} />
            <IdentityRow label="Âge" value={game.identity.age} />
            <IdentityRow label="Durée" value={game.identity.duration} />
            <IdentityRow label="Année" value={game.identity.year} />
            <IdentityRow label="Type" value={game.identity.type} />
            <ThemedView style={styles.identityRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Difficulté
              </ThemedText>
              <StarRow rating={game.identity.difficulty} />
            </ThemedView>
            <ThemedView style={styles.identityRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Note de Ça Monstre Joue
              </ThemedText>
              <StarRow rating={game.identity.note} />
            </ThemedView>
          </ThemedView>

          {intro.map((paragraph, i) => (
            <ThemedText key={i} style={styles.paragraph}>
              {paragraph}
            </ThemedText>
          ))}

          {game.fitIntro ? <ThemedText style={styles.paragraph}>{game.fitIntro}</ThemedText> : null}

          <HighlightedHeading size="subtitle" style={styles.sectionTitle}>
            Ce jeu est fait pour toi si...
          </HighlightedHeading>
          {game.fitFor.map((line, i) => (
            <ThemedText key={i} style={styles.listItem}>
              ✓ {line}
            </ThemedText>
          ))}

          <HighlightedHeading size="subtitle" style={styles.sectionTitle}>
            Ce n’est pas pour toi si...
          </HighlightedHeading>
          {game.notFitFor.map((line, i) => (
            <ThemedText key={i} style={styles.listItem}>
              ✗ {line}
            </ThemedText>
          ))}

          {game.video ? (
            <Pressable onPress={() => Linking.openURL(game.video)}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">▶ Regarder la vidéo</ThemedText>
              </ThemedView>
            </Pressable>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.paragraph}>
              Vidéo à venir
            </ThemedText>
          )}

          {game.spotify ? (
            <Pressable onPress={() => Linking.openURL(game.spotify)}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">♫ Notre playlist Spotify conseillée</ThemedText>
              </ThemedView>
            </Pressable>
          ) : null}

          {gallery.length ? (
            <>
              <HighlightedHeading size="subtitle" style={styles.sectionTitle}>
                Pour aller plus loin
              </HighlightedHeading>
              {gallery.map(({ article }) => (
                <Link
                  key={article!.slug}
                  href={{ pathname: '/article/[slug]', params: { slug: article!.slug } }}
                  asChild>
                  <Pressable style={({ pressed }) => [styles.articleCard, pressed && styles.pressed]}>
                    <CoverImage path={article!.cover} style={styles.articleImage} />
                    <ThemedText type="smallBold" style={styles.articleTitle}>
                      {article!.title}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}
            </>
          ) : null}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: Spacing.four, gap: Spacing.two },
  title: { fontSize: 28, marginBottom: Spacing.two },
  identityCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  identityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paragraph: { marginBottom: Spacing.two },
  sectionTitle: { fontSize: 18, marginTop: Spacing.three, marginBottom: Spacing.two },
  listItem: { marginBottom: 4 },
  pressed: { opacity: 0.7 },
  linkButton: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  articleImage: { width: 64, height: 64, borderRadius: Spacing.two },
  articleTitle: { flex: 1 },
});
