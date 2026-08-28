import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { Brand, Fonts } from '@/constants/theme';

const LINES = ["L'écosystème", 'ludique Suisse'];
const VB_WIDTH = 380;
const VB_HEIGHT = 160;
const LINE_Y = [64, 136];
const FONT_SIZE = 46;

/**
 * Titre "feu glacé" : remplace les pastilles de catégories sur l'accueil.
 * Lettres en dégradé blanc → bleu glace avec un contour net (demandé
 * explicitement par l'utilisateur), plus une lueur scintillante derrière —
 * react-native-svg n'expose pas <feGaussianBlur> côté JS ici, donc le flou
 * est simulé par calques de traits épais semi-transparents superposés
 * (technique SVG classique) plutôt qu'un vrai filtre, et animé en opacité
 * pour un effet de flamme qui vacille doucement.
 */
export function IceFireHeading() {
  const flicker = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.55, duration: 1000, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.9, duration: 900, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.65, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: flicker }]} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}>
          {LINES.map((line, i) => (
            <SvgText
              key={`glow-outer-${i}`}
              x="50%"
              y={LINE_Y[i]}
              fontSize={FONT_SIZE}
              fontFamily={Fonts.displayExtraBold}
              fill="none"
              stroke={Brand.white}
              strokeWidth={16}
              strokeOpacity={0.16}
              strokeLinejoin="round"
              textAnchor="middle">
              {line}
            </SvgText>
          ))}
          {LINES.map((line, i) => (
            <SvgText
              key={`glow-inner-${i}`}
              x="50%"
              y={LINE_Y[i]}
              fontSize={FONT_SIZE}
              fontFamily={Fonts.displayExtraBold}
              fill="none"
              stroke={Brand.ice}
              strokeWidth={8}
              strokeOpacity={0.4}
              strokeLinejoin="round"
              textAnchor="middle">
              {line}
            </SvgText>
          ))}
        </Svg>
      </Animated.View>

      <Svg width="100%" height="100%" viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="iceFireFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Brand.white} />
            <Stop offset="50%" stopColor={Brand.iceLight} />
            <Stop offset="100%" stopColor={Brand.ice} />
          </LinearGradient>
        </Defs>
        {LINES.map((line, i) => (
          <SvgText
            key={`fill-${i}`}
            x="50%"
            y={LINE_Y[i]}
            fontSize={FONT_SIZE}
            fontFamily={Fonts.displayExtraBold}
            fill="url(#iceFireFill)"
            stroke={Brand.iceDark}
            strokeWidth={2}
            strokeLinejoin="round"
            textAnchor="middle">
            {line}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: VB_WIDTH / VB_HEIGHT },
});
