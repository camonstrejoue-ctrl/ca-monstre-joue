import { Alert, Platform } from 'react-native';

/**
 * Confirmation avant une action destructive (suppression, rejet...).
 * `Alert.alert` ne produit aucune boîte de dialogue visible/interactive sous
 * react-native-web (limitation connue de react-native-web, pas de notre
 * code) — sur web on utilise donc `window.confirm` à la place. Comportement
 * natif (iOS/Android, où Alert.alert fonctionne normalement) inchangé.
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Confirmer'
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/** Même limitation que confirmAction ci-dessus, pour un simple message d'info (un seul bouton). */
export function notifyAction(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
