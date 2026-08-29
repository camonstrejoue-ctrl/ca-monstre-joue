import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import { Brand } from '@/constants/theme';

// Boules de neige décoratives (remplacent d'anciennes pastilles plates) —
// positions/tailles fixes (pas de Math.random à chaque rendu, pour un
// rendu stable et reproductible). `shaded` alterne entre boules bien
// blanches et boules légèrement teintées glace, pour suggérer du relief
// plutôt qu'une texture uniforme.
const SNOWBALLS: {
  top: `${number}%`;
  left: `${number}%`;
  size: number;
  opacity: number;
  shaded: boolean;
}[] = [
  { top: '22%', left: '85%', size: 26, opacity: 0.5, shaded: false },
  { top: '30%', left: '4%', size: 38, opacity: 0.38, shaded: true },
  { top: '38%', left: '55%', size: 18, opacity: 0.48, shaded: false },
  { top: '46%', left: '20%', size: 24, opacity: 0.42, shaded: true },
  { top: '52%', left: '75%', size: 34, opacity: 0.44, shaded: false },
  { top: '60%', left: '10%', size: 16, opacity: 0.46, shaded: false },
  { top: '68%', left: '45%', size: 44, opacity: 0.34, shaded: true },
  { top: '76%', left: '88%', size: 22, opacity: 0.48, shaded: false },
  { top: '84%', left: '25%', size: 28, opacity: 0.38, shaded: true },
  { top: '90%', left: '62%', size: 18, opacity: 0.5, shaded: false },
  { top: '96%', left: '5%', size: 32, opacity: 0.36, shaded: false },
];

// Flocons de neige — petit astérisque à 3 branches (6 segments), plus
// fidèle à un flocon qu'un simple point. Dispersés à des tailles/opacités
// variées pour suggérer de la profondeur (les plus petits/pâles "plus
// loin").
const SNOWFLAKES: { top: `${number}%`; left: `${number}%`; size: number; opacity: number; rotate: number }[] = [
  { top: '8%', left: '25%', size: 16, opacity: 0.55, rotate: 10 },
  { top: '6%', left: '62%', size: 12, opacity: 0.4, rotate: -20 },
  { top: '18%', left: '92%', size: 10, opacity: 0.35, rotate: 35 },
  { top: '24%', left: '15%', size: 18, opacity: 0.5, rotate: -8 },
  { top: '33%', left: '70%', size: 11, opacity: 0.38, rotate: 15 },
  { top: '41%', left: '35%', size: 14, opacity: 0.45, rotate: -30 },
  { top: '50%', left: '90%', size: 10, opacity: 0.32, rotate: 5 },
  { top: '58%', left: '8%', size: 16, opacity: 0.48, rotate: 25 },
  { top: '65%', left: '55%', size: 12, opacity: 0.4, rotate: -15 },
  { top: '73%', left: '80%', size: 15, opacity: 0.42, rotate: 20 },
  { top: '80%', left: '30%', size: 10, opacity: 0.34, rotate: -25 },
  { top: '88%', left: '68%', size: 13, opacity: 0.38, rotate: 12 },
];

// Bandeau de neige continu sur toute la largeur, avec des glaçons fins et
// serrés tout du long (pas des amas isolés séparés par des trous) —
// repris de la bande du milieu d'une référence illustrée partagée par
// l'utilisateur (rangée dense de longs glaçons fins, ligne de neige
// légèrement festonnée entre chaque). Construit dans un repère large
// fixe (BAND_VB_W x BAND_VB_H) puis étiré en largeur à 100% de l'écran
// via `preserveAspectRatio="none"` (la hauteur, elle, reste fixe en dp —
// voir BAND_HEIGHT).
const BAND_VB_W = 1000;
const BAND_VB_H = 150;
const BAND_TOP = 40; // hauteur du bandeau plein avant la ligne de neige
const BAND_HEIGHT = 130; // hauteur réelle à l'écran (dp)

// Longueurs de glaçons (au-delà de BAND_TOP) tirées à l'avance pour un
// rendu stable — deux jeux différents pour le haut et le bas, pour ne
// pas avoir l'air d'un simple miroir.
const DRIP_LENGTHS_TOP = [55, 85, 40, 70, 95, 50, 75, 35, 90, 60, 45, 80, 65, 38, 72, 48];
const DRIP_LENGTHS_BOTTOM = [70, 42, 88, 55, 35, 78, 92, 48, 65, 40, 85, 58, 72, 44, 60, 36];

function buildIceBandPath(dripLengths: number[]): string {
  const count = dripLengths.length;
  const segW = BAND_VB_W / count;
  const gap = segW * 0.1;
  let d = `M0,0 L${BAND_VB_W},0 L${BAND_VB_W},${BAND_TOP} `;
  for (let i = count - 1; i >= 0; i--) {
    const xRight = (i + 1) * segW - gap / 2;
    const xLeft = i * segW + gap / 2;
    const xTip = i * segW + segW / 2;
    const tipY = BAND_TOP + dripLengths[i];
    d += `L${xRight},${BAND_TOP} L${xTip},${tipY} L${xLeft},${BAND_TOP} `;
    // Petite bosse arrondie dans la ligne de neige entre deux glaçons
    // adjacents, pour un bord festonné plutôt que des jointures plates.
    if (i > 0) {
      const xGap = i * segW;
      d += `Q${xGap},${BAND_TOP - 9} ${xGap - gap / 2},${BAND_TOP} `;
    }
  }
  d += 'Z';
  return d;
}

const ICE_BAND_TOP_PATH = buildIceBandPath(DRIP_LENGTHS_TOP);
const ICE_BAND_BOTTOM_PATH = buildIceBandPath(DRIP_LENGTHS_BOTTOM);

function IceBand({ flip }: { flip?: boolean }) {
  // Deux calques du même tracé : un bleu glace légèrement décalé (l'ombre
  // qui dépasse sur les bords, comme sur la référence), et un blanc
  // par-dessus sans décalage. `flip` retourne l'ensemble verticalement
  // pour obtenir le bandeau du bas à partir du même tracé.
  const d = flip ? ICE_BAND_BOTTOM_PATH : ICE_BAND_TOP_PATH;
  return (
    <View style={[styles.band, flip ? styles.bandBottom : styles.bandTop]} pointerEvents="none">
      <Svg
        width="100%"
        height={BAND_HEIGHT}
        viewBox={`0 0 ${BAND_VB_W} ${BAND_VB_H}`}
        preserveAspectRatio="none"
        style={flip ? styles.flipped : undefined}>
        <G opacity={0.5}>
          <G transform="translate(6, 7)">
            <Path d={d} fill={Brand.iceLight} />
          </G>
          <Path d={d} fill={Brand.white} />
        </G>
      </Svg>
    </View>
  );
}

function Snowball({ size, opacity, shaded, gradientId }: { size: number; opacity: number; shaded: boolean; gradientId: string }) {
  // Dégradé radial (highlight clair en haut à gauche, base plus foncée en
  // bas à droite) + un léger cerne + une petite touche de brillance, pour
  // lire comme une boule de neige en relief plutôt qu'une pastille plate.
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={gradientId} cx="38%" cy="32%" r="75%">
          <Stop offset="0%" stopColor={Brand.white} stopOpacity={1} />
          <Stop offset="55%" stopColor={shaded ? Brand.iceLight : Brand.white} stopOpacity={1} />
          <Stop offset="100%" stopColor={shaded ? Brand.ice : Brand.iceLight} stopOpacity={0.95} />
        </RadialGradient>
      </Defs>
      <G opacity={opacity}>
        <Circle cx={r} cy={r} r={r} fill={`url(#${gradientId})`} />
        <Circle cx={r} cy={r} r={r - 0.75} fill="none" stroke={Brand.black} strokeOpacity={0.55} strokeWidth={1.5} />
        <Ellipse cx={r * 0.62} cy={r * 0.55} rx={r * 0.24} ry={r * 0.17} fill={Brand.white} opacity={0.75} />
      </G>
    </Svg>
  );
}

function Snowflake({ size, opacity, rotate }: { size: number; opacity: number; rotate: number }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: `${rotate}deg` }] }}>
      <Line x1={c} y1={0} x2={c} y2={size} stroke={Brand.white} strokeWidth={1.4} strokeLinecap="round" opacity={opacity} />
      <Line x1={0} y1={c} x2={size} y2={c} stroke={Brand.white} strokeWidth={1.4} strokeLinecap="round" opacity={opacity} />
      <Line x1={size * 0.15} y1={size * 0.15} x2={size * 0.85} y2={size * 0.85} stroke={Brand.white} strokeWidth={1.2} strokeLinecap="round" opacity={opacity * 0.85} />
      <Line x1={size * 0.85} y1={size * 0.15} x2={size * 0.15} y2={size * 0.85} stroke={Brand.white} strokeWidth={1.2} strokeLinecap="round" opacity={opacity * 0.85} />
      <Circle cx={c} cy={c} r={size * 0.09} fill={Brand.white} opacity={opacity} />
    </Svg>
  );
}

/**
 * Fond "glacé" texturé : dégradé bleu glace → blanc, boules de neige en
 * relief, bandeaux de neige avec glaçons/stalagmites sur toute la largeur
 * en haut/bas, et flocons dispersés — demandé par l'utilisateur après un
 * premier essai en fond uni jugé trop plat, puis en éléments visuels
 * glacés pour renforcer l'ambiance "grotte de glace" du monstre Yeti.
 * Toujours pointerEvents="none" pour ne jamais intercepter les
 * interactions du contenu posé par-dessus.
 */
export function IcyBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[Brand.iceLight, '#EDF7FC', Brand.white]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {SNOWBALLS.map((ball, i) => (
        <View key={`ball-${i}`} style={{ position: 'absolute', top: ball.top, left: ball.left }}>
          <Snowball size={ball.size} opacity={ball.opacity} shaded={ball.shaded} gradientId={`snowball-grad-${i}`} />
        </View>
      ))}
      {SNOWFLAKES.map((flake, i) => (
        <View key={`flake-${i}`} style={{ position: 'absolute', top: flake.top, left: flake.left }}>
          <Snowflake size={flake.size} opacity={flake.opacity} rotate={flake.rotate} />
        </View>
      ))}
      <IceBand />
      <IceBand flip />
    </View>
  );
}

const styles = StyleSheet.create({
  flipped: { transform: [{ scaleY: -1 }] },
  band: { position: 'absolute', left: 0, right: 0 },
  bandTop: { top: 0 },
  bandBottom: { bottom: 0 },
});
