/* ============================================
   ÇA MONSTRE JOUE — Comportements & rendu de pages
   ============================================ */

// ---------- helpers ----------
function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  (children || []).forEach(c => c && node.appendChild(c));
  return node;
}
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function findGame(slug) { return (window.GAMES || []).find(g => g.slug === slug); }
function findArticle(slug) { return (window.ARTICLES || []).find(a => a.slug === slug); }
function findCategory(slug) { return (window.CATEGORIES || []).find(c => c.slug === slug); }
function gamesInCategory(catSlug) {
  return (window.GAMES || [])
    .filter(g => g.categories.includes(catSlug))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
function articlesForGame(slug) {
  return (window.ARTICLES || []).filter(a => a.gameSlug === slug);
}
function spotifyEmbed(url) {
  if (!url) return null;
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode|artist)\/([a-zA-Z0-9]+)/);
  if (!m) return null;
  return { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, height: (m[1] === 'playlist' || m[1] === 'album') ? 352 : 152 };
}
function starRow(stars, max, label) {
  max = max || 5;
  const full = Math.floor(stars);
  const hasHalf = (stars - full) >= 0.5;
  const wrap = el('span', { class: 'stars', 'aria-label': `${stars}/${max}` + (label ? ` — ${label}` : '') });
  for (let i = 1; i <= max; i++) {
    if (i <= full) {
      wrap.appendChild(el('span', { class: 'star star--full', html: '&#9733;' }));
    } else if (i === full + 1 && hasHalf) {
      wrap.appendChild(el('span', { class: 'star star--half', html: '&#9733;<span class="star-half-fill">&#9733;</span>' }));
    } else {
      wrap.appendChild(el('span', { class: 'star star--empty', html: '&#9733;' }));
    }
  }
  if (label) wrap.appendChild(el('span', { class: 'stars-label', text: ' ' + label }));
  return wrap;
}
function youTubeEmbed(url) {
  if (!url) return null;
  const patterns = [
    /shorts\/([a-zA-Z0-9_-]{6,})/,
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /[?&]v=([a-zA-Z0-9_-]{6,})/,
    /embed\/([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}
// palette rotation for image placeholders when no real photo is set yet
const PH_CLASSES = ['ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5', 'ph-6'];
function placeholderMedia(seed) {
  const idx = Math.abs(hashCode(seed || '')) % PH_CLASSES.length;
  const wrap = el('div', { class: `ph ${PH_CLASSES[idx]}` });
  const img = el('img', { class: 'mascot', src: 'assets/logo.png', alt: '' });
  wrap.appendChild(img);
  return wrap;
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return h;
}
function mediaElement(src, alt, seed) {
  if (!src) return placeholderMedia(seed);
  const img = el('img', { src, alt: alt || '', loading: 'lazy' });
  img.style.display = 'block';
  img.style.width = '100%';
  img.style.height = 'auto';
  img.addEventListener('error', () => { img.replaceWith(placeholderMedia(seed)); }, { once: true });
  return img;
}

// ---------- navigation (dropdown + mobile menu) ----------
function initNav() {
  const toggle = qs('.menu-toggle');
  const nav = qs('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
  qsa('.nav-item.has-dropdown > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const item = link.closest('.nav-item');
      const wasOpen = item.classList.contains('open');
      qsa('.nav-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) qsa('.nav-item.open').forEach(i => i.classList.remove('open'));
  });
}

// ---------- newsletter + contact forms ----------
function initForms() {
  const nl = qs('#newsletter-form');
  if (nl) {
    nl.addEventListener('submit', (e) => {
      e.preventDefault();
      qs('.newsletter-success', nl.parentElement)?.classList.add('show');
      nl.reset();
    });
  }
  const contact = qs('#contact-form');
  if (contact) {
    contact.addEventListener('submit', (e) => {
      e.preventDefault();
      qs('.form-success').classList.add('show');
      contact.reset();
    });
  }
}

// ---------- HOME: hero carousel + category grid ----------
function carouselSlideMedia(src, alt, seed) {
  if (!src) {
    const ph = placeholderMedia(seed);
    ph.style.width = '100%';
    ph.style.height = '100%';
    ph.style.aspectRatio = 'auto';
    return ph;
  }
  const img = el('img', { src, alt: alt || '' });
  img.addEventListener('error', () => { img.replaceWith(carouselSlideMedia(null, alt, seed)); }, { once: true });
  return img;
}

function renderHomeHero() {
  const carousel = qs('#hero-carousel');
  if (!carousel) return;
  const track = qs('#carousel-track');
  const dotsWrap = qs('#carousel-dots');
  const prevBtn = qs('#carousel-prev');
  const nextBtn = qs('#carousel-next');
  const latest = [...(window.ARTICLES || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  track.innerHTML = '';
  dotsWrap.innerHTML = '';
  if (latest.length === 0) { carousel.style.display = 'none'; return; }

  latest.forEach((a, i) => {
    const slide = el('a', { class: 'carousel-slide', href: `article.html?slug=${a.slug}` });
    slide.appendChild(carouselSlideMedia(a.banner || a.cover, a.title, a.slug));
    slide.appendChild(el('span', { class: 'badge', text: 'Nouvel article' }));
    slide.appendChild(el('div', { class: 'overlay' }, [
      el('h3', { text: a.title }),
      el('span', { text: formatDate(a.date) }),
    ]));
    track.appendChild(slide);

    const dot = el('button', { type: 'button', 'aria-label': `Aller à l'article ${i + 1}` });
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = qsa('button', dotsWrap);
  let index = 0;
  let timer = null;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function goTo(i) { index = (i + latest.length) % latest.length; update(); resetTimer(); }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }
  function resetTimer() {
    if (timer) clearInterval(timer);
    if (latest.length > 1) timer = setInterval(next, 5000);
  }

  const multi = latest.length > 1;
  prevBtn.style.display = multi ? '' : 'none';
  nextBtn.style.display = multi ? '' : 'none';
  dotsWrap.style.display = multi ? '' : 'none';
  prevBtn.onclick = prev;
  nextBtn.onclick = next;
  carousel.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  carousel.addEventListener('mouseleave', resetTimer);

  update();
  resetTimer();
}

function renderCategoryGrid() {
  const mount = qs('#category-grid');
  if (!mount) return;
  mount.innerHTML = '';
  (window.CATEGORIES || []).forEach(cat => {
    const card = el('a', { class: 'cat-card', href: `categorie.html?cat=${cat.slug}` });
    card.appendChild(mediaElement(cat.image, cat.name, cat.slug));
    card.appendChild(el('div', { class: 'overlay' }, [
      el('span', { class: 'highlight', text: cat.name }),
    ]));
    mount.appendChild(card);
  });
}

// ---------- CATEGORY page ----------
function renderCategoryPage() {
  const mount = qs('#games-grid');
  if (!mount) return;
  const catSlug = getParam('cat');
  const cat = findCategory(catSlug);
  qsa('[data-cat-name]').forEach(n => n.textContent = cat ? cat.name : 'Catégorie');
  const games = gamesInCategory(catSlug);
  mount.innerHTML = '';
  if (games.length === 0) {
    mount.appendChild(el('p', { text: 'De nouveaux jeux arrivent bientôt dans cette catégorie !', style: 'text-align:center;color:var(--gray);grid-column:1/-1;' }));
    return;
  }
  games.forEach(g => {
    const card = el('div', { class: 'game-card' });
    const thumb = el('a', { class: 'thumb', href: `jeu.html?slug=${g.slug}` });
    thumb.appendChild(mediaElement(g.thumbnail || g.cover, g.name, g.slug));
    const btn = el('a', { class: 'btn btn--block', href: `jeu.html?slug=${g.slug}`, text: g.name });
    card.appendChild(thumb);
    card.appendChild(btn);
    mount.appendChild(card);
  });
}

// ---------- GAME page ----------
function renderGamePage() {
  const root = qs('#game-root');
  if (!root) return;
  const g = findGame(getParam('slug'));
  if (!g) {
    root.innerHTML = '<div class="container"><p style="padding:60px 0;text-align:center;">Ce jeu n\'existe pas (encore).</p></div>';
    return;
  }
  document.title = `${g.name} — Ça Monstre Joue`;
  qsa('[data-game-name]').forEach(n => n.textContent = g.name);
  const introEl = qs('[data-game-intro]');
  introEl.innerHTML = '';
  (Array.isArray(g.intro) ? g.intro : [g.intro]).forEach(p => introEl.appendChild(el('p', { text: p })));

  const heroTrack = qs('#game-hero-track');
  const heroDotsWrap = qs('#game-hero-dots');
  const heroScrim = qs('.game-hero-scrim');
  if (heroTrack) {
    const images = (g.heroImages && g.heroImages.length)
      ? g.heroImages
      : [g.cover, ...(g.gallery || []).map(i => i.image)].filter(Boolean);
    const slides = images.length ? images : [null];
    heroTrack.innerHTML = '';
    heroDotsWrap.innerHTML = '';
    slides.forEach((src, i) => {
      const slide = el('div', { class: 'slide' });
      slide.appendChild(carouselSlideMedia(src, g.name, g.slug + '-' + i));
      heroTrack.appendChild(slide);
      if (slides.length > 1) {
        const dot = el('button', { type: 'button', 'aria-label': `Image ${i + 1}` });
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => heroGoTo(i));
        heroDotsWrap.appendChild(dot);
      }
    });
    const heroDots = qsa('button', heroDotsWrap);
    let heroIndex = 0;
    let heroTimer = null;
    // object-fit:contain letterboxes the img inside its full-size box ; the scrim
    // must only darken the visible photo, not the blank bars, or the bars read as grey.
    function updateHeroScrim() {
      if (!heroScrim) return;
      const container = qs('.game-hero');
      const activeImg = qs(`.slide:nth-child(${heroIndex + 1}) img`, heroTrack);
      if (!container || !activeImg || !activeImg.naturalWidth) { heroScrim.style.cssText = ''; return; }
      const cw = container.clientWidth, ch = container.clientHeight;
      const containerRatio = cw / ch;
      const imgRatio = activeImg.naturalWidth / activeImg.naturalHeight;
      if (imgRatio > containerRatio) {
        const visibleH = cw / imgRatio;
        heroScrim.style.cssText = `left:0;width:100%;top:${(ch - visibleH) / 2}px;height:${visibleH}px;`;
      } else {
        const visibleW = ch * imgRatio;
        heroScrim.style.cssText = `top:0;height:100%;left:${(cw - visibleW) / 2}px;width:${visibleW}px;`;
      }
    }
    function heroUpdate() {
      heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
      heroDots.forEach((d, i) => d.classList.toggle('active', i === heroIndex));
      updateHeroScrim();
    }
    function heroGoTo(i) { heroIndex = (i + slides.length) % slides.length; heroUpdate(); heroResetTimer(); }
    function heroResetTimer() {
      if (heroTimer) clearInterval(heroTimer);
      if (slides.length > 1) heroTimer = setInterval(() => heroGoTo(heroIndex + 1), 4000);
    }
    heroUpdate();
    heroResetTimer();
    window.addEventListener('resize', updateHeroScrim);
    qsa('img', heroTrack).forEach(img => img.addEventListener('load', updateHeroScrim));
  }

  const idList = qs('#identity-list');
  const swissTip = 'Et oui, en Suisse on note sur 6 ! À 4 t’as la moyenne. À 5 t’es vraiment bon. À 6 t’es excellent !';
  function labelWithTip(text, tip) {
    return el('span', { class: 'label' }, [
      document.createTextNode(text + ' '),
      el('span', { class: 'tooltip', 'data-tip': tip, tabindex: '0', 'aria-label': tip, text: 'ⓘ' }),
    ]);
  }
  const rows = [
    ['Nombre de joueurs', g.identity.players],
    ['Âge recommandé', g.identity.age],
    ['Temps de jeu', g.identity.duration],
    ['Année d’édition', g.identity.year],
    ['Type de jeu', g.identity.type],
    ['Difficulté', starRow(g.identity.difficulty.stars, g.identity.difficulty.max || 6, g.identity.difficulty.label)],
    [labelWithTip('Note de Ça Monstre Joue', swissTip), starRow(g.identity.note.stars, g.identity.note.max || 6)],
  ];
  idList.innerHTML = '';
  rows.forEach(([label, value]) => {
    const labelNode = typeof label === 'string' ? el('span', { class: 'label', text: label }) : label;
    const valueNode = typeof value === 'string' ? el('span', { text: value }) : value;
    idList.appendChild(el('li', {}, [labelNode, valueNode]));
  });

  const fitBody = qs('#fit-body');
  fitBody.innerHTML = '';
  if (g.fitIntro) fitBody.appendChild(el('p', { text: g.fitIntro, style: 'margin-bottom:18px;' }));
  fitBody.appendChild(el('p', { text: 'Ce jeu est fait pour toi si :' }));
  const yesList = el('ul', { style: 'margin:0 0 20px;padding-left:0;' });
  g.fitFor.forEach(t => yesList.appendChild(el('li', { text: '✓ ' + t, style: 'margin-bottom:8px;color:var(--black);font-weight:700;' })));
  fitBody.appendChild(yesList);
  fitBody.appendChild(el('p', { text: 'Ce jeu n’est malheureusement pas pour toi si :' }));
  const noList = el('ul', { style: 'padding-left:0;' });
  g.notFitFor.forEach(t => noList.appendChild(el('li', { text: '✕ ' + t, style: 'margin-bottom:8px;' })));
  fitBody.appendChild(noList);

  const videoWrap = qs('#video-wrap');
  const embed = youTubeEmbed(g.video);
  videoWrap.innerHTML = '';
  if (embed) {
    videoWrap.appendChild(el('iframe', {
      src: embed, title: g.name,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowfullscreen: 'true',
    }));
  } else {
    videoWrap.appendChild(el('div', { class: 'video-placeholder' }, [
      el('div', { class: 'play', html: '&#9654;' }),
      el('p', { text: 'Vidéo à venir' }),
    ]));
  }

  const spotifyMount = qs('#spotify-embed');
  const spotifySection = qs('#spotify-section');
  const spotify = spotifyEmbed(g.spotify);
  if (spotify) {
    spotifySection.style.display = '';
    spotifyMount.innerHTML = '';
    spotifyMount.appendChild(el('iframe', {
      src: spotify.src, width: '100%', height: String(spotify.height), frameborder: '0',
      allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
      loading: 'lazy', style: 'border-radius:12px;',
    }));
  } else {
    spotifySection.style.display = 'none';
  }

  const gallerySection = qs('#gallery-section');
  const gallery = qs('#gallery-grid');
  gallery.innerHTML = '';
  const resolvedGallery = (g.gallery || []).filter(item => findArticle(item.articleSlug));
  gallerySection.style.display = resolvedGallery.length === 0 ? 'none' : '';
  resolvedGallery.forEach(item => {
    const article = findArticle(item.articleSlug);
    const card = el('a', { class: 'gallery-card', href: `article.html?slug=${article.slug}` });
    card.appendChild(mediaElement(item.image || article.cover, article.title, article.slug));
    card.appendChild(el('div', { class: 'overlay' }, [
      el('h3', { text: article.title }),
      el('span', { text: 'Lire l’article' }),
    ]));
    gallery.appendChild(card);
  });
}

// ---------- ARTICLE page ----------
function renderArticlePage() {
  const root = qs('#article-root');
  if (!root) return;
  const a = findArticle(getParam('slug'));
  if (!a) {
    root.innerHTML = '<div class="container"><p style="padding:60px 0;text-align:center;">Cet article n\'existe pas (encore).</p></div>';
    return;
  }
  document.title = `${a.title} — Ça Monstre Joue`;
  const hero = qs('#article-hero');
  hero.innerHTML = '';
  hero.appendChild(carouselSlideMedia(a.hero || a.cover, a.title, a.slug));
  qs('#article-meta').textContent = formatDate(a.date);
  qs('#article-title').textContent = a.title;
  qs('#article-subtitle').textContent = a.subtitle || '';

  const body = qs('#article-blocks');
  body.innerHTML = '';
  a.blocks.forEach(b => {
    if (b.type === 'p') {
      body.appendChild(el('p', { html: b.text }));
    } else if (b.type === 'h2') {
      body.appendChild(el('h2', { text: b.text, style: 'margin-top:40px;' }));
    } else if (b.type === 'list') {
      const ul = el('ul', {});
      b.items.forEach(item => ul.appendChild(el('li', { html: item })));
      body.appendChild(ul);
    } else if (b.type === 'spoiler') {
      const details = el('details', { class: 'accordion', style: 'margin:28px 0;' }, [
        el('summary', { class: 'accordion-header' }, [
          el('span', { text: b.title }),
          el('span', { class: 'icon', text: '+' }),
        ]),
        el('div', { class: 'accordion-body' }, [el('p', { html: b.text })]),
      ]);
      body.appendChild(details);
    } else if (b.type === 'image') {
      const figure = el('figure', { style: 'margin:28px 0;' });
      const box = el('div', { style: 'border-radius:var(--radius-lg);overflow:hidden;border:3px solid var(--black);line-height:0;' });
      box.appendChild(mediaElement(b.src, b.caption, b.src));
      figure.appendChild(box);
      if (b.caption) figure.appendChild(el('figcaption', { text: b.caption, style: 'color:var(--gray);font-size:.9rem;margin-top:8px;text-align:center;' }));
      body.appendChild(figure);
    } else if (b.type === 'char') {
      const row = el('div', { style: 'display:flex;gap:20px;align-items:center;margin:26px 0;flex-wrap:wrap;' });
      const thumb = el('div', { style: 'width:140px;flex:none;border-radius:var(--radius-md);overflow:hidden;border:3px solid var(--black);line-height:0;' });
      thumb.appendChild(mediaElement(b.image, b.name, b.name));
      const text = el('div', { style: 'flex:1;min-width:220px;' }, [
        el('h3', { text: b.name, style: 'font-size:1.15rem;margin-bottom:6px;' }),
        el('p', { text: b.text, style: 'margin:0;' }),
      ]);
      row.appendChild(thumb);
      row.appendChild(text);
      body.appendChild(row);
    }
  });

  const relatedSection = qs('#related-section');
  const relatedGrid = qs('#related-grid');
  const game = findGame(a.gameSlug);
  relatedGrid.innerHTML = '';
  if (game) {
    qs('#related-title').textContent = `Pour en découvrir plus sur ${game.name}`;
    const gameCard = el('a', { class: 'gallery-card', href: `jeu.html?slug=${game.slug}` });
    gameCard.appendChild(mediaElement(game.thumbnail || game.cover, game.name, game.slug));
    gameCard.appendChild(el('div', { class: 'overlay' }, [
      el('h3', { text: `Retour sur la page de ${game.name}` }),
    ]));
    relatedGrid.appendChild(gameCard);
    (game.gallery || [])
      .filter(item => item.articleSlug !== a.slug && findArticle(item.articleSlug))
      .forEach(item => {
        const other = findArticle(item.articleSlug);
        const card = el('a', { class: 'gallery-card', href: `article.html?slug=${other.slug}` });
        card.appendChild(mediaElement(item.image || other.cover, other.title, other.slug));
        card.appendChild(el('div', { class: 'overlay' }, [
          el('h3', { text: other.title }),
          el('span', { text: 'Lire l’article' }),
        ]));
        relatedGrid.appendChild(card);
      });
    relatedSection.style.display = '';
  } else {
    relatedSection.style.display = 'none';
  }
}

// ---------- init ----------
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForms();
  renderHomeHero();
  renderCategoryGrid();
  renderCategoryPage();
  renderGamePage();
  renderArticlePage();
});
