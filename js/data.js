/* ============================================
   ÇA MONSTRE JOUE — Données du site
   Pour ajouter un jeu : dupliquer un objet dans GAMES.
   Pour ajouter un article : dupliquer un objet dans ARTICLES.
   ============================================ */

window.CATEGORIES = [
  { slug: 'jeux-a-deux',        name: 'Jeux à deux',        image: 'assets/categories/jeux-adeux-categorie.JPG' },
  { slug: 'jeux-cooperatifs',   name: 'Jeux coopératifs',   image: 'assets/categories/jeux-cooperatifs-categorie.jpg' },
  { slug: 'jeux-dambiance',     name: "Jeux d'ambiance",    image: 'assets/categories/jeux-dambiance-categorie.jpg' },
  { slug: 'jeux-de-strategie',  name: 'Jeux de stratégie',  image: 'assets/categories/jeux-strategie-categorie.JPG' },
  { slug: 'jeux-narratifs',     name: 'Jeux narratifs',     image: 'assets/categories/jeux-narratifs-categorie.JPG' },
  { slug: 'jeux-famille',       name: 'Jeux famille',       image: 'assets/categories/jeux-famille-categorie.JPG' },
];

// Astuce : ajoute un champ `thumbnail: 'chemin/vers/image-carree.jpg'` à un jeu
// pour lui donner une image dédiée (format carré 1:1 recommandé) sur les pages
// de catégories, différente de sa `cover` (utilisée dans la bannière de sa fiche).
// Ajoute aussi `heroImages: ['chemin/1.jpg', 'chemin/2.jpg', ...]` (suffixe -fiche,
// format paysage ~16:9 à 21:9 recommandé, ex. 1600x500px) pour choisir précisément
// les photos du carrousel tournant en haut de la fiche jeu. Sans ce champ, le
// carrousel réutilise automatiquement `cover` + les images de `gallery`.
window.GAMES = [
  {
    slug: 'sub-terra-ii',
    name: 'Sub Terra II',
    categories: ['jeux-a-deux', 'jeux-cooperatifs'],
    cover: 'assets/games/sub-terra-ii/cover.jpg',
    thumbnail: 'assets/games/sub-terra-ii/sub-terra-ii-liste.jpg',
    heroImages: [
      'assets/games/sub-terra-ii/sub-fiche.JPG',
      'assets/games/sub-terra-ii/tuile-fiche.JPG',
      'assets/games/sub-terra-ii/perso-fiche.JPG',
    ],
    intro: "Explore un temple volcanique, en équipe ! Dans ce jeu d'exploration et de placement de tuiles, tu devras récupérer 3 clés pour débloquer un artefact légendaire, en évitant les différents pièges et gardes qui te barrent la route. L'artefact en poche, fuis avant que le volcan n'entre en éruption et que toute l'équipe ne meure dans d'atroces souffrances !",
    identity: {
      players: '1-6',
      age: '10 ans et plus',
      duration: '45-75 minutes',
      year: '2023',
      type: 'Coopératif',
      difficulty: { stars: 2, label: 'Facile' },
      note: { stars: 5 },
    },
    fitFor: [
      'Tu es un fan de jeux coopératifs',
      'Tu aimes les aventures immersives pleines de tension',
      'Tu adores placer des tuiles et explorer',
      'Tu recherches un jeu vite appris, vite expliqué',
      'Tu apprécies refaire encore et encore des parties en changeant de personnages (ou pas)',
    ],
    notFitFor: [
      'Tu aimes broyer tes adversaires autour de la table',
      'La victoire, c’est pour toi seul',
      'Le thème des temples mystérieux et des volcans, c’est définitivement pas ton truc',
      'Tu détestes les jeux de société (tu t’es perdu ??)',
      'T’as pas aimé le premier Sub Terra',
    ],
    video: 'https://youtube.com/shorts/o5udBSFZtEo',
    spotify: 'https://open.spotify.com/track/260FKIaAwovHuUTJ7IvKUK?si=sAW_B1XkTQeVQ5s2HphkxQ&utm_source=whatsapp',
    gallery: [
      { image: 'assets/games/sub-terra-ii/critique-vignette.jpg', articleSlug: 'sub-terra-ii-critique' },
      { image: 'assets/games/sub-terra-ii/compo-type-vignette.jpg', articleSlug: 'sub-terra-ii-compo-type' },
    ],
  },
  {
    slug: 'dorf-romantik-sakura',
    name: 'Dorf Romantik - Sakura',
    categories: ['jeux-a-deux', 'jeux-cooperatifs'],
    thumbnail: 'assets/games/dorf-romantik-sakura/dorf-romantik-sakura-liste.JPG',
    heroImages: [
      'assets/games/dorf-romantik-sakura/Dork-romantik-sakura-fiche.JPG',
      'assets/games/dorf-romantik-sakura/Dork-romantik-sakura-fiche2.JPG',
      'assets/games/dorf-romantik-sakura/Dork-romantik-sakura-fiche3.JPG',
    ],
    intro: "Façonne ton paysage dans un univers japonais magnifique. Dans ce jeu de pose de tuiles relaxant, tu joues avec ton équipe pour atteindre des objectifs précis à chaque partie. Réalise la route la plus longue possible, crée une rizière de 5 tuiles adjacentes, dessine une rivière de 6 tuiles contenant 2 carpes Koi... Agence ton paysage de manière harmonieuse (ou pas) et marque le plus de points possible à chaque partie pour débloquer de nouveaux éléments de jeu en suivant une campagne qui progresse à chaque partie et amène une grande variété.",
    identity: {
      players: '1-6',
      age: '8 ans et plus',
      duration: '30-60 minutes',
      year: '2023',
      type: 'Coopératif / placement de tuiles',
      difficulty: { stars: 1, label: 'Facile' },
      note: { stars: 6, max: 6 },
    },
    fitIntro: "Dorf Romantik, c'est l'archétype du jeu qui paie pas d'mine mais qui devient vite un classique de ta ludothèque au goût de r'viens y ! C'est notre avis ! Mais est-il fait pour toi ?",
    fitFor: [
      'Placer des tuiles c’est définitivement ton truc !',
      'Tu aimes jouer sans trop réfléchir, même le soir, fatigué',
      'Tu adores suivre une campagne et continuer ta partie de jour en jour',
      'Tu recherches un jeu vite appris, vite expliqué, vite joué',
      'T’es fan du Japon et tu as ton jardin zen à la maison',
    ],
    notFitFor: [
      'Tu as besoin de surstimulation quand tu joues',
      'Tu veux un jeu à faire une fois à l’apéro',
      'Tu as cru que Sakura faisait référence au personnage de Naruto et t’es triste que y’ait pas de ninjas',
    ],
    // Pas encore de vidéo reçue : placeholder "Vidéo à venir" affiché automatiquement.
    video: '',
    spotify: 'https://open.spotify.com/playlist/0ALucT2kHAEvPVpWZeXj4T?si=V2_AGKaxRGCSGb0ozdsDUQ&utm_source=whatsapp&pi=EQXDWwI-RU2m9',
    // Pas encore d'articles associés reçus : galerie masquée automatiquement tant que vide.
    gallery: [],
  },
  {
    slug: 'daybreak',
    name: 'Daybreak',
    categories: ['jeux-a-deux', 'jeux-cooperatifs', 'jeux-de-strategie'],
    // Pas encore d'image reçue : placeholder logo affiché automatiquement.
    cover: '',
    intro: [
      "Quel jeu est plus dans l’ère du temps ? Sauve la planète, ou regarde-la brûler, dans ce jeu coopératif à base de combos de cartes.",
      "Chaque joueur incarne une zone économique (Europe, États-Unis, Chine, Monde majoritaire) et doit réussir à diminuer ses émissions tout en assurant son approvisionnement énergétique croissant.",
      "Tu devras faire des choix de société clivants comme par exemple miser soit sur l’énergie nucléaire ou sur l’énergie éolienne pour faire des combos de cartes et produire de l’énergie propre de manière exponentielle.",
      "En un nombre de tours limité et avec une situation qui se détériore à chaque manche, tu vas devoir jongler entre la production d’énergie, la baisse des émissions, le renforcement de tes résiliences ou encore la séquestration de carbone.",
      "Fais les bons choix, aie un peu de chance et travaille en équipe pour atteindre le point de bascule où tes émissions de carbone seront intégralement séquestrées par les forêts et océans, ce qui te permettra de sauver la planète et de gagner la partie.",
    ],
    identity: {
      players: '1-4',
      age: '10 ans et plus',
      duration: '90 minutes',
      year: '2024',
      type: 'Coopératif',
      difficulty: { stars: 3, max: 6, label: 'Intermédiaire' },
      note: { stars: 5.5, max: 6 },
    },
    fitIntro: 'Daybreak est un de nos jeux préférés !',
    fitFor: [
      'Tu es un fan de jeux coopératifs',
      'Tu aimes les jeux tranquilles, sans prise de tête',
      'Tu adores faire des combos de cartes',
      'Tu aimes varier la difficulté et devoir lutter pour gagner',
      'Tu veux sauver le monde',
    ],
    notFitFor: [
      'Tu aimes les interactions virulentes entre joueurs',
      'Tu ne supportes pas de perdre',
      'Le réchauffement climatique, tu n’y crois pas',
      'Tu n’arrives pas à rester plus de 45 minutes sur une chaise',
    ],
    video: 'https://youtube.com/shorts/ZlMJrS7kiDk',
    // Playlist à ajouter plus tard.
    spotify: '',
    gallery: [
      { image: '', articleSlug: 'daybreak-critique' },
    ],
  },
  {
    slug: 'eila-et-leclat-de-la-montagne',
    name: "Eila et l'Éclat de la Montagne",
    categories: ['jeux-narratifs', 'jeux-a-deux', 'jeux-cooperatifs'],
    thumbnail: 'assets/games/eila-et-leclat-de-la-montagne/eila-liste.JPG',
    heroImages: [
      'assets/games/eila-et-leclat-de-la-montagne/eila1-fiche.JPG',
      'assets/games/eila-et-leclat-de-la-montagne/eila2-fiche.JPG',
      'assets/games/eila-et-leclat-de-la-montagne/eila3-fiche.JPG',
    ],
    intro: [
      "Incarne Eila, une courageuse petite lapine, dans sa quête initiatique !",
      "Eila et l’Éclat de la Montagne est un jeu narratif et de gestion de ressources. Au travers de 5 chapitres, notre héroïne vit une multitude d’aventures de plus en plus sombres.",
      "Retourne les cartes, prends des choix éclairés et accomplis tes objectifs, afin de guider Eila au sommet de la montagne.",
      "Mais attention, prends les bonnes décisions ! Dans Eila, tous les choix sont potentiellement lourds de conséquences.",
    ],
    identity: {
      players: '1+ (mais idéal à 2 joueurs)',
      age: '12 ans et plus',
      duration: '30 à 45 minutes selon les chapitres',
      year: '2023',
      type: 'Coopératif',
      difficulty: { stars: 4, label: 'Moyen' },
      note: { stars: 6, max: 6 },
    },
    fitIntro: "Nous avons adoré Eila et l’Éclat de la Montagne ! Mais ce jeu ne correspond pas à tout le monde...",
    fitFor: [
      'Tu es un fan de jeux coopératifs ou solo',
      'Tu aimes les jeux narratifs, mais tu n’es pas un expert du domaine',
      'Tu es nostalgique des romans à la 1ère personne de ton enfance',
      'Tu sais t’émerveiller des petites choses dans la vie',
      'Tu es obstiné·e et prêt·e à redémarrer le jeu plusieurs fois pour obtenir la meilleure fin possible',
    ],
    notFitFor: [
      'Tu cherches un jeu auquel tu pourras rejouer 250 fois',
      'Le design "cute" te rebute',
      'Tu as la "capacité émotionnelle d’une cuillère à café"',
      'Tu ne supportes pas la frustration du destin laissé aux dés',
      'Tu es un grand expert des jeux narratifs et tu es venu à bout des plus difficiles d’entre eux',
    ],
    // Pas encore de vidéo reçue : placeholder "Vidéo à venir" affiché automatiquement.
    video: '',
    spotify: 'https://open.spotify.com/playlist/2NhsVpfsZTNjQ0EqpWAA2p?si=zwXwvuPaTKW_jygs9ynILQ&utm_source=whatsapp&sci=spotify%3Acard-config%3A3sa6PCtW1oJX1vteSqR5r1&nd=1&dlsi=bb4bd28844f645f9',
    gallery: [
      { image: 'assets/games/eila-et-leclat-de-la-montagne/eila1-vignette.JPG', articleSlug: 'eila-et-leclat-de-la-montagne-critique' },
    ],
  },
  {
    slug: 'escape-the-dark-castle',
    name: 'Escape the Dark Castle',
    categories: ['jeux-a-deux', 'jeux-narratifs', 'jeux-cooperatifs', 'jeux-dambiance'],
    thumbnail: 'assets/games/escape-the-dark-castle/escape-liste.jpg',
    heroImages: [
      'assets/games/escape-the-dark-castle/escape-fiche.jpg',
      'assets/games/escape-the-dark-castle/escape2-fiche.jpg',
      'assets/games/escape-the-dark-castle/escape3-fiche.jpg',
    ],
    intro: [
      "Penses-tu pouvoir sortir vivant du Dark Castle ?",
      "Dans ce jeu d’exploration narratif, prépare-toi à perdre. C’est ce qui fait le charme du jeu.",
      "Tu vas perdre encore et encore et mourir de façon horrible encore et encore. Dévoré par une goule assoiffée de sang. Poignardé dans le dos par un marchand véreux. Empalé par un piège dissimulé dans les murs. Les occasions ne manqueront pas.",
      "Tu incarnes un groupe de prisonniers en quête de liberté. Arpente les couloirs du Dark Castle, plus dangereux les uns que les autres, pour espérer sortir vivants. Mais attention ! Si l’un des prisonniers meurt, l’aventure s’achève.",
      "Tu devras combattre, fouiller des coffres et des cadavres, jouer ta vie aux dés pour acquérir des armes et survivre aux futurs ennemis.",
      "Probabilité de survie ? Hmmm... 25 % ! Seras-tu assez courageux ?",
    ],
    identity: {
      players: '1-4',
      age: '14 ans et plus',
      duration: '30-60 minutes',
      year: '2023',
      type: 'Coopératif / narratif',
      difficulty: { stars: 1, label: 'Facile' },
      note: { stars: 6, max: 6 },
    },
    fitIntro: "Escape the Dark Castle est un jeu narratif dans lequel tu devras affronter des ennemis fourbes et sanguinaires. Retourne la prochaine carte, lis ta mort prochaine de la façon la plus vivante possible, choisis et combats avec tes lancers de dés et sois chanceux !",
    fitFor: [
      'Tu es un fan de jeux narratifs',
      'Tu aimes lire en mettant le ton',
      'Tu adores le challenge',
      'Tu recherches un jeu vite appris, vite expliqué, vite joué',
      'Tu veux varier tes jeux à l’apéro',
      'Tu apprécies gagner après 3 défaites d’affilée',
    ],
    notFitFor: [
      'Tu n’aimes pas les graphismes sombres',
      'Tu cherches un jeu expert avec plein de stratégie',
      'La lecture, c’est pas trop ton truc',
    ],
    // Pas encore de vidéo reçue : placeholder "Vidéo à venir" affiché automatiquement.
    video: '',
    // Pas encore de playlist reçue.
    spotify: '',
    // Pas encore d'articles associés reçus : galerie masquée automatiquement tant que vide.
    gallery: [],
  },
  {
    slug: 'finspan',
    name: 'Finspan',
    categories: ['jeux-de-strategie', 'jeux-a-deux'],
    cover: 'assets/games/finspan/Finspan-cover.JPG',
    thumbnail: 'assets/games/finspan/Finspan-liste.JPG',
    intro: [
      "Finspan c’est l’archétype du jeu compétitif chill du soir.",
      "On en regretterait presque qu’il n’existe pas une version coopérative tellement l’aspect compétitif disparaît.",
      "Dans ce jeu de gestion et de collection, tu dois développer ton écosystème aquatique, implanter de nouvelles espèces de poissons, pondre des œufs, les faire éclore en poissons juvéniles puis regrouper ces juvéniles en bancs.",
      "Marque le plus de points en fonction des objectifs demandés et des points que rapportent tes différents poissons.",
      "On se complaît alors à gérer son écosystème personnel et on se met facilement dans sa bulle pour réaliser ses objectifs. Les joueurs les plus aguerris et férus de victoires éclatantes surveilleront les avancées des autres joueurs et prendront des actions en conséquence.",
      "Les amoureux du jeu chill du soir feront leurs actions dans leur coin, en profitant de la beauté du jeu et des détails de chaque carte avec des informations passionnantes sur chaque espèce.",
    ],
    identity: {
      players: '1-5',
      age: '10 ans et plus',
      duration: '45-60 minutes',
      year: '2025',
      type: 'Compétitif',
      difficulty: { stars: 3, label: 'Moyenne' },
      note: { stars: 5, max: 6 },
    },
    fitIntro: "Finspan c’est le parfait mélange entre réflexion, simplicité et tranquillité, idéal pour entrer dans l’univers des jeux de société un peu plus complexes que le Uno sans se prendre la tête avec un apprentissage des règles de 2h.",
    fitFor: [
      'Tu es un fan de jeux de collection',
      'Tu aimes les poissons et en apprendre plus',
      'Tu veux un jeu chill mais avec une certaine profondeur',
      'Tu as envie qu’un gagnant clair se dessine',
    ],
    notFitFor: [
      'Tu n’aimes que les jeux coopératifs',
      'Tu cherches un jeu d’ambiance pour ta prochaine soirée',
      'Les poissons, c’est pas trop ton truc',
    ],
    // Pas encore de vidéo reçue : placeholder "Vidéo à venir" affiché automatiquement.
    video: '',
    // Pas encore de playlist reçue.
    spotify: '',
    // 2 articles prévus mais pas encore rédigés : la galerie les affichera
    // automatiquement dès que ces articles seront ajoutés avec ces slugs.
    gallery: [
      { image: '', articleSlug: 'finspan-quel-span-es-tu' },
      { image: '', articleSlug: 'finspan-extension-requins-recifs' },
    ],
  },
  {
    slug: 'wingspan',
    name: 'Wingspan',
    categories: ['jeux-de-strategie', 'jeux-a-deux'],
    thumbnail: 'assets/games/wingspan/wingspan-liste.JPG',
    heroImages: [
      'assets/games/wingspan/wingspan-fiche1.JPG',
      'assets/games/wingspan/wingspan-fiche2.JPG',
      'assets/games/wingspan/wingspan-fiche3.JPG',
      'assets/games/wingspan/wingspan-fiche4.JPG',
      'assets/games/wingspan/wingspan-fiche5.JPG',
    ],
    intro: [
      "Avec Wingspan, on apprend en s’amusant.",
      "Tu as toujours rêvé de savoir quel est l’oiseau que tu entends chaque matin dans ton jardin ? Tu ne le sauras pas plus en jouant à Wingspan ! Mais tu apprendras plein de noms d’oiseaux, et d’informations intéressantes à leur sujet.",
      "Combien mesure un Geai bleu ? Quel type de nid utilise un Héron vert ? Combien d’œufs peut pondre un Tarin des pins ? Tu trouveras toutes ces réponses au fil de tes parties, en même temps que tu écraseras tes adversaires grâce à ta stratégie rondement ficelée.",
      "Place un maximum d’oiseaux, ponds le plus d’œufs possibles, et marque toutes sortes de points en remplissant des objectifs de manche et des objectifs secrets sur tes cartes bonus !",
    ],
    identity: {
      players: '1-5',
      age: '10 ans et plus',
      duration: '45-60 minutes',
      year: '2019',
      type: 'Compétitif',
      difficulty: { stars: 3, label: 'Moyenne' },
      note: { stars: 5, max: 6 },
    },
    fitIntro: "Wingspan est un jeu qui saura te faire entrer dans le monde magnifique de l’ornithologie. Des parties relativement courtes et sans interactions vigoureuses entre joueurs t’offriront des soirées ludiques mais reposantes.",
    fitFor: [
      'Tu aimes faire tes combos dans ton coin sans qu’on passe la partie à te mettre des bâtons dans les roues',
      'Tu adores apprendre en t’amusant et souhaite découvrir chaque espèce',
      'Tu as un jeune ado à la maison et cherche un jeu pour le stimuler intellectuellement tout en s’amusant',
      'Tu as adoré Finspan ou Wyrmspan et souhaites varier les univers',
    ],
    notFitFor: [
      'La nature, c’est vraiment pas ton truc',
      'Pour toi les oiseaux, c’est clairement pas assez cool. Tu veux des dragons !',
      'T’as le budget que pour un jeu et t’es fan de poissons, va voir <a href="/jeu.html?slug=finspan">Finspan</a> !',
      'Tu veux un jeu pour jouer avec ton enfant. 10 ans c’est vraiment le minimum.',
    ],
    // Pas encore de vidéo reçue : placeholder "Vidéo à venir" affiché automatiquement.
    video: '',
    // Pas encore de playlist reçue.
    spotify: '',
    gallery: [
      { image: 'assets/games/wingspan/wingspan-cavautlecoupdaile-vignette.JPG', articleSlug: 'wingspan-critique' },
      // Article "quel span es-tu" pas encore rédigé : la galerie l'affichera
      // automatiquement dès qu'il sera ajouté avec ce slug.
      { image: 'assets/games/wingspan/wingspan-quelspanestu-vignette.JPG', articleSlug: 'wingspan-quel-span-es-tu' },
    ],
  },
];

// Astuce : ajoute un champ `banner: 'chemin/vers/image-16-9.jpg'` à un article
// pour lui donner une image dédiée (format 16:9 recommandé) dans le carrousel
// de la page d'accueil, différente de sa vignette `cover` (utilisée ailleurs).
// Ajoute aussi `hero: 'chemin/vers/image-32-9.jpg'` (suffixe -bandeau) pour
// l'image tout en haut de la page de l'article (format 32:9, ultra-large).
window.ARTICLES = [
  {
    slug: 'sub-terra-ii-critique',
    title: 'Sub Terra II - Notre critique brûlante',
    date: '2026-08-01',
    author: 'Alex',
    gameSlug: 'sub-terra-ii',
    hero: 'assets/games/sub-terra-ii/tuiles-bandeau.jpg',
    cover: 'assets/games/sub-terra-ii/critique-vignette.jpg',
    excerpt: "Récupérer un artefact dans un temple volcanique : le jeu en vaut-il la chandelle ?",
    blocks: [
      { type: 'p', text: "Récupérer un artefact dans un temple volcanique : le jeu en vaut-il la chandelle ? Si tu es arrivé là ce n'est pas par hasard ! Tu te demandes surement si visiter un temple volcanique vaut les CHF 48.- que coutent le jeu. Réponse courte : Oh que oui !" },
      { type: 'p', text: "Si tu aimes les jeux coopératifs plein de rebondissements avec un dosage finement réglé entre stratégie, via les choix que tu réalises, et aléatoire (dans la pose de tuile et dans les lancers de dés), fonce !" },
      { type: 'p', text: "La première étape lorsque tu es bien installé autour de la table et que tu as lu les règles (qui sont relativement faciles à apprendre !) c'est bien évidemment de choisir ton équipe ! Réfléchis bien à la composition de ton groupe car elle va grandement influer sur la difficulté de ton expédition. Sans soigneur, gare aux bobos ! Tu ne prends que des personnages avec peu de points de vie ? Le moindre piège peut t'être fatal. En bref, construis ton équipe afin de parer à toutes les situations qui se présenteront à toi." },
      { type: 'image', src: 'assets/games/sub-terra-ii/gameplay-meeples.jpg', caption: "Compose ton équipe avec soin : chaque personnage a son rôle à jouer." },
      { type: 'p', text: 'Si tu souhaites un peu d’aide, découvre notre <a href="/article.html?slug=sub-terra-ii-compo-type">composition type pour bien débuter</a>. La variété des personnages et de leurs compétences offre une très grande rejouabilité et permettra à chacun de trouver un gameplay qui lui plaira. Que tu sois un bourrin qui veut foncer dans le tas et tuer ses ennemis, un explorateur agile qui veut se déplacer facilement ou un support pour tes amis, tu trouveras chaussure à ton pied.' },
      { type: 'p', text: "Vient alors le moment d'explorer ! Parcours prudemment les couloirs du temple à la recherche des 3 précieuses clés. Mais attention, chaque tuile que tu vas poser devant toi pour découvrir ton chemin peut contenir de terribles dangers. Des pièges à fléchettes, des pieux qui sortent du sol, des flammes prêtes à te carboniser ou encore des zones fragiles sur le point de s'effondrer peuvent te coûter la vie à chaque instant. Une mauvaise décision, une prise de risque un peu trop grande, 4 explorateurs sur la même tuile lors d'un éboulement et c'est perdu !" },
      { type: 'image', src: 'assets/games/sub-terra-ii/gameplay-tuiles.jpg', caption: "Chaque tuile posée peut cacher un piège... ou la clé que tu cherches." },
      { type: 'p', text: 'Le jeu pourra te paraitre difficile dans les premières parties si tu es du genre poisseux au lancé de dés. Ne perds pas espoir ! Non seulement la "routourne va tourner" mais tu vas également gagner en cohérence et en anticipation et sauras tirer le meilleur parti des personnages, de leurs compétences et des associations en équipe.' },
      { type: 'p', text: "La partie la plus haletante et tendue du jeu, celle qui te fera certainement vibrer, c'est quand tu parviendras à t'emparer de l'artefact. À l'instar d'une aventure d'Indiana Jones, il te faudra fuir rapidement et lutter de toutes tes forces contre un aléatoire fourbe et retors qui s'acharne sur toi à chaque lancer de dé." },
      { type: 'image', src: 'assets/games/sub-terra-ii/gameplay-lave.jpg', caption: "La fuite vers la sortie, entre coulées de lave et effondrements." },
      { type: 'p', text: "La grande force de Sub Terra II, c'est le basculement qui s'opère une fois l'artefact en main. Dans les premières parties tu auras l'impression de subir ce voyage de retour. Prends un peu de hauteur, choisis bien ton équipe en anticipant la fuite et mets au point un plan et une stratégie pour les deux parties du jeu." },
      { type: 'p', text: "Plus complet que Sub Terra I, avec plus de rebondissement, ce second volet n'est pas simplement une déclinaison du même jeu. Si tu as aimé le 1, tu vas adorer le 2. Si tu n'as aucun des deux et que tu souhaites choisir, un seul conseil, prends le 2 !" },
      { type: 'p', text: "Quid des extensions ? Sache que Sub Terra II possède deux extensions qui rajoutent de nouveaux personnages aux compétences uniques ainsi que ne nouvelles missions ! On ne les a pas encore testé mais nous espérons les découvrir le plus vite possible et bien évidemment partager cette découverte avec toi ! Alors suis-nous sur Instagram et abonne-toi à notre newsletter pour ne rien rater de nos prochains contenus." },
    ],
  },
  {
    slug: 'sub-terra-ii-compo-type',
    title: 'Sub Terra II - Notre compo type',
    date: '2026-08-03',
    author: 'Alex',
    gameSlug: 'sub-terra-ii',
    banner: 'assets/games/sub-terra-ii/compo-type-banniere.jpg',
    hero: 'assets/games/sub-terra-ii/compo-type-bandeau.jpg',
    cover: 'assets/games/sub-terra-ii/compo-type-vignette.jpg',
    excerpt: 'Les personnages conseillés pour bien débuter le jeu, et les profils plus situationnels à essayer ensuite.',
    blocks: [
      { type: 'h2', text: 'Les personnages conseillés pour bien débuter' },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/combattante-chevronnee.jpg', name: 'La combattante chevronnée', text: "Un personnage indispensable qui t'offrira beaucoup de confort lors de tes parties. Son grand nombre de points de vie, allié à sa capacité à encaisser les attaques sans dommages permet de donner beaucoup d'espace à ton équipe et prendre des risques qui seraient inconsidérés avec la plupart des autres personnages." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/guerisseuse.jpg', name: 'La guérisseuse (mamie pour les intimes)', text: "Le soigneur le plus facile à utiliser. Sa faculté de guérir 4 points de vie à chaque tour, allié aux points de vie de la combattante chevronnée offre un duo efficace pour avancer sereinement dans le temple. Malgré son faible nombre de points de vie qui te forcera à faire attention à son placement, sa capacité à récupérer de la santé passivement (avec un peu de chance) rend son gameplay très complet." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/gredin.jpg', name: 'Le gredin', text: "Quasiment obligatoire si tu souhaites ressortir vivant. Sa capacité à parcourir rapidement les couloirs et surtout à éviter les pièges et protéger ses compagnons de ceux-ci en font une pièce maitresse autour de laquelle organiser tous les déplacements de l'équipe." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/contremaitre.jpg', name: 'Le contremaître', text: "Vient compléter notre équipe type. En duo avec le gredin, il permet de \"consolider\" les tuiles sur lesquelles se trouvent les pièges ou autres dangers et ainsi supprimer les embuches et sécuriser le terrain. Idéal pour préparer le chemin de retour !" },
      { type: 'h2', text: 'Les personnages situationnels' },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/aristocrate.jpg', name: "L'aristocrate", text: "Couteau suisse en soutien. Parfait pour déplacer un autre personnage en danger ou poser des tuiles jokers quand tu te sens bloqué." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/sapeur.jpg', name: 'Le sapeur', text: "Pour les bourrins ! Il explose les murs pour créer des passages et fait des dégâts de zone. Moins facile que le contremaitre mais un remplaçant intéressant." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/tireuse-elite.jpg', name: "La tireuse d'élite", text: "Des capacités intéressantes, tout en finesse. Elimination de loin et exploration du terrain à distance, sans prendre de risque." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/guide.jpg', name: 'Le guide', text: "Extrêmement mobile et agile, le guide parcours les couloirs facilement et se faufile entre les éboulements pour atteindre des personnages isolés sans perdre de temps." },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/archeologue.jpg', name: "L'archéologue", text: "Personnage très utile pour avancer prudemment, son atout majeur est de pouvoir choisir entre 2 tuiles lors de chaque exploration. Un joker très appréciable !" },
      { type: 'char', image: 'assets/games/sub-terra-ii/characters/pretre.jpg', name: 'Le prêtre', text: "Alternative robuste à la guérisseuse. Sa puissance réside dans sa capacité à soigner très efficacement et à faire des dégâts de zone à des ennemis multiples." },
    ],
  },
  {
    slug: 'daybreak-critique',
    title: 'Daybreak - La critique',
    subtitle: 'Pourquoi Daybreak est devenu notre jeu chill du soir ?',
    date: '2026-08-06',
    author: 'Alex',
    gameSlug: 'daybreak',
    // Pas encore d'image reçue : placeholder logo affiché automatiquement.
    cover: '',
    excerpt: "Un jeu sur le réchauffement climatique, reposant ? On t'explique pourquoi Daybreak est devenu notre partie chill du soir.",
    blocks: [
      { type: 'p', text: "Aaaah Daybreak ! Si on nous avait dit, dans le magasin, que ce jeu qui ne payait pas de mine allait devenir un véritable coup de cœur, pas sûr qu’on y aurait cru !" },
      { type: 'p', text: "De prime abord, lutter contre le réchauffement climatique, en particulier dans le climat anxiogène actuel, ça fait pas super envie... on n’a pas vraiment l’impression qu’on va s’évader en jouant..." },
      { type: 'p', text: "Et pourtant, Daybreak est reposant !" },
      { type: 'p', text: "On joue ensemble donc, contre le réchauffement climatique." },
      { type: 'p', text: "Durant chaque début de manche, on choisit un projet global qui donne un bonus à toute l’équipe, on révèle la première carte crise qui donne le ton pour ce tour, on discute et on fait le point sur sa stratégie." },
      { type: 'p', text: "Passé cette étape, on utilise chacun les cartes de sa main, sur son propre plateau de jeu, pour lancer des projets locaux, équilibrer la demande en énergie, réduire ses émissions. Le tout en utilisant à bon escient les combos de cartes présentant les mêmes icônes afin d’amplifier les effets des cartes de manière exponentielle." },
      { type: 'p', text: "Au final, Daybreak est le jeu qu’on aime sortir quand on a envie de jouer malgré la fatigue. Un peu d’interaction, de la réflexion, des combos à faire dans son coin. On met en commun et on adapte sa stratégie pour le tour suivant." },
      { type: 'p', text: "Côté rejouabilité, on apprécie beaucoup le fait de pouvoir varier les zones économiques. Chacune a ses forces et ses faiblesses et l’association de zones différentes fera considérablement varier la difficulté." },
      { type: 'list', items: [
        'Europe et États-Unis : partie facile',
        'Chine et Monde majoritaire : prépare-toi à perdre !',
      ] },
      { type: 'p', text: "Si tu veux en découvrir plus sur les zones économiques et comment les exploiter au mieux, découvre notre article dédié." },
    ],
  },
  {
    slug: 'eila-et-leclat-de-la-montagne-critique',
    title: "Eila - Entre appréhension et émotions fortes",
    date: '2026-08-07',
    author: 'Camille',
    gameSlug: 'eila-et-leclat-de-la-montagne',
    banner: 'assets/games/eila-et-leclat-de-la-montagne/eila3-banniere.JPG',
    hero: 'assets/games/eila-et-leclat-de-la-montagne/eila1-bandeau.jpg',
    cover: 'assets/games/eila-et-leclat-de-la-montagne/eila1-vignette.JPG',
    excerpt: "Notre avis complet, sans spoiler (ou presque), sur Eila et l'Éclat de la Montagne.",
    blocks: [
      { type: 'p', text: "La première fois que nous avons sorti la boîte de « Eila et l’Éclat de la Montagne » pour y jouer, j’ai eu peur. Très peur. Dans une boîte aussi énorme devait forcément se trouver un livre de règles. J’anticipais déjà de longues heures de lutte acharnée contre le sommeil... Mais NON ! Des règles simples introduites de manière progressive, des graphismes sublimes et une histoire qui en émouvra plus d’un. Un vrai coup de cœur !" },
      { type: 'p', text: "Tu l’auras peut-être compris, Eila et l’Éclat de la Montagne, c’est mon jeu préféré ! Mais, même si je ne suis pas totalement objective, je vais essayer de te transmettre une partie des émotions que me procure Eila à chaque partie." },
      { type: 'p', text: "Plonger dans cette aventure est si facile..." },
      { type: 'h2', text: 'Des règles simples' },
      { type: 'p', text: "Contrairement à de nombreux jeux, les règles de Eila et l’Éclat de la Montagne sont simples et surtout elles sont introduites de manière progressive. Les chapitres 0 et 1 sont prévus pour se familiariser avec les différentes mécaniques et les règles de base. Dans chacun des chapitres suivants, la notice t’expliquera en quelques minutes les nouveaux ajustements à mettre en place et les nouvelles règles qui s’appliqueront." },
      { type: 'h2', text: 'Une grande richesse' },
      { type: 'p', text: "Derrière un jeu aux apparences enfantines, se cache un jeu très complet, mettant en jeu une grande variété de mécaniques : gestion de ressources, lancers de dés, déplacements sur un plateau de tuiles, choix multiples... Cette large variété permet d’éviter le côté un peu répétitif de certains jeux se basant sur une unique mécanique." },
      { type: 'h2', text: 'Un jeu pour tout le monde' },
      { type: 'p', text: "Si les premiers chapitres peuvent paraître d’une simplicité enfantine, la difficulté monte crescendo avec les suivants. Ainsi, Eila et l’Éclat de la Montagne devient finalement un jeu particulièrement stratégique où chaque choix peut tout changer. Pour autant, même des personnes peu habituées aux jeux de société pourront jouer un rôle important dans les prises de décision. En effet, avec Eila, les stratégies offensives dont tu peux avoir l’habitude dans d’autres jeux ne sont pas nécessairement les meilleures à adopter ! Sois prévenu !" },
      { type: 'h2', text: 'Une bonne rejouabilité' },
      { type: 'p', text: "Avec « Eila et l’Éclat de la Montagne », on parie que tu vas perdre ! Les derniers chapitres sont en effet plutôt complexes et tu souhaiteras forcément réussir les épreuves qui t’attendent. Par ailleurs, « Eila et l’Éclat de la Montagne » est un jeu narratif, toutes les fins ne se valent pas (si tu veux en savoir un petit peu plus, ouvre le ruban ci-dessous)..." },
      { type: 'spoiler', title: 'Ne pas cliquer si tu veux garder la surprise !!!!', text: "La première fois que nous avons joué, nous sommes allés à toute vitesse. Le jeu nous paraissait hyper simple. Nous sommes rapidement arrivés au dernier chapitre que nous avons malgré tout dû rejouer car nous avions perdu face à plusieurs ennemis particulièrement résistants. Et nous avons lu une des fins... Avec une certaine déception, il faut bien le dire. Nous avons tout recommencé, plusieurs fois. Et nous sommes enfin arrivés (moyennant quelques petits arrangements avec les dés... « oups le dé est cassé », « c’était à moi de lancer ») à la fin pour laquelle il valait le coup de persévérer encore et encore. On lit souvent des commentaires de joueurs qui ne comprennent pas pourquoi Eila est un jeu touchant avec une histoire profonde. Je n’en dirai pas plus pour ne pas gâcher la découverte de l’histoire, mais juste un conseil : persévère ! Et n’oublie pas qu’il s’agit d’une quête initiatique et qu’Eila (mais pas seulement elle) a des choses à apprendre." },
      { type: 'h2', text: 'Quelques points de frustration...' },
      { type: 'h2', text: 'Une certaine complexité' },
      { type: 'p', text: "Si les premiers chapitres sont très simples, ce n’est pas du tout le cas des derniers. Face à la malchance des lancers de dés, il est possible de se décourager ou de... forcer un peu le destin ! Dans plusieurs de nos parties, nous avons eu beaucoup de malchance dans les lancers de dés ET dans les tirages des cartes. En effet, pour les plus poisseux d’entre nous, il est possible que le sort s’acharne avec les dés et avec les cartes. Ces dernières peuvent alors sortir dans un ordre particulièrement défavorable... Ce qui compromet toute la suite du jeu." },
      { type: 'h2', text: 'La rejouabilité' },
      { type: 'p', text: "Même si, comme nous le disions plus haut, le jeu peut être recommencé plusieurs fois afin d’obtenir la meilleure fin possible, lorsque celle-ci est atteinte, le livre se termine. Malgré tout, je dirais que la rejouabilité est plutôt bonne pour un jeu narratif, mais forcément limitée si on la compare à d’autres jeux." },
      { type: 'h2', text: 'Hasard ou talent ?' },
      { type: 'p', text: "Une place importante est accordée aux lancers de dés qui peuvent parfois s’avérer frustrants si, comme moi, tu as une poisse d’enfer. Par ailleurs, comme je le mentionnais plus haut, nous retrouvons beaucoup d’aléatoire lors des tirages de cartes. Si l’ordre t’est particulièrement défavorable, tu peux tout aussi bien recommencer le chapitre !" },
      { type: 'p', text: "Si tu as été convaincu, on espère que tu vas prendre autant de plaisir que nous ! N’hésite pas à revenir ici pour nous donner ton avis sur le jeu dans les commentaires." },
    ],
  },
  {
    slug: 'wingspan-critique',
    title: 'Wingspan, ça vaut l’coup d’aile ?',
    date: '2026-08-10',
    author: 'Alex',
    gameSlug: 'wingspan',
    hero: 'assets/games/wingspan/wingspan-bandeau1.png',
    cover: 'assets/games/wingspan/wingspan-cavautlecoupdaile-vignette.JPG',
    banner: 'assets/games/wingspan/wingspan-banniere.JPG',
    excerpt: "On n’était pas franchement portés sur les oiseaux, et pourtant Wingspan a complètement réussi à nous conquérir. Notre avis sur le bestseller qui a lancé toute la franchise Span.",
    blocks: [
      { type: 'p', text: "Wingspan, le bestseller qui a lancé toute la franchise des Span ! Sorti en 2019, ce jeu est rapidement devenu un classique au sein de la communauté des amoureux du jeu de société." },
      { type: 'p', text: 'Et bien figure-toi qu’on ne l’a testé que très récemment ! Et pour cause, parmi nous, aucun n’était particulièrement fan d’oiseaux ! Ainsi, on est entré dans la franchise par <a href="/jeu.html?slug=finspan">Finspan</a> et on a adoré.' },
      { type: 'p', text: "Bon ok, on n’est peut-être pas si objectifs que ça vu qu’on a chacun un aquarium à la maison !" },
      { type: 'p', text: "De là, on s’est dit, et pourquoi pas tester Wingspan ?!" },
      { type: 'p', text: "Déjà, il faut le dire, le matériel est magnifique. Les cartes sont illustrées avec soin, les œufs rajoutent un charme fou au jeu, et surtout il y a une mangeoire à oiseau qui sert à lancer les dés (ça, on a kiffé comme disent les jeunes)." },
      { type: 'image', src: 'assets/games/wingspan/mangeoire.JPG', caption: 'La fameuse mangeoire, qui sert aussi à lancer les dés.' },
      { type: 'p', text: "Tu le sais si tu as lu nos autres critiques, Camille et moi on est vraiment fans des jeux coop et surtout pas des jeux prises de tête. Et bien Wingspan, c’est pas coop, mais c’est vraiment chill. Chacun fait son plateau de son côté, on est focus sur sa stratégie, sur ses cartes, on prend plaisir à découvrir chaque oiseau et tous les détails le concernant." },
      { type: 'image', src: 'assets/games/wingspan/wingspan-oiseau.JPG', caption: 'Chaque oiseau a ses propres caractéristiques et informations à découvrir.' },
      { type: 'p', text: "Bien sûr, l’objectif reste de gagner, et si tu es vraiment un compétitif pur et dur, tu vas t’y retrouver. À la fin, on compte bien évidemment les points, et comme d’hab, avec sa poisse légendaire combinée à ma chance insolente, Camille perd." },
      { type: 'p', text: "Le jeu a de nombreux avantages qui ont su nous conquérir. D’abord, il est facile à apprendre. Les mécaniques sont sensiblement les mêmes que dans Finspan, on n’était donc pas perdu. Mais même pour un novice, c’est vite compris et vite appris." },
      { type: 'p', text: "Les parties sont plutôt rapides et ne te bloqueront pas une après-midi complète. Côté rejouabilité, chaque partie est différente ! Avec des objectifs tirés aléatoirement, qu’ils soient communs ou personnels, ta stratégie et ton expérience de jeu seront complètement différentes à chaque fois." },
      { type: 'p', text: "Mais du coup tu te dis : « bon ok ça a l’air cool mais ils veulent en venir où ? »" },
      { type: 'p', text: "C’est vrai, on aurait pu t’épargner tout cet article. En bref, notre avis pourrait se résumer en une phrase :" },
      { type: 'p', text: "<strong>Les oiseaux, c’est pas notre truc, pourtant le jeu a su nous happer et nous émerveiller.</strong>" },
    ],
  },
];

// À compléter : noms, rôles, bios et photos des 4 membres de la team.
window.TEAM = [
  { name: 'Alex', linkedin: 'https://www.linkedin.com/in/alexandre-marchionini-b9500960/', role: "L'insupportable chanceux", bio: "Fan inconditionnel de jeux en tous genres ! En un mot, j’ai besoin de jouer pour être heureux. Que ce soit des jeux de société entre amis, en couple, en soirée ; des jeux vidéos avec Camille ; des jeux en extérieurs comme le Kubb ou encore des sports ludiques comme le tennis, j’ai besoin constamment du jeu pour créer du lien et du liant. Côté jeux de société, je suis un aficionado des jeux coopératifs et des jeux narratifs. Quoi de mieux que gagner ensemble ?", favoriteGame: 'Mysterium', photo: 'assets/team/photo-alex.jpg' },
  { name: 'Camille', role: 'La poisseuse', bio: 'Orthophoniste de métier, le jeu est pour moi essentiel, que ce soit dans mon quotidien professionnel ou personnel. Allergique aux "livres de règles" (type "Kingdom Rush"), j’aime les jeux faciles à apprendre (ou alors j’attends qu’Alex apprenne les règles pour me les expliquer). Dotée d’une très grande poisse, je préfère les jeux coopératifs qui m’épargneront une trop grande frustration...', favoriteGame: "Eila et l'Éclat de la Montagne", photo: 'assets/team/photo-camille.jpg' },
  { name: 'Guillaume', linkedin: 'https://www.linkedin.com/in/guillaume-laborie-32096191/', role: 'Le maître des règles', bio: 'Bio à compléter.', favoriteGame: 'Ark Nova', photo: 'assets/team/member-3.jpg' },
  { name: 'Mylène', linkedin: 'https://www.linkedin.com/in/mylenepoinard/', role: 'La mauvaise perdante aux Aventuriers du Rail', bio: 'Bio à compléter.', favoriteGame: 'Forêt mixte', photo: 'assets/team/member-4.jpg' },
];

// À compléter : URLs réelles des réseaux sociaux.
window.SOCIALS = {
  instagram: '#',
  facebook: '#',
  twitter: '#',
  tiktok: '#',
};
