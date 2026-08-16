import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { NavTile } from '@/components/nav-tile';
import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';

export default function AccueilScreen() {
  const { content, loading, error, refresh } = useContent();

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Image
        source={require('@/assets/images/monstre-fond.png')}
        style={styles.backgroundMonster}
        contentFit="contain"
        pointerEvents="none"
      />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <Link href="/ptit-monstre" asChild>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
            <StickerBox backgroundColor={Brand.white} radius={Radius.lg}>
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

        <NavTile
          href="/monde-du-jeu"
          label="Le monde du jeu près de chez moi"
          image="assets/categories/jeux-narratifs-categorie.JPG"
        />
        <NavTile
          href="/mon-univers"
          label="Mon univers"
          image="assets/categories/jeux-dambiance-categorie.jpg"
        />
        <NavTile
          href="/outils"
          label="Mes outils pour jouer"
          image="assets/categories/jeux-famille-categorie.JPG"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.coralLight },
  backgroundMonster: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
  },
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
});
