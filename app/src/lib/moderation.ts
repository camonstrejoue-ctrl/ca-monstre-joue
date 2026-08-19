// Âge minimum pour accéder à la mise en relation entre joueurs (recherche,
// contact). Un profil dont l'âge n'est pas déclaré est traité comme non
// éligible (ni pour voir les contacts des autres, ni pour être contacté).
export const MIN_CONTACT_AGE = 18;

export function meetsContactAge(age: number | undefined | null): boolean {
  return typeof age === 'number' && age >= MIN_CONTACT_AGE;
}
