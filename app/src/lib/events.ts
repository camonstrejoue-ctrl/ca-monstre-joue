import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

export interface CommunityEvent {
  id: string;
  title: string;
  location: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM'
  price: string; // texte libre, ex: "Gratuit", "5 CHF"
  contact: string; // e-mail, téléphone ou lien
  description?: string;
  createdBy: string;
  createdAt: unknown;
}

export function useUpcomingEvents() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().slice(0, 10);
      const upcoming = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }) as CommunityEvent)
        .filter((e) => e.date >= today);
      setEvents(upcoming);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { events, loading };
}

export async function addEvent(
  uid: string,
  data: {
    title: string;
    location: string;
    date: string;
    time: string;
    price: string;
    contact: string;
    description?: string;
  }
) {
  if (!db) throw new Error('Firebase non configuré.');
  const ref = doc(collection(db, 'events'));
  await setDoc(ref, { ...data, createdBy: uid, createdAt: serverTimestamp() });
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
