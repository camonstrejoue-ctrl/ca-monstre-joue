// Génère, à partir des gabarits jeu.html / article.html / categorie.html, une
// page statique par jeu/article/catégorie (jeu/<slug>/index.html, etc.) avec
// un <title>, une <meta description> et des balises Open Graph/Twitter propres
// à chaque contenu. Nécessaire car ces gabarits sont normalement vides tant
// que le JavaScript n'a pas tourné, ce que les robots de partage social
// (Facebook, X, WhatsApp, Instagram...) n'exécutent jamais.
//
// N'écrit jamais dans jeu.html / article.html / categorie.html : uniquement
// dans les dossiers générés jeu/, article/, categorie/ (gitignorés), au
// moment du déploiement GitHub Pages.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.join(__dirname, '..');
const BASE_URL = 'https://www.camonstrejoue.ch';
const FALLBACK_IMAGE = `${BASE_URL}/assets/logo.png`;

function loadContent() {
  const dataFile = path.join(rootDir, 'js', 'data.js');
  const source = fs.readFileSync(dataFile, 'utf8');
  const sandboxWindow = {};
  const context = vm.createContext({ window: sandboxWindow });
  vm.runInContext(source, context, { filename: dataFile });
  return sandboxWindow;
}

function absoluteUrl(relPath) {
  if (!relPath) return null;
  return `${BASE_URL}/${relPath.replace(/^\/+/, '')}`;
}

// Résumé en texte brut (pas de HTML), tronqué proprement pour une meta description.
function toDescription(value, maxLen) {
  const text = Array.isArray(value) ? value.join(' ') : (value || '');
  const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Remplace le bloc <title> + meta description/OG/Twitter/canonical générique
// du gabarit par les valeurs propres à ce contenu.
function injectMeta(template, { genericTitle, genericDescription, title, description, image, url, ogType }) {
  let html = template;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image || FALLBACK_IMAGE);

  html = html.replace(`<title>${genericTitle}</title>`, `<title>${t}</title>`);
  html = html.replaceAll(`content="${genericDescription}"`, `content="${d}"`);
  html = html.replaceAll(`content="${escapeHtml(genericTitle)}"`, `content="${t}"`);
  html = html.replace(/href="https:\/\/www\.camonstrejoue\.ch\/[a-z.]*"/, `href="${url}"`);
  html = html.replace(/content="https:\/\/www\.camonstrejoue\.ch\/[a-z.]*"/, `content="${url}"`);
  html = html.replace(/content="https:\/\/www\.camonstrejoue\.ch\/assets\/logo\.png"/g, `content="${img}"`);
  if (ogType) html = html.replace(/property="og:type" content="[a-z]+"/, `property="og:type" content="${ogType}"`);
  return html;
}

function writePage(outDir, html) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

function parsePlayerRange(str) {
  const nums = ((str || '').match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return null;
  return { min: nums[0], max: nums.length > 1 ? nums[1] : Infinity };
}

// Insère un ou plusieurs objets JSON-LD (un <script> par objet) juste avant
// </head> — données structurées lues par les moteurs de réponse IA
// (Perplexity, AI Overviews...) pour extraire des faits fiables sans avoir à
// exécuter de JavaScript.
function injectJsonLd(html, objects) {
  const scripts = objects
    .map((obj) => `<script type="application/ld+json">\n${JSON.stringify(obj)}\n</script>`)
    .join('\n');
  return html.replace('</head>', `${scripts}\n</head>`);
}

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item,
    })),
  };
}

function gameJsonLd(g, categories, url) {
  const firstCat = categories.find((c) => (g.categories || [])[0] === c.slug);
  const crumbs = [['Accueil', `${BASE_URL}/`]];
  if (firstCat) crumbs.push([firstCat.name, `${BASE_URL}/categorie/${firstCat.slug}/`]);
  crumbs.push([g.name, url]);

  const players = parsePlayerRange(g.identity && g.identity.players);
  const review = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Game',
      name: g.name,
      description: toDescription(g.intro || g.fitIntro || '', 300),
      image: absoluteUrl(g.cover || g.thumbnail) || FALLBACK_IMAGE,
      ...(players ? { numberOfPlayers: { '@type': 'QuantitativeValue', minValue: players.min, ...(Number.isFinite(players.max) ? { maxValue: players.max } : {}) } } : {}),
    },
    ...(g.identity && g.identity.note
      ? { reviewRating: { '@type': 'Rating', ratingValue: g.identity.note.stars, bestRating: g.identity.note.max || 6, worstRating: 1 } }
      : {}),
    author: { '@type': 'Organization', name: 'Ça Monstre Joue' },
    publisher: { '@type': 'Organization', name: 'Ça Monstre Joue' },
  };
  return [breadcrumb(crumbs), review];
}

function articleJsonLd(a, game, url) {
  const crumbs = [['Accueil', `${BASE_URL}/`]];
  if (game) crumbs.push([game.name, `${BASE_URL}/jeu/${game.slug}/`]);
  crumbs.push([a.title, url]);

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: toDescription(a.excerpt || '', 300),
    image: absoluteUrl(a.banner || a.cover) || FALLBACK_IMAGE,
    ...(a.date ? { datePublished: a.date } : {}),
    author: { '@type': 'Organization', name: 'Ça Monstre Joue' },
    publisher: {
      '@type': 'Organization',
      name: 'Ça Monstre Joue',
      logo: { '@type': 'ImageObject', url: FALLBACK_IMAGE },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  return [breadcrumb(crumbs), article];
}

function categoryJsonLd(c, url) {
  const crumbs = [['Accueil', `${BASE_URL}/`], [c.name, url]];
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${c.name} — Ça Monstre Joue`,
    description: `Tous nos jeux de la catégorie ${c.name} sur Ça Monstre Joue.`,
    url,
  };
  return [breadcrumb(crumbs), collection];
}

// Même règle de programmation que côté client (js/main.js) : un article dont
// `date` est dans le futur garde sa page générée (prête dès que la date
// arrive) mais reste absent du sitemap et de llms.txt tant que ce n'est pas
// le cas, pour ne pas le faire indexer/découvrir en avance.
function isPublished(article) {
  return article.date <= new Date().toISOString().slice(0, 10);
}

function main() {
  const { GAMES = [], ARTICLES = [], CATEGORIES = [] } = loadContent();

  const gameTemplate = fs.readFileSync(path.join(rootDir, 'jeu.html'), 'utf8');
  const articleTemplate = fs.readFileSync(path.join(rootDir, 'article.html'), 'utf8');
  const categoryTemplate = fs.readFileSync(path.join(rootDir, 'categorie.html'), 'utf8');

  const urls = [`${BASE_URL}/`, `${BASE_URL}/tous-les-jeux.html`, `${BASE_URL}/agenda.html`, `${BASE_URL}/guides.html`, `${BASE_URL}/equipe.html`, `${BASE_URL}/contact.html`, `${BASE_URL}/app.html`];

  GAMES.forEach((g) => {
    const url = `${BASE_URL}/jeu/${g.slug}/`;
    let html = injectMeta(gameTemplate, {
      genericTitle: 'Fiche jeu — Ça Monstre Joue',
      genericDescription: 'Découvre nos fiches jeux détaillées : identité complète, notre avis, vidéo et bien plus, sur le blog Ça Monstre Joue.',
      title: `${g.name} — Ça Monstre Joue`,
      description: toDescription(g.intro || g.fitIntro || '', 160),
      image: absoluteUrl(g.cover || g.thumbnail),
      url,
      ogType: 'website',
    });
    html = injectJsonLd(html, gameJsonLd(g, CATEGORIES, url));
    writePage(path.join(rootDir, 'jeu', g.slug), html);
    urls.push(url);
  });

  ARTICLES.forEach((a) => {
    const url = `${BASE_URL}/article/${a.slug}/`;
    let html = injectMeta(articleTemplate, {
      genericTitle: 'Article — Ça Monstre Joue',
      genericDescription: "Critiques, conseils et avis détaillés sur des jeux de société, par l'équipe de Ça Monstre Joue.",
      title: `${a.title} — Ça Monstre Joue`,
      description: toDescription(a.excerpt || '', 160),
      image: absoluteUrl(a.banner || a.cover),
      url,
      ogType: 'article',
    });
    const game = GAMES.find((g) => g.slug === a.gameSlug);
    html = injectJsonLd(html, articleJsonLd(a, game, url));
    writePage(path.join(rootDir, 'article', a.slug), html);
    if (isPublished(a)) urls.push(url);
  });

  CATEGORIES.forEach((c) => {
    const url = `${BASE_URL}/categorie/${c.slug}/`;
    let html = injectMeta(categoryTemplate, {
      genericTitle: 'Catégorie — Ça Monstre Joue',
      genericDescription: 'Explore nos jeux de société classés par catégorie sur Ça Monstre Joue.',
      title: `${c.name} — Ça Monstre Joue`,
      description: `Tous nos jeux de la catégorie ${c.name} sur Ça Monstre Joue, classés par ordre alphabétique.`,
      image: absoluteUrl(c.image),
      url,
      ogType: 'website',
    });
    html = injectJsonLd(html, categoryJsonLd(c, url));
    writePage(path.join(rootDir, 'categorie', c.slug), html);
    urls.push(url);
  });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${escapeHtml(u)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemap, 'utf8');

  const publishedArticles = ARTICLES.filter(isPublished);
  const guideArticles = publishedArticles.filter((a) => a.guide);
  const otherArticles = publishedArticles.filter((a) => !a.guide);

  const llmsTxt = [
    '# Ça Monstre Joue',
    '',
    '> Blog suisse de jeux de société tenu par quatre passionnés : critiques honnêtes, fiches jeux',
    '> détaillées (nombre de joueurs, âge, durée, complexité, note sur 6) et conseils pour choisir',
    '> sa prochaine partie.',
    '',
    '## Jeux',
    ...GAMES.map((g) => `- [${g.name}](${BASE_URL}/jeu/${g.slug}/): ${toDescription(g.intro || g.fitIntro || '', 200)}`),
    '',
    '## Articles',
    ...otherArticles.map((a) => `- [${a.title}](${BASE_URL}/article/${a.slug}/): ${toDescription(a.excerpt || '', 200)}`),
    '',
    `## Guides du Monstre (${BASE_URL}/guides.html)`,
    ...guideArticles.map((a) => `- [${a.title}](${BASE_URL}/article/${a.slug}/): ${toDescription(a.excerpt || '', 200)}`),
    '',
    '## Catégories',
    ...CATEGORIES.map((c) => `- [${c.name}](${BASE_URL}/categorie/${c.slug}/)`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(rootDir, 'llms.txt'), llmsTxt, 'utf8');

  console.log(
    `Pages SEO générées : ${GAMES.length} jeux, ${ARTICLES.length} articles, ${CATEGORIES.length} catégories. sitemap.xml : ${urls.length} URLs. llms.txt généré.`
  );
}

main();
