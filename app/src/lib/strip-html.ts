// Les blocs 'p'/'list' du contenu peuvent contenir de petits bouts de HTML
// (ex: <a href="...">texte</a>) écrits pour le site web. React Native ne rend
// pas de HTML, donc on ne garde que le texte visible.
export function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}
