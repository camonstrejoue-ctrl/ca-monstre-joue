// Âge minimum pour accéder à la mise en relation entre joueurs ("Trouver des
// joueurs" : visibilité dans l'annuaire + contact). L'inscription elle-même
// n'a pas de restriction d'âge — seule cette fonctionnalité l'exige, calculée
// à la volée depuis `birthdate` (jamais stockée en dur, donc toujours à jour
// : elle se débloque automatiquement le jour des 18 ans, sans action de
// l'utilisateur).
export const MIN_CONTACT_AGE = 18;

const BIRTHDATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse une date de naissance au format "JJ/MM/AAAA" (saisie utilisateur) en
 * `Date`. Retourne `null` si le format est invalide, la date n'existe pas
 * (ex: 31/02), ou si elle est dans le futur.
 */
export function parseBirthdateInput(input: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate || date.getTime() > Date.now()) return null;
  return date;
}

/** Formate une `Date` en "JJ/MM/AAAA" pour pré-remplir le champ de saisie. */
export function formatBirthdateInput(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Convertit un champ Firestore `birthdate` (Timestamp, ou `Date` déjà
 * convertie par le SDK, ou chaîne ISO pour d'anciennes données) en `Date`.
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'string' && BIRTHDATE_RE.test(value)) return new Date(value);
  return null;
}

/** Âge en années révolues, calculé au jour près à partir d'une date de naissance. */
export function computeAge(birthdate: unknown): number | null {
  const date = toDate(birthdate);
  if (!date) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export function meetsMinAge(birthdate: unknown, minAge: number): boolean {
  const age = computeAge(birthdate);
  return age !== null && age >= minAge;
}
