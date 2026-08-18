# Types de posts Instagram — Ça Monstre Joue

Bibliothèque de gabarits réutilisables pour générer des posts Instagram à partir du contenu déjà présent
sur le site (`js/data.js`). Pour déclencher un post, donner à Claude : le **type** (ci-dessous) + le
**jeu ou l'article** concerné. Claude va chercher le contenu réel dans `js/data.js` et rédige la caption
complète (accroche, corps, CTA, hashtags, lien UTM) — jamais de contenu inventé, toujours tiré des
champs existants (intro, fitFor/notFitFor, blocks, identity, etc.).

Ton : tutoiement (cohérent avec l'interface du site et le ton déjà utilisé dans `fitFor`/`notFitFor`).
Le texte des articles/fiches jeu lui-même (intro, blocks) ne doit jamais être reformulé sur le fond,
seulement extrait/mis en forme pour Instagram.

## Lien et UTM

Convention du site (voir `CLAUDE.md`) :

`https://www.camonstrejoue.ch/<page>?utm_source=instagram&utm_medium=<emplacement>&utm_campaign=<slug>`

- Fiche jeu : `/jeu/<slug>/` — `utm_campaign=<slug-du-jeu>`
- Article : `/article/<slug>/` — `utm_campaign=<slug-de-larticle>`
- `utm_medium` : `bio` (lien fixe en bio), `story`, `video` (description vidéo/reel), `post` (lien en légende)

---

## I. Fiches jeu (`window.GAMES`)

Champs sources : `name`, `intro`, `identity` (players/age/duration/type/difficulty/note),
`fitFor`/`notFitFor`, `monsterTip`, `video`, `heroImages`, `categories`.

**1. Présentation flash**
Reel ou post simple. Accroche = phrase la plus forte de `intro`. Overlay avec les specs
(`identity.players`, `identity.duration`, `identity.age`). CTA vers la fiche jeu.

**2. Fit for / Not fit for**
Carrousel 2 temps : *"Ce jeu est fait pour toi si..."* (liste `fitFor`, déjà écrite en tutoiement, à
reprendre telle quelle) puis *"Passe ton chemin si..."* (`notFitFor`). Format qui se suffit à lui-même,
peu de réécriture nécessaire.

**3. Le conseil du Monstre**
Post court centré sur `monsterTip`, ton mascotte/complice. Bon format pour varier des posts "avis".

**4. Verdict en un coup d'œil**
Visuel avec la note (`identity.note.stars` / 6) et la difficulté (`identity.difficulty`). Accroche type
*"Notre note pour {name} : {note}/6"*. Fonctionne bien en story avec sticker "d'accord ?".

**5. Table / immersion visuelle**
Post photo(s) tirées de `heroImages`, peu ou pas de texte — juste une légende courte et une accroche
sensorielle (thème, ambiance). Bon format quand le visuel est fort et parle de lui-même.

**6. Repartage vidéo existante**
Si `video` pointe vers un Reel/Short déjà tourné : nouvelle accroche + nouveau contexte pour republier
sans retourner de contenu.

---

## II. Articles critique (avis détaillé d'un jeu, ex. `sub-terra-ii-critique`)

Champs sources : `title`, `subtitle`, `excerpt`, `blocks` (paragraphes et `h2`).

**1. Verdict en punchline**
Repérer la phrase la plus tranchée/mémorable dans les `blocks` et la poser en gros sur un visuel du jeu.

**2. Point fort / point faible**
Carrousel 2 slides contrastées, extraites du raisonnement de l'article (pas inventées).

**3. Citation choc**
Une phrase drôle ou marquante de l'article, mise en avant façon citation, avec `subtitle` de l'article
en accroche si pertinent (ex. *"La corde nostalgique"*).

**4. On a testé (immersif)**
Reel/post à la première personne, ton retour d'expérience, s'appuie sur les anecdotes concrètes
présentes dans l'article plutôt que sur un résumé générique.

---

## III. Articles compo type / stratégie (ex. `sub-terra-ii-compo-type`)

Champs sources : `blocks` (conseils, étapes, personnages/rôles évoqués).

**1. Astuce express**
Un seul conseil fort en punchline : *"Le conseil qu'on aurait aimé avoir avant notre première partie."*

**2. L'erreur à éviter**
Angle négatif/relatable : *"L'erreur qu'on a tous faite en y jouant."*

**3. Carrousel stratégie**
Liste des conseils/étapes de l'article, un par slide, numérotés.

**4. Duel de choix**
Si l'article compare des options (perso/équipe/stratégie) : poser en débat *"Team A vs Team B, tu choisis
quoi ?"* pour driver les commentaires.

---

## IV. Articles guide / opinion (sujet général, pas lié à un seul jeu — ex. `extensions-jeux-de-societe-une-arnaque`, `jeux-pour-lapero`, `combien-de-jeux-pour-etre-heureux`, `organiser-soiree-jeux-competitif-ou-cooperatif`)

Champs sources : `blocks` en entier (thèse, sous-parties en `h2`, exemples, anecdotes).

**1. Confession personnelle**
Reprendre l'anecdote perso de l'auteur si l'article en contient une (souvent le cas — cf. Alex et Catan).
Accroche à la première personne, très relatable.

**2. Sondage / engagement**
Story avec sticker sondage/curseur, question posée dès la thèse de l'article. Bon format pour driver du
trafic vers le lien en story.

**3. Carrousel pédagogique**
Découpe l'article selon ses `h2` : 1 slide de thèse, 1 slide par sous-partie, 1 slide de conclusion/CTA.
Le format le plus fidèle au raisonnement complet de l'article.

**4. Punchline / meme relatable**
Une seule accroche courte et drôle, sans développer — juste teaser + lien en bio. Bon format pour la
fréquence de publication (rapide à produire).

**5. Comparaison pop-culture**
Si l'article contient une analogie (ex. "extension = saison 10 d'une série"), la sortir telle quelle en
accroche de reel — fonctionne au-delà de l'audience jeux de société.

**6. Débat / prise de position**
Poser la thèse de l'article comme un choix tranché en commentaire (*"Team X vs Team Y, t'es où ?"*),
renvoyer vers l'article pour "notre avis complet".

**7. Checklist actionnable**
Si l'article contient des critères de décision (ex. "3 questions à se poser avant d'acheter une
extension"), en faire un post/carrousel utilitaire, format qui s'enregistre et se partage bien.

**8. Top / classement (listicle)**
Pour les articles du type "Les 3/5 jeux qui...", un jeu par slide de carrousel, avec l'accroche propre à
chaque jeu tirée de l'article.

---

## Comment déclencher un post

Donner : le type (ex. "Fit for / Not fit for") + le jeu ou l'article (ex. "Wingspan" ou
"jeux-pour-lapero"). Claude relit le contenu réel dans `js/data.js`, rédige la caption complète
(accroche + corps + CTA + hashtags + lien avec UTM) et propose, si pertinent, des notes de mise en page
pour le carrousel/visuel.
