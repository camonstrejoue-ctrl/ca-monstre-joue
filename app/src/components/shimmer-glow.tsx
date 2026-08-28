import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

// Petites étincelles positionnées à cheval sur les bords de la carte,
// chacune avec son propre délai/durée pour scintiller de façon décalée
// plutôt que toutes en même temps (effet plus naturel).
const SPARKLE_SPOTS: { top: `${number}%`; left: `${number}%`; size: number; delay: number; duration: number }[] = [
  { top: '-8%', left: '12%', size: 15, delay: 0, duration: 1900 },
  { top: '18%', left: '97%', size: 11, delay: 500, duration: 1600 },
  { top: '55%', left: '-4%', size: 10, delay: 950, duration: 2100 },
  { top: '82%', left: '90%', size: 13, delay: 250, duration: 1800 },
  { top: '96%', left: '22%', size: 9, delay: 1300, duration: 1700 },
];

function Sparkle({
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
      <Ionicons name="sparkles" size={size} color={Brand.gold} />
    </Animated.View>
  );
}

/**
 * Contour doré qui "respire" (opacité animée en boucle) + étincelles qui
 * scintillent tout autour — demandé pour mettre en avant le bloc Agenda
 * sur l'accueil. Générique : n'importe quel enfant peut être enveloppé,
 * l'anneau colle au `radius` fourni. `opacity`/`transform` uniquement
 * (native driver), pour rester fluide même sur un appareil modeste.
 */
export function ShimmerGlow({ children, radius }: { children: ReactNode; radius: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.container}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { borderRadius: radius, opacity: ringOpacity }]}
      />
      {SPARKLE_SPOTS.map((spot, i) => (
        <Sparkle key={i} {...spot} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  ring: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: Brand.gold,
    ...Platform.select({
      web: { boxShadow: `0 0 12px ${Brand.gold}` },
      default: {
        shadowColor: Brand.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
});
