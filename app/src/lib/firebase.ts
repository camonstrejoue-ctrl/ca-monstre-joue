import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth, type Auth } from 'firebase/auth';
// @ts-expect-error -- exported by firebase/auth's React Native build (resolved by
// Metro via the "react-native" package export condition on native platforms);
// plain `tsc` resolves the browser build's types instead and doesn't see it.
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebase-config';

export { isFirebaseConfigured };

let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// N'initialise Firebase que si un vrai projet est configuré (voir
// app/.env.example) : sinon `initializeAuth` lève une erreur immédiate
// (clé API invalide) et ferait planter toute l'app au démarrage.
if (isFirebaseConfigured) {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  db = getFirestore(app);
  storage = getStorage(app);
}

export { auth, db, storage };
