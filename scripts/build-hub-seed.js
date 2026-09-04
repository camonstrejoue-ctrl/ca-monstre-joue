// Dev, one-shot : convertit l'export OneNote « Le Hub de CMJ » (.onepkg
// décompressé en dossier de fichiers .one) en js/hub-seed.json, importable
// une seule fois depuis le Hub pour amorcer l'arborescence et le contenu.
//
// Usage :
//   node scripts/build-hub-seed.js "<dossier contenant les .one>"
//
// L'extraction du texte est heuristique (le format .one est binaire, MS-ONESTORE
// stocke le texte en UTF-16LE dans des property sets) : la mise en forme, les
// images, les liens et l'ordre exact des paragraphes ne sont pas garantis.
// L'équipe relit et corrige après import.
'use strict';

const fs = require('fs');
const path = require('path');

const srcDir = process.argv[2];
if (!srcDir || !fs.existsSync(srcDir)) {
  console.error('Dossier source introuvable. Usage : node scripts/build-hub-seed.js "<dossier .one>"');
  process.exit(1);
}

const OUT = path.join(__dirname, '..', 'js', 'hub-seed.json');

// Nettoie une chaîne : NBSP -> espace, retire caractères de contrôle et
// caractère de remplacement U+FFFD, compacte les espaces.
function normalize(s) {
  let out = '';
  for (const ch of String(s)) {
    const c = ch.codePointAt(0);
    if (c === 0xa0 || c === 0x2007 || c === 0x202f) out += ' ';
    else if (c < 0x20 || c === 0x7f || c === 0xfffd) out += ' ';
    else out += ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

// --- Extraction des suites de texte UTF-16LE -------------------------------
function extractRuns(buf) {
  const runs = [];
  let cur = [];
  for (let i = 0; i + 1 < buf.length; i += 2) {
    const code = buf[i] | (buf[i + 1] << 8);
    const isText =
      code === 0x09 || code === 0x0a || code === 0x0d ||
      (code >= 0x20 && code <= 0x2027) ||
      (code >= 0x2030 && code <= 0x205e) ||
      code === 0x20ac ||
      (code >= 0x2018 && code <= 0x201f) ||
      (code >= 0xa0 && code <= 0x017f);
    if (isText) {
      cur.push(code);
    } else {
      if (cur.length >= 6) runs.push(String.fromCharCode.apply(null, cur));
      cur = [];
    }
  }
  if (cur.length >= 6) runs.push(String.fromCharCode.apply(null, cur));
  return runs;
}

// Bruit OneNote récurrent : polices, libellés de gabarit, nom du compte,
// métadonnées de synchro, lignes « À partir de l'adresse … ».
const NOISE_EXACT = new Set([
  'Posts RS', 'PageTitle', 'PageDateTime', 'Calibri', 'Calibri Light',
  'Nunito', 'Baloo 2', 'Aqwel Aqwel', 'Sans titre', 'Page sans titre',
  'Présentation du jeu',
]);
const NOISE_RE = [
  /^<resolutionId/i,
  /^À partir de l['’]adresse\s*</i,
  /^https?:\/\/\S+$/i,
  /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i,   // GUID interne OneNote
  /^[A-ZÀ-Ý][a-zà-ÿ]+ [A-ZÀ-Ý][a-zà-ÿ]+$/,      // « Prénom Nom » seul sur sa ligne
];

function stripInline(s) {
  return normalize(
    String(s)
      .replace(/HYPERLINK\s+"[^"]*"/g, '')
      .replace(/<https?:\/\/[^>]*>/g, '')
  );
}

function cleanRuns(runs) {
  const seen = new Set();
  const out = [];
  for (let r of runs) {
    r = stripInline(r);
    if (r.length < 6) continue;
    if (NOISE_EXACT.has(r)) continue;
    if (NOISE_RE.some((re) => re.test(r))) continue;
    const letters = (r.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    if (letters < 5) continue;
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(r);
  }
  return out;
}

// Répare le mojibake « UTF-8 lu comme latin1 » des noms extraits du .onepkg.
function repairName(name) {
  let s = String(name);
  if (/Ã.|â€/.test(s)) s = Buffer.from(s, 'latin1').toString('utf8');
  return normalize(s.replace(/\^J/g, ' '))
    .replace(/^Article\s*[-–—_]\s*/i, '')
    .replace(/\.one$/i, '')
    .trim();
}

function classify(relPath) {
  // On classe d'après les DOSSIERS parents uniquement (repairName gère le
  // mojibake) — pas d'après le nom de fichier, qui contient souvent « jeux ».
  const dirs = path.dirname(relPath).split(/[\\/]/).map((d) => repairName(d).toLowerCase());
  const status = dirs.some((d) => /non\s*publi/.test(d)) ? 'Non Publiés' : 'Publiés';
  const kind = dirs.some((d) => /page.*jeux|jeux/.test(d) && !/guide/.test(d)) ? 'Pages de jeux' : 'Guides';
  return { status, kind };
}

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else if (name.toLowerCase().endsWith('.one')) acc.push(full);
  }
  return acc;
}

// --- Construction du seed --------------------------------------------------
let idc = 0;
const nid = (p) => `seed-${p}-${String(++idc).padStart(3, '0')}`;

const nodes = [];
const pages = [];
const folderId = {};

function ensureFolder(title, parentId, key, order) {
  if (folderId[key]) return folderId[key];
  const id = nid('folder');
  folderId[key] = id;
  nodes.push({ id, type: 'folder', parentId: parentId || null, title, order });
  return id;
}

['Non Publiés', 'Publiés'].forEach((status, i) => {
  const sid = ensureFolder(status, null, status, i);
  ['Guides', 'Pages de jeux'].forEach((kind, j) => {
    ensureFolder(kind, sid, `${status} > ${kind}`, j);
  });
});

const files = walk(srcDir, []).sort();
const orderByFolder = {};

for (const file of files) {
  const rel = path.relative(srcDir, file);
  const { status, kind } = classify(rel);
  const parentId = folderId[`${status} > ${kind}`];
  const fileTitle = repairName(path.basename(file));
  const runs = cleanRuns(extractRuns(fs.readFileSync(file)));

  let title;
  if (kind === 'Pages de jeux') {
    title = fileTitle; // nom de fichier = nom du jeu, plus fiable que le contenu
  } else {
    // Guides : le nom de fichier est parfois tronqué. On le garde comme base,
    // mais si une suite du contenu commence pareil et va plus loin, elle est
    // le titre complet.
    const key = fileTitle.slice(0, 18).toLowerCase().replace(/[^a-zà-ÿ0-9]/gi, '');
    const fuller = runs.find(
      (r) => r.length <= 160
        && r.toLowerCase().replace(/[^a-zà-ÿ0-9]/gi, '').startsWith(key)
        && r.length > fileTitle.length
    );
    title = fuller || fileTitle;
    if (title.length > 120) title = title.slice(0, 120).replace(/\s+\S*$/, '') + '…';
  }
  title = (title || 'Sans titre').trim();

  const body = runs.filter((r) => r !== title);

  orderByFolder[parentId] = (orderByFolder[parentId] || 0) + 1;
  const id = nid('page');
  nodes.push({ id, type: 'page', parentId, title, order: orderByFolder[parentId] });

  const blocks = body.map((text) => {
    const isHeading = text.length <= 70 && !/[.:!?»]$/.test(text) && /[A-Za-zÀ-ÿ]/.test(text);
    return isHeading
      ? { type: 'header', data: { text, level: 3 } }
      : { type: 'paragraph', data: { text } };
  });
  if (blocks.length === 0) blocks.push({ type: 'paragraph', data: { text: '' } });
  pages.push({ id, blocks });
}

const seed = {
  generatedAt: new Date().toISOString(),
  note: 'Import unique — extraction heuristique depuis OneNote, à relire/corriger.',
  nodes,
  pages,
};

fs.writeFileSync(OUT, JSON.stringify(seed, null, 2) + '\n', 'utf8');
console.log(
  `hub-seed.json écrit : ${nodes.filter((n) => n.type === 'folder').length} dossiers, ` +
  `${pages.length} pages -> ${path.relative(path.join(__dirname, '..'), OUT)}`
);
