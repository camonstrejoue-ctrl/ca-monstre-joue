import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getBggGameDetails, type BggGame } from '@/lib/bgg';
import { db } from '@/lib/firebase';

export interface LudothequeEntry {
  bggId: string;
  name: string;
  yearPublished?: number;
  thumbnail?: string;
  categories?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  addedAt: Timestamp | null;
}

export function useLudotheque(uid: string | undefined) {
  const [entries, setEntries] = useState<LudothequeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !db) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users', uid, 'ludotheque'), (snapshot) => {
      // Ignore les entrées d'un ancien format (avant le passage à la
      // recherche BGG) qui n'auraient pas `bggId`/`name`.
      const valid = snapshot.docs
        .map((d) => d.data() as Partial<LudothequeEntry>)
        .filter((e): e is LudothequeEntry => Boolean(e.bggId && e.name));
      setEntries(valid);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { entries, loading };
}

export async function addGameToLudotheque(uid: string, game: BggGame) {
  if (!db) throw new Error('Firebase non configuré.');
  await setDoc(doc(db, 'users', uid, 'ludotheque', game.bggId), {
    bggId: game.bggId,
    name: game.name,
    yearPublished: game.yearPublished ?? null,
    thumbnail: game.thumbnail ?? null,
    categories: game.categories ?? [],
    minPlayers: game.minPlayers ?? null,
    maxPlayers: game.maxPlayers ?? null,
    addedAt: serverTimestamp(),
  });
}

export async function removeGameFromLudotheque(uid: string, bggId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await deleteDoc(doc(db, 'users', uid, 'ludotheque', bggId));
}

/**
 * Complète en tâche de fond les entrées ajoutées avant qu'on récupère
 * catégories/nombre de joueurs depuis BGG (sinon elles restent invisibles
 * dans les filtres, qui ignorent les entrées sans cette donnée).
 */
export async function backfillEntryDetails(uid: string, entry: LudothequeEntry) {
  if (!db) return;
  const details = await getBggGameDetails(entry.bggId);
  if (!details) return;
  await setDoc(
    doc(db, 'users', uid, 'ludotheque', entry.bggId),
    {
      categories: details.categories ?? [],
      minPlayers: details.minPlayers ?? null,
      maxPlayers: details.maxPlayers ?? null,
      thumbnail: entry.thumbnail ?? details.thumbnail ?? null,
    },
    { merge: true }
  );
}
