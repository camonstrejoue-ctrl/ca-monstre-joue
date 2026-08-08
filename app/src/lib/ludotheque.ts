import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { BggGame } from '@/lib/bgg';
import { db } from '@/lib/firebase';

export interface LudothequeEntry {
  bggId: string;
  name: string;
  yearPublished?: number;
  thumbnail?: string;
  addedAt: unknown;
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
    addedAt: serverTimestamp(),
  });
}

export async function removeGameFromLudotheque(uid: string, bggId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await deleteDoc(doc(db, 'users', uid, 'ludotheque', bggId));
}
