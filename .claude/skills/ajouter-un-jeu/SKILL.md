---
name: ajouter-un-jeu
description: >
  Ajoute un nouveau jeu de société au site Ça Monstre Joue (fiche jeu dans window.GAMES,
  js/data.js, plus dossier assets/games/<slug>/). Utilise systématiquement ce skill dès que
  l'utilisateur annonce ou colle le contenu d'un nouveau jeu à intégrer — même partiel, même
  sans images, même juste "on ajoute [nom du jeu]" ou "voilà le prochain jeu à mettre en ligne".
  S'applique aussi pour créer le dossier d'assets d'un jeu avant même d'avoir tout le contenu.
---

# Ajouter un nouveau jeu

Ce skill encapsule le workflow "Ajouter un nouveau jeu" documenté dans [CLAUDE.md](../../../CLAUDE.md)
à la racine du projet — lis cette section en entier avant de commencer, elle reste la source de
référence (règles de schéma, suffixes d'images, SEO, tutoiement/vouvoiement). Ce fichier résume la
séquence d'actions et les pièges connus.

## Séquence

1. **Dès l'annonce du jeu**, même sans détails ni images, crée immédiatement le dossier
   `assets/games/<slug>/` (slug = nom du jeu en kebab-case, sans accents).
2. Lis les jeux existants dans `js/data.js` (`window.GAMES`) pour repérer un jeu structurellement
   proche (même type de contenu) et t'aligner sur son schéma exact plutôt que d'improviser des noms
   de champs.
3. Construis l'entrée `window.GAMES` avec les champs suivants, dans cet ordre par convention :
   `slug`, `name`, `categories` (tableau de slugs de catégories — **si l'utilisateur ne les précise
   pas, demande-les, ne devine jamais**), `cover`, `thumbnail`, `heroImages` (tableau), `intro`
   (string ou tableau de paragraphes — préfère un tableau pour une intro longue), `identity`, `fitIntro`
   (optionnel), `fitFor` (tableau), `notFitFor` (tableau), `video`, `spotify`, `gallery` (tableau).
4. `identity` est un objet `{ players, age, duration, year, type, difficulty, note }` où :
   - `difficulty` et `note` sont chacun un objet `{ stars, max, label? }` (max par défaut 6 si omis).
   - `note` est **toujours sur 6 étoiles** (barème suisse — un tooltip l'explique déjà sur "Note de
     Ça Monstre Joue" dans l'UI), donc `stars` reste cohérent avec une échelle sur 6 même si `max`
     est omis.
5. Si une image n'est pas encore fournie pour un champ (`cover`, `thumbnail`, `heroImages`,
   `gallery[].image`...), laisse la valeur vide (`''`) plutôt que d'inventer un chemin — regarde
   comment les jeux existants gèrent ce cas (ex. `daybreak` dans `js/data.js`, commentaire
   "Pas encore d'image reçue") et ajoute le même type de commentaire.
6. Pour les noms de fichiers image à venir, utilise les suffixes attendus par le site (table complète
   dans CLAUDE.md) : `-banniere`, `-vignette`, `-categorie`, `-liste`, `-bandeau`, `-cover`, `-fiche`.
   Si l'utilisateur fournit déjà les images, utilise le skill `optimiser-image` pour les préparer avant
   de les référencer.
7. **`gallery`** relie ce jeu à ses articles (`{ image, articleSlug }`) — si des articles existent déjà
   ou seront ajoutés juste après, vérifie la cohérence croisée avec `window.ARTICLES` (voir le skill
   `ajouter-un-article`).

## Vigilance

- **Ne jamais deviner les catégories.** Si elles ne sont pas données, demande-les explicitement — ce
  champ pilote l'affichage sur les pages de catégorie et l'accueil.
- **Ne jamais reformuler le tu/vous du texte fourni** (intro, `fitFor`, `notFitFor`) — ce contenu reste
  exactement dans la formulation de l'utilisateur, même si elle mélange tu/vous avec le reste du site.
- **Si le contenu fourni ne rentre dans aucun champ existant**, ou diverge du schéma habituel (structure
  différente, information supplémentaire), signale-le explicitement à l'utilisateur et demande s'il faut
  harmoniser — n'improvise pas un nouveau format de ta propre initiative.
- **SEO** : si ce jeu génère une nouvelle page par slug, vérifie que `scripts/generate-seo-pages.js`
  la prend en compte (elle devrait, puisqu'elle boucle sur `window.GAMES`) — pas d'action spécifique
  requise sauf si la structure du jeu introduit un nouveau type de page.
- Une fois l'entrée ajoutée, propose de créer un commit + push (autorisation permanente déjà donnée
  dans CLAUDE.md pour ce projet) après confirmation visuelle que tout s'affiche correctement.
