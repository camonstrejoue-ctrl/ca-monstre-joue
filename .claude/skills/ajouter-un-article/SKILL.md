---
name: ajouter-un-article
description: >
  Ajoute un nouvel article de blog au site Ça Monstre Joue (entrée dans window.ARTICLES,
  js/data.js, liée à une fiche jeu existante). Utilise systématiquement ce skill dès que
  l'utilisateur fournit ou demande la création d'un article, d'une critique, d'une "compo type",
  d'un guide ou de tout autre contenu éditorial lié à un jeu déjà présent sur le site — même
  partiel, même sans images. Couvre aussi la mise à jour de la fiche jeu correspondante pour que
  l'article y apparaisse.
---

# Ajouter un nouvel article

Ce skill encapsule le workflow "Ajouter un nouvel article" documenté dans [CLAUDE.md](../../../CLAUDE.md)
à la racine du projet — lis cette section avant de commencer (elle reste la source de référence pour
le schéma, le SEO, le tutoiement/vouvoiement). Ce fichier résume la séquence et le piège le plus
fréquent.

## Séquence

1. Identifie le jeu concerné (`gameSlug`) dans `window.GAMES` (js/data.js) — s'il n'existe pas encore,
   utilise d'abord le skill `ajouter-un-jeu`.
2. Demande **qui est l'auteur** plutôt que de deviner : `author` doit correspondre exactement à un
   `name` de `window.TEAM` (photo + prénom affichés en haut de l'article, cliquable vers la page équipe).
3. Construis l'entrée `window.ARTICLES` en t'alignant sur le schéma des articles existants du même
   jeu ou d'un jeu similaire : `slug`, `title`, `subtitle` (optionnel), `date`, `author`, `gameSlug`,
   `banner` (optionnel, pour le carrousel d'accueil), `hero` (image en haut de l'article), `cover`
   (vignette utilisée dans "Pour aller plus loin"), `excerpt`, `blocks` (tableau).
4. Les `blocks` supportent plusieurs types : `{ type: 'p', text }` (paragraphe), `{ type: 'h2', text }`
   (sous-titre), `{ type: 'image', src, caption }`, `{ type: 'list', items }`, `{ type: 'char', image,
   name, text }` (fiche personnage, vu dans les articles "compo type"), et
   `{ type: 'spoiler', title, text }` pour du contenu à révéler au clic (accordéon fermé par défaut) —
   utile pour les passages qui gâchent l'histoire d'un jeu narratif.
5. Si des images sont fournies, utilise le skill `optimiser-image` pour les préparer avant de les
   référencer (suffixes attendus : `-banniere`, `-vignette`, `-bandeau` pour un article — table
   complète dans CLAUDE.md).
6. **Étape à ne jamais oublier** : mets à jour le tableau `gallery` du jeu correspondant dans
   `window.GAMES` (`{ image: '<cover ou vignette de l'article>', articleSlug: '<slug de l'article>' }`)
   pour que l'article apparaisse dans la section "Pour aller plus loin" de la fiche jeu. C'est une
   erreur déjà commise une fois sur ce projet — vérifie systématiquement cette liaison avant de
   considérer la tâche terminée.

## Vigilance

- **Ne jamais reformuler le tu/vous du texte fourni** par l'utilisateur dans les `blocks` — ce contenu
  reste exactement dans sa formulation d'origine.
- **`author` doit exister dans `window.TEAM`** — si l'utilisateur donne un prénom qui ne correspond à
  aucun membre, signale l'écart plutôt que de créer une entrée approximative.
- **Vérifie le contenu suspect** : si un passage semble sans rapport avec le jeu concerné (lien vidéo,
  paragraphe qui semble copié d'un autre jeu), signale-le avant de l'intégrer — l'utilisateur copie
  parfois du texte d'un article précédent par erreur.
- **SEO** : chaque article a sa propre page statique générée par `scripts/generate-seo-pages.js`
  (meta description, OG, canonical) — elle se base sur `excerpt`/`cover`, donc un bon `excerpt` et une
  bonne image `cover` améliorent directement le SEO sans travail supplémentaire.
- Une fois l'article ajouté **et** la `gallery` du jeu mise à jour, propose un commit + push (autorisation
  permanente déjà donnée dans CLAUDE.md pour ce projet) après vérification visuelle.
