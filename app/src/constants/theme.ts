/**
 * Palette et typographie reprises du site (css/style.css) pour que l'app ait
 * le même look visuel : fond crème, accents corail, bordures noires épaisses,
 * ombres "dures" façon autocollant, police Baloo 2 (titres) + Nunito (texte).
 */

import '@/global.css';

// Palette de marque, identique à :root dans css/style.css
export const Brand = {
  coral: '#E8392A',
  coralDark: '#C22C1F',
  coralLight: '#FBE3E0',
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

export const Colors = {
  light: {
    text: Brand.black,
    background: Brand.coralLight,
    backgroundElement: Brand.white,
    // Reste blanc (pas corail plein) : beaucoup d'endroits affichent du texte
    // noir par-dessus cette couleur, qui serait peu lisible sur un corail
    // saturé sans reprendre chaque composant pour passer le texte en blanc.
    backgroundSelected: Brand.white,
    textSecondary: Brand.gray,
  },
  dark: {
    // Pas de mode sombre défini sur le site (marque 100% claire) : on garde
    // les mêmes accents mais sur un fond sombre pour rester utilisable.
    text: Brand.white,
    background: Brand.black,
    backgroundElement: '#2A2A2A',
    backgroundSelected: Brand.coralDark,
    textSecondary: Brand.grayLight,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
