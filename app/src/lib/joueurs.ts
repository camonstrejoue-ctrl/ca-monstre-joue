import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

import type { UserProfile } from '@/lib/auth-context';
import { db } from '@/lib/firebase';

export interface PlayerResult extends UserProfile {
  uid: string;
}

export async function searchPlayersByVille(
  ville: string,
  excludeUid: string
): Promise<PlayerResult[]> {
  if (!db) throw new Error('Firebase non configuré.');
  const villeLower = ville.trim().toLowerCase();
  const q = query(
    collection(db, 'users'),
    where('villeLower', '==', villeLower),
    where('visibleToPlayers', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...(d.data() as UserProfile) }))
    .filter((p) => p.uid !== excludeUid);
}

export async function listAllPlayers(excludeUid: string): Promise<PlayerResult[]> {
  if (!db) throw new Error('Firebase non configuré.');
  const q = query(collection(db, 'users'), where('visibleToPlayers', '==', true));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...(d.data() as UserProfile) }))
    .filter((p) => p.uid !== excludeUid)
    .sort((a, b) => a.pseudo.localeCompare(b.pseudo, 'fr'));
}

export async function getPlayer(uid: string): Promise<PlayerResult | null> {
  if (!db) throw new Error('Firebase non configuré.');
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { uid: snap.id, ...(snap.data() as UserProfile) } : null;
  } catch (err) {
    // Un lien direct vers un profil qui n'est plus (ou jamais été) rendu
    // visible par son propriétaire est refusé par les règles Firestore :
    // on le traite comme "introuvable" plutôt que de laisser l'écran
    // bloqué en chargement.
    if ((err as { code?: string }).code === 'permission-denied') return null;
    throw err;
  }
}

export async function getPlayerLudotheque(uid: string): Promise<string[]> {
  if (!db) throw new Error('Firebase non configuré.');
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'ludotheque'));
    return snap.docs.map((d) => d.id);
  } catch (err) {
    if ((err as { code?: string }).code === 'permission-denied') return [];
    throw err;
  }
}

export async function reportPlayer(reporterUid: string, reportedUid: string, reason: string) {
  if (!db) throw new Error('Firebase non configuré.');
  const reportRef = doc(collection(db, 'reports'));
  await setDoc(reportRef, {
    reporterUid,
    reportedUid,
    reason,
    createdAt: serverTimestamp(),
  });
}
