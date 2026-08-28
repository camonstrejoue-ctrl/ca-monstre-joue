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

import { type BggGame } from '@/lib/bgg';
import { db } from '@/lib/firebase';

/**
 * Liste de souhaits ("Liste au Père Noël") : des jeux qu'on ne possède pas
 * mais qu'on aimerait recevoir — même mécanique que la ludothèque (recherche
 * BGG, ajout, retrait), mais dans une sous-collection à part (`pereNoel`),
 * puisque ce sont des jeux qu'on NE possède PAS, contrairement à la
 * ludothèque. Publique dans les mêmes conditions que la ludothèque (voir
 * firestore.rules et lib/joueurs.ts).
 */
export interface PereNoelEntry {
  bggId: string;
  name: string;
  yearPublished?: number;
  thumbnail?: string;
  addedAt: Timestamp | null;
}

export function useListePereNoel(uid: string | undefined) {
  const [entries, setEntries] = useState<PereNoelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !db) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users', uid, 'pereNoel'), (snapshot) => {
      const valid = snapshot.docs
        .map((d) => d.data() as Partial<PereNoelEntry>)
        .filter((e): e is PereNoelEntry => Boolean(e.bggId && e.name));
      setEntries(valid);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { entries, loading };
}

export async function addGameToListePereNoel(uid: string, game: BggGame) {
  if (!db) throw new Error('Firebase non configuré.');
  await setDoc(doc(db, 'users', uid, 'pereNoel', game.bggId), {
    bggId: game.bggId,
    name: game.name,
    yearPublished: game.yearPublished ?? null,
    thumbnail: game.thumbnail ?? null,
    addedAt: serverTimestamp(),
  });
}

export async function removeGameFromListePereNoel(uid: string, bggId: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await deleteDoc(doc(db, 'users', uid, 'pereNoel', bggId));
}
