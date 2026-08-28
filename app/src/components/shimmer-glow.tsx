import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

// Petites flammes positionnées à cheval sur les bords de la carte,
// chacune avec son propre délai/durée pour crépiter de façon décalée
// plutôt que toutes en même temps (effet plus naturel).
const EMBER_SPOTS: { top: `${number}%`; left: `${number}%`; size: number; delay: number; duration: number }[] = [
  { top: '-8%', left: '12%', size: 15, delay: 0, duration: 1900 },
  { top: '18%', left: '97%', size: 11, delay: 500, duration: 1600 },
  { top: '55%', left: '-4%', size: 10, delay: 950, duration: 2100 },
  { top: '82%', left: '90%', size: 13, delay: 250, duration: 1800 },
  { top: '96%', left: '22%', size: 9, delay: 1300, duration: 1700 },
];

function Ember({
  top,
  left,
  size,
  delay,
  duration,
}: {
  top: `${number}%`;
  left: `${number}%`;
  size: number;
  delay: number;
  duration: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    function run() {
      anim.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ]).start(({ finished }) => {
        if (finished && !cancelled) run();
      });
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [anim, delay, duration]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.15] });

  return (
    <Animated.View
      style={{ position: 'absolute', top, left, opacity: anim, transform: [{ scale }] }}
      pointerEvents="none">
      <Ionicons name="flame" size={size} color={Brand.flameBright} />
    </Animated.View>
  );
}

/**
 * Bordure "qui se consume" : couleur (braise sombre → flamme → pointe
 * brûlante) et épaisseur du contour vacillent en boucle sur une séquence
 * de durées irrégulières, façon feu réel plutôt qu'un pouls mécanique —
 * même principe que le contour du titre "feu glacé" de l'accueil.
 * `borderColor`/`borderWidth` ne passent pas par le native driver (donc
 * animation JS, largement assez léger pour un seul contour). Petites
 * flammes qui crépitent tout autour en plus. Remplace l'ancien contour
 * doré fixe, à la demande de l'utilisateur.
 */
export function ShimmerGlow({ children, radius }: { children: ReactNode; radius: number }) {
  const burn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const steps = [0.9, 0.25, 1, 0.5, 0.75, 0.1, 0.95, 0.2];
    const durations = [420, 520, 460, 560, 430, 500, 440, 480];
    const sequence = Animated.sequence(
      steps.map((toValue, i) =>
        Animated.timing(burn, {
          toValue,
          duration: durations[i],
          easing: Easing.linear,
          useNativeDriver: false,
        })
      )
    );
    const loop = Animated.loop(sequence);
    loop.start();
    return () => loop.stop();
  }, [burn]);

  const ringColor = burn.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Brand.flameDark, Brand.flame, Brand.flameBright],
  });
  const ringWidth = burn.interpolate({ inputRange: [0, 1], outputRange: [2, 4] });
  const ringOpacity = burn.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={styles.container}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          { borderRadius: radius, borderColor: ringColor, borderWidth: ringWidth, opacity: ringOpacity },
        ]}
      />
      {EMBER_SPOTS.map((spot, i) => (
        <Ember key={i} {...spot} />
      ))}
    </View>
  );
}

/**
 * Petit "pop" (léger agrandissement puis rebond) toutes les 5 secondes —
 * demandé pour attirer l'œil sur le bloc Agenda. `delay` puis un aller
 * (timing rapide) suivi d'un retour en ressort (spring, avec le petit
 * rebond naturel que ça donne), en boucle. `opacity`/`transform`
 * uniquement (native driver).
 */
export function PopBounce({ children }: { children: ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(5000),
        Animated.timing(scale, {
          toValue: 1.07,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 140,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  ring: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    ...Platform.select({
      web: { boxShadow: `0 0 14px ${Brand.flame}` },
      default: {
        shadowColor: Brand.flame,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
});
