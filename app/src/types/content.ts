export interface Category {
  slug: string;
  name: string;
  image?: string;
}

export interface StarRating {
  stars: number;
  max?: number;
  label?: string;
}

export interface Identity {
  players: string;
  age: string;
  duration: string;
  year: string;
  type: string;
  difficulty: StarRating;
  note: StarRating;
}

export interface GalleryItem {
  image: string;
  articleSlug: string;
}

export interface Game {
  slug: string;
  name: string;
  // Identifiant BoardGameGeek (BGG) du jeu, pour relier une entrée de
  // ludothèque (ajoutée via la recherche BGG) à sa fiche sur notre site
  // quand elle existe.
  bggId?: string;
  categories: string[];
  cover: string;
  thumbnail?: string;
  heroImages?: string[];
  intro: string | string[];
  identity: Identity;
  fitIntro?: string;
  fitFor: string[];
  notFitFor: string[];
  video: string;
  spotify: string;
  gallery: GalleryItem[];
}

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'char'; image: string; name: string; text: string }
  | { type: 'spoiler'; title: string; text: string };

export interface Article {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  gameSlug: string;
  banner?: string;
  hero?: string;
  cover: string;
  excerpt: string;
  blocks: ArticleBlock[];
}

export interface TeamMember {
  name: string;
  linkedin?: string;
  role: string;
  bio: string;
  favoriteGame: string;
  photo: string;
}

export interface SiteContent {
  generatedAt: string;
  games: Game[];
  articles: Article[];
  categories: Category[];
  team: TeamMember[];
  socials: Record<string, string>;
}
