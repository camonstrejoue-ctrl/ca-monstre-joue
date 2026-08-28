import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Brand } from '@/constants/theme';

// Pastilles de "givre" décoratives, positions/tailles fixes (pas de
// Math.random à chaque rendu, pour un rendu stable et reproductible) —
// donne une texture de glace/neige plutôt qu'un simple fond uni, sans
// dépendre d'une image externe.
const FROST_DOTS: {
  top: `${number}%`;
  left: `${number}%`;
  size: number;
  opacity: number;
  color: string;
}[] = [
  { top: '4%', left: '78%', size: 90, opacity: 0.16, color: Brand.white },
  { top: '2%', left: '8%', size: 50, opacity: 0.14, color: Brand.iceDark },
  { top: '14%', left: '38%', size: 30, opacity: 0.12, color: Brand.white },
  { top: '22%', left: '85%', size: 46, opacity: 0.15, color: Brand.white },
  { top: '30%', left: '4%', size: 70, opacity: 0.1, color: Brand.iceDark },
  { top: '38%', left: '55%', size: 26, opacity: 0.16, color: Brand.white },
  { top: '46%', left: '20%', size: 40, opacity: 0.12, color: Brand.iceDark },
  { top: '52%', left: '75%', size: 60, opacity: 0.13, color: Brand.white },
  { top: '60%', left: '10%', size: 24, opacity: 0.14, color: Brand.white },
  { top: '68%', left: '45%', size: 84, opacity: 0.09, color: Brand.iceDark },
  { top: '76%', left: '88%', size: 34, opacity: 0.15, color: Brand.white },
  { top: '84%', left: '25%', size: 48, opacity: 0.11, color: Brand.iceDark },
  { top: '90%', left: '62%', size: 28, opacity: 0.16, color: Brand.white },
  { top: '96%', left: '5%', size: 56, opacity: 0.1, color: Brand.white },
];

// Glaçons suspendus au bord supérieur — pointe arrondie en haut, fine
// pointe qui goutte en bas. Longueurs et largeurs variées pour un bord
// irrégulier, plus crédible qu'une rangée de piques identiques.
const ICICLES: { left: `${number}%`; width: number; height: number; opacity: number }[] = [
  { left: '2%', width: 22, height: 46, opacity: 0.5 },
  { left: '11%', width: 14, height: 26, opacity: 0.35 },
  { left: '19%', width: 26, height: 60, opacity: 0.55 },
  { left: '29%', width: 16, height: 32, opacity: 0.4 },
  { left: '38%', width: 20, height: 42, opacity: 0.45 },
  { left: '47%', width: 12, height: 24, opacity: 0.3 },
  { left: '55%', width: 24, height: 54, opacity: 0.5 },
  { left: '64%', width: 15, height: 30, opacity: 0.35 },
  { left: '73%', width: 21, height: 44, opacity: 0.45 },
  { left: '82%', width: 13, height: 26, opacity: 0.3 },
  { left: '90%', width: 25, height: 58, opacity: 0.5 },
  { left: '97%', width: 16, height: 34, opacity: 0.38 },
];

// Stalagmites au bord inférieur — même silhouette que les glaçons, mais
// posée à l'endroit (base arrondie, pointe vers le haut), pour évoquer une
// grotte de glace plutôt qu'un simple miroir décoratif.
const STALAGMITES: { left: `${number}%`; width: number; height: number; opacity: number }[] = [
  { left: '5%', width: 20, height: 38, opacity: 0.4 },
  { left: '15%', width: 28, height: 56, opacity: 0.5 },
  { left: '25%', width: 14, height: 24, opacity: 0.3 },
  { left: '34%', width: 22, height: 46, opacity: 0.45 },
  { left: '44%', width: 16, height: 28, opacity: 0.32 },
  { left: '58%', width: 24, height: 50, opacity: 0.48 },
  { left: '68%', width: 13, height: 22, opacity: 0.28 },
  { left: '77%', width: 26, height: 52, opacity: 0.46 },
  { left: '87%', width: 17, height: 30, opacity: 0.35 },
  { left: '95%', width: 21, height: 40, opacity: 0.4 },
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

function Icicle({ width, height, opacity, flip }: { width: number; height: number; opacity: number; flip?: boolean }) {
  // Base arrondie d'un côté, pointe fine de l'autre. `flip` retourne la
  // forme verticalement pour obtenir une stalagmite à partir du même
  // tracé qu'un glaçon.
  const d = `M0,${height * 0.22} Q0,0 ${width * 0.2},0 L${width * 0.8},0 Q${width},0 ${width},${height * 0.22} L${width * 0.58},${height} Q${width / 2},${height * 1.06} ${width * 0.42},${height} Z`;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={flip ? styles.flipped : undefined}>
      <Path d={d} fill={Brand.white} opacity={opacity} />
      <Path d={d} fill="none" stroke={Brand.iceDark} strokeOpacity={opacity * 0.5} strokeWidth={1} />
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
 * Fond "glacé" texturé : dégradé bleu glace → blanc, pastilles de givre,
 * glaçons/stalagmites en bordure et flocons dispersés — demandé par
 * l'utilisateur après un premier essai en fond uni jugé trop plat, puis
 * en éléments visuels glacés (stalactites/stalagmites/flocons) pour
 * renforcer l'ambiance "grotte de glace" du monstre Yeti. Toujours
 * pointerEvents="none" pour ne jamais intercepter les interactions du
 * contenu posé par-dessus.
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
      {FROST_DOTS.map((dot, i) => (
        <View
          key={`dot-${i}`}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: dot.color,
            opacity: dot.opacity,
          }}
        />
      ))}
      {SNOWFLAKES.map((flake, i) => (
        <View key={`flake-${i}`} style={{ position: 'absolute', top: flake.top, left: flake.left }}>
          <Snowflake size={flake.size} opacity={flake.opacity} rotate={flake.rotate} />
        </View>
      ))}
      {ICICLES.map((icicle, i) => (
        <View key={`icicle-${i}`} style={{ position: 'absolute', top: 0, left: icicle.left }}>
          <Icicle width={icicle.width} height={icicle.height} opacity={icicle.opacity} />
        </View>
      ))}
      {STALAGMITES.map((stalagmite, i) => (
        <View key={`stalagmite-${i}`} style={{ position: 'absolute', bottom: 0, left: stalagmite.left }}>
          <Icicle width={stalagmite.width} height={stalagmite.height} opacity={stalagmite.opacity} flip />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flipped: { transform: [{ scaleY: -1 }] },
});
