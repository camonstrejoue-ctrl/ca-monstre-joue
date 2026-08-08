import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { signIn, signOut, signUp } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase';

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <ThemedView
          type="backgroundSelected"
          style={[styles.primaryButton, (pressed || disabled) && styles.pressed]}>
          <ThemedText type="smallBold">{label}</ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

function AuthForms() {
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [ville, setVille] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Renseigne ton e-mail et ton mot de passe.');
      return;
    }
    if (mode === 'inscription' && (!pseudo || !ville || !ageConfirmed)) {
      setError('Renseigne un pseudo, une ville, et confirme que tu as 16 ans ou plus.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'inscription') {
        await signUp({ email, password, pseudo, ville, ageConfirmed });
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError((err as Error).message.replace(/^Firebase:\s*/, ''));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.form}>
      <ThemedText type="subtitle">
        {mode === 'connexion' ? 'Se connecter' : 'Créer un compte'}
      </ThemedText>

      {!isFirebaseConfigured ? (
        <ThemedText type="small" themeColor="textSecondary">
          Firebase n’est pas encore configuré (voir app/.env.example).
        </ThemedText>
      ) : null}

      <FormField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormField label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

      {mode === 'inscription' ? (
        <>
          <FormField label="Pseudo" value={pseudo} onChangeText={setPseudo} />
          <FormField label="Ville" value={ville} onChangeText={setVille} />
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAgeConfirmed((value) => !value)}>
            <ThemedView
              style={[styles.checkbox, ageConfirmed && styles.checkboxChecked]}
            />
            <ThemedText type="small" style={styles.checkboxLabel}>
              J’ai 16 ans ou plus
            </ThemedText>
          </Pressable>
        </>
      ) : null}

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <PrimaryButton
        label={mode === 'connexion' ? 'Se connecter' : "S'inscrire"}
        onPress={handleSubmit}
        disabled={submitting || !isFirebaseConfigured}
      />

      <Pressable onPress={() => setMode(mode === 'connexion' ? 'inscription' : 'connexion')}>
        <ThemedText type="link" style={styles.switchMode}>
          {mode === 'connexion' ? 'Pas de compte ? Inscris-toi' : 'Déjà un compte ? Connecte-toi'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function ProfileView() {
  const { user, profile } = useAuth();

  return (
    <ThemedView style={styles.form}>
      <ThemedText type="subtitle">{profile?.pseudo ?? 'Mon profil'}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {user?.email}
      </ThemedText>
      {profile?.ville ? <ThemedText type="small">Ville : {profile.ville}</ThemedText> : null}

      <Link href="/cgu" asChild>
        <Pressable>
          <ThemedText type="link">Conditions d’utilisation</ThemedText>
        </Pressable>
      </Link>

      <PrimaryButton label="Se déconnecter" onPress={() => signOut()} />
    </ThemedView>
  );
}

export default function ProfilScreen() {
  const { user, initializing } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.pageTitle}>
          Profil
        </ThemedText>
        {initializing ? null : user ? <ProfileView /> : <AuthForms />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
  pageTitle: { fontSize: 32, marginBottom: Spacing.two },
  form: { gap: Spacing.three },
  primaryButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  switchMode: { textAlign: 'center', marginTop: Spacing.two },
  error: { color: '#D14343' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#999' },
  checkboxChecked: { backgroundColor: '#3c87f7', borderColor: '#3c87f7' },
  checkboxLabel: { flex: 1 },
});
