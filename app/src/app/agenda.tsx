import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { addEvent, removeEvent, reportEvent, useUpcomingEvents, type CommunityEvent } from '@/lib/events';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatEventDateTime(event: CommunityEvent) {
  const start = formatDate(event.date) + (event.time ? ` à ${event.time}` : '');
  if (!event.endDate || event.endDate === event.date) return start;
  const end = formatDate(event.endDate) + (event.endTime ? ` à ${event.endTime}` : '');
  return `Du ${start} au ${end}`;
}

function SignedOutHint() {
  return (
    <ThemedView style={styles.hintBox}>
      <ThemedText type="small" themeColor="textSecondary">
        Connecte-toi pour publier un événement.
      </ThemedText>
      <Link href="/profil" asChild>
        <Pressable>
          <ThemedText type="link">Aller à Profil</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

function AddEventForm({ uid, onAdded }: { uid: string; onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!title.trim() || !location.trim() || !date.trim() || !contact.trim()) {
      setError('Renseigne au moins le nom, le lieu, la date et un contact.');
      return;
    }
    if (!DATE_RE.test(date.trim())) {
      setError('La date doit être au format AAAA-MM-JJ (ex: 2026-09-15).');
      return;
    }
    if (endDate.trim() && !DATE_RE.test(endDate.trim())) {
      setError('La date de fin doit être au format AAAA-MM-JJ (ex: 2026-09-17).');
      return;
    }
    setSubmitting(true);
    try {
      await addEvent(uid, {
        title: title.trim(),
        location: location.trim(),
        date: date.trim(),
        time: time.trim(),
        endDate: endDate.trim() || undefined,
        endTime: endTime.trim() || undefined,
        price: price.trim() || 'Gratuit',
        contact: contact.trim(),
        description: description.trim(),
      });
      onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.form}>
      <FormField label="Nom de l'événement" value={title} onChangeText={setTitle} />
      <FormField label="Lieu" value={location} onChangeText={setLocation} />
      <FormField
        label="Date (AAAA-MM-JJ)"
        value={date}
        onChangeText={setDate}
        placeholder="2026-09-15"
      />
      <FormField label="Heure" value={time} onChangeText={setTime} placeholder="19:00" />
      <FormField
        label="Date de fin (optionnel, si l'événement dure plusieurs jours)"
        value={endDate}
        onChangeText={setEndDate}
        placeholder="2026-09-17"
      />
      <FormField label="Heure de fin" value={endTime} onChangeText={setEndTime} placeholder="20:00" />
      <FormField
        label="Prix"
        value={price}
        onChangeText={setPrice}
        placeholder="Gratuit, 5 CHF, ..."
      />
      <FormField
        label="Contact (e-mail, téléphone ou lien)"
        value={contact}
        onChangeText={setContact}
      />
      <FormField
        label="Description (optionnel)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Pressable onPress={handleSubmit} disabled={submitting}>
        <ThemedView type="backgroundSelected" style={styles.submitButton}>
          <ThemedText type="smallBold">Publier l’événement</ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

function EventCard({ event, uid }: { event: CommunityEvent; uid: string | undefined }) {
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const isOwner = uid && event.createdBy === uid;
  const isLink = /^https?:\/\//.test(event.contact);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{event.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatEventDateTime(event)} · {event.location}
      </ThemedText>
      <ThemedText type="small">{event.price}</ThemedText>
      {event.description ? <ThemedText type="small">{event.description}</ThemedText> : null}
      {isLink ? (
        <Pressable onPress={() => Linking.openURL(event.contact)}>
          <ThemedText type="link">{event.contact}</ThemedText>
        </Pressable>
      ) : (
        <ThemedText type="small">Contact : {event.contact}</ThemedText>
      )}

      <ThemedView style={styles.cardFooter}>
        {isOwner ? (
          <Pressable onPress={() => removeEvent(event.id)}>
            <ThemedText type="small" style={styles.removeLink}>
              Supprimer
            </ThemedText>
          </Pressable>
        ) : uid ? (
          reportSent ? (
            <ThemedText type="small" themeColor="textSecondary">
              Signalement envoyé
            </ThemedText>
          ) : showReport ? null : (
            <Pressable onPress={() => setShowReport(true)}>
              <ThemedText type="small" style={styles.removeLink}>
                Signaler
              </ThemedText>
            </Pressable>
          )
        ) : null}
      </ThemedView>

      {showReport ? (
        <ThemedView style={styles.reportForm}>
          <FormField label="Raison du signalement" value={reportReason} onChangeText={setReportReason} />
          <Pressable
            onPress={async () => {
              if (!uid || !reportReason.trim()) return;
              await reportEvent(uid, event.id, reportReason.trim());
              setReportSent(true);
              setShowReport(false);
            }}
            disabled={!reportReason.trim()}>
            <ThemedView type="backgroundSelected" style={styles.submitButton}>
              <ThemedText type="small">Envoyer</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

export default function AgendaScreen() {
  const { user } = useAuth();
  const { events, loading } = useUpcomingEvents();
  const [showForm, setShowForm] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Agenda
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Festivals, tournois en boutique, soirées jeux entre particuliers... Retrouve ici
              les prochains événements de la communauté.
            </ThemedText>

            {user ? (
              <Pressable onPress={() => setShowForm((v) => !v)}>
                <ThemedView type="backgroundSelected" style={styles.addButton}>
                  <ThemedText type="smallBold">
                    {showForm ? 'Fermer le formulaire' : '+ Ajouter un événement'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ) : (
              <SignedOutHint />
            )}
            {showForm && user ? (
              <AddEventForm uid={user.uid} onAdded={() => setShowForm(false)} />
            ) : null}

            {!loading && events.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun événement à venir pour l’instant.
              </ThemedText>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => <EventCard event={item} uid={user?.uid} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  pageTitle: { fontSize: 32 },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  addButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  form: { gap: Spacing.two, marginTop: Spacing.two },
  submitButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  error: { color: '#D14343' },
  card: { gap: 4, padding: Spacing.three, borderRadius: Spacing.three, marginBottom: Spacing.three },
  cardFooter: { flexDirection: 'row', marginTop: Spacing.two },
  removeLink: { color: '#D14343' },
  reportForm: { gap: Spacing.two, marginTop: Spacing.two },
});
