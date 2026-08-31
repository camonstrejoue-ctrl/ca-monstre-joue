/**
 * Détection/normalisation légère de liens saisis à la main dans un champ
 * texte (ex: "www.exemple.ch" sans protocole) — utilisé pour rendre un
 * champ cliquable sans obliger l'utilisateur à taper "https://".
 */

const URL_LIKE_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

/** true si la chaîne ressemble à une URL/un nom de domaine, avec ou sans protocole. */
export function isUrlLike(value: string): boolean {
  return URL_LIKE_RE.test(value.trim());
}

/** Ajoute "https://" si absent, pour obtenir une URL utilisable par Linking.openURL. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
