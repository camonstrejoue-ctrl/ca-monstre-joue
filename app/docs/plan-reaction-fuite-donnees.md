# Plan de réaction en cas de fuite de données

Aide-mémoire interne (pas un document public) — à suivre si tu soupçonnes un accès non
autorisé, une perte ou une divulgation de données de l'app (comptes, profils, événements,
signalements...). Basé sur l'art. 24 de la nLPD (obligation de notifier le PFPDT "dans les
meilleurs délais" en cas de violation présentant un risque élevé pour les personnes concernées).

## 1. Signes qui doivent déclencher ce plan

- Alerte Firebase (Console → Project Settings → Security, ou email Google) sur un accès
  anormal, une clé API compromise, ou un pic de lecture/écriture inhabituel.
- Une règle Firestore accidentellement trop permissive découverte (ex. via un test comme
  ceux effectués dans cette session).
- Un utilisateur ou un tiers signale avoir vu des données d'un autre compte.
- Perte ou vol d'un appareil/compte ayant accès à la console Firebase (accès admin complet).

## 2. Premières actions (dans l'heure si possible)

1. **Contenir** : si la cause est identifiée (règle trop ouverte, clé exposée), corriger
   immédiatement — republier des règles Firestore restrictives, régénérer une clé API
   compromise (Firebase Console → Project Settings → General → tes applications), ou
   révoquer l'accès d'un collaborateur.
2. **Ne pas supprimer les preuves** : avant de nettoyer quoi que ce soit, noter ce qui a été
   trouvé (capture d'écran, requête suspecte, horodatage).
3. **Évaluer l'ampleur** : quelles données (emails, âges, villes, mots de passe — normalement
   jamais en clair via Firebase Auth — photos de souvenirs — jamais sur nos serveurs de toute
   façon), combien de comptes, depuis quand.

## 3. Faut-il notifier le PFPDT ?

Oui si la violation est **susceptible d'entraîner un risque élevé** pour les personnes
concernées (ex. données de contact ou d'âge exposées à des inconnus, ce qui est justement le
risque que les règles Firestore et l'écran 18+ visent à éviter). Dans le doute, mieux vaut
notifier.

- Formulaire en ligne du PFPDT : https://www.edoeb.admin.ch/ (rubrique "Annoncer une
  violation de la sécurité des données").
- Informations à préparer : nature de la violation, catégories et nombre approximatif de
  personnes concernées, conséquences probables, mesures déjà prises ou prévues.
- "Dans les meilleurs délais" n'a pas de délai chiffré fixe en droit suisse (contrairement au
  RGPD et ses 72h) — mais agir vite reste la meilleure protection, autant pour les personnes
  concernées que pour toi.

## 4. Informer les personnes concernées

Nécessaire si c'est utile à leur protection (ex. changer de mot de passe) ou si le PFPDT
l'exige. Canal : email à l'adresse de contact du compte, ou notification in-app si l'app est
encore accessible. Rester factuel : ce qui s'est passé, quelles données, ce que tu as fait,
ce qu'iels peuvent faire de leur côté.

## 5. Après coup

- Documenter l'incident (même en interne, un simple fichier texte avec date, cause, mesures)
  — utile si le PFPDT pose des questions plus tard, et pour ne pas refaire la même erreur.
  Aucun modèle imposé : ce fichier peut lui-même servir de journal si besoin.
- Revoir si une mesure structurelle s'impose (ex. règles Firestore plus strictes,
  vérification supplémentaire côté rules — voir le travail déjà fait sur
  `visibleToPlayers`/`birthdate` dans `firestore.rules`).

## Contact

Registre/déclaration : camonstrejoue@gmail.com — c'est aussi l'adresse "responsable du
traitement" affichée dans la politique de confidentialité, donc le point d'entrée naturel
pour une notification externe.
