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

function primaryName(item: any): string {
  const names = asArray(item.name);
  const primary = names.find((n) => n['@_type'] === 'primary') ?? names[0];
  return primary?.['@_value'] ?? 'Sans titre';
}

export interface BggGame {
  bggId: string;
  name: string;
  yearPublished?: number;
  thumbnail?: string;
}

export async function searchBgg(query: string): Promise<BggGame[]> {
  if (!TOKEN) throw new Error('BGG non configuré.');
  const data = await bggFetch(`/search?query=${encodeURIComponent(query)}&type=boardgame`);
  const items = asArray(data?.items?.item);
  return items.slice(0, 20).map((item) => ({
    bggId: String(item['@_id']),
    name: primaryName(item),
    yearPublished: item.yearpublished?.['@_value']
      ? Number(item.yearpublished['@_value'])
      : undefined,
  }));
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
