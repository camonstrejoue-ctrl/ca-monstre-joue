import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

// Uid du compte "administrateur" — voir firestore.rules (isAdmin). Utilisé
// côté app uniquement pour l'affichage (afficher/cacher l'écran de
// modération) : la vraie sécurité est appliquée par les règles Firestore,
// pas par ce contrôle client.
export const ADMIN_UID = 'Y2pQOvv87aPZrazoU1PPlNbaLdo1';

export type EventStatus = 'pending' | 'published';

export interface CommunityEvent {
  id: string;
  title: string;
  location: string;
  date: string; // 'YYYY-MM-DD' (début)
  time: string; // 'HH:MM' (début)
  endDate?: string; // 'YYYY-MM-DD' — optionnel, pour un événement sur plusieurs jours
  endTime?: string; // 'HH:MM'
  price: string; // texte libre, ex: "Gratuit", "5 CHF"
  contact: string; // e-mail ou téléphone
  website?: string; // adresse d'un site web (affiché comme "Informations", cliquable)
  description?: string;
  poster?: string; // data URI base64, ou URL (événements publiés depuis le site)
  status: EventStatus;
  createdBy: string;
  createdAt: unknown;
}

// Soumission du formulaire "Proposer un événement" du site statique (voir
// js/firebase-forms.js) — collection à part, distincte de `events`, tant
// qu'un admin ne l'a pas publiée (voir publishEventSubmission ci-dessous).
export interface EventSubmission {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  price: string;
  registrationLink?: string;
  contact: string;
  imageUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: unknown;
}

// Supprime pour de bon (pas juste "cache") les événements dont la date de
// fin est passée. N'importe quel client connecté peut le faire (voir
// firestore.rules : la suppression d'un événement expiré n'est pas réservée
// à son auteur) — c'est un simple ménage de données publiques déjà
// invisibles, sans rien de sensible. Best-effort : une erreur (ex. hors
// ligne) est ignorée silencieusement, le prochain client qui ouvre l'Agenda
// réessaiera.
async function cleanupExpiredEvents(events: CommunityEvent[]) {
  if (!db) return;
  const today = new Date().toISOString().slice(0, 10);
  const expired = events.filter((e) => (e.endDate || e.date) < today);
  await Promise.allSettled(expired.map((e) => deleteDoc(doc(db!, 'events', e.id))));
}

// Liste publique : uniquement les événements "published" (voir
// firestore.rules — un "pending" n'est de toute façon lisible que par son
// auteur ou l'admin, cette requête ne les recevrait pas).
export function useUpcomingEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'events'), where('status', '==', 'published'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const today = new Date().toISOString().slice(0, 10);
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityEvent);
        // Reste affiché tant que l'événement n'est pas terminé (utile pour
        // les événements sur plusieurs jours, ex: un festival).
        const upcoming = all.filter((e) => (e.endDate || e.date) >= today);
        setEvents(upcoming);
        setLoading(false);
        cleanupExpiredEvents(all).catch(() => {});
      },
      // Cette requête (status == 'published' + orderBy('date')) demande un
      // index composite Firestore — sans lui la requête échoue silencieusement
      // (failed-precondition) tant que l'index n'est pas créé côté console. On
      // évite au moins que l'écran reste bloqué en chargement indéfiniment.
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  return { events, loading };
}

// Firestore refuse une valeur de champ explicitement `undefined` (contrairement
// à une clé absente) et fait échouer tout le setDoc — utilisé pour ne garder
// que les champs optionnels réellement renseignés (endDate, endTime, poster...).
function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export async function addEvent(
  uid: string,
  data: {
    title: string;
    location: string;
    date: string;
    time: string;
    endDate?: string;
    endTime?: string;
    price: string;
    contact: string;
    website?: string;
    description?: string;
    poster?: string;
  }
) {
  if (!db) throw new Error('Firebase non configuré.');
  const ref = doc(collection(db, 'events'));
  await setDoc(ref, {
    ...stripUndefined(data),
    createdBy: uid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export async function removeEvent(eventId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await deleteDoc(doc(db, 'events', eventId));
}

export async function reportEvent(reporterUid: string, eventId: string, reason: string) {
  if (!db) throw new Error('Firebase non configuré.');
  const ref = doc(collection(db, 'reports'));
  await setDoc(ref, {
    reporterUid,
    reportedType: 'event',
    reportedId: eventId,
    reason,
    createdAt: serverTimestamp(),
  });
}

// ---------- Modération (admin uniquement — voir firestore.rules) ----------

// Événements créés depuis l'app, encore en attente de publication.
export function usePendingEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'events'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CommunityEvent));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  return { events, loading };
}

// Soumissions du site (formulaire "Proposer un événement"), en attente.
export function usePendingEventSubmissions() {
  const [submissions, setSubmissions] = useState<EventSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'eventSubmissions'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSubmissions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as EventSubmission));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  return { submissions, loading };
}

export async function publishEvent(eventId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await updateDoc(doc(db, 'events', eventId), { status: 'published' });
}

export async function rejectEvent(eventId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await deleteDoc(doc(db, 'events', eventId));
}

// Publie une soumission du site : crée un événement "published" dans
// `events` (createdBy = l'admin qui publie, puisque la soumission n'a pas
// de compte app associé) à partir des champs de la soumission, puis marque
// la soumission "approved" pour ne pas la retraiter. `registrationLink` est
// repris tel quel dans `website` (affiché comme "Informations", cliquable).
export async function publishEventSubmission(adminUid: string, submission: EventSubmission) {
  if (!db) throw new Error('Firebase non configuré.');
  const ref = doc(collection(db, 'events'));
  await setDoc(ref, {
    ...stripUndefined({
      title: submission.title,
      location: submission.location,
      date: submission.date,
      time: submission.time,
      price: submission.price,
      contact: submission.contact,
      website: submission.registrationLink ?? undefined,
      description: submission.description,
      poster: submission.imageUrl ?? undefined,
    }),
    createdBy: adminUid,
    status: 'published',
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'eventSubmissions', submission.id), { status: 'approved' });
}

export async function rejectEventSubmission(submissionId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await updateDoc(doc(db, 'eventSubmissions', submissionId), { status: 'rejected' });
}
