# Ça Monstre Joue — État du projet

Résumé de ce qu'on a construit ensemble : comment le site fonctionne, ce qu'il contient, et où on en est.
Dernière mise à jour : 2026-09-09.

---

## 1. Comment le site fonctionne

Pas de CMS, pas de base de données pour le contenu : **tout vit dans un seul fichier**,
[js/data.js](../js/data.js) (`window.GAMES`, `window.ARTICLES`, `window.CATEGORIES`, `window.TEAM`,
`window.HOME_BANNERS`).

**Le circuit, à chaque changement de contenu :**
1. On décide ensemble quoi ajouter/changer.
2. J'édite `js/data.js`.
3. `scripts/generate-seo-pages.js` génère les pages statiques par jeu/article/catégorie (titre, meta
   description, données structurées propres à chacune) + `sitemap.xml` + `llms.txt`.
4. Commit + push vers `origin main`.
5. GitHub Actions déploie automatiquement (~1-2 min) sur GitHub Pages.

Aucune étape manuelle une fois le contenu écrit — sauf pour les changements SEO **structurants**
(architecture d'URLs, suppression/fusion de pages), qui demandent validation avant push
(voir [docs/seo-geo-expert.md](seo-geo-expert.md)).

## 2. Le contenu, en chiffres

| | |
|---|---|
| Fiches jeu | 12 |
| Articles & guides | 13 |
| Catégories | 6 (jeux à deux, coopératifs, d'ambiance, de stratégie, narratifs, famille) |
| Équipe | 4 personnes |

## 3. Le plan du site

| Page | Généré par | Contenu |
|---|---|---|
| Accueil (`index.html`) | — | Bandeau pub, carrousel, catégories, CTA newsletter, raccourci Guides, FAQ |
| Catégorie (`categorie/<slug>/`) | 1 par catégorie (6) | Jeux classés par ordre alphabétique |
| Fiche jeu (`jeu/<slug>/`) | 1 par jeu (12) | Identité, avis, vidéo, conseil P'tit Monstre, "Pour aller plus loin" |
| Article (`article/<slug>/`) | 1 par article (13) | Critique ou guide, lié à un jeu ou général |
| Tous les jeux (`tous-les-jeux.html`) | — | Liste complète, navigation alphabétique |
| Guides (`guides.html`) | — | Liste des articles marqués `guide: true` |
| Équipe (`equipe.html`) | — | 4 cartes (bio, jeu préféré, réseaux) |
| Contact / Agenda | — | Formulaires connectés à Firebase (partagé avec l'app) |
| App (`app.html`) | — | Page "bientôt disponible" |

## 4. Les fonctionnalités

- **P'tit Monstre** : chatbot de recommandation de jeu, présent sur tout le site.
- **Newsletter Substack** : trois points de conversion — bloc "sticker" en fin d'article/fiche jeu et sur
  toutes les pages de listing (accueil, catégories, tous-les-jeux, guides), petit widget dans le footer,
  et bandeau publicitaire en haut de l'accueil (avec un visuel dédié pour mobile, format 335×100).
- **Recherche** : par nom de jeu ou d'article, accessible depuis le menu sur toutes les pages.
- **Formulaires Contact / Agenda** : écrivent dans Firebase (projet partagé avec l'app), consultables
  depuis la console Firebase.
- **Agenda synchronisé** : un événement validé côté app apparaît automatiquement sur le site.
- **Google Analytics 4** : même propriété que l'app, reporting unifié blog + application.

## 5. SEO & GEO

**Technique (déjà en place, maintenu automatiquement à chaque page générée) :**
- Titre, meta description, Open Graph/Twitter, canonical uniques par page.
- `sitemap.xml` et `robots.txt` — ce dernier autorise explicitement les robots IA (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended…), choix rare qui vise les moteurs de réponse (GEO).
- `llms.txt` généré automatiquement, résume le site pour les IA.
- Données structurées (JSON-LD) : `BreadcrumbList` partout, `Review` avec un auteur `Person` réel
  (plus `Organization` générique), `Article`, `FAQPage` sur l'accueil, `CollectionPage` par catégorie.

**Cadre de collaboration :**
- [docs/seo-geo-expert.md](seo-geo-expert.md) : rôle et méthodologie d'audit adoptés pour tout le
  travail SEO/GEO sur ce projet.
- [docs/idees-articles-seo.md](idees-articles-seo.md) : backlog vivant d'idées d'articles (titre,
  mots-clés, intention, angle GEO), retiré au fur et à mesure des publications. Contient notamment
  3 sujets identifiés comme "à forte conversion" après recherche concurrentielle réelle (le plus
  prometteur : un guide cadeau "édition Suisse romande", angle où aucun média éditorial concurrent
  n'a été trouvé — seulement des boutiques).

**Audit marketing (fait le 2026-09-02, 3 axes travaillés) :**
1. Newsletter étendue à tout le site (fait).
2. Cadence de publication — dates des 13 articles réétalées pour éviter tout trou visible (fait).
3. Trous de contenu du catalogue — 6 jeux sur 12 sans article encore ; backlog prêt, contenu à écrire.

**Timing de publication recommandé** (recherche du 2026-09-08, sources dans l'historique de
conversation) : nouvel article le mercredi matin, note Substack de relais le mercredi 18h-20h (heure
suisse, ajustée depuis les données globales Substack qui sont à dominante américaine).

## 6. Comment on travaille ensemble

- [CLAUDE.md](../CLAUDE.md) : règles permanentes du projet (conventions, workflow git, règles
  éditoriales tu/vous, suffixes d'images, poids/format).
- Commit + push automatiques après chaque changement notable — **sauf** les changements SEO/contenu
  structurants, qui demandent validation explicite (règle ajoutée le 2026-09-03).
- Mémoire persistante entre sessions (fichiers dans `~/.claude/.../memory/`) : lancement en 2 étapes,
  checklist de lancement, cadre SEO/GEO, coordination avec la session app, règle sur les dates
  d'articles, bibliothèque de gabarits Instagram, le Hub de rédaction interne.

## 7. L'équipe

| Nom | Rôle | Essentiel |
|---|---|---|
| Alex | L'insupportable chanceux | Fan de jeux coopératifs et narratifs |
| Camille | La poisseuse | Préfère les coopératifs, pour éviter la frustration |
| Guillaume | Le touche-à-tout | Toujours celui qui lit et explique les règles |
| Prune | La mauvaise perdante | Ex-Mylène, revenue sous ce nom ; toujours pas remise de 2020 aux Aventuriers du Rail |

## 8. Où on en est

| Statut | Élément |
|---|---|
| ⏳ En attente | DNS + GitHub Pages — seule étape qui empêche le site d'être joignable |
| ⏳ En attente | Photos de Guillaume et Prune (chemins actuels non pourvus) |
| ⏳ En attente | Vrais liens Instagram/Facebook/TikTok (retour prévu le 1er novembre) |
| ⏳ En attente | Publication de l'app sur les stores |
| ⏳ En attente | Contenu du backlog SEO à écrire (6 jeux sans article, guide cadeau Suisse romande…) |
| ✅ Fait | Lancement réduit (app/agenda/réseaux masqués sauf Substack + YouTube) |
| ✅ Fait | SEO/GEO technique (sitemap, données structurées, llms.txt, robots.txt) |
| ✅ Fait | Newsletter étendue à tout le site + bug bannière mobile corrigé |
| ✅ Fait | Équipe à jour (4 membres, bios complètes) |
| ✅ Fait | 7 notes Substack pré-lancement rédigées, prêtes à poster |

---

*Ce fichier résume l'historique de travail — pas la documentation technique elle-même (voir
[CLAUDE.md](../CLAUDE.md) pour ça). À mettre à jour au fil des prochaines sessions plutôt que de le
laisser devenir obsolète.*
