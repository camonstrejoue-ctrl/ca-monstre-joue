import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * Message "connecte-toi pour..." partagé par les écrans qui exigent un
 * compte (Joueurs, Ludothèque, Agenda) — avant ce composant, chaque écran
 * avait sa propre version légèrement différente du même message.
 */
export function SignedOutPrompt({ text }: { text: string }) {
  return (
    <ThemedView style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        Connecte-toi
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        {text}
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

const styles = StyleSheet.create({
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
});
