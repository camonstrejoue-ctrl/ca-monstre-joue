import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { createUserProfile } from '@/lib/auth-context';
import { auth, db } from '@/lib/firebase';

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

/**
 * Supprime le compte et les données personnelles de l'utilisateur (profil +
 * ludothèque). Les contenus publics qu'il a créés (événements, signalements,
 * suggestions) ne sont pas effacés en cascade — ils restent, mais ne sont
 * plus rattachés à un compte existant.
 *
 * Peut échouer avec "auth/requires-recent-login" si la connexion date de
 * trop longtemps : dans ce cas, l'appelant doit inviter l'utilisateur à se
 * reconnecter avant de réessayer.
 */
export async function deleteAccount() {
  if (!auth || !db) throw new Error('Firebase non configuré.');
  const user = auth.currentUser;
  if (!user) throw new Error('Aucun utilisateur connecté.');

  const ludothequeSnap = await getDocs(collection(db, 'users', user.uid, 'ludotheque'));
  await Promise.all(ludothequeSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'users', user.uid));
  await deleteUser(user);
}
