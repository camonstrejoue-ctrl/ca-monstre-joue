import type { Category, Game } from '@/types/content';

// Port fidèle de la logique du chatbot "P'tit Monstre" du site (js/main.js,
// initChatbot). Même questions, même ordre, même façon de filtrer les jeux.

export interface ChatOption<T = unknown> {
  label: string;
  value: T;
}

export interface ChatStep {
  key: string;
  question: string;
  options: (categories: Category[]) => ChatOption[];
  match: (game: Game, value: unknown) => boolean;
}

function parseRange(str: string): { min: number; max: number } {
  const nums = (str.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return { min: 0, max: Infinity };
  if (nums.length === 1) return { min: nums[0], max: Infinity };
  return { min: nums[0], max: nums[1] };
}

function parseMinAge(str: string): number {
  const m = str.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

export const STEPS: ChatStep[] = [
  {
    key: 'category',
    question: 'Quel type de jeu recherches-tu ?',
    options: (categories) => [
      ...categories.map((c) => ({ label: c.name, value: c.slug as string | null })),
      { label: 'Peu importe', value: null },
    ],
    match: (g, value) => value === null || g.categories.includes(value as string),
  },
  {
    key: 'players',
    question: 'Vous serez combien à jouer ?',
    options: () => [
      { label: '1-2 joueurs', value: [1, 2] },
      { label: '3-4 joueurs', value: [3, 4] },
      { label: '5-6 joueurs', value: [5, 6] },
      { label: '7 joueurs ou plus', value: [7, Infinity] },
      { label: 'Peu importe', value: null },
    ],
    match: (g, value) => {
      if (!value) return true;
      const [lo, hi] = value as [number, number];
      const range = parseRange(g.identity.players);
      return range.min <= hi && range.max >= lo;
    },
  },
  {
    key: 'age',
    question: 'Quel est l’âge des joueurs ?',
    options: () => [
      { label: 'Enfants (6-9 ans)', value: 8 },
      { label: 'Ados (10-13 ans)', value: 12 },
      { label: '14 ans et plus', value: 17 },
      { label: 'Peu importe', value: null },
    ],
    match: (g, value) => value === null || parseMinAge(g.identity.age) <= (value as number),
  },
  {
    key: 'duration',
    question: 'Combien de temps voulez-vous jouer ?',
    options: () => [
      { label: 'Moins de 30 min', value: [0, 30] },
      { label: '30 à 60 min', value: [30, 60] },
      { label: '60 à 90 min', value: [60, 90] },
      { label: 'Plus de 90 min', value: [90, Infinity] },
      { label: 'Peu importe', value: null },
    ],
    match: (g, value) => {
      if (!value) return true;
      const [lo, hi] = value as [number, number];
      const range = parseRange(g.identity.duration);
      return range.min <= hi && range.max >= lo;
    },
  },
  {
    key: 'difficulty',
    question: 'Quel niveau de complexité recherches-tu ?',
    options: () => [
      { label: 'Facile', value: [1, 2] },
      { label: 'Moyenne', value: [3, 4] },
      { label: 'Difficile', value: [5, 6] },
      { label: 'Peu importe', value: null },
    ],
    match: (g, value) => {
      if (!value) return true;
      const [lo, hi] = value as [number, number];
      return g.identity.difficulty.stars >= lo && g.identity.difficulty.stars <= hi;
    },
  },
];

export function matchingGames(games: Game[], answers: Record<string, unknown>): Game[] {
  return games.filter((g) => STEPS.every((step) => step.match(g, answers[step.key])));
}
