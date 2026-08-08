import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { createUserProfile } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

export async function signUp(params: {
  email: string;
  password: string;
  pseudo: string;
  ville: string;
  ageConfirmed: boolean;
}) {
  if (!auth) throw new Error('Firebase non configuré.');
  const credentials = await createUserWithEmailAndPassword(auth, params.email, params.password);
  await createUserProfile(credentials.user.uid, {
    pseudo: params.pseudo,
    ville: params.ville,
    contactEmail: params.email,
    ageConfirmed: params.ageConfirmed,
  });
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase non configuré.');
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  if (!auth) return;
  await firebaseSignOut(auth);
}
