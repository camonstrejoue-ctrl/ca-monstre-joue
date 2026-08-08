# Publier Ça Monstre Joue sur le Play Store

Ce guide suppose que tu es prêt à publier. Tant que ce n'est pas le cas, aucune de ces étapes
n'est nécessaire — l'app se teste très bien sans jamais les exécuter (voir `README.md` ou le
message de Claude Code pour tester avec Expo Go).

## 1. Comptes nécessaires (à créer toi-même)

- **Compte Expo** (gratuit) sur https://expo.dev — nécessaire pour utiliser EAS Build (compile
  l'app dans le cloud, pas besoin d'installer Android Studio).
- **Compte développeur Google Play** (25 $, une seule fois) sur
  https://play.google.com/console/signup

## 2. Installer et connecter EAS CLI

```bash
npm install -g eas-cli
eas login
```

## 3. Lier le projet à ton compte Expo

Depuis le dossier `app/` :

```bash
eas build:configure
```

Ça va créer un `projectId` lié à ton compte et l'ajouter à `app.json`.

## 4. Build de test (APK, installable directement sur un téléphone Android)

```bash
eas build --profile preview --platform android
```

Une fois terminé (quelques minutes), EAS te donne un lien de téléchargement — installe l'APK sur
ton téléphone (il faudra peut-être autoriser "sources inconnues" dans les réglages Android) pour
tester l'app "en vrai", hors Expo Go.

## 5. Build de production (format attendu par le Play Store)

```bash
eas build --profile production --platform android
```

Produit un fichier `.aab` (Android App Bundle).

## 6. Créer la fiche sur le Play Store

Dans la [Play Console](https://play.google.com/console) :

1. Créer une application → "Ça Monstre Joue".
2. Renseigner la fiche store : description courte/longue, icône 512×512, image de couverture
   1024×500, captures d'écran (au moins 2, prises depuis l'app).
3. Remplir le questionnaire de classification de contenu et la section confidentialité (données
   collectées : e-mail, pseudo, ville — voir `src/app/cgu.tsx` pour le texte déjà rédigé).
4. Uploader le `.aab` généré à l'étape 5 dans un canal de test (interne ou fermé) d'abord.

## 7. Soumettre (optionnel, via EAS)

```bash
eas submit --platform android
```

Envoie directement le dernier build vers la Play Console (alternative à l'upload manuel).

---

**Rappel :** publier sur le Play Store est un acte définitif et visible publiquement — vérifie
toute la fiche (textes, captures, prix) avant de passer un test interne en production.
