import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export async function submitSuggestion(userId: string, pseudo: string, text: string) {
  if (!db) throw new Error('Firebase non configuré.');
  const ref = doc(collection(db, 'suggestions'));
  await setDoc(ref, {
    userId,
    pseudo,
    text,
    createdAt: serverTimestamp(),
  });
}
