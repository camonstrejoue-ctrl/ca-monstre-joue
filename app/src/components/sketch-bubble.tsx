import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Brand } from '@/constants/theme';

const VB_W = 400;
const VB_H = 260;

// Un seul tracé, contour épais et arrondi — harmonisé avec le style du
// monstre (assets/images/monstre.png) : trait plein, régulier, jointures
// arrondies, plutôt que le double-trait "croquis" du premier essai.
// `preserveAspectRatio="none"` : le SVG épouse exactement les dimensions
// du conteneur (hauteur pilotée par le texte), donc pas de vrai
// rectangle géométrique.
const OUTLINE =
  'M44,8 L360,6 Q392,4 390,36 L392,166 Q394,198 360,200 L222,202 L202,244 L178,204 L54,206 Q14,204 16,174 L12,42 Q10,10 44,8 Z';

/**
 * Bulle avec un contour noir épais façon dessin animé, harmonisé avec le
 * trait du monstre — remplace SoftCard pour la bulle de l'accueil. Pointe
 * centrée en bas. Le texte se place dans `content`, avec un
 * `paddingBottom` généreux pour laisser la place à la pointe dessinée
 * en dessous.
 */
export function SketchBubble({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wrap, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <Path
          d={OUTLINE}
          fill={Brand.white}
          stroke={Brand.black}
          strokeWidth={7}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  content: { paddingHorizontal: 34, paddingTop: 22, paddingBottom: 56 },
});
