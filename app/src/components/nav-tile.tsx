import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CoverImage } from '@/components/cover-image';
import { SoftCard } from '@/components/soft-card';
import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

type IconTileColor = 'ice' | 'green' | 'cream';

// Même logique que .shortcut-card sur le site (css/style.css) : grande carte
// pleine couleur, gros pictogramme, petite étiquette en majuscules au-dessus
// du titre — plutôt qu'une simple ligne blanche avec une icône minuscule
// (look "réglages système" jugé trop plat).
const ICON_TILE_COLORS: Record<IconTileColor, { bg: string; icon: string; tag: string }> = {
  ice: { bg: Brand.iceLight, icon: Brand.iceDark, tag: Brand.iceDark },
  green: { bg: Brand.greenLight, icon: Brand.greenDark, tag: Brand.greenDark },
  cream: { bg: Brand.creamDark, icon: Brand.black, tag: Brand.iceDark },
};

/**
 * Gros bouton de navigation façon carte. Deux variantes :
 * - `icon` (recommandée) : grande carte de couleur, pictogramme, étiquette +
 *   titre — ne dépend d'aucune illustration dédiée.
 * - `image` (ancienne variante, conservée pour compat) : photo de fond avec
 *   voile sombre — évite de recycler une photo de jeu sans rapport avec la
 *   destination, à réserver aux cas où une vraie image illustrative existe.
 */
export function NavTile({
  href,
  label,
  description,
  eyebrow,
  icon,
  color = 'ice',
  image,
}: {
  href: Href;
  label: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  color?: IconTileColor;
  image?: string;
}) {
  if (icon) {
    const palette = ICON_TILE_COLORS[color];
    return (
      <View style={styles.iconTileWrap}>
        <Link href={href} asChild>
          <Pressable>
            <SoftCard backgroundColor={palette.bg} radius={Radius.lg}>
              <View style={styles.iconCardRow}>
                <View style={styles.iconSpacer} />
                <View style={styles.iconText}>
                  {eyebrow ? (
                    <ThemedText type="smallBold" style={[styles.eyebrow, { color: palette.tag }]}>
                      {eyebrow}
                    </ThemedText>
                  ) : null}
                  <ThemedText type="subtitle" style={styles.iconTitle}>
                    {label}
                  </ThemedText>
                  {description ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {description}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
            </SoftCard>
          </Pressable>
        </Link>
        {/* Badge-icône rond qui déborde du coin de la carte, ombre douce
            plutôt que bordure noire — reprend directement l'esprit
            "illustration qui déborde" de la référence de design. */}
        <View style={styles.iconBadge} pointerEvents="none">
          <SoftCard backgroundColor={Brand.white} radius={999} style={styles.iconBadgeCard}>
            <View style={styles.iconBadgeInner}>
              <Ionicons name={icon} size={30} color={palette.icon} />
            </View>
          </SoftCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Link href={href} asChild>
        <Pressable style={styles.touchable}>
          <SoftCard backgroundColor={Brand.white} radius={Radius.lg} style={styles.sticker}>
            <View style={styles.imageWrap}>
              <CoverImage path={image!} style={styles.image} />
              <View style={styles.overlay}>
                <ThemedText type="smallBold" style={styles.label}>
                  {label}
                </ThemedText>
              </View>
            </View>
          </SoftCard>
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
  iconTileWrap: { position: 'relative', marginTop: 22 },
  iconCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    minHeight: 108,
  },
  iconSpacer: { width: 40 },
  iconText: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  iconTitle: { fontSize: 19, lineHeight: 23 },
  iconBadge: {
    position: 'absolute',
    top: -20,
    left: 24,
    width: 62,
    height: 62,
  },
  iconBadgeCard: { width: 62, height: 62 },
  iconBadgeInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
