import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useContent } from '@/lib/content';
import { getPlayer, getPlayerLudotheque, reportPlayer, type PlayerResult } from '@/lib/joueurs';
import { findCategory, findGame } from '@/lib/queries';

export default function JoueurScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { user } = useAuth();
  const { content } = useContent();

  const [player, setPlayer] = useState<PlayerResult | null | undefined>(undefined);
  const [ludothequeSlugs, setLudothequeSlugs] = useState<string[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    getPlayer(uid).then(setPlayer);
    getPlayerLudotheque(uid).then(setLudothequeSlugs);
  }, [uid]);

  async function handleReport() {
    if (!user || !reportReason.trim()) return;
    setReportError(null);
    try {
      await reportPlayer(user.uid, uid, reportReason.trim());
      setReportSent(true);
      setShowReportForm(false);
    } catch (err) {
      setReportError((err as Error).message);
    }
  }

  if (player === undefined) {
    return <ContentState loading error={null} onRetry={() => {}} />;
  }
  if (player === null) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText>Ce profil est introuvable.</ThemedText>
      </ThemedView>
    );
  }

  const games = content ? ludothequeSlugs.map((slug) => findGame(content, slug)).filter(Boolean) : [];
  const visibility = player.visibility;
  const categoryNames =
    content && visibility?.categoriesPreferees
      ? (player.categoriesPreferees ?? [])
          .map((slug) => findCategory(content, slug)?.name)
          .filter(Boolean)
      : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: player.pseudo }} />
      <ScrollView contentContainerStyle={styles.body}>
        {visibility?.photo && player.photoURL ? (
          <Image source={{ uri: player.photoURL }} style={styles.photo} />
        ) : null}
        <ThemedText type="title" style={styles.title}>
          {player.pseudo}
        </ThemedText>
        {visibility?.prenom && player.prenom ? (
          <ThemedText type="small">Prénom : {player.prenom}</ThemedText>
        ) : null}
        {visibility?.age && player.age ? <ThemedText type="small">Âge : {player.age}</ThemedText> : null}
        <ThemedText type="small" themeColor="textSecondary">
          {player.ville}
        </ThemedText>
        {categoryNames.length ? (
          <ThemedView style={styles.chipRow}>
            {categoryNames.map((name) => (
              <ThemedView key={name} type="backgroundElement" style={styles.chip}>
                <ThemedText type="small">{name}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        ) : null}

        <Pressable onPress={() => Linking.openURL(`mailto:${player.contactEmail}`)}>
          <ThemedView type="backgroundSelected" style={styles.contactButton}>
            <ThemedText type="smallBold">✉ Contacter {player.pseudo}</ThemedText>
          </ThemedView>
        </Pressable>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ludothèque
        </ThemedText>
        {games.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Aucun jeu enregistré pour l’instant.
          </ThemedText>
        ) : (
          games.map((game) => (
            <ThemedView key={game!.slug} style={styles.gameRow}>
              <CoverImage path={game!.thumbnail || game!.cover} style={styles.gameImage} />
              <ThemedText type="small">{game!.name}</ThemedText>
            </ThemedView>
          ))
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Signaler
        </ThemedText>
        {reportSent ? (
          <ThemedText type="small" themeColor="textSecondary">
            Signalement envoyé, merci.
          </ThemedText>
        ) : showReportForm ? (
          <ThemedView style={styles.reportForm}>
            <FormField
              label="Raison du signalement"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            {reportError ? <ThemedText style={styles.error}>{reportError}</ThemedText> : null}
            <Pressable onPress={handleReport} disabled={!reportReason.trim()}>
              <ThemedView type="backgroundElement" style={styles.reportButton}>
                <ThemedText type="small">Envoyer le signalement</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        ) : (
          <Pressable onPress={() => setShowReportForm(true)}>
            <ThemedText type="link" style={styles.reportLink}>
              Signaler ce profil
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: Spacing.four, gap: Spacing.two },
  title: { fontSize: 28 },
  photo: { width: 96, height: 96, borderRadius: 48, marginBottom: Spacing.two },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: 4, borderRadius: Spacing.five },
  contactButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, marginTop: Spacing.four, marginBottom: Spacing.two },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.two },
  gameImage: { width: 40, height: 40, borderRadius: Spacing.two },
  reportLink: { color: '#D14343' },
  reportForm: { gap: Spacing.two },
  reportButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
  },
  error: { color: '#D14343' },
});
