---
name: optimiser-image
description: >
  Redimensionne et recompresse une image (photo) avant de l'intégrer au site Ça Monstre Joue.
  Utilise systématiquement ce skill dès qu'un fichier image est fourni par l'utilisateur pour
  être ajouté au site — nouvelle photo de jeu, image d'article, bannière, vignette, peu importe
  le suffixe — AVANT de la copier dans assets/ et de la référencer dans js/data.js. Ne s'applique
  pas aux logos/icônes à transparence déjà identifiés comme exceptions (voir ci-dessous).
---

# Optimiser une image avant intégration

Encapsule la section "Poids et format des images" de [CLAUDE.md](../../../CLAUDE.md) — objectif :
aucune image de plusieurs Mo sur le site, dossier `assets/` qui reste léger, sans que l'utilisateur
ait à le demander à chaque fois.

## Exceptions — ne jamais toucher

Ces fichiers ont besoin de transparence, ne les fais **jamais** passer par ce skill :
`assets/logo.png`, `assets/monstre.png`, `assets/favicon.svg`, `assets/team/group.svg`.
Plus généralement, tout PNG qui est un logo/icône (pas une photo) reste en PNG intact.

## Ce que fait l'optimisation

- Redimensionne à 2400px max sur le plus grand côté (suffisant pour tous les usages du site, y
  compris écrans retina) — jamais d'agrandissement d'une image plus petite.
- Recompresse en JPEG qualité ~82 (quasi sans perte visuelle, standard web).
- Convertit en JPEG les PNG qui sont en réalité des photos (le PNG est sans perte, très lourd pour
  ce type de contenu).
- Respecte l'orientation EXIF avant recompression (sinon risque de photo pivotée après traitement).

## Comment l'exécuter

Un script Node autonome fait le travail : `scripts/optimize-image.js`, à côté de ce fichier.

1. Vérifie que `sharp` est disponible dans le dossier du skill ; sinon installe-le une seule fois
   (l'installation est locale au skill, ne touche pas au projet qui n'a pas de `node_modules`) :
   ```bash
   npm install --no-save --prefix ".claude/skills/optimiser-image" sharp
   ```
2. Pour chaque image à traiter :
   ```bash
   node ".claude/skills/optimiser-image/scripts/optimize-image.js" "chemin/vers/image.jpg"
   ```
   Le script redimensionne, recompresse, et si c'est un PNG-photo, écrit un `.jpg` et supprime
   l'original `.png` (même nom de fichier, extension changée). Il affiche en sortie JSON le chemin
   final et si le nom de fichier a changé (`renamed: true/false`).
3. **Si `renamed: true`** (conversion `.png` → `.jpg`), mets à jour la référence correspondante dans
   `js/data.js` avec la nouvelle extension — c'est la seule chose à modifier manuellement, le nom de
   fichier lui-même ne change pas.
4. Pour ajuster les valeurs par défaut si besoin ponctuel : `--max 2400`, `--quality 82`,
   `--keep-format` (désactive la conversion PNG→JPEG, utile pour une exception ponctuelle en dehors
   de la liste ci-dessus si l'utilisateur le demande explicitement).

## Suffixes de noms de fichiers

Le suffixe du nom de fichier indique où l'image sera utilisée sur le site (ratio attendu, champ de
données cible) — table complète dans CLAUDE.md (`-banniere`, `-vignette`, `-categorie`, `-liste`,
`-bandeau`, `-cover`, `-fiche`). Ce skill ne recadre pas au ratio (il redimensionne sans déformer,
proportionnellement) — le ratio doit déjà être correct dans la photo source ou géré par le CSS du
site ; signale à l'utilisateur si une image fournie semble avoir un ratio très éloigné de l'usage
prévu par son suffixe.
