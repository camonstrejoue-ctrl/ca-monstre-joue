import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckboxRow } from '@/components/checkbox-row';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { SoftCard } from '@/components/soft-card';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { DEFAULT_VISIBILITY, updateUserProfile, useAuth, type ProfileVisibility } from '@/lib/auth-context';
import { useContent } from '@/lib/content';
import { computeAge, formatBirthdateInput, parseBirthdateInput } from '@/lib/moderation';

/**
 * Chaque section a son propre état, sa propre sauvegarde et son propre
 * message "Enregistré." juste en dessous du bouton concerné — plutôt qu'un
 * unique bouton "Enregistrer" tout en bas pour tout le formulaire (avant,
 * cocher juste une case ici demandait de scroller jusqu'en bas pour que ça
 * soit vraiment pris en compte).
 */
function Section({
  title,
  children,
  onSave,
  saving,
  saved,
  error,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <SoftCard backgroundColor={Brand.white} radius={Radius.lg}>
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title}
        </ThemedText>
        {children}
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <PrimaryButton
          label={saving ? 'Enregistrement...' : 'Enregistrer'}
          onPress={onSave}
          disabled={saving}
        />
        {saved ? (
          <ThemedText type="small" themeColor="textSecondary">
            Enregistré.
          </ThemedText>
        ) : null}
      </View>
    </SoftCard>
  );
}

function PrenomSection() {
  const { user, profile, refreshProfile } = useAuth();
  const [prenom, setPrenom] = useState(profile?.prenom ?? '');
  const [visible, setVisible] = useState(profile?.visibility?.prenom ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrenom(profile?.prenom ?? '');
    setVisible(profile?.visibility?.prenom ?? false);
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        prenom: prenom.trim(),
        visibility: { ...(profile?.visibility ?? DEFAULT_VISIBILITY), prenom: visible },
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Prénom" onSave={handleSave} saving={saving} saved={saved} error={null}>
      <FormField label="Prénom" value={prenom} onChangeText={setPrenom} />
      <CheckboxRow
        label="Afficher mon prénom sur mon profil public"
        checked={visible}
        onToggle={() => setVisible((v) => !v)}
      />
    </Section>
  );
}

function BirthdateSection() {
  const { user, profile, refreshProfile } = useAuth();
  const [input, setInput] = useState(
    profile?.birthdate ? formatBirthdateInput(profile.birthdate.toDate()) : ''
  );
  const [visible, setVisible] = useState(profile?.visibility?.age ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInput(profile?.birthdate ? formatBirthdateInput(profile.birthdate.toDate()) : '');
    setVisible(profile?.visibility?.age ?? false);
  }, [profile]);

  const parsed = input.trim() ? parseBirthdateInput(input) : null;
  const displayedAge = computeAge(parsed);

  async function handleSave() {
    if (!user) return;
    setError(null);
    if (input.trim() && !parsed) {
      setError('Date de naissance invalide (format JJ/MM/AAAA).');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        birthdate: parsed ?? undefined,
        visibility: { ...(profile?.visibility ?? DEFAULT_VISIBILITY), age: visible },
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Date de naissance" onSave={handleSave} saving={saving} saved={saved} error={error}>
      <FormField
        label="Date de naissance (JJ/MM/AAAA)"
        value={input}
        onChangeText={setInput}
        placeholder="ex: 14/03/1995"
        keyboardType="numbers-and-punctuation"
      />
      {displayedAge !== null ? (
        <ThemedText type="small" themeColor="textSecondary">
          Âge calculé : {displayedAge} ans
        </ThemedText>
      ) : null}
      <CheckboxRow
        label="Afficher mon âge sur mon profil public"
        checked={visible}
        onToggle={() => setVisible((v) => !v)}
      />
    </Section>
  );
}

function DescriptionSection() {
  const { user, profile, refreshProfile } = useAuth();
  const [description, setDescription] = useState(profile?.description ?? '');
  const [visible, setVisible] = useState(profile?.visibility?.description ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDescription(profile?.description ?? '');
    setVisible(profile?.visibility?.description ?? false);
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        description: description.trim(),
        visibility: { ...(profile?.visibility ?? DEFAULT_VISIBILITY), description: visible },
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Description" onSave={handleSave} saving={saving} saved={saved} error={null}>
      <FormField
        label="Décris ton profil de joueur en quelques mots et quel type de joueurs tu souhaiterais rencontrer et dans quel contexte"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <CheckboxRow
        label="Afficher ma description sur mon profil public"
        checked={visible}
        onToggle={() => setVisible((v) => !v)}
      />
    </Section>
  );
}

function CategoriesSection() {
  const { user, profile, refreshProfile } = useAuth();
  const { content } = useContent();
  const [categories, setCategories] = useState<string[]>(profile?.categoriesPreferees ?? []);
  const [visible, setVisible] = useState(profile?.visibility?.categoriesPreferees ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCategories(profile?.categoriesPreferees ?? []);
    setVisible(profile?.visibility?.categoriesPreferees ?? false);
  }, [profile]);

  function toggleCategory(slug: string) {
    setCategories((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        categoriesPreferees: categories,
        visibility: { ...(profile?.visibility ?? DEFAULT_VISIBILITY), categoriesPreferees: visible },
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title="Catégories de jeux appréciées"
      onSave={handleSave}
      saving={saving}
      saved={saved}
      error={null}>
      <View style={styles.chipRow}>
        {(content?.categories ?? []).map((cat) => {
          const selected = categories.includes(cat.slug);
          return (
            <Pressable key={cat.slug} onPress={() => toggleCategory(cat.slug)}>
              <View style={[styles.chip, selected && styles.chipSelected]}>
                <ThemedText type={selected ? 'smallBold' : 'small'}>{cat.name}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
      <CheckboxRow
        label="Afficher mes catégories préférées sur mon profil public"
        checked={visible}
        onToggle={() => setVisible((v) => !v)}
      />
    </Section>
  );
}

export default function EditerProfilScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Éditer mon profil' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Ces informations restent privées, sauf si tu coches la case "Afficher..." de chaque
          section.
        </ThemedText>
        <PrenomSection />
        <BirthdateSection />
        <DescriptionSection />
        <CategoriesSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  section: { gap: Spacing.two, padding: Spacing.four },
  sectionTitle: { fontSize: 19 },
  error: { color: '#D14343' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Brand.creamDark,
  },
  chipSelected: { borderColor: Brand.ice },
});
