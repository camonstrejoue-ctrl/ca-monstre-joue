import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useContent } from '@/lib/content';
import { addGameToLudotheque, removeGameFromLudotheque, useLudotheque } from '@/lib/ludotheque';
import type { Game } from '@/types/content';

function GameRow({ game, owned, uid }: { game: Game; owned: boolean; uid: string }) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (owned) {
        await removeGameFromLudotheque(uid, game.slug);
      } else {
        await addGameToLudotheque(uid, game.slug);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.gameCard}>
      <Link href={{ pathname: '/jeu/[slug]', params: { slug: game.slug } }} asChild>
        <Pressable style={styles.gameLink}>
          <CoverImage path={game.thumbnail || game.cover} style={styles.gameImage} />
          <ThemedView style={styles.gameInfo}>
            <ThemedText type="smallBold">{game.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {game.identity.players} joueurs
            </ThemedText>
          </ThemedView>
        </Pressable>
      </Link>
      <Pressable onPress={toggle} disabled={busy}>
        <ThemedView
          type={owned ? 'backgroundSelected' : 'backgroundElement'}
          style={[styles.toggleButton, busy && styles.pressed]}>
          <ThemedText type="small">{owned ? '✓ Dans ma ludothèque' : '+ Ajouter'}</ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

function SignedOutPrompt() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Connecte-toi pour gérer ta ludothèque
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Retrouve ici les jeux que tu possèdes, pour les partager avec les autres joueurs.
      </ThemedText>
      <Link href="/profil" asChild>
        <Pressable>
          <ThemedView type="backgroundSelected" style={styles.loginButton}>
            <ThemedText type="smallBold">Aller à Profil</ThemedText>
          </ThemedView>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

export default function LudothequeScreen() {
  const { user, initializing } = useAuth();
  const { content, loading, error, refresh } = useContent();
  const { slugs: ownedSlugs } = useLudotheque(user?.uid);

  if (initializing) return null;
  if (!user) return <SignedOutPrompt />;
  if (loading || error || !content) {
    return <ContentState loading={loading} error={error} onRetry={refresh} />;
  }

  const games = [...content.games].sort((a, b) => {
    const aOwned = ownedSlugs.has(a.slug);
    const bOwned = ownedSlugs.has(b.slug);
    if (aOwned !== bOwned) return aOwned ? -1 : 1;
    return a.name.localeCompare(b.name, 'fr');
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.pageTitle}>
            Ma ludothèque
          </ThemedText>
        }
        renderItem={({ item }) => (
          <GameRow game={item} owned={ownedSlugs.has(item.slug)} uid={user.uid} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  pageTitle: { fontSize: 32, marginBottom: Spacing.three },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centerText: { textAlign: 'center' },
  loginButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  pressed: { opacity: 0.6 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  gameLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  gameImage: { width: 56, height: 56, borderRadius: Spacing.two },
  gameInfo: { flex: 1, gap: 2 },
  toggleButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
});
