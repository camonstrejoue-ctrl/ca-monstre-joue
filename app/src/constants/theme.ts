/**
 * Palette et typographie reprises du site (css/style.css) pour que l'app ait
 * le même look visuel : fond crème, accents corail, bordures noires épaisses,
 * ombres "dures" façon autocollant, police Baloo 2 (titres) + Nunito (texte).
 */

import '@/global.css';

// Palette de marque, identique à :root dans css/style.css — SAUF coral/
// coralDark/coralLight sur cette branche de test, remplacés par une variante
// "glacée" (bleu glace) qui colle mieux à l'identité Yeti de la mascotte,
// à la demande de l'utilisateur. coral/coralDark/coralLight restent définis
// (les cornes de l'avatar sont peintes en rouge dans les images, donc ce
// rouge reste visible quoi qu'il arrive) mais ice/iceDark/iceLight
// remplacent leur rôle d'accent principal dans l'UI sur cette branche.
export const Brand = {
  coral: '#E8392A',
  coralDark: '#C22C1F',
  coralLight: '#FBE3E0',
  ice: '#2F8FCB',
  iceDark: '#1E6690',
  iceLight: '#D9EEFB',
  green: '#2F9E52',
  greenDark: '#227A3F',
  greenLight: '#E4F5E9',
  black: '#1A1A1A',
  cream: '#F5F5F5',
  creamDark: '#E7E7E7',
  white: '#FFFFFF',
  gray: '#666666',
  grayLight: '#CFCFCF',
} as const;

// Le site n'a pas de mode sombre (marque 100% claire) : l'app n'en propose
// pas non plus, une seule palette toujours utilisée (voir hooks/use-theme.ts).
export const Colors = {
  light: {
    text: Brand.black,
    background: Brand.iceLight,
    backgroundElement: Brand.white,
    // Reste blanc (pas corail plein) : beaucoup d'endroits affichent du texte
    // noir par-dessus cette couleur, qui serait peu lisible sur un corail
    // saturé sans reprendre chaque composant pour passer le texte en blanc.
    backgroundSelected: Brand.white,
    textSecondary: Brand.gray,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

// Correspond à --font-display / --font-body du site.
export const Fonts = {
  display: 'Baloo2_700Bold',
  displaySemiBold: 'Baloo2_600SemiBold',
  displayExtraBold: 'Baloo2_800ExtraBold',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtraBold: 'Nunito_800ExtraBold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Rayons repris de --radius-sm/md/lg du site.
export const Radius = {
  sm: 10,
  md: 18,
  lg: 28,
} as const;

// Épaisseur de bordure noire "autocollant" utilisée sur les cartes/badges du site.
export const StickerBorder = 3;

export const BottomTabInset = 0;
export const MaxContentWidth = 800;
