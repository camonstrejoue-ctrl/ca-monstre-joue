import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CoverImage } from '@/components/cover-image';
import { StickerBox } from '@/components/sticker';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

type IconTileColor = 'coral' | 'green';

const ICON_TILE_COLORS: Record<IconTileColor, { bg: string; icon: string }> = {
  coral: { bg: Brand.coralLight, icon: Brand.coralDark },
  green: { bg: Brand.greenLight, icon: Brand.greenDark },
};

/**
 * Gros bouton de navigation façon carte. Deux variantes :
 * - `icon` (recommandée) : icône dans un rond de couleur + libellé, façon
 *   ToolCard — ne dépend d'aucune illustration dédiée.
 * - `image` (ancienne variante, conservée pour compat) : photo de fond avec
 *   voile sombre — évite de recycler une photo de jeu sans rapport avec la
 *   destination, à réserver aux cas où une vraie image illustrative existe.
 */
export function NavTile({
  href,
  label,
  description,
  icon,
  color = 'coral',
  image,
}: {
  href: Href;
  label: string;
  description?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  color?: IconTileColor;
  image?: string;
}) {
  if (icon) {
    const palette = ICON_TILE_COLORS[color];
    return (
      <Link href={href} asChild>
        <Pressable>
          <StickerBox backgroundColor={Brand.white} radius={Radius.md}>
            <View style={styles.iconRow}>
              <View style={[styles.iconCircle, { backgroundColor: palette.bg }]}>
                <Ionicons name={icon} size={26} color={palette.icon} />
              </View>
              <View style={styles.iconText}>
                <ThemedText type="smallBold">{label}</ThemedText>
                {description ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {description}
                  </ThemedText>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Brand.gray} />
            </View>
          </StickerBox>
        </Pressable>
      </Link>
    );
  }

  return (
    <View style={styles.wrap}>
      <Link href={href} asChild>
        <Pressable style={styles.touchable}>
          <StickerBox backgroundColor={Brand.white} radius={Radius.lg} style={styles.sticker}>
            <View style={styles.imageWrap}>
              <CoverImage path={image!} style={styles.image} />
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { flex: 1, gap: 2 },
});
