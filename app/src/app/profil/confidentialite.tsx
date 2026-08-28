import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckboxRow } from '@/components/checkbox-row';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { updateUserProfile, useAuth } from '@/lib/auth-context';
import { computeAge, meetsMinAge, MIN_CONTACT_AGE } from '@/lib/moderation';

export default function ConfidentialiteScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [visibleToPlayers, setVisibleToPlayers] = useState(profile?.visibleToPlayers ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVisibleToPlayers(profile?.visibleToPlayers ?? false);
  }, [profile]);

  const age = computeAge(profile?.birthdate);
  const canBeVisible = meetsMinAge(profile?.birthdate, MIN_CONTACT_AGE);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile(user.uid, {
        visibleToPlayers: canBeVisible && visibleToPlayers,
      });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Trouver des joueurs' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Réservé aux {MIN_CONTACT_AGE} ans et plus. Si tu actives cette option, ton profil
          apparaît dans l’annuaire « Joueurs » et tu peux contacter les autres joueurs visibles —
          et réciproquement, tu ne peux contacter personne tant qu’elle est désactivée.
        </ThemedText>

        <CheckboxRow
          label="Être visible par les autres joueurs"
          checked={visibleToPlayers && canBeVisible}
          onToggle={() => setVisibleToPlayers((v) => !v)}
          disabled={!canBeVisible}
        />

        {!canBeVisible && age !== null ? (
          <ThemedText type="small" themeColor="textSecondary">
            {`Désactivé car tu as moins de ${MIN_CONTACT_AGE} ans d’après ta date de naissance — ça se débloquera tout seul le jour de tes ${MIN_CONTACT_AGE} ans.`}
          </ThemedText>
        ) : null}
        {!canBeVisible && age === null ? (
          <ThemedView style={styles.missingBirthdate}>
            <ThemedText type="small" themeColor="textSecondary">
              Indique ta date de naissance pour savoir si tu peux l’activer.
            </ThemedText>
            <Link href="/profil/editer" asChild>
              <Pressable>
                <ThemedText type="link">Éditer mon profil</ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        ) : null}

        <ThemedView style={styles.saveWrap}>
          <PrimaryButton
            label={saving ? 'Enregistrement...' : 'Enregistrer'}
            onPress={handleSave}
            disabled={saving}
          />
          {saved ? (
            <ThemedText type="small" themeColor="textSecondary">
              Enregistré.
            </ThemedText>
          ) : null}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  missingBirthdate: { gap: Spacing.two },
  saveWrap: { gap: Spacing.two, marginTop: Spacing.two },
});
