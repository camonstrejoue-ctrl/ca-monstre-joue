import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AVATAR_ACCESSORIES, AvatarMonster } from '@/components/avatar-monster';
import { CheckboxRow } from '@/components/checkbox-row';
import { FormField } from '@/components/form-field';
import { NavTile } from '@/components/nav-tile';
import { PrimaryButton } from '@/components/primary-button';
import { SoftCard } from '@/components/soft-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { deleteAccount, signIn, signOut, signUp } from '@/lib/auth';
import { updateUserProfile, useAuth } from '@/lib/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase';
import { parseBirthdateInput, MIN_CONTACT_AGE } from '@/lib/moderation';
import { submitSuggestion } from '@/lib/suggestions';

function AuthForms() {
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [ville, setVille] = useState('');
  const [birthdateInput, setBirthdateInput] = useState('');
  const [cguAccepted, setCguAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Renseigne ton e-mail et ton mot de passe.');
      return;
    }
    if (mode === 'inscription' && (!pseudo || !ville)) {
      setError('Renseigne un pseudo et une ville.');
      return;
    }
    let birthdate: Date | null = null;
    if (mode === 'inscription') {
      birthdate = parseBirthdateInput(birthdateInput);
      if (!birthdate) {
        setError('Indique ta date de naissance au format JJ/MM/AAAA.');
        return;
      }
    }
    if (mode === 'inscription' && !cguAccepted) {
      setError('Tu dois accepter les CGU et la politique de confidentialité pour créer un compte.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'inscription') {
        await signUp({ email, password, pseudo, ville, birthdate: birthdate! });
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
    <View style={styles.form}>
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
          <FormField
            label={`Date de naissance (JJ/MM/AAAA) — sert uniquement à débloquer "Trouver des joueurs" à partir de ${MIN_CONTACT_AGE} ans`}
            value={birthdateInput}
            onChangeText={setBirthdateInput}
            placeholder="ex: 14/03/1995"
            keyboardType="numbers-and-punctuation"
          />

          <ThemedText type="small" themeColor="textSecondary">
            En créant un compte, tu confirmes avoir lu et accepté :
          </ThemedText>
          <Link href="/cgu" asChild>
            <Pressable>
              <ThemedText type="link">Conditions d’utilisation</ThemedText>
            </Pressable>
          </Link>
          <Link href="/politique-confidentialite" asChild>
            <Pressable>
              <ThemedText type="link">Politique de confidentialité</ThemedText>
            </Pressable>
          </Link>
          <CheckboxRow
            label="J’ai lu et j’accepte les CGU et la politique de confidentialité"
            checked={cguAccepted}
            onToggle={() => setCguAccepted((value) => !value)}
          />
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
    </View>
  );
}

function SuggestionForm() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitSuggestion(user.uid, profile?.pseudo ?? '', text.trim());
      setSent(true);
      setText('');
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      {sent ? (
        <ThemedText type="small" themeColor="textSecondary">
          Merci, ta suggestion a bien été envoyée !
        </ThemedText>
      ) : open ? (
        <>
          <FormField
            label="Ta suggestion"
            value={text}
            onChangeText={setText}
            multiline
            placeholder="Ex : ajouter un mode sombre, permettre de filtrer la ludothèque par catégorie..."
          />
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
          <PrimaryButton
            label="Envoyer la suggestion"
            onPress={handleSubmit}
            disabled={submitting || !text.trim()}
          />
        </>
      ) : (
        <Pressable onPress={() => setOpen(true)}>
          <ThemedView type="backgroundElement" style={styles.suggestionButton}>
            <ThemedText type="smallBold">💡 Proposer une nouvelle fonctionnalité</ThemedText>
          </ThemedView>
        </Pressable>
      )}
    </View>
  );
}

function DeleteAccountSection() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === 'auth/requires-recent-login'
          ? 'Pour ta sécurité, déconnecte-toi puis reconnecte-toi avant de supprimer ton compte.'
          : (err as Error).message
      );
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Supprimer ton compte ?',
      'Ton profil et ta ludothèque seront définitivement supprimés. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
      ]
    );
  }

  return (
    <View style={styles.deleteSection}>
      <Pressable onPress={confirmDelete} disabled={deleting}>
        <ThemedText type="small" style={styles.deleteLink}>
          {deleting ? 'Suppression...' : 'Supprimer mon compte'}
        </ThemedText>
      </Pressable>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

function ProfileView() {
  const { user, profile, refreshProfile } = useAuth();
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  async function handleSelectAvatar(accessory: string | null) {
    if (!user || avatarSaving) return;
    setAvatarSaving(true);
    try {
      await updateUserProfile(user.uid, { avatarAccessory: accessory });
      await refreshProfile();
    } finally {
      setAvatarSaving(false);
    }
  }

  const currentAccessory = profile?.avatarAccessory ?? null;

  return (
    <View style={styles.form}>
      {/* Fusionné avec l'ancien bloc "Mon avatar" (qui suivait juste en
          dessous et affichait un second avatar, redondant avec celui-ci) :
          un seul avatar, celui-ci, à la fois identité et sélecteur de
          chapeau. */}
      <SoftCard backgroundColor={Brand.ice} radius={Radius.lg}>
        <View style={styles.profileHeader}>
          <Pressable onPress={() => setAvatarOpen((v) => !v)} style={styles.avatarPreviewWrap}>
            <AvatarMonster accessory={currentAccessory} size={96} ring={Brand.white} />
            <ThemedText type="small" style={styles.profileHeaderMeta}>
              {avatarOpen ? 'Touche l’avatar pour fermer' : 'Touche l’avatar pour changer de chapeau'}
            </ThemedText>
          </Pressable>

          <ThemedText type="subtitle" style={styles.profileHeaderName}>
            {profile?.pseudo ?? 'Mon profil'}
          </ThemedText>
          <ThemedText type="small" style={styles.profileHeaderMeta}>
            {user?.email}
          </ThemedText>
          {profile?.ville ? (
            <ThemedText type="small" style={styles.profileHeaderMeta}>
              {profile.ville}
            </ThemedText>
          ) : null}

          {avatarOpen ? (
            <View style={styles.chipRow}>
              <Pressable onPress={() => handleSelectAvatar(null)} disabled={avatarSaving}>
                <ThemedView
                  type="backgroundElement"
                  style={[styles.accessoryOption, currentAccessory === null && styles.accessoryOptionSelected]}>
                  <AvatarMonster accessory={null} size={40} />
                  <ThemedText type={currentAccessory === null ? 'smallBold' : 'small'}>Aucun</ThemedText>
                </ThemedView>
              </Pressable>
              {AVATAR_ACCESSORIES.map((acc) => (
                <Pressable key={acc.value} onPress={() => handleSelectAvatar(acc.value)} disabled={avatarSaving}>
                  <ThemedView
                    type="backgroundElement"
                    style={[
                      styles.accessoryOption,
                      currentAccessory === acc.value && styles.accessoryOptionSelected,
                    ]}>
                    <AvatarMonster accessory={acc.value} size={40} />
                    <ThemedText type={currentAccessory === acc.value ? 'smallBold' : 'small'}>
                      {acc.label}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </SoftCard>

      <View style={styles.navSection}>
        <NavTile
          href="/profil/editer"
          icon="person"
          eyebrow="Réglages"
          label="Éditer mon profil"
          description="Prénom, date de naissance, description, catégories"
          color="ice"
        />
        <NavTile
          href="/profil/confidentialite"
          icon="people"
          eyebrow="Réglages"
          label="Trouver des joueurs"
          description="Visibilité dans l’annuaire, 18 ans et plus"
          color="frost"
        />
      </View>

      <SuggestionForm />

      <Link href="/cgu" asChild>
        <Pressable>
          <ThemedText type="link">Conditions d’utilisation</ThemedText>
        </Pressable>
      </Link>
      <Link href="/politique-confidentialite" asChild>
        <Pressable>
          <ThemedText type="link">Politique de confidentialité</ThemedText>
        </Pressable>
      </Link>

      <PrimaryButton label="Se déconnecter" onPress={() => signOut()} />

      <DeleteAccountSection />
    </View>
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
  error: { color: '#D14343' },
  switchMode: { textAlign: 'center', marginTop: Spacing.two },
  deleteSection: { marginTop: Spacing.four, alignItems: 'center', gap: Spacing.two },
  deleteLink: { color: '#D14343', textDecorationLine: 'underline' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'center' },
  profileHeader: {
    alignItems: 'center',
    gap: 4,
    padding: Spacing.four,
  },
  profileHeaderName: { color: Brand.white, marginTop: Spacing.two, textAlign: 'center' },
  profileHeaderMeta: { color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  avatarPreviewWrap: { alignItems: 'center', gap: 4 },
  accessoryOption: {
    alignItems: 'center',
    gap: 4,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 84,
  },
  accessoryOptionSelected: { borderColor: Brand.ice },
  suggestionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  navSection: { gap: Spacing.two },
});
