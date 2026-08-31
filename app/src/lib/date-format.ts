/**
 * Conversion entre le format de stockage interne des dates ("AAAA-MM-JJ",
 * choisi pour que le tri/la comparaison de chaînes reste chronologique —
 * utilisé par Firestore orderBy sur `events`, et par le tri local des
 * souvenirs) et le format saisi/affiché à l'utilisateur ("JJ-MM-AAAA", plus
 * naturel en français). Rien ne doit stocker le format JJ-MM-AAAA : il ne
 * doit exister qu'à la frontière saisie/affichage.
 */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_RE = /^(\d{2})-(\d{2})-(\d{4})$/;

/** "2026-09-15" → "15-09-2026". Retourne la valeur telle quelle si elle n'est pas au format attendu. */
export function isoToDisplayDate(iso: string): string {
  const match = ISO_RE.exec(iso.trim());
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

/**
 * "15-09-2026" → "2026-09-15". Retourne `null` si le format est invalide ou
 * si la date n'existe pas réellement (ex: 31-02-2026).
 */
export function displayToIsoDate(display: string): string | null {
  const match = DISPLAY_RE.exec(display.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return `${year}-${month}-${day}`;
}
