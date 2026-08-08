import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  pseudo: string;
  ville: string;
  villeLower: string;
  contactEmail: string;
  ageConfirmed: boolean;
  createdAt: unknown;
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
    createdAt: serverTimestamp(),
  });
}
