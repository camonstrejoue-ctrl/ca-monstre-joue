import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AVATAR_ACCESSORIES, AvatarMonster } from '@/components/avatar-monster';
import { CheckboxRow } from '@/components/checkbox-row';
import { FormField } from '@/components/form-field';
import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { signIn, signOut, signUp } from '@/lib/auth';
import { DEFAULT_VISIBILITY, updateUserProfile, useAuth, type ProfileVisibility } from '@/lib/auth-context';
import { useContent } from '@/lib/content';
import { isFirebaseConfigured } from '@/lib/firebase';
import { submitSuggestion } from '@/lib/suggestions';

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
        <StickerBox
          backgroundColor={disabled ? Brand.grayLight : Brand.coral}
          radius={Radius.md}
          style={pressed && styles.pressed}>
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {label}
          </ThemedText>
        </StickerBox>
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
          <CheckboxRow
            label="J’ai 16 ans ou plus"
            checked={ageConfirmed}
            onToggle={() => setAgeConfirmed((value) => !value)}
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
    </ThemedView>
  );
}

function AvatarPicker() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  async function handleSelect(accessory: string | null) {
    if (!user || saving) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { avatarAccessory: accessory });
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  }

  const current = profile?.avatarAccessory ?? null;

  return (
    <ThemedView style={styles.form}>
      <ThemedText type="subtitle">Mon avatar</ThemedText>
      <AvatarMonster accessory={current} size={96} style={styles.avatarPreview} />
      <ThemedView style={styles.chipRow}>
        <Pressable onPress={() => handleSelect(null)} disabled={saving}>
          <ThemedView
            type={current === null ? 'backgroundSelected' : 'backgroundElement'}
            style={styles.accessoryOption}>
            <AvatarMonster accessory={null} size={40} />
            <ThemedText type="small">Aucun</ThemedText>
          </ThemedView>
        </Pressable>
        {AVATAR_ACCESSORIES.map((acc) => (
          <Pressable key={acc.value} onPress={() => handleSelect(acc.value)} disabled={saving}>
            <ThemedView
              type={current === acc.value ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.accessoryOption}>
              <AvatarMonster accessory={acc.value} size={40} />
              <ThemedText type="small">{acc.label}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

function EditProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const { content } = useContent();

  const [prenom, setPrenom] = useState(profile?.prenom ?? '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [categories, setCategories] = useState<string[]>(profile?.categoriesPreferees ?? []);
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    profile?.visibility ?? DEFAULT_VISIBILITY
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPrenom(profile?.prenom ?? '');
    setAge(profile?.age ? String(profile.age) : '');
    setCategories(profile?.categoriesPreferees ?? []);
    setVisibility(profile?.visibility ?? DEFAULT_VISIBILITY);
  }, [profile]);

  function toggleCategory(slug: string) {
    setCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const parsedAge = age.trim() ? Number(age.trim()) : null;
    if (age.trim() && (!Number.isFinite(parsedAge) || parsedAge! < 0 || parsedAge! > 120)) {
      setError('Âge invalide.');
      setSaving(false);
      return;
    }
    try {
      await updateUserProfile(user.uid, {
        prenom: prenom.trim(),
        age: parsedAge,
        categoriesPreferees: categories,
        visibility,
      });
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={styles.form}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Informations supplémentaires (optionnel)
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Ces informations ne sont visibles par les autres joueurs que si tu coches la case
        correspondante.
      </ThemedText>

      <FormField label="Prénom" value={prenom} onChangeText={setPrenom} />
      <CheckboxRow
        label="Afficher mon prénom sur mon profil public"
        checked={visibility.prenom}
        onToggle={() => setVisibility((v) => ({ ...v, prenom: !v.prenom }))}
      />

      <FormField label="Âge" value={age} onChangeText={setAge} keyboardType="number-pad" />
      <CheckboxRow
        label="Afficher mon âge sur mon profil public"
        checked={visibility.age}
        onToggle={() => setVisibility((v) => ({ ...v, age: !v.age }))}
      />

      <ThemedText type="small" themeColor="textSecondary">
        Catégories de jeux appréciées
      </ThemedText>
      <ThemedView style={styles.chipRow}>
        {(content?.categories ?? []).map((cat) => {
          const selected = categories.includes(cat.slug);
          return (
            <Pressable key={cat.slug} onPress={() => toggleCategory(cat.slug)}>
              <ThemedView
                type={selected ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.chip}>
                <ThemedText type="small">{cat.name}</ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>
      <CheckboxRow
        label="Afficher mes catégories préférées sur mon profil public"
        checked={visibility.categoriesPreferees}
        onToggle={() =>
          setVisibility((v) => ({ ...v, categoriesPreferees: !v.categoriesPreferees }))
        }
      />

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      {saved ? (
        <ThemedText type="small" themeColor="textSecondary">
          Enregistré.
        </ThemedText>
      ) : null}

      <PrimaryButton label="Enregistrer" onPress={handleSave} disabled={saving} />
    </ThemedView>
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
    <ThemedView style={styles.form}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Une idée pour l’app ?
      </ThemedText>
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
    </ThemedView>
  );
}

function ProfileView() {
  const { user, profile } = useAuth();

  return (
    <ThemedView style={styles.form}>
      <ThemedView style={styles.profileHeader}>
        <AvatarMonster accessory={profile?.avatarAccessory} size={56} />
        <ThemedView style={styles.profileHeaderText}>
          <ThemedText type="subtitle">{profile?.pseudo ?? 'Mon profil'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user?.email}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      {profile?.ville ? <ThemedText type="small">Ville : {profile.ville}</ThemedText> : null}

      <Link href="/cgu" asChild>
        <Pressable>
          <ThemedText type="link">Conditions d’utilisation</ThemedText>
        </Pressable>
      </Link>

      <PrimaryButton label="Se déconnecter" onPress={() => signOut()} />

      <AvatarPicker />
      <EditProfileForm />
      <SuggestionForm />
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
  sectionTitle: { marginTop: Spacing.four },
  primaryButtonText: {
    color: Brand.white,
    textAlign: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  pressed: { opacity: 0.7 },
  switchMode: { textAlign: 'center', marginTop: Spacing.two },
  error: { color: '#D14343' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  profileHeaderText: { flex: 1, gap: 2 },
  avatarPreview: { alignSelf: 'center' },
  accessoryOption: {
    alignItems: 'center',
    gap: 4,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    width: 84,
  },
  suggestionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
