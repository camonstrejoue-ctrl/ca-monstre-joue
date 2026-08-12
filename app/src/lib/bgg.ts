import { XMLParser } from 'fast-xml-parser';

// Recherche de jeux via l'API XML de BoardGameGeek (boardgamegeek.com/xmlapi2).
// Nécessite une application enregistrée et approuvée par BGG
// (boardgamegeek.com/applications) ainsi qu'un jeton d'autorisation, renseigné
// dans app/.env.local via EXPO_PUBLIC_BGG_APP_TOKEN. Appelée directement
// depuis l'app (pas de serveur intermédiaire) — voir la discussion sur ce
// choix dans l'historique du projet : jeton exposé côté client, risque jugé
// faible à cette échelle.
const TOKEN = process.env.EXPO_PUBLIC_BGG_APP_TOKEN;
export const isBggConfigured = Boolean(TOKEN);

// Le domaine doit être utilisé SANS "www" (exigence de BGG pour les requêtes
// authentifiées).
const BASE_URL = 'https://boardgamegeek.com/xmlapi2';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

async function bggFetch(path: string): Promise<any> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!response.ok) throw new Error(`Réponse BGG ${response.status}`);
  const xml = await response.text();
  return parser.parse(xml);
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// fast-xml-parser ne décode pas toujours les entités numériques (ex: &#039;)
// à l'intérieur des valeurs d'attributs — filet de sécurité manuel.
function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'');
}

function primaryName(item: any): string {
  const names = asArray(item.name);
  const primary = names.find((n) => n['@_type'] === 'primary') ?? names[0];
  return decodeEntities(primary?.['@_value'] ?? 'Sans titre');
}

export interface BggGame {
  bggId: string;
  name: string;
  yearPublished?: number;
  thumbnail?: string;
}

// L'endpoint /search de BGG ne renvoie ni image ni vignette (seulement
// id/nom/année) : il faut un second appel à /thing pour ça. On peut lui
// passer plusieurs id séparés par des virgules en un seul appel.
async function getThumbnails(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const data = await bggFetch(`/thing?id=${ids.join(',')}`);
  const items = asArray(data?.items?.item);
  const map: Record<string, string> = {};
  for (const item of items) {
    if (item.thumbnail) map[String(item['@_id'])] = item.thumbnail;
  }
  return map;
}

export async function searchBgg(query: string): Promise<BggGame[]> {
  if (!TOKEN) throw new Error('BGG non configuré.');
  const data = await bggFetch(`/search?query=${encodeURIComponent(query)}&type=boardgame`);
  const items = asArray(data?.items?.item);
  const games = items.slice(0, 20).map((item) => ({
    bggId: String(item['@_id']),
    name: primaryName(item),
    yearPublished: item.yearpublished?.['@_value']
      ? Number(item.yearpublished['@_value'])
      : undefined,
  }));

  try {
    const thumbnails = await getThumbnails(games.map((g) => g.bggId));
    return games.map((g) => ({ ...g, thumbnail: thumbnails[g.bggId] }));
  } catch {
    // Si le second appel échoue, on garde quand même les résultats de recherche
    // (sans image plutôt que pas de résultats du tout).
    return games;
  }
}

export async function getBggGameDetails(bggId: string): Promise<BggGame | null> {
  if (!TOKEN) throw new Error('BGG non configuré.');
  const data = await bggFetch(`/thing?id=${encodeURIComponent(bggId)}`);
  const item = asArray(data?.items?.item)[0];
  if (!item) return null;
  return {
    bggId: String(item['@_id']),
    name: primaryName(item),
    yearPublished: item.yearpublished?.['@_value']
      ? Number(item.yearpublished['@_value'])
      : undefined,
    thumbnail: item.thumbnail,
  };
}
