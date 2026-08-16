import { Colors } from '@/constants/theme';

// Le site n'a pas de mode sombre (marque 100% claire) : l'app reste donc
// toujours sur la palette claire, peu importe le réglage du téléphone,
// pour ne jamais surprendre avec un thème différent du site.
export function useTheme() {
  return Colors.light;
}
