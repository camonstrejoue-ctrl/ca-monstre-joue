import type { Article, Game, SiteContent } from '@/types/content';

export function findGame(content: SiteContent, slug: string): Game | undefined {
  return content.games.find((g) => g.slug === slug);
}

export function findArticle(content: SiteContent, slug: string): Article | undefined {
  return content.articles.find((a) => a.slug === slug);
}

export function findCategory(content: SiteContent, slug: string) {
  return content.categories.find((c) => c.slug === slug);
}

export function gamesInCategory(content: SiteContent, categorySlug: string): Game[] {
  return content.games
    .filter((g) => g.categories.includes(categorySlug))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export function recentArticles(content: SiteContent, count = 3): Article[] {
  return [...content.articles]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, count);
}

export function articlesForGame(content: SiteContent, gameSlug: string): Article[] {
  return content.articles.filter((a) => a.gameSlug === gameSlug);
}

export function galleryForGame(content: SiteContent, game: Game) {
  return game.gallery
    .map((item) => ({ ...item, article: findArticle(content, item.articleSlug) }))
    .filter((item) => item.article);
}

export function heroImagesForGame(game: Game): string[] {
  if (game.heroImages?.length) return game.heroImages;
  const images = [game.cover, ...game.gallery.map((g) => g.image)].filter(Boolean) as string[];
  return images.length ? images : [];
}
