# Ça Monstre Joue — App mobile

App React Native (Expo) qui reprend le contenu du site (jeux, articles, catégories) et ajoute
comptes utilisateurs, ludothèque personnelle et mise en relation entre joueurs par ville.

## Démarrer

```bash
npm install
npx expo start
```

Puis :

- **Sur ton téléphone (Android)** : installe [Expo Go](https://expo.dev/go), scanne le QR code
  affiché dans le terminal (même réseau Wi-Fi que cet ordinateur).
- **Dans le navigateur** : appuie sur `w` dans le terminal, ou lance `npx expo start --web`.

## Configuration nécessaire

Copie `.env.example` en `.env.local` et renseigne les valeurs Firebase (voir la console Firebase
du projet — Paramètres du projet > Vos applications). Sans ça, le contenu (jeux/articles) reste
consultable mais les comptes/ludothèque/joueurs restent désactivés.

## Structure

- `src/app/` — écrans (routing par fichiers, Expo Router).
- `src/lib/` — accès au contenu (`content.ts`), Firebase (`firebase.ts`), ludothèque, joueurs.
- `src/components/` — composants réutilisables.
- `firestore.rules` — règles de sécurité à coller dans la console Firebase.

## Publier

Voir [`PUBLISHING.md`](./PUBLISHING.md) une fois prêt à sortir l'app sur le Play Store.
