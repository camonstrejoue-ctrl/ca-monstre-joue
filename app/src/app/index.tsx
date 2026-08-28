import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { IceFireHeading } from '@/components/ice-fire-heading';
import { NavTile } from '@/components/nav-tile';
import { SoftCard } from '@/components/soft-card';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content';

/**
 * Écran d'accueil en deux pages qui se glissent verticalement (ScrollView
 * en pagination) — demandé par l'utilisateur : une première page "mascotte
 * en grand + bulle" avant le vrai contenu (raccourcis + catégories), pour
 * démarrer sur une note sympathique plutôt que droit sur la grille de
 * boutons. La hauteur de chaque page est mesurée au runtime (onLayout)
 * plutôt que déduite de useWindowDimensions, pour coller exactement à
 * l'espace réellement disponible sous la safe area (pas de bande vide ni
 * de contenu coupé selon l'appareil).
 */
export default function AccueilScreen() {
  const { content, loading, error, refresh } = useContent();
  const [pageHeight, setPageHeight] = useState(0);

  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.pager} onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}>
        {pageHeight > 0 ? (
          <ScrollView
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={pageHeight}
            decelerationRate="fast"
            bounces={false}>
            <View style={{ height: pageHeight }}>
              <IntroPage />
            </View>
            <View style={{ height: pageHeight }}>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  contentFit="contain"
                />

                <IceFireHeading />

                <NavTile
                  href="/joueurs"
                  label="Trouver des joueurs"
                  eyebrow="Communauté"
                  description="Organise une partie ou un échange près de chez toi"
                  icon="people"
                  color="ice"
                />
                <NavTile
                  href="/agenda"
                  label="Agenda"
                  eyebrow="Ne rate rien"
                  description="Festivals, tournois, soirées jeux..."
                  icon="calendar"
                  color="flame"
                  shimmer
                />
                <NavTile
                  href="/catalogue"
                  label="Le blog"
                  eyebrow="À lire"
                  description="Toutes nos fiches jeux et critiques"
                  icon="newspaper"
                  color="frost"
                />
              </ScrollView>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function IntroPage() {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <View style={styles.introPage}>
      <View style={styles.introSpacer} />

      <View style={styles.bubbleWrap}>
        <SoftCard backgroundColor={Brand.white} radius={Radius.lg} style={styles.bubble}>
          <ThemedText type="subtitle" style={styles.bubbleText}>
            Jouer, c’est bon pour la santé.
          </ThemedText>
        </SoftCard>
        <View style={styles.bubbleTail} />
      </View>

      <Image
        source={require('@/assets/images/monstre.png')}
        style={styles.monster}
        contentFit="contain"
      />

      <Animated.View style={[styles.swipeHint, { transform: [{ translateY }] }]}>
        <Ionicons name="chevron-down" size={22} color={Brand.iceDark} />
        <ThemedText type="small" themeColor="textSecondary">
          Glisse vers le bas
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  pager: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.four },
  logo: {
    width: '112.5%',
    aspectRatio: 971 / 489,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  introPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  introSpacer: { flex: 1 },
  bubbleWrap: { alignItems: 'center', zIndex: 1 },
  bubble: { paddingHorizontal: Spacing.five, paddingVertical: Spacing.four, maxWidth: 360 },
  bubbleText: { textAlign: 'center', fontSize: 25, lineHeight: 30 },
  bubbleTail: {
    width: 22,
    height: 22,
    backgroundColor: Brand.white,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    marginTop: -12,
  },
  // Réduit d'un tiers (72% → 48%) pour laisser plus de place à la bulle,
  // agrandie en retour, à la demande de l'utilisateur.
  monster: {
    width: '48%',
    aspectRatio: 193 / 279,
    marginTop: Spacing.two,
  },
  swipeHint: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2, paddingBottom: Spacing.two },
});
