import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarMonster } from '@/components/avatar-monster';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { updateUserProfile, useAuth } from '@/lib/auth-context';
import { listAllPlayers, searchPlayersByVille, type PlayerResult } from '@/lib/joueurs';
import { MIN_CONTACT_AGE } from '@/lib/moderation';

function SignedOutPrompt() {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Connecte-toi pour trouver des joueurs
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Cherche des joueurs dans ta ville pour organiser une partie ou échanger des jeux.
      </ThemedText>
      <Link href="/profil" asChild>
        <Pressable>
          <ThemedView type="backgroundSelected" style={styles.loginButton}>
            <ThemedText type="smallBold">Aller à Profil</ThemedText>
          </ThemedView>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

function AgeGate({ uid, onConfirmed }: { uid: string; onConfirmed: () => void }) {
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    const parsed = Number(age.trim());
    if (!age.trim() || !Number.isFinite(parsed) || parsed < 0 || parsed > 120) {
      setError('Indique un âge valide.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile(uid, { age: parsed });
      if (parsed >= MIN_CONTACT_AGE) {
        onConfirmed();
      } else {
        setError('Cette fonctionnalité est réservée aux 18 ans et plus.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Réservé aux 18 ans et plus
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Pour mettre en relation des joueurs en toute sécurité, indique ton âge pour continuer.
      </ThemedText>
      <FormField label="Ton âge" value={age} onChangeText={setAge} keyboardType="number-pad" />
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <Pressable onPress={handleConfirm} disabled={saving}>
        <ThemedView type="backgroundSelected" style={styles.loginButton}>
          <ThemedText type="smallBold">Confirmer</ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

export default function JoueursScreen() {
  const { user, profile, initializing, refreshProfile } = useAuth();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ville, setVille] = useState('');
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    if (!user) return;
    setSearching(true);
    setError(null);
    try {
      setResults(await listAllPlayers(user.uid));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (user) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  async function handleSearch() {
    if (!user) return;
    if (!ville.trim()) {
      await loadAll();
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const players = await searchPlayersByVille(ville, user.uid);
      setResults(players);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  if (initializing) return null;
  if (!user) return <SignedOutPrompt />;

  const hasConfirmedAge = ageConfirmed || (profile?.age ?? 0) >= MIN_CONTACT_AGE;
  if (!hasConfirmedAge) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AgeGate
          uid={user.uid}
          onConfirmed={() => {
            setAgeConfirmed(true);
            refreshProfile();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.pageTitle}>
              Joueurs
            </ThemedText>
            <FormField
              label="Ville (laisse vide pour voir tout le monde)"
              value={ville}
              onChangeText={setVille}
              placeholder="ex: Genève"
              onSubmitEditing={handleSearch}
            />
            <Pressable onPress={handleSearch} disabled={searching}>
              <ThemedView type="backgroundSelected" style={styles.searchButton}>
                <ThemedText type="smallBold">
                  {ville.trim() ? 'Rechercher' : 'Voir tous les joueurs'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
            {!searching && results.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                {ville.trim() ? 'Aucun joueur trouvé dans cette ville pour l’instant.' : 'Aucun autre joueur pour l’instant.'}
              </ThemedText>
            ) : null}
          </ThemedView>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/joueur/[uid]', params: { uid: item.uid } }} asChild>
            <Pressable style={styles.playerCard}>
              <AvatarMonster accessory={item.avatarAccessory} size={48} />
              <ThemedView style={styles.playerInfo}>
                <ThemedText type="smallBold">{item.pseudo}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.ville}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.four, gap: Spacing.three },
  header: { gap: Spacing.three, marginBottom: Spacing.three },
  pageTitle: { fontSize: 32 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centerText: { textAlign: 'center' },
  loginButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  searchButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  error: { color: '#D14343' },
  pressed: { opacity: 0.7 },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  playerInfo: { flex: 1, gap: 2 },
});
