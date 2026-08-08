import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
  style,
}: {
  accessory?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const source = SOURCES[accessory ?? 'aucun'] ?? SOURCES.aucun;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }, style]}>
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
