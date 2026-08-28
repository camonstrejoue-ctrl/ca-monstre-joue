import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

/**
 * Variante "douce" de StickerBox pour la version test du pivot visuel
 * (pas de bordure noire, ombre portée floutée plutôt que décalée) —
 * inspirée d'une référence de design partagée par l'utilisateur. Même
 * API que StickerBox pour rester un remplacement direct dans les
 * composants déjà construits, le temps de comparer les deux directions.
 */
export function SoftCard({
  children,
  style,
  radius = Radius.md,
  backgroundColor = Brand.white,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.card, { borderRadius: radius, backgroundColor }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(26,26,26,0.12)',
      },
      default: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
      },
    }),
  },
});
