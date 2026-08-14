import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';

type HomeLinkHref =
  | '/agenda'
  | '/catalogue'
  | '/ludotheque'
  | '/outils/souvenirs'
  | '/joueurs'
  | '/outils/des'
  | '/outils/score';

function HomeTile({
  href,
  label,
  full = false,
}: {
  href: HomeLinkHref;
  label: string;
  full?: boolean;
}) {
  return (
    // `Link asChild` rend un <a> sur web qui ne grandit pas tout seul dans une
    // rangée flex (il garde sa taille naturelle) : on fixe donc la taille de
    // la tuile sur ce conteneur englobant, et le lien/bouton se contente de
    // remplir 100% de cet espace.
    <View style={full ? styles.tileFull : styles.tileHalf}>
      <Link href={href} asChild>
        <Pressable style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.tileInner}>
            <Image
              source={require('@/assets/images/avatars/monstre-aucun.png')}
              style={styles.tileAvatar}
            />
            <ThemedText type="smallBold" style={styles.tileLabel}>
              {label}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </Link>
    </View>
  );
}

export default function AccueilScreen() {
  const { content, loading, error, refresh } = useContent();

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

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

        <View style={styles.grid}>
          <View style={styles.row}>
            <HomeTile href="/agenda" label="Agenda" />
            <HomeTile href="/catalogue" label="Blog" />
          </View>
          <View style={styles.row}>
            <HomeTile href="/ludotheque" label="Ma ludothèque" />
            <HomeTile href="/outils/souvenirs" label="Mes souvenirs" />
          </View>
          <View style={styles.row}>
            <HomeTile href="/joueurs" label="Trouver des joueurs près de chez moi" full />
          </View>
          <View style={styles.row}>
            <HomeTile href="/outils/des" label="Lanceur de dés" />
            <HomeTile href="/outils/score" label="Compteur de points" />
          </View>
        </View>
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
  pressed: { opacity: 0.7 },
  grid: { gap: Spacing.three, marginTop: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  tile: { width: '100%', height: '100%', borderRadius: Spacing.five, overflow: 'hidden' },
  tileHalf: { flex: 1, aspectRatio: 1 },
  tileFull: { flex: 1, aspectRatio: 16 / 7 },
  tileInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  tileAvatar: { width: 48, height: 48 },
  tileLabel: { textAlign: 'center', fontSize: 16, lineHeight: 20 },
});
