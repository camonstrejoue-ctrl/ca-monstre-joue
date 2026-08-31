import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/**
 * Confirmation d'une action destructive, affichée EN LIGNE (pas de dialogue
 * système). Alert.alert() ne produit aucune boîte de dialogue visible sous
 * react-native-web, et window.confirm()/alert() sont désactivés dans le
 * pane de prévisualisation de Claude Code (voir la conversation) — une UI
 * intégrée à l'écran est le seul choix qui fonctionne de façon fiable sur
 * toutes les plateformes (web, natif, cet outil de prévisualisation inclus).
 */
export function ConfirmRow({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  busy,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <View style={styles.row}>
      <ThemedText type="small">{message}</ThemedText>
      <View style={styles.buttons}>
        <Pressable onPress={onConfirm} disabled={busy}>
          <ThemedText type="smallBold" style={styles.destructive}>
            {busy ? '...' : confirmLabel}
          </ThemedText>
        </Pressable>
        <Pressable onPress={onCancel} disabled={busy}>
          <ThemedText type="small" themeColor="textSecondary">
            Annuler
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.two, marginTop: Spacing.two },
  buttons: { flexDirection: 'row', gap: Spacing.three },
  destructive: { color: '#D14343' },
});
