import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';

export const AVATAR_ACCESSORIES = [
  { value: 'haut-de-forme', label: 'Chapeau haut de forme' },
  { value: 'casquette', label: 'Casquette' },
  { value: 'melon', label: 'Chapeau melon' },
  { value: 'bob', label: 'Bob' },
  { value: 'paille', label: 'Chapeau de paille' },
  { value: 'sombrero', label: 'Sombrero' },
] as const;

export type AvatarAccessory = (typeof AVATAR_ACCESSORIES)[number]['value'];

const SOURCES: Record<string, ImageSource> = {
  aucun: require('@/assets/images/avatars/monstre-aucun.png'),
  'haut-de-forme': require('@/assets/images/avatars/monstre-haut-de-forme.png'),
  casquette: require('@/assets/images/avatars/monstre-casquette.png'),
  melon: require('@/assets/images/avatars/monstre-melon.png'),
  bob: require('@/assets/images/avatars/monstre-bob.png'),
  paille: require('@/assets/images/avatars/monstre-paille.png'),
  sombrero: require('@/assets/images/avatars/monstre-sombrero.png'),
};

export function AvatarMonster({
  accessory,
  size = 48,
  ring,
  style,
}: {
  accessory?: string | null;
  size?: number;
  // Anneau coloré autour de l'avatar (idée empruntée à une référence de
  // design partagée par l'utilisateur — avatars cerclés) : `true` pour le
  // corail de marque, ou une couleur précise. Réservé aux avatars mis en
  // avant (liste Joueurs, fiche joueur, en-tête Profil) — pas utilisé pour
  // les petites vignettes de sélection d'accessoire, qui n'en ont pas besoin.
  ring?: boolean | string;
  style?: StyleProp<ViewStyle>;
}) {
  const source = SOURCES[accessory ?? 'aucun'] ?? SOURCES.aucun;
  const ringColor = ring === true ? Brand.ice : ring || undefined;
  const ringWidth = ringColor ? Math.max(3, Math.round(size * 0.06)) : 0;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor: ringColor ?? 'transparent',
        },
        style,
      ]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
});
