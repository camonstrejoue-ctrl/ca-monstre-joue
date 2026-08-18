# Types de posts Instagram — Ça Monstre Joue

Banque de types de posts (angles), optimisée pour 3 objectifs : **interactions** (commentaires, partages,
sauvegardes), **abonnés** (portée au-delà des gens qui suivent déjà le compte) et **trafic** (clics vers
le blog / l'app). Un seul post ne maximise jamais les 3 à la fois — chaque type ci-dessous indique lequel
il sert en priorité, pour choisir en connaissance de cause plutôt que de tout demander à chaque post.

Pour un article ou un jeu donné, 5 à 8 de ces types s'appliqueront généralement. Claude relit le contenu
réel dans `js/data.js` et rédige la caption complète — le contenu de fond n'est jamais inventé.

## Principes qui font la différence sur les 3 objectifs

- **Une seule CTA par post, hiérarchisée.** Ne jamais demander à la fois "commente", "abonne-toi" et
  "clique sur le lien" au même niveau — choisir LA priorité de ce post précis et la mettre en avant, les
  autres restent secondaires ou absentes.
- **Le lien cliquable direct n'existe qu'en story et en bio** (jamais dans une légende de post). Donc :
  pour maximiser le **trafic**, privilégier la **story avec sticker lien** — un seul tap vers l'article.
  Pour un post feed, la CTA réaliste est "lien en bio", plus friction, donc moins efficace pour du trafic
  pur.
- **Les Reels sont poussés aux non-abonnés** (Explore/Reels), pas juste aux abonnés existants — c'est le
  format le plus efficace pour gagner des **abonnés**. Un post image simple, lui, touche surtout les gens
  qui suivent déjà.
- **Les sauvegardes et les partages comptent plus que les likes** pour la portée de l'algorithme —
  privilégier les formats "à garder" (checklist, carrousel récap) et les formats "à envoyer à un pote"
  (relatable, drôle, provocant) plutôt que le simple joli visuel.
- **Une question fermée, facile à répondre en 2 secondes**, en fin de caption, fait beaucoup plus de
  commentaires qu'une question ouverte du type "qu'en pensez-vous ?". Préférer un choix A/B, un "vrai ou
  faux", un chiffre à deviner.
- **Le hook (1ère ligne / 3 premières secondes) doit fonctionner seul**, sans dépendre du reste du texte
  ni de l'image — c'est lui qui décide si quelqu'un s'arrête de scroller.
- **Prioriser Reels et carrousels dans le calendrier de publication** ; garder les posts image simple et
  les stories pour la fréquence/le lien direct, pas comme format principal de découverte.

## Lien et UTM

`https://www.camonstrejoue.ch/<page>?utm_source=instagram&utm_medium=<emplacement>&utm_campaign=<slug>`

- Article : `/article/<slug>/`, Fiche jeu : `/jeu/<slug>/`, App : `/app.html`
- `utm_medium` : `bio`, `story` (sticker lien), `video` (reel), `post` (lien en légende, à éviter comme
  CTA principale puisqu'il n'est pas cliquable — n'utiliser que pour le tracking d'un lien qu'on répète
  en commentaire épinglé)

---

## Les types de posts

**1. Débat / duel A vs B** — 💬 interactions (priorité 1) · 👥 abonnés (partage si accrocheur)
Poser la thèse de l'article comme un choix fermé et facile à trancher (*"Team enrichissement vs team
nouveau jeu déguisé, tu commentes A ou B ?"*). La question fermée en dernière ligne est non négociable.
Format : post ou carrousel. CTA secondaire seulement : "notre avis complet en bio".

**2. Hot take / punchline provocante** — 💬 interactions (priorité 1) · 👥 abonnés
Une affirmation tranchée, volontairement clivante, tirée ou dérivée d'une phrase forte de l'article
(*"Les extensions sont une arnaque. Débattez."*). Fonctionne parce qu'elle donne envie de contredire en
commentaire. Format : post court, visuel simple.

**3. Reel storytelling / confession** — 👥 abonnés (priorité 1) · 💬 interactions
Raconte une anecdote ou un moment de partie déjà présent dans l'article, avec un hook fort dans les 3
premières secondes et une histoire qui se suffit à elle-même (ne pas couper le payoff pour forcer le clic
— un Reel qui se suffit fait suivre le compte, un Reel frustrant fait défiler). CTA discrète en fin de
vidéo/légende : "la suite en bio" pour ceux qui veulent l'avis complet.

**4. Checklist / carrousel "à sauvegarder"** — 👥 abonnés · 💬 interactions (sauvegardes)
Conseils ou critères pratiques tirés de l'article, présentés comme un outil réutilisable (*"3 questions à
te poser avant d'acheter une extension — sauvegarde ce post"*). La dernière slide doit explicitement dire
"sauvegarde pour plus tard" : ça déclenche le signal qui compte le plus pour l'algorithme.

**5. Story sondage + lien direct** — 🔗 trafic (priorité 1) · 💬 interactions
Sticker sondage/curseur qui pose la question centrale de l'article, sticker lien vers l'article juste
après. C'est le seul format qui envoie vraiment du monde vers le blog en un tap — à utiliser chaque fois
qu'un post feed performe bien, en relai le lendemain.

**6. Tag un pote** — 👥 abonnés · 💬 interactions (priorité 1, via portée)
Format pensé pour la viralité pure : *"Tag la personne qui a une pile de jeux jamais ouverts."* Peu
d'info sur le jeu lui-même, juste une accroche relatable assez large pour être partagée hors de
l'audience jeux de société. À utiliser avec parcimonie (1-2 fois par mois), en alternance avec du contenu
plus riche.

**7. Carrousel pédagogique** — 👥 abonnés · 🔗 trafic (secondaire)
L'article découpé selon ses sous-parties, avec CTA de fin claire vers l'article complet. Bon format
compromis quand le sujet est trop riche pour tenir en une accroche seule.

**8. Top / classement** — 👥 abonnés · 💬 interactions
Pour les articles listicle, un jeu par slide avec une question de fin type "lequel tu tenterais en
premier ?". Le format liste est un des plus enregistrés sur Instagram.

**9. Avantages / points de frustration** — 💬 interactions · 🔗 trafic
Carrousel 2 temps qui reprend une section avis contrastée de l'article. Bon terrain pour la question
fermée de fin ("toi, c'est quoi ton point bloquant sur un jeu : le hasard ou la durée des parties ?").

**10. Teaser app** — 🔗 trafic vers l'app (priorité 1)
Contenu qui commence sur Instagram et se termine sur l'app (*"la suite de ce format est dispo sur
l'app"*), avec lien vers `/app.html`. À utiliser dès qu'un post a bien marché sur le blog — republier le
même sujet avec cet angle pour construire l'audience de lancement de l'app avant sa sortie sur les
stores.

**11. Zoom sur un détail / chiffre qui surprend** — contenu de remplissage (fréquence, pas de priorité)
Un personnage, un objet, une note (6/6), un chiffre insolite de l'article, en accroche courte. Utile pour
garder une cadence de publication régulière (l'algorithme récompense la régularité) sans épuiser le
contenu fort d'un article en un seul post — bon format pour décliner plusieurs posts sur un seul compo
type (un personnage à la fois).

**12. Repartage média existant** — contenu de remplissage (fréquence, pas de priorité)
Republier une vidéo/reel déjà tourné (`video`, blocs `instagram`) avec une nouvelle accroche. Faible sur
les 3 objectifs pris isolément (contenu déjà vu par les abonnés) mais peu coûteux à produire — à réserver
aux semaines creuses plutôt qu'à la stratégie principale.

---

## Comment prioriser sur un article donné

1. Choisir 1 type parmi #1-3 (débat, hot take, ou reel storytelling) comme post principal de lancement —
   ce sont ceux qui font le plus travailler interactions + abonnés ensemble.
2. Ajouter #4 ou #7 (checklist ou carrousel) le lendemain pour capter les gens qui veulent creuser.
3. Relayer en story avec #5 (sondage + lien) pour convertir l'intérêt en trafic réel vers le blog.
4. Compléter le calendrier avec #8-12 selon ce que l'article permet, en gardant #6 (tag un pote) et #10
   (teaser app) pour des moments ciblés plutôt que systématiques.
