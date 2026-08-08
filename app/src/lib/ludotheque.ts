import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';

export function useLudotheque(uid: string | undefined) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !db) {
      setSlugs(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users', uid, 'ludotheque'), (snapshot) => {
      setSlugs(new Set(snapshot.docs.map((d) => d.id)));
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { slugs, loading };
}

export async function addGameToLudotheque(uid: string, gameSlug: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await setDoc(doc(db, 'users', uid, 'ludotheque', gameSlug), {
    gameSlug,
    addedAt: serverTimestamp(),
  });
}

export async function removeGameFromLudotheque(uid: string, gameSlug: string) {
  if (!db) throw new Error('Firebase non configuré.');
  await deleteDoc(doc(db, 'users', uid, 'ludotheque', gameSlug));
}
