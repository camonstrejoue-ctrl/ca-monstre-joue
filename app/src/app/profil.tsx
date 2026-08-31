import { Ionicons } from '@expo/vector-icons';
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
import { deleteAccount, resetPassword, signIn, signOut, signUp } from '@/lib/auth';
import { updateUserProfile, useAuth } from '@/lib/auth-context';
import { ADMIN_UID } from '@/lib/events';
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
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleResetPassword() {
    setError(null);
    setResetSent(false);
    if (!email) {
      setError('Renseigne ton e-mail pour recevoir le lien de réinitialisation.');
      return;
    }
    setResetSending(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError((err as Error).message.replace(/^Firebase:\s*/, ''));
    } finally {
      setResetSending(false);
    }
  }

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

      {mode === 'connexion' ? (
        resetSent ? (
          <ThemedText type="small" themeColor="textSecondary">
            E-mail envoyé (si ce compte existe) — vérifie ta boîte de réception (et les spams).
          </ThemedText>
        ) : (
          <Pressable onPress={handleResetPassword} disabled={resetSending}>
            <ThemedText type="link" style={styles.switchMode}>
              {resetSending ? 'Envoi...' : 'Mot de passe oublié ?'}
            </ThemedText>
          </Pressable>
        )
      ) : null}

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
      {/* Même gabarit que les NavTile en dessous (badge qui déborde en haut
          à gauche, même hauteur de carte) plutôt qu'un bloc à part plus
          grand — l'avatar tient lieu d'icône, avec un petit crayon dessus
          pour signaler qu'on peut taper dessus pour le modifier (remplace
          le texte "Touche l'avatar..." retiré). Seul l'avatar est
          cliquable : la carte elle-même n'est qu'un affichage, elle ne
          mène nulle part. */}
      <View style={styles.profileTileWrap}>
        <SoftCard backgroundColor={Brand.ice} radius={Radius.lg}>
          <View style={styles.iconCardRow}>
            <View style={styles.iconSpacer} />
            <View style={styles.iconText}>
              <ThemedText type="smallBold" style={[styles.eyebrow, styles.profileEyebrow]}>
                Mon compte
              </ThemedText>
              <ThemedText type="subtitle" style={styles.profileTitle}>
                {profile?.pseudo ?? 'Mon profil'}
              </ThemedText>
              <ThemedText type="small" style={styles.profileMeta}>
                {user?.email}
              </ThemedText>
            </View>
          </View>
        </SoftCard>
        <Pressable
          onPress={() => setAvatarOpen((v) => !v)}
          style={styles.profileBadge}
          accessibilityLabel="Modifier mon avatar"
          accessibilityRole="button">
          <SoftCard backgroundColor={Brand.white} radius={999} style={styles.profileBadgeCard}>
            <AvatarMonster accessory={currentAccessory} size={62} />
          </SoftCard>
          <View style={styles.profilePencilBadge}>
            <Ionicons name="pencil" size={12} color={Brand.white} />
          </View>
        </Pressable>
      </View>

      {avatarOpen ? (
        <SoftCard backgroundColor={Brand.white} radius={Radius.lg} style={styles.avatarPickerCard}>
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
        </SoftCard>
      ) : null}

      <View style={styles.navSection}>
        <NavTile
          href="/profil/editer"
          icon="person"
          eyebrow="Réglages"
          label="Éditer mon profil"
          color="ice"
        />
        <NavTile
          href="/profil/confidentialite"
          icon="people"
          eyebrow="Réglages"
          label="Trouver des joueurs"
          color="frost"
        />
        {user?.uid === ADMIN_UID ? (
          <NavTile
            href="/admin/evenements"
            icon="shield-checkmark"
            eyebrow="Admin"
            label="Modération — Agenda"
            color="ice"
          />
        ) : null}
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  avatarPickerCard: { padding: Spacing.four },
  // Repris tel quel du gabarit NavTile (icon variant) pour que ce bloc
  // fasse exactement la même taille que "Éditer mon profil" /
  // "Trouver des joueurs" juste en dessous.
  profileTileWrap: { position: 'relative', marginTop: 22 },
  iconCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    minHeight: 108,
  },
  iconSpacer: { width: 40 },
  iconText: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  profileEyebrow: { color: 'rgba(255,255,255,0.85)' },
  profileTitle: { fontSize: 19, lineHeight: 23, color: Brand.white },
  profileMeta: { color: 'rgba(255,255,255,0.85)' },
  profileBadge: {
    position: 'absolute',
    top: -20,
    left: 24,
    width: 62,
    height: 62,
  },
  profileBadgeCard: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  profilePencilBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.iceDark,
    borderWidth: 2,
    borderColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
