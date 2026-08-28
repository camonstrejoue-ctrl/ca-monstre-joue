import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { Brand, Fonts } from '@/constants/theme';

const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

const LINES = ["L'écosystème", 'ludique Suisse'];
const VB_WIDTH = 380;
const VB_HEIGHT = 160;
const LINE_Y = [64, 136];
const FONT_SIZE = 46;

// Séquence volontairement irrégulière (durées qui varient) plutôt qu'un
// aller-retour régulier : donne un vacillement de flamme crédible plutôt
// qu'un pouls mécanique. Les deux lignes partagent la même valeur animée
// (même vacillement, au même moment) — à la demande de l'utilisateur.
// Ralenti + pause de quelques secondes entre deux passages (le premier
// réglage vacillait trop vite, en continu).
function useFlicker() {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const steps = [0.9, 0.25, 1, 0.5, 0.75, 0.1, 0.95, 0.2];
    const durations = [650, 800, 700, 850, 650, 750, 650, 700];
    const sequence = Animated.sequence([
      ...steps.map((toValue, i) =>
        Animated.timing(value, {
          toValue,
          duration: durations[i],
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ),
      Animated.delay(3500),
    ]);
    const loop = Animated.loop(sequence);
    loop.start();
    return () => loop.stop();
  }, [value]);

  return value;
}

/**
 * Titre "feu glacé" : remplace les pastilles de catégories sur l'accueil.
 * Lettres en dégradé blanc → bleu glace ; le contour (demandé
 * explicitement par l'utilisateur) n'est plus statique — sa couleur et
 * son épaisseur vacillent en boucle comme une flamme, via
 * Animated.createAnimatedComponent (couleur/largeur de trait ne passent
 * pas par le native driver, donc animation JS — largement assez léger
 * pour un titre). Une lueur floutée (calques de traits superposés,
 * react-native-svg n'exposant pas <feGaussianBlur> côté JS) scintille en
 * plus derrière, en opacité (native driver).
 */
export function IceFireHeading() {
  const glow = useRef(new Animated.Value(0.7)).current;
  const flame = useFlicker();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.55, duration: 1000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.9, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.65, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const contourColor = flame.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Brand.iceDark, Brand.ice, Brand.white],
  });
  const contourWidth = flame.interpolate({ inputRange: [0, 1], outputRange: [1.4, 3.4] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow }]} pointerEvents="none">
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
          <AnimatedSvgText
            key={`fill-${i}`}
            x="50%"
            y={LINE_Y[i]}
            fontSize={FONT_SIZE}
            fontFamily={Fonts.displayExtraBold}
            fill="url(#iceFireFill)"
            stroke={contourColor}
            strokeWidth={contourWidth}
            strokeLinejoin="round"
            textAnchor="middle">
            {line}
          </AnimatedSvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', aspectRatio: VB_WIDTH / VB_HEIGHT },
});
