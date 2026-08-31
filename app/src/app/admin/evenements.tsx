import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { confirmAction } from '@/lib/confirm';
import { isoToDisplayDate } from '@/lib/date-format';
import {
  ADMIN_UID,
  publishEvent,
  publishEventSubmission,
  rejectEvent,
  rejectEventSubmission,
  usePendingEventSubmissions,
  usePendingEvents,
  type CommunityEvent,
  type EventSubmission,
} from '@/lib/events';

/**
 * Écran de modération de l'Agenda — réservé au compte admin (voir
 * ADMIN_UID). Deux files d'attente à traiter au même endroit :
 * - les événements créés depuis l'app (collection `events`, status
 *   "pending" — voir addEvent dans agenda.tsx) ;
 * - les soumissions du formulaire "Proposer un événement" du site
 *   statique (collection `eventSubmissions`, remplies par
 *   js/firebase-forms.js, status "pending").
 * Publier une soumission du site crée un nouvel événement "published"
 * dans `events` (voir publishEventSubmission) — c'est ce qui permet au
 * site de n'avoir, à terme, qu'à lire `events` filtré sur
 * status == 'published' au lieu de dupliquer à la main dans js/data.js.
 * La vraie protection contre un accès non-admin est dans
 * firestore.rules (isAdmin) : ce garde côté écran n'est que pour l'UX,
 * pas la sécurité.
 */
export default function ModerationEvenementsScreen() {
  const { user, initializing } = useAuth();
  const { events: pendingEvents, loading: loadingEvents } = usePendingEvents();
  const { submissions, loading: loadingSubmissions } = usePendingEventSubmissions();

  if (initializing) return null;
  if (!user || user.uid !== ADMIN_UID) {
    return (
      <View style={styles.notFound}>
        <ThemedText>Cette page est introuvable.</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Événements de l’app ({pendingEvents.length})
        </ThemedText>
        {!loadingEvents && pendingEvents.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Rien en attente.
          </ThemedText>
        ) : (
          pendingEvents.map((event) => <PendingEventCard key={event.id} event={event} />)
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Soumissions du site ({submissions.length})
        </ThemedText>
        {!loadingSubmissions && submissions.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Rien en attente.
          </ThemedText>
        ) : (
          submissions.map((submission) => (
            <PendingSubmissionCard key={submission.id} submission={submission} adminUid={user.uid} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PendingEventCard({ event }: { event: CommunityEvent }) {
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    setBusy(true);
    try {
      await publishEvent(event.id);
    } finally {
      setBusy(false);
    }
  }

  function confirmReject() {
    confirmAction(
      'Rejeter cet événement ?',
      `« ${event.title} » sera définitivement supprimé.`,
      () => rejectEvent(event.id),
      'Rejeter'
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {event.poster ? <Image source={{ uri: event.poster }} style={styles.posterImage} /> : null}
      <ThemedText type="smallBold">{event.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {isoToDisplayDate(event.date)} {event.time} · {event.location}
      </ThemedText>
      <ThemedText type="small">{event.price}</ThemedText>
      {event.description ? <ThemedText type="small">{event.description}</ThemedText> : null}
      <ThemedText type="small">Contact : {event.contact}</ThemedText>
      <View style={styles.actionsRow}>
        <Pressable onPress={handlePublish} disabled={busy}>
          <ThemedView type="backgroundSelected" style={styles.actionButton}>
            <ThemedText type="smallBold">Publier</ThemedText>
          </ThemedView>
        </Pressable>
        <Pressable onPress={confirmReject} disabled={busy}>
          <ThemedText type="small" style={styles.rejectLink}>
            Rejeter
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function PendingSubmissionCard({
  submission,
  adminUid,
}: {
  submission: EventSubmission;
  adminUid: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    setBusy(true);
    try {
      await publishEventSubmission(adminUid, submission);
    } finally {
      setBusy(false);
    }
  }

  function confirmReject() {
    confirmAction(
      'Rejeter cette soumission ?',
      `« ${submission.title} » ne sera pas publiée.`,
      () => rejectEventSubmission(submission.id),
      'Rejeter'
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {submission.imageUrl ? (
        <Image source={{ uri: submission.imageUrl }} style={styles.posterImage} />
      ) : null}
      <ThemedText type="smallBold">{submission.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {isoToDisplayDate(submission.date)} {submission.time} · {submission.location}
      </ThemedText>
      <ThemedText type="small">{submission.price}</ThemedText>
      {submission.description ? <ThemedText type="small">{submission.description}</ThemedText> : null}
      <ThemedText type="small">Contact : {submission.contact}</ThemedText>
      {submission.registrationLink ? (
        <ThemedText type="small">Inscription : {submission.registrationLink}</ThemedText>
      ) : null}
      <View style={styles.actionsRow}>
        <Pressable onPress={handlePublish} disabled={busy}>
          <ThemedView type="backgroundSelected" style={styles.actionButton}>
            <ThemedText type="smallBold">Publier</ThemedText>
          </ThemedView>
        </Pressable>
        <Pressable onPress={confirmReject} disabled={busy}>
          <ThemedText type="small" style={styles.rejectLink}>
            Rejeter
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: Spacing.four, gap: Spacing.two },
  sectionTitle: { fontSize: 19, marginTop: Spacing.four, marginBottom: Spacing.two },
  card: { gap: 4, padding: Spacing.three, borderRadius: Spacing.three, marginBottom: Spacing.three },
  posterImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
  actionButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  rejectLink: { color: '#D14343' },
});
