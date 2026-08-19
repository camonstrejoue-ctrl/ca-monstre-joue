import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { auth, db } from '@/lib/firebase';

export interface ProfileVisibility {
  prenom: boolean;
  age: boolean;
  categoriesPreferees: boolean;
}

export const DEFAULT_VISIBILITY: ProfileVisibility = {
  prenom: false,
  age: false,
  categoriesPreferees: false,
};

export interface UserProfile {
  pseudo: string;
  ville: string;
  villeLower: string;
  contactEmail: string;
  ageConfirmed: boolean;
  createdAt: unknown;
  // Champs optionnels, visibles sur le profil public seulement si autorisé via `visibility`.
  prenom?: string;
  age?: number;
  categoriesPreferees?: string[];
  visibility?: ProfileVisibility;
  // Chapeau porté par l'avatar monstre, toujours visible publiquement (pas
  // une donnée personnelle) : 'haut-de-forme' | 'casquette' | 'melon' | 'bob'
  // | 'paille' | 'sombrero', ou absent pour aucun accessoire.
  avatarAccessory?: string;
  // Visibilité dans l'annuaire "Joueurs" : décochée par défaut, ne peut être
  // activée que si `age` est renseigné à 18 ans ou plus (voir MIN_CONTACT_AGE
  // dans lib/moderation.ts). Contacter un autre joueur exige que SON PROPRE
  // profil soit lui aussi visibleToPlayers.
  visibleToPlayers?: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  initializing: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(Boolean(auth));

  async function loadProfile(uid: string) {
    if (!db) return;
    const snap = await getDoc(doc(db, 'users', uid));
    setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
  }

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        await loadProfile(nextUser.uid);
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        initializing,
        refreshProfile: async () => {
          if (user) await loadProfile(user.uid);
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function createUserProfile(
  uid: string,
  data: { pseudo: string; ville: string; contactEmail: string; ageConfirmed: boolean }
) {
  if (!db) throw new Error('Firebase non configuré.');
  await setDoc(doc(db, 'users', uid), {
    ...data,
    villeLower: data.ville.trim().toLowerCase(),
    visibility: DEFAULT_VISIBILITY,
    visibleToPlayers: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: {
    prenom?: string;
    age?: number | null;
    categoriesPreferees?: string[];
    visibility?: ProfileVisibility;
    avatarAccessory?: string | null;
    visibleToPlayers?: boolean;
  }
) {
  if (!db) throw new Error('Firebase non configuré.');
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}
