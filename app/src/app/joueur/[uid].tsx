import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarMonster } from '@/components/avatar-monster';
import { ContentState } from '@/components/content-state';
import { CoverImage } from '@/components/cover-image';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { useContent } from '@/lib/content';
import {
  getPlayer,
  getPlayerListePereNoel,
  getPlayerLudotheque,
  reportPlayer,
  type PlayerResult,
} from '@/lib/joueurs';
import type { PereNoelEntry } from '@/lib/liste-pere-noel';
import type { LudothequeEntry } from '@/lib/ludotheque';
import { computeAge, MIN_CONTACT_AGE } from '@/lib/moderation';
import { findCategory, findGameByBggId } from '@/lib/queries';

// Utilisé pour la Ludothèque ET la Liste au Père Noël d'un profil public :
// même rendu (vignette + nom), lien vers la fiche jeu du site quand elle
// existe (findGameByBggId), sinon juste affiché tel quel — un jeu ajouté
// par recherche BGG libre n'est pas forcément dans le catalogue du site.
function GameEntryRow({ name, thumbnail, siteSlug }: { name: string; thumbnail?: string; siteSlug: string | undefined }) {
  const row = (
    <View style={styles.gameRow}>
      <CoverImage path={thumbnail} style={styles.gameImage} />
      <ThemedText type="small">{name}</ThemedText>
    </View>
  );
  if (!siteSlug) return row;
  return (
    <Link href={{ pathname: '/jeu/[slug]', params: { slug: siteSlug } }} asChild>
      <Pressable>{row}</Pressable>
    </Link>
  );
}

// Accordéon fermé par défaut : avec une grosse ludothèque (50 jeux...) la
// liste complète alourdirait visuellement la fiche joueur si elle était
// toujours dépliée. Le nombre de jeux reste visible dans l'en-tête même
// replié, pour donner l'info sans avoir à déplier.
function AccordionSection({
  title,
  count,
  emptyMessage,
  children,
}: {
  title: string;
  count: number;
  emptyMessage: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.accordionHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title} {count > 0 ? `(${count})` : ''}
        </ThemedText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textSecondary} />
      </Pressable>
      {open ? (
        count === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {emptyMessage}
          </ThemedText>
        ) : (
          children
        )
      ) : null}
    </View>
  );
}

export default function JoueurScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { user, profile } = useAuth();
  const { content } = useContent();

  const [player, setPlayer] = useState<PlayerResult | null | undefined>(undefined);
  const [ludotheque, setLudotheque] = useState<LudothequeEntry[]>([]);
  const [pereNoel, setPereNoel] = useState<PereNoelEntry[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    getPlayer(uid).then(setPlayer);
    getPlayerLudotheque(uid).then(setLudotheque);
    getPlayerListePereNoel(uid).then(setPereNoel);
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
      <View style={styles.notFound}>
        <ThemedText>Ce profil est introuvable.</ThemedText>
      </View>
    );
  }

  const visibility = player.visibility;
  const viewerCanContact = Boolean(profile?.visibleToPlayers);
  const targetCanBeContacted = Boolean(player.visibleToPlayers);
  const contactAllowed = viewerCanContact && targetCanBeContacted;
  const viewerAge = computeAge(profile?.birthdate);
  const viewerIsMinor = viewerAge !== null && viewerAge < MIN_CONTACT_AGE;
  const playerAge = computeAge(player.birthdate);
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
        <AvatarMonster accessory={player.avatarAccessory} size={96} ring style={styles.avatar} />
        <ThemedText type="title" style={styles.title}>
          {player.pseudo}
        </ThemedText>
        {visibility?.prenom && player.prenom ? (
          <ThemedText type="small">Prénom : {player.prenom}</ThemedText>
        ) : null}
        {visibility?.age && playerAge !== null ? (
          <ThemedText type="small">Âge : {playerAge}</ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {player.ville}
        </ThemedText>
        {categoryNames.length ? (
          <View style={styles.chipRow}>
            {categoryNames.map((name) => (
              <ThemedView key={name} type="backgroundElement" style={styles.chip}>
                <ThemedText type="small">{name}</ThemedText>
              </ThemedView>
            ))}
          </View>
        ) : null}

        {visibility?.description && player.description ? (
          <ThemedText type="small" style={styles.description}>
            {player.description}
          </ThemedText>
        ) : null}

        {contactAllowed ? (
          <Pressable onPress={() => Linking.openURL(`mailto:${player.contactEmail}`)}>
            <ThemedView type="backgroundSelected" style={styles.contactButton}>
              <ThemedText type="smallBold">✉ Contacter {player.pseudo}</ThemedText>
            </ThemedView>
          </Pressable>
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.contactUnavailable}>
            {viewerCanContact
              ? 'Le contact n’est pas disponible pour ce profil.'
              : viewerIsMinor
                ? `Réservé aux ${MIN_CONTACT_AGE} ans et plus — ça se débloquera automatiquement le jour de tes ${MIN_CONTACT_AGE} ans.`
                : 'Active « Être visible par les autres joueurs » dans ton profil pour pouvoir contacter d’autres joueurs.'}
          </ThemedText>
        )}

        <AccordionSection
          title="Ludothèque"
          count={ludotheque.length}
          emptyMessage="Aucun jeu enregistré pour l’instant.">
          {ludotheque.map((entry) => (
            <GameEntryRow
              key={entry.bggId}
              name={entry.name}
              thumbnail={entry.thumbnail}
              siteSlug={content ? findGameByBggId(content, entry.bggId)?.slug : undefined}
            />
          ))}
        </AccordionSection>

        <AccordionSection
          title="🎁 Liste au Père Noël"
          count={pereNoel.length}
          emptyMessage="Aucun jeu dans la liste pour l’instant.">
          {pereNoel.map((entry) => (
            <GameEntryRow
              key={entry.bggId}
              name={entry.name}
              thumbnail={entry.thumbnail}
              siteSlug={content ? findGameByBggId(content, entry.bggId)?.slug : undefined}
            />
          ))}
        </AccordionSection>

        <ThemedText type="subtitle" style={[styles.sectionTitle, styles.reportTitle]}>
          Signaler
        </ThemedText>
        {reportSent ? (
          <ThemedText type="small" themeColor="textSecondary">
            Signalement envoyé, merci.
          </ThemedText>
        ) : showReportForm ? (
          <View style={styles.reportForm}>
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
          </View>
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
  avatar: { marginBottom: Spacing.two },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: 4, borderRadius: Spacing.five },
  description: { marginTop: Spacing.three },
  contactButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  contactUnavailable: { marginTop: Spacing.three },
  sectionTitle: { fontSize: 18, marginBottom: Spacing.two },
  reportTitle: { marginTop: Spacing.four },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
  },
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
