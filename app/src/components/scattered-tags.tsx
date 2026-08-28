import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';

const PALETTE = [
  { bg: Brand.coral, text: Brand.white },
  { bg: Brand.black, text: Brand.white },
  { bg: Brand.green, text: Brand.white },
  { bg: Brand.creamDark, text: Brand.black },
  { bg: Brand.white, text: Brand.black },
];

const ROTATIONS = ['-6deg', '4deg', '-3deg', '5deg', '-4deg', '3deg'];

/**
 * Badges façon stickers éparpillés à plat rotation — idée empruntée à une
 * référence de design (pastilles de catégories dispersées sur l'écran
 * d'accueil d'une app de compétences). Utilise les vraies catégories du
 * site plutôt que des libellés inventés.
 */
export function ScatteredTags({ labels }: { labels: string[] }) {
  return (
    <View style={styles.row}>
      {labels.map((label, i) => {
        const palette = PALETTE[i % PALETTE.length];
        return (
          <View
            key={label}
            style={[
              styles.tag,
              {
                backgroundColor: palette.bg,
                transform: [{ rotate: ROTATIONS[i % ROTATIONS.length] }],
              },
            ]}>
            <ThemedText type="smallBold" style={[styles.tagText, { color: palette.text }]}>
              {label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
  },
  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.12)',
  },
  tagText: { fontSize: 13 },
});
