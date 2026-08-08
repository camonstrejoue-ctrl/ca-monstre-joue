import { getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebase-config';

export { isFirebaseConfigured };

let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// N'initialise Firebase que si un vrai projet est configuré (voir
// app/.env.example) : sinon `getAuth` lève une erreur immédiate (clé API
// invalide) et ferait planter toute l'app au démarrage.
if (isFirebaseConfigured) {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { auth, db, storage };
