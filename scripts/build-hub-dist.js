// Assemble hub-dist/ : le strict nécessaire pour héberger « Le Hub de CMJ »
// seul sur Firebase Hosting (ca-monstre-joue.web.app), SANS exposer le reste
// du site (qui n'est pas encore lancé). Lancé automatiquement avant chaque
// `firebase deploy --only hosting` (voir predeploy dans firebase.json).
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'hub-dist');

// Fichiers repris tels quels, avec la même arborescence relative (hub.html
// référence /css/…, /js/…, /assets/… en chemins absolus).
const FILES = [
  'hub.html',
  'css/hub.css',
  'js/hub.js',
  'js/hub-seed.json',
  'assets/logo.png',
  'assets/monstre.png',
];

fs.rmSync(dist, { recursive: true, force: true });
for (const rel of FILES) {
  const from = path.join(root, rel);
  const to = path.join(dist, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// Racine -> Hub, et rien à indexer sur ce domaine interne.
fs.writeFileSync(
  path.join(dist, 'index.html'),
  '<!doctype html><meta charset="utf-8"><title>Le Hub de CMJ</title>' +
  '<meta name="robots" content="noindex, nofollow">' +
  '<meta http-equiv="refresh" content="0; url=/hub.html">' +
  '<a href="/hub.html">Le Hub</a>\n'
);
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

console.log(`hub-dist/ assemblé (${FILES.length} fichiers + index.html + robots.txt).`);
