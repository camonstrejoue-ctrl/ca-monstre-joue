import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Brand } from '@/constants/theme';

const VB_W = 400;
const VB_H = 260;

// Deux tracés légèrement décalés/irréguliers (pas un rectangle parfait) —
// imite le contour "dessiné au stylo, repassé deux fois" d'une référence
// partagée par l'utilisateur (bulle façon croquis à la main, avec des
// hachures dans un coin et une pointe irrégulière en bas à gauche).
// `preserveAspectRatio="none"` : le SVG épouse exactement les dimensions
// du conteneur (hauteur pilotée par le texte), donc pas de vrai
// rectangle géométrique — l'irrégularité du tracé masque l'étirement.
const OUTLINE_A = 'M16,18 L384,10 L390,196 L60,206 L42,236 L34,204 L20,200 Z';
const OUTLINE_B = 'M10,26 L388,4 L396,190 L54,214 L38,244 L28,208 L14,192 Z';

const HATCH_LINES: [number, number, number, number][] = [
  [20, 208, 29, 231],
  [24, 200, 34, 225],
  [28, 192, 40, 219],
  [32, 184, 45, 213],
  [36, 176, 49, 207],
  [40, 170, 53, 201],
];

/**
 * Bulle façon croquis à la main : contour noir irrégulier (deux tracés
 * superposés), hachures et pointe en bas à gauche — remplace SoftCard
 * pour la bulle de l'accueil, sur demande explicite avec une image de
 * référence. Le texte se place dans `content`, avec un `paddingBottom`
 * généreux pour laisser la place à la pointe dessinée en dessous.
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
          d={OUTLINE_A}
          fill={Brand.white}
          stroke={Brand.black}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Path
          d={OUTLINE_B}
          fill="none"
          stroke={Brand.black}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {HATCH_LINES.map(([x1, y1, x2, y2], i) => (
          <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={Brand.black} strokeWidth={1.5} strokeLinecap="round" />
        ))}
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  content: { paddingHorizontal: 34, paddingTop: 22, paddingBottom: 56 },
});
