import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';

const LINES = ["L'écosystème", 'ludique Suisse'];

// Halo derrière le texte : copies décalées en anneau, opacité faible,
// pour simuler un flou sans vrai filtre de flou (indisponible pour du
// texte RN natif).
const GLOW_OFFSETS: [number, number][] = [
  [-3, -3],
  [0, -4],
  [3, -3],
  [4, 0],
  [3, 3],
  [0, 4],
  [-3, 3],
  [-4, 0],
];

// Contour : copies décalées plus rapprochées, couleur animée (voir
// useFlicker) — simule le trait qui "brûle" en vacillant.
const OUTLINE_OFFSETS: [number, number][] = [
  [-1.6, -1.6],
  [0, -2],
  [1.6, -1.6],
  [2, 0],
  [1.6, 1.6],
  [0, 2],
  [-1.6, 1.6],
  [-2, 0],
];

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
 * Reconstruit en Text RN natif (contour par copies décalées) au lieu de
 * <Text> SVG — la version SVG (police personnalisée + fill dégradé +
 * stroke animé) ne s'affichait pas du tout sur téléphone via Expo Go,
 * alors qu'elle marchait dans l'aperçu web (react-native-svg gère mal
 * les polices custom sur Text natif, contrairement au web qui délègue
 * au vrai DOM SVG du navigateur). Le contour vacille toujours en couleur
 * (comme une flamme) via des copies de texte superposées et légèrement
 * décalées plutôt qu'un vrai stroke SVG — 100% Text natif, donc fiable
 * sur les deux plateformes.
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

  return (
    <View style={styles.wrap}>
      {LINES.map((line, i) => (
        <View key={i} style={styles.lineWrap}>
          <Animated.View style={[styles.layer, { opacity: glow }]} pointerEvents="none">
            {GLOW_OFFSETS.map(([dx, dy], j) => (
              <Text
                key={`glow-${j}`}
                style={[styles.line, styles.glowText, { transform: [{ translateX: dx }, { translateY: dy }] }]}>
                {line}
              </Text>
            ))}
          </Animated.View>
          <View style={styles.layer} pointerEvents="none">
            {OUTLINE_OFFSETS.map(([dx, dy], j) => (
              <Animated.Text
                key={`outline-${j}`}
                style={[
                  styles.line,
                  styles.outlineText,
                  { color: contourColor, transform: [{ translateX: dx }, { translateY: dy }] },
                ]}>
                {line}
              </Animated.Text>
            ))}
          </View>
          <Text style={[styles.line, styles.fillText]}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  lineWrap: { position: 'relative' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  line: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  glowText: { position: 'absolute', top: 0, left: 0, right: 0, color: Brand.white, opacity: 0.14 },
  outlineText: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.9 },
  fillText: { color: Brand.white },
});
