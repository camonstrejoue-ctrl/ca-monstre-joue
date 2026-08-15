import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';
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
  image,
  full = false,
}: {
  href: HomeLinkHref;
  label: string;
  image: string;
  full?: boolean;
}) {
  return (
    // `Link asChild` rend un <a> sur web qui ne grandit pas tout seul dans une
    // rangée flex (il garde sa taille naturelle) : on fixe donc la taille de
    // la tuile sur ce conteneur englobant, et le lien/bouton se contente de
    // remplir 100% de cet espace.
    <View style={full ? styles.tileFull : styles.tileHalf}>
      <Link href={href} asChild>
        <Pressable style={({ pressed }) => [styles.tileTouchable, pressed && styles.pressed]}>
          <StickerBox backgroundColor={Brand.white} radius={Radius.lg} style={styles.tileSticker}>
            <View style={styles.tileImageWrap}>
              {/* Images 1:1 existantes du site, en test en attendant une
                  illustration dédiée par section. */}
              <CoverImage path={image} style={styles.tileImage} />
              <View style={styles.tileOverlay}>
                <ThemedText type="smallBold" style={styles.tileLabel}>
                  {label}
                </ThemedText>
              </View>
            </View>
          </StickerBox>
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
          <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
            <StickerBox backgroundColor={Brand.coralLight} radius={Radius.lg}>
              <View style={styles.ptitMonstreInner}>
                <Image
                  source={require('@/assets/images/avatars/monstre-aucun.png')}
                  style={styles.ptitMonstreAvatar}
                />
                <ThemedText type="smallBold" style={styles.ptitMonstreText}>
                  P’tit Monstre, trouve mon prochain jeu
                </ThemedText>
              </View>
            </StickerBox>
          </Pressable>
        </Link>

        <View style={styles.grid}>
          <View style={styles.row}>
            <HomeTile
              href="/agenda"
              label="Agenda"
              image="assets/categories/jeux-adeux-categorie.JPG"
            />
            <HomeTile
              href="/catalogue"
              label="Blog"
              image="assets/categories/jeux-cooperatifs-categorie.jpg"
            />
          </View>
          <View style={styles.row}>
            <HomeTile
              href="/ludotheque"
              label="Ludothèque"
              image="assets/categories/jeux-dambiance-categorie.jpg"
            />
            <HomeTile
              href="/outils/souvenirs"
              label="Souvenirs"
              image="assets/categories/jeux-strategie-categorie.JPG"
            />
          </View>
          <View style={styles.row}>
            <HomeTile
              href="/joueurs"
              label="Trouver des joueurs près de chez moi"
              image="assets/categories/jeux-narratifs-categorie.JPG"
              full
            />
          </View>
          <View style={styles.row}>
            <HomeTile
              href="/outils/des"
              label="Lanceur de dés"
              image="assets/categories/jeux-famille-categorie.JPG"
            />
            <HomeTile
              href="/outils/score"
              label="Compteur de points"
              image="assets/games/sub-terra-ii/sub-terra-ii-liste.jpg"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  logo: {
    width: '75%',
    aspectRatio: 971 / 489,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  ptitMonstreInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  ptitMonstreAvatar: { width: 40, height: 40 },
  ptitMonstreText: { flex: 1, color: Brand.black },
  pressed: { opacity: 0.85 },
  grid: { gap: Spacing.four, marginTop: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.four },
  tileTouchable: { width: '100%', height: '100%' },
  tileHalf: { flex: 1, aspectRatio: 1 },
  tileFull: { flex: 1, aspectRatio: 16 / 7 },
  tileSticker: { width: '100%', height: '100%' },
  tileImageWrap: { width: '100%', height: '100%' },
  tileImage: { width: '100%', height: '100%' },
  tileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,26,26,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  tileLabel: {
    textAlign: 'center',
    fontSize: 31,
    lineHeight: 35,
    color: Brand.white,
  },
});
