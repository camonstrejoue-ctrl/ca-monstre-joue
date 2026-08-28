import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Brand } from '@/constants/theme';

const VB_W = 400;
const VB_H = 260;

// Deux tracés légèrement décalés/irréguliers (coins arrondis via Q,
// pointe centrée en bas) — imite le contour "dessiné au stylo, repassé
// deux fois" d'une référence partagée par l'utilisateur (bulle façon
// croquis à la main, avec des hachures et une pointe irrégulière).
// `preserveAspectRatio="none"` : le SVG épouse exactement les dimensions
// du conteneur (hauteur pilotée par le texte), donc pas de vrai
// rectangle géométrique — l'irrégularité du tracé masque l'étirement.
const OUTLINE_A =
  'M44,8 L360,6 Q392,4 390,36 L392,166 Q394,198 360,200 L222,202 L202,244 L178,204 L54,206 Q14,204 16,174 L12,42 Q10,10 44,8 Z';
const OUTLINE_B =
  'M38,16 L366,2 Q396,8 388,42 L394,160 Q398,192 356,206 L226,208 L200,248 L174,210 L48,200 Q8,196 20,168 L8,36 Q14,6 38,16 Z';

const HATCH_LINES: [number, number, number, number][] = [
  [140, 205, 149, 225],
  [144, 197, 154, 219],
  [148, 189, 159, 213],
  [152, 181, 164, 207],
  [156, 173, 169, 201],
  [160, 167, 173, 195],
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
