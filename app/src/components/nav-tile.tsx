import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CoverImage } from '@/components/cover-image';
import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

/**
 * Gros bouton de navigation façon carte : image de fond (test en attendant
 * une illustration dédiée), voile sombre, libellé centré en gros — même
 * style que "Trouver des joueurs près de chez moi" sur l'accueil.
 */
export function NavTile({ href, label, image }: { href: Href; label: string; image: string }) {
  return (
    <View style={styles.wrap}>
      <Link href={href} asChild>
        <Pressable style={styles.touchable}>
          <StickerBox backgroundColor={Brand.white} radius={Radius.lg} style={styles.sticker}>
            <View style={styles.imageWrap}>
              <CoverImage path={image} style={styles.image} />
              <View style={styles.overlay}>
                <ThemedText type="smallBold" style={styles.label}>
                  {label}
                </ThemedText>
              </View>
            </View>
          </StickerBox>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: 16 / 7 },
  pressed: { opacity: 0.85 },
  touchable: { width: '100%', height: '100%' },
  sticker: { width: '100%', height: '100%' },
  imageWrap: { width: '100%', height: '100%' },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,26,26,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  label: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 26,
    color: Brand.white,
  },
});
