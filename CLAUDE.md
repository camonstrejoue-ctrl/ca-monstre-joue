# Ça Monstre Joue — Notes pour Claude Code

Site statique (HTML/CSS/JS, sans build ni backend) présentant le blog de jeux de société Ça Monstre Joue.

## Workflow Git

L'utilisateur veut toujours garder **deux sauvegardes à jour** : une locale (commit) et une sur GitHub (push).
Après chaque changement notable (nouveau jeu, nouvel article, modification de design significative),
crée un commit avec un message clair puis pousse-le vers `origin main` — sans attendre que ce soit demandé
explicitement à chaque fois, cette instruction vaut comme autorisation permanente pour ce projet.

## Aperçu local

Le site n'a pas de serveur — pour le prévisualiser (notamment les vidéos YouTube, qui ne fonctionnent pas
en `file://`), lancer :

```bash
powershell -ExecutionPolicy Bypass -File "serve.ps1"
```

puis ouvrir `http://localhost:8752/`.

## Suffixes de noms de fichiers image

Quand l'utilisateur ajoute une image, le suffixe indique où elle doit être utilisée :

| Suffixe | Ratio | Usage | Champ de données |
|---|---|---|---|
| `-banniere` | 16:9 | Carrousel de la page d'accueil | `banner` (article) |
| `-vignette` | 1:1 | Miniature d'un article, affichée en bas des pages jeu ("Pour aller plus loin") | `cover` (article) |
| `-categorie` | 1:1 | Tuile d'une catégorie sur l'accueil | `image` (catégorie) |
| `-liste` | 1:1 | Vignette d'un jeu sur une page de catégorie | `thumbnail` (jeu) |
| `-bandeau` | 32:9 | Image tout en haut d'une page d'article | `hero` (article) |
| `-cover` | 16:9 | Image en haut d'une page jeu | `cover` (jeu) |
| `-fiche` | 16:9 à 21:9 | Carrousel tournant en haut d'une fiche jeu | `heroImages` (jeu, tableau) |

Sans suffixe reconnu, l'image est identifiée par le contexte de la demande (photo de partie, carte de
personnage, couverture de jeu, etc.).

## Ajouter un nouveau jeu

1. Dès que l'utilisateur annonce un nouveau jeu (même sans images), créer immédiatement le dossier
   `assets/games/<slug>/`.
2. Ajouter l'entrée dans `window.GAMES` (js/data.js) : si les catégories ne sont pas précisées, les
   demander plutôt que de deviner.
3. `identity.difficulty` et `identity.note` sont des objets `{ stars, max, label? }` (étoiles, max par
   défaut 6). `identity.note` est systématiquement sur 6 étoiles (barème suisse — un tooltip l'explique
   déjà sur "Note de Ça Monstre Joue").
4. `intro` peut être une chaîne ou un tableau de paragraphes (un tableau donne un texte plus aéré, à
   préférer pour les intros longues).
5. Respecter le même schéma que les jeux existants dans `window.GAMES` (mêmes champs, même structure
   `identity`, mêmes conventions). Si le contenu fourni par l'utilisateur pour ce nouveau jeu diverge du
   schéma existant (champ manquant, structure différente, information qui ne rentre dans aucun champ
   actuel), le signaler et demander s'il faut harmoniser plutôt que d'improviser un nouveau format.

## Ajouter un nouvel article

1. Ajouter l'entrée dans `window.ARTICLES` (js/data.js), avec `gameSlug` pointant vers le bon jeu.
2. **Ne pas oublier** de mettre à jour le tableau `gallery` du jeu correspondant (`{ image, articleSlug }`)
   pour que l'article apparaisse dans la section "Pour aller plus loin" de la fiche jeu — c'est une erreur
   déjà faite une fois, à ne pas répéter.
3. Un bloc `{ type: 'spoiler', title, text }` est disponible pour du contenu à révéler au clic
   (accordéon fermé par défaut), utile pour les passages qui gâchent l'histoire d'un jeu narratif.
4. Ajouter `author: '<Prénom>'`, qui doit correspondre exactement à un `name` de `window.TEAM` (photo +
   prénom affichés en haut de l'article, cliquable vers la page équipe) — demander qui a écrit l'article
   plutôt que de deviner.

## Tutoiement (règle éditoriale, depuis le 2026-08-10)

Tout le contenu du site s'adresse au lecteur en tutoiement, jamais en vouvoiement — que ce soit dans
`js/data.js` (intros de jeux, `fitIntro`, blocs d'articles) ou dans le texte statique des pages HTML.
Toute nouvelle rédaction (nouveau jeu, nouvel article, nouveau texte d'interface) doit être écrite
directement en tutoiement, sans qu'il soit besoin de le redemander.

## Optimisation SEO (à maintenir et améliorer, pas seulement préserver)

Le site a reçu une passe SEO complète (2026-08-08) : un `<h1>` unique par page, meta description +
Open Graph + Twitter Card + `rel="canonical"` sur chaque gabarit, tous les liens internes en
root-relative (`/jeu.html`, pas `jeu.html`), des pages statiques générées par jeu/article/catégorie
(`scripts/generate-seo-pages.js`, branché dans `.github/workflows/deploy.yml`) avec `sitemap.xml` et
`robots.txt`. Domaine de référence : `https://www.camonstrejoue.ch`.

Toute modification ou nouvelle fonctionnalité doit **respecter ces standards et les améliorer si
l'occasion se présente**, pas seulement éviter de les casser :
- Toute nouvelle page a un `<h1>` unique, une meta description, des balises OG/Twitter et un canonical.
- Tout lien interne (HTML statique ou généré en JS) est en root-relative (`/xxx.html`), jamais relatif.
- Si une nouvelle page « par slug » est ajoutée (sur le modèle jeu/article/catégorie), pense à l'intégrer
  à `scripts/generate-seo-pages.js` pour qu'elle ait sa propre page statique + entrée sitemap.
- Un nouveau champ de contenu qui pourrait enrichir une meta description ou une image Open Graph est une
  bonne occasion d'améliorer ce qui existe déjà, pas seulement de faire le minimum demandé.

## Tracking Google Analytics 4 et liens UTM

Le site a un tag GA4 (ID `G-2ST1V87HQW`, propriété partagée avec le projet Firebase de l'app pour un
reporting unifié blog + app) posé juste après `<head>` sur chaque gabarit HTML (`index.html`, `jeu.html`,
`article.html`, `categorie.html`, `contact.html`, `equipe.html`, `tous-les-jeux.html`) — donc aussi sur
les pages générées automatiquement par `scripts/generate-seo-pages.js`, qui copient ces gabarits. Toute
nouvelle page HTML statique du même type doit recevoir le même snippet.

Convention UTM pour tout lien vers le site posté sur les réseaux sociaux (Instagram, TikTok, YouTube...) :

`https://www.camonstrejoue.ch/<page>?utm_source=<réseau>&utm_medium=<emplacement>&utm_campaign=<contenu>`

- `utm_source` : réseau d'origine — `instagram`, `tiktok`, `youtube`, `facebook`...
- `utm_medium` : type d'emplacement — `bio` (lien fixe en bio), `story`, `video` (description vidéo)
- `utm_campaign` : slug du jeu/article promu (ex. `catan`), ou nom de campagne générale (ex. `lancement`)

Exemples :
- Lien fixe en bio Instagram : `?utm_source=instagram&utm_medium=bio&utm_campaign=lien_bio`
- Story Instagram vers une fiche jeu précise : `/jeu/catan/?utm_source=instagram&utm_medium=story&utm_campaign=catan`
- Description YouTube d'une vidéo sur un jeu : `/jeu/<slug>/?utm_source=youtube&utm_medium=video&utm_campaign=<slug>`

Le lien vers l'app (bouton "Vers l'app" du menu, bouton "Regarde ce contenu sur l'app" du bloc partage)
pointe vers `/app.html` (page "bientôt disponible", en attendant la publication sur les stores), avec la
même convention UTM appliquée depuis le blog lui-même : `utm_source=blog`, `utm_medium=nav` (menu) ou
`partage` (bloc partage jeu/article), `utm_campaign=lien_menu` ou slug du contenu partagé — pour
distinguer dans GA4 le trafic blog → app. Quand l'app sera publiée sur les stores, remplacer les hrefs de
`/app.html` par les vraies URLs de store (en gardant les mêmes paramètres UTM), et remplacer le contenu de
`app.html` par une redirection ou une page de présentation complète.

## Poids et format des images

Dès que l'utilisateur fournit une nouvelle image (photo), la convertir directement au bon format et au
poids le plus léger possible avant de l'utiliser, sans qu'il ait besoin de le demander :
- Redimensionner : 2400px maximum sur le plus grand côté (largement suffisant pour tous les usages du
  site, y compris en écran retina).
- Recompresser en JPEG qualité ~82 (visuellement quasi sans perte, standard web).
- Convertir en JPEG les PNG qui sont en réalité des photos (le PNG est un format sans perte, très mauvais
  pour ce type de contenu) — sauf les logos/icônes qui ont besoin de transparence
  (`assets/logo.png`, `assets/monstre.png`, `assets/favicon.svg`, `assets/team/group.svg`) : ceux-là ne
  se touchent pas.
- Respecter l'orientation EXIF de la photo source avant de la recompresser (sinon risque de photo
  pivotée après traitement).
- Le nom de fichier ne change pas, seule l'extension change si le format change (`.png` → `.jpg`) — dans
  ce cas, mettre à jour la référence correspondante dans `js/data.js`.
- Objectif de référence (déjà atteint sur l'ensemble du site le 2026-08-08) : aucune image de plusieurs
  Mo, le dossier `assets/` complet doit rester de l'ordre de quelques dizaines de Mo max.

## Vigilance sur le contenu fourni par l'utilisateur

L'utilisateur copie-colle parfois du texte d'un jeu précédent par erreur dans la description d'un nouveau
jeu (ex. un lien vidéo ou un paragraphe entier réutilisé). Si un passage semble sans rapport avec le reste
de la description (thème différent, lien identique à un jeu précédent), le signaler avant de l'intégrer
plutôt que de l'ajouter tel quel.
