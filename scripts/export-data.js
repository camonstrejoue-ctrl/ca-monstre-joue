// Génère data/content.json à partir de js/data.js, sans jamais modifier ce
// dernier. js/data.js est écrit pour tourner dans un navigateur (il assigne
// directement à `window`) ; on l'exécute donc dans un faux `window` sandboxé.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.join(__dirname, '..');
const dataFile = path.join(rootDir, 'js', 'data.js');
const outDir = path.join(rootDir, 'data');
const outFile = path.join(outDir, 'content.json');

const source = fs.readFileSync(dataFile, 'utf8');

const sandboxWindow = {};
const context = vm.createContext({ window: sandboxWindow });
vm.runInContext(source, context, { filename: dataFile });

const { GAMES, ARTICLES, CATEGORIES, TEAM, SOCIALS } = sandboxWindow;

for (const [name, value] of Object.entries({ GAMES, ARTICLES, CATEGORIES })) {
  if (!Array.isArray(value)) {
    throw new Error(`js/data.js n'a pas défini window.${name} comme un tableau.`);
  }
}

const content = {
  generatedAt: new Date().toISOString(),
  games: GAMES,
  articles: ARTICLES,
  categories: CATEGORIES,
  team: TEAM || [],
  socials: SOCIALS || {},
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(content, null, 2) + '\n', 'utf8');

console.log(
  `data/content.json généré : ${GAMES.length} jeux, ${ARTICLES.length} articles, ${CATEGORIES.length} catégories.`
);
