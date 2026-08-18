# Types de posts Instagram — Ça Monstre Joue

Banque unique de types de posts (angles), applicable à n'importe quel article du site. Pour un article
donné, 5 à 8 de ces types s'appliqueront généralement — pas besoin de tous les utiliser à chaque fois.

Pour déclencher des posts : donner l'article (ou le jeu) concerné, Claude relit le contenu réel dans
`js/data.js` et propose 5 idées (ou plus) en piochant parmi ces types, avec pour chacune une caption
complète (accroche + corps + CTA + hashtags + lien UTM). Le contenu de fond n'est jamais inventé, toujours
tiré des `blocks` de l'article ou des champs de la fiche jeu.

Ton : tutoiement (cohérent avec l'interface et le ton déjà présent sur le site). Le texte des articles
lui-même n'est jamais reformulé sur le fond, seulement extrait/mis en forme pour Instagram.

## Lien et UTM

`https://www.camonstrejoue.ch/<page>?utm_source=instagram&utm_medium=<emplacement>&utm_campaign=<slug>`

- Article : `/article/<slug>/`, Fiche jeu : `/jeu/<slug>/`
- `utm_medium` : `bio`, `story`, `video` (reel), `post` (lien en légende)

---

## Les types de posts

**1. Confession / anecdote perso**
Repartir d'une anecdote vécue racontée dans l'article (l'extension jamais ouverte d'Alex, la peur de
Camille en ouvrant la boîte d'Eila, la poisse aux dés...). Format le plus authentique, accroche à la
première personne.

**2. Punchline / verdict choc**
Une phrase forte, déjà écrite dans l'article, sortie telle quelle en gros sur un visuel. Ex. *"Les
oiseaux, c'est pas notre truc, pourtant le jeu a su nous happer."* Post court, rapide à produire.

**3. Carrousel pédagogique**
Découpe l'article selon ses sous-parties (`h2`) : 1 slide de thèse, 1 slide par sous-partie, 1 slide de
conclusion/CTA. Le format le plus fidèle au raisonnement complet de l'article.

**4. Débat / sondage**
Poser la question ou la thèse centrale de l'article comme un choix tranché (*"Team A vs Team B, t'es
où ?"*) ou en sticker sondage story. Objectif : faire réagir en commentaire.

**5. Comparaison / analogie**
Si l'article contient une comparaison à autre chose (ex. extension = saison 10 d'une série, achat de jeu
= tendre vers le bonheur), la sortir telle quelle en accroche de reel. Fonctionne au-delà de l'audience
jeux de société.

**6. Checklist / conseils actionnables**
Liste de critères ou conseils pratiques tirés de l'article (ex. les 3 questions à se poser avant
d'acheter une extension, les 3 techniques pour traîner sa moitié en magasin). Format qui s'enregistre et
se partage bien.

**7. Top / classement**
Pour les articles listicle ("Les 3/5 jeux qui..."), un jeu ou un élément par slide de carrousel, avec
l'accroche propre à chacun tirée de l'article.

**8. Avantages / points de frustration**
Quand l'article a une section avis contrastée (points forts vs points qui gâchent un peu), carrousel 2
temps qui reprend ces deux blocs tels quels.

**9. Immersion / récit de partie**
Raconter un moment de partie précis déjà décrit dans l'article (ex. la répartition des personnages du
Seigneur des Anneaux, la fuite finale de Sub Terra II). Bon format reel, ton narratif.

**10. Zoom sur un détail**
Un personnage, un objet de jeu ou un détail marquant mis en avant seul (ex. un personnage d'une compo
type, la mangeoire à oiseaux de Wingspan). Bon format pour varier la fréquence sans épuiser tout
l'article d'un coup — permet aussi de décliner plusieurs posts sur un seul article compo type (un
personnage à la fois).

**11. Le chiffre / fait qui surprend**
Un chiffre ou un fait insolite tiré de l'article en accroche (prix, nombre d'extensions, "n+33"...).
Format très court, efficace en story.

**12. Repartage média existant**
Si l'article/la fiche jeu référence une vidéo ou un reel déjà tourné (`video`, blocs `instagram`),
nouvelle accroche pour republier sans retourner de contenu.

---

## Exemple d'usage

Pour l'article *"Les extensions sont-elles une arnaque ?"*, 5 idées avec des angles différents
piocheraient par exemple dans : confession perso (#1, l'anecdote Catan), carrousel pédagogique (#3, thèse
+ les deux types d'extensions), comparaison/analogie (#5, la saison 10 d'une série), débat (#4, team
"enrichissement" vs team "nouveau jeu déguisé"), checklist (#6, si l'article en contenait une explicite).
