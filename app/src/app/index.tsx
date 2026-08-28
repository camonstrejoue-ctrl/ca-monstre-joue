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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <Link href="/ptit-monstre" asChild>
          <Pressable>
            <StickerBox backgroundColor={Brand.coral} radius={Radius.lg}>
              <View style={styles.ptitMonstreInner}>
                <Image
                  source={require('@/assets/images/avatars/monstre-aucun.png')}
                  style={styles.ptitMonstreAvatar}
                />
                <View style={styles.ptitMonstreTextWrap}>
                  <ThemedText type="smallBold" style={styles.ptitMonstreEyebrow}>
                    Ton guide jeux
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.ptitMonstreText}>
                    P’tit Monstre trouve ton prochain jeu
                  </ThemedText>
                </View>
              </View>
            </StickerBox>
          </Pressable>
        </Link>

        <NavTile
          href="/joueurs"
          label="Trouver des joueurs"
          eyebrow="Communauté"
          description="Organise une partie ou un échange près de chez toi"
          icon="people"
          color="coral"
        />
        <NavTile
          href="/agenda"
          label="Agenda"
          eyebrow="Ne rate rien"
          description="Festivals, tournois, soirées jeux..."
          icon="calendar"
          color="green"
        />
        <NavTile
          href="/catalogue"
          label="Le blog"
          eyebrow="À lire"
          description="Toutes nos fiches jeux et critiques"
          icon="newspaper"
          color="cream"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  logo: {
    width: '112.5%',
    aspectRatio: 971 / 489,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  ptitMonstreInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  ptitMonstreAvatar: { width: 64, height: 64 },
  ptitMonstreTextWrap: { flex: 1, gap: 2 },
  ptitMonstreEyebrow: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  ptitMonstreText: { color: Brand.white, fontSize: 19, lineHeight: 23 },
  pressed: { opacity: 0.85 },
});
