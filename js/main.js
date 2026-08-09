/* ============================================
   ÇA MONSTRE JOUE — Comportements & rendu de pages
   ============================================ */

// ---------- helpers ----------
function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }
// Sur les URLs générées au déploiement (ex. /jeu/finspan/), le slug est dans
// le chemin plutôt qu'en paramètre — on prend le dernier segment non vide.
function getSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(p => p && p !== 'index.html');
  return parts.length ? parts[parts.length - 1] : null;
}
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
// Les chemins d'assets dans data.js sont écrits sans "/" initial (ex. "assets/games/...") ;
// on les rend root-relative ici pour qu'ils marchent aussi depuis les pages générées en
// profondeur (ex. /jeu/<slug>/, /categorie/<slug>/), pas seulement depuis la racine du site.
function assetUrl(src) {
  if (!src || src.startsWith('/') || /^[a-z]+:/i.test(src)) return src;
  return '/' + src;
}
// palette rotation for image placeholders when no real photo is set yet
const PH_CLASSES = ['ph-1', 'ph-2', 'ph-3', 'ph-4', 'ph-5', 'ph-6'];
function placeholderMedia(seed) {
  const idx = Math.abs(hashCode(seed || '')) % PH_CLASSES.length;
  const wrap = el('div', { class: `ph ${PH_CLASSES[idx]}` });
  const img = el('img', { class: 'mascot', src: '/assets/logo.png', alt: '' });
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
  const img = el('img', { src: assetUrl(src), alt: alt || '', loading: 'lazy' });
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
  const img = el('img', { src: assetUrl(src), alt: alt || '' });
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
    const slide = el('a', { class: 'carousel-slide', href: `/article.html?slug=${a.slug}` });
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
    const card = el('a', { class: 'cat-card', href: `/categorie.html?cat=${cat.slug}` });
    card.appendChild(mediaElement(cat.image, cat.name, cat.slug));
    card.appendChild(el('div', { class: 'overlay' }, [
      el('span', { class: 'highlight', text: cat.name }),
    ]));
    mount.appendChild(card);
  });
}

// ---------- CATEGORY page ----------
function gameCard(g) {
  const card = el('div', { class: 'game-card' });
  const thumb = el('a', { class: 'thumb', href: `/jeu.html?slug=${g.slug}` });
  thumb.appendChild(mediaElement(g.thumbnail || g.cover, g.name, g.slug));
  const btn = el('a', { class: 'btn btn--block', href: `/jeu.html?slug=${g.slug}`, text: g.name });
  card.appendChild(thumb);
  card.appendChild(btn);
  return card;
}

function renderCategoryPage() {
  const mount = qs('#games-grid');
  if (!mount) return;
  const catSlug = getParam('cat') || getSlugFromPath();
  const cat = findCategory(catSlug);
  qsa('[data-cat-name]').forEach(n => n.textContent = cat ? cat.name : 'Catégorie');
  const games = gamesInCategory(catSlug);
  mount.innerHTML = '';
  if (games.length === 0) {
    mount.appendChild(el('p', { text: 'De nouveaux jeux arrivent bientôt dans cette catégorie !', style: 'text-align:center;color:var(--gray);grid-column:1/-1;' }));
    return;
  }
  games.forEach(g => mount.appendChild(gameCard(g)));
}

// ---------- ALL GAMES (alphabetical) page ----------
function renderAllGamesPage() {
  const mount = qs('#all-games-list');
  const alphaNav = qs('#alpha-nav');
  if (!mount || !alphaNav) return;
  const games = [...(window.GAMES || [])].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const groups = {};
  games.forEach(g => {
    const letter = g.name.trim().charAt(0).toUpperCase();
    (groups[letter] = groups[letter] || []).push(g);
  });
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  alphaNav.innerHTML = '';
  letters.forEach(letter => {
    alphaNav.appendChild(groups[letter]
      ? el('a', { href: `#letter-${letter}`, text: letter })
      : el('span', { text: letter }));
  });
  mount.innerHTML = '';
  letters.filter(letter => groups[letter]).forEach(letter => {
    const group = el('div', { class: 'letter-group', id: `letter-${letter}` });
    group.appendChild(el('h2', { class: 'letter-heading', text: letter }));
    const grid = el('div', { class: 'games-grid' });
    groups[letter].forEach(g => grid.appendChild(gameCard(g)));
    group.appendChild(grid);
    mount.appendChild(group);
  });
}

// ---------- share row (jeu + article pages) ----------
const SHARE_ICONS = {
  facebook: 'M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.2-1.5 1.6-1.5H17V3.6C16.7 3.5 15.7 3.4 14.6 3.4c-2.3 0-3.9 1.4-3.9 4v2.5H8v3.1h2.7V21z',
  x: 'M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.2-.8.5-1.6.8-2.5 1a4 4 0 0 0-6.9 3.6A11.3 11.3 0 0 1 3.9 4.9a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 3.9c-.6.1-1.2.2-1.8.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.6a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.3-6 11.3-11.3v-.5c.8-.6 1.4-1.3 1.9-2.1z',
  whatsapp: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.06L2 22l5.19-1.44a9.87 9.87 0 0 0 4.85 1.24h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 17.9a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.87.83-3.02-.19-.31a8.15 8.15 0 0 1-1.24-4.31c0-4.51 3.68-8.19 8.19-8.19a8.13 8.13 0 0 1 5.78 2.4 8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.68 8.19-8.19 8.19zm4.49-6.14c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.45-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.04s.88 2.37 1 2.53c.12.16 1.73 2.64 4.19 3.7.58.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28z',
  telegram: 'M21.94 4.11a1.5 1.5 0 0 0-1.53-.21L3.32 10.85a1.42 1.42 0 0 0 .07 2.68l4.56 1.47 1.76 5.68a1.14 1.14 0 0 0 1.94.44l2.42-2.53 4.6 3.4a1.34 1.34 0 0 0 2.1-.79l2.9-13.7a1.5 1.5 0 0 0-.73-1.39zM9.6 14.56l-.03 3.36-1.4-4.53 10.9-6.87-9.47 8.04z',
  email: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.01L12 12l8-5.99V6H4zm16 2.24-7.4 5.55a1 1 0 0 1-1.2 0L4 8.24V18h16V8.24z',
  link: 'M10.59 13.41a1 1 0 0 1 0-1.41l2.83-2.83a1 1 0 1 1 1.41 1.41l-2.83 2.83a1 1 0 0 1-1.41 0zm-2.12 2.12a3 3 0 0 1 0-4.24l2.83-2.83a3 3 0 0 1 4.24 0 1 1 0 0 1-1.41 1.41 1 1 0 0 0-1.42 0l-2.83 2.83a1 1 0 0 0 0 1.42 1 1 0 0 1-1.41 1.41zm8.49-8.49a3 3 0 0 1 0 4.24l-1.42 1.41a1 1 0 0 1-1.41-1.41l1.41-1.42a1 1 0 0 0 0-1.41 1 1 0 0 1 1.42-1.41z',
  share: 'M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .05 3.71l-6.13 3.5a3 3 0 1 0 0 3.58l6.13 3.5A3 3 0 1 0 16 16a2.98 2.98 0 0 0-.78.11l-6.13-3.5a3.02 3.02 0 0 0 0-1.44l6.13-3.5c.55.34 1.19.54 1.83.54.03 0 0 0 0 0z',
};
function svgIcon(name) {
  return `<svg viewBox="0 0 24 24"><path d="${SHARE_ICONS[name]}"/></svg>`;
}
function renderShareRow(container, url, title) {
  if (!container) return;
  container.innerHTML = '';
  if (navigator.share) {
    const nativeBtn = el('button', { type: 'button', 'aria-label': 'Partager' });
    nativeBtn.innerHTML = svgIcon('share');
    nativeBtn.addEventListener('click', () => navigator.share({ title, url }).catch(() => {}));
    container.appendChild(nativeBtn);
  }
  [
    { label: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: 'X', icon: 'x', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` },
    { label: 'Telegram', icon: 'telegram', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { label: 'Email', icon: 'email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}` },
  ].forEach(t => {
    const a = el('a', { href: t.href, target: '_blank', rel: 'noopener', 'aria-label': t.label });
    a.innerHTML = svgIcon(t.icon);
    container.appendChild(a);
  });
  const copyBtn = el('button', { type: 'button', class: 'share-copy', 'aria-label': 'Copier le lien' });
  copyBtn.innerHTML = `${svgIcon('link')}<span>Copier le lien</span>`;
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(url).then(() => {
      const span = copyBtn.querySelector('span');
      span.textContent = 'Lien copié !';
      setTimeout(() => { span.textContent = 'Copier le lien'; }, 2000);
    }).catch(() => {});
  });
  container.appendChild(copyBtn);
}
function renderAppShareLink(slug) {
  const link = qs('#app-share-link');
  if (!link) return;
  link.href = `/app.html?utm_source=blog&utm_medium=partage&utm_campaign=${encodeURIComponent(slug)}`;
}

// ---------- GAME page ----------
function renderGamePage() {
  const root = qs('#game-root');
  if (!root) return;
  const g = findGame(getParam('slug') || getSlugFromPath());
  if (!g) {
    root.innerHTML = '<div class="container"><p style="padding:60px 0;text-align:center;">Ce jeu n\'existe pas (encore).</p></div>';
    return;
  }
  document.title = `${g.name} — Ça Monstre Joue`;
  renderShareRow(qs('#share-row'), `${window.location.origin}/jeu/${g.slug}/`, g.name);
  renderAppShareLink(g.slug);
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

  const yesBox = el('div', { class: 'fit-box fit-box--yes' }, [
    el('h4', { text: 'Ce jeu est fait pour toi si :' }),
  ]);
  const yesList = el('ul', {});
  g.fitFor.forEach(t => yesList.appendChild(el('li', { text: '✓ ' + t })));
  yesBox.appendChild(yesList);
  fitBody.appendChild(yesBox);

  const noBox = el('div', { class: 'fit-box fit-box--no' }, [
    el('h4', { text: 'Ce jeu n’est malheureusement pas pour toi si :' }),
  ]);
  const noList = el('ul', {});
  g.notFitFor.forEach(t => noList.appendChild(el('li', { text: '✕ ' + t })));
  noBox.appendChild(noList);
  fitBody.appendChild(noBox);

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
    const card = el('a', { class: 'gallery-card', href: `/article.html?slug=${article.slug}` });
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
  const a = findArticle(getParam('slug') || getSlugFromPath());
  if (!a) {
    root.innerHTML = '<div class="container"><p style="padding:60px 0;text-align:center;">Cet article n\'existe pas (encore).</p></div>';
    return;
  }
  document.title = `${a.title} — Ça Monstre Joue`;
  renderShareRow(qs('#share-row'), `${window.location.origin}/article/${a.slug}/`, a.title);
  renderAppShareLink(a.slug);
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
      const figure = el('figure', { style: 'margin:28px auto;width:50%;' });
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
    const gameCard = el('a', { class: 'gallery-card', href: `/jeu.html?slug=${game.slug}` });
    gameCard.appendChild(mediaElement(game.thumbnail || game.cover, game.name, game.slug));
    gameCard.appendChild(el('div', { class: 'overlay' }, [
      el('h3', { text: `Retour sur la page de ${game.name}` }),
    ]));
    relatedGrid.appendChild(gameCard);
    (game.gallery || [])
      .filter(item => item.articleSlug !== a.slug && findArticle(item.articleSlug))
      .forEach(item => {
        const other = findArticle(item.articleSlug);
        const card = el('a', { class: 'gallery-card', href: `/article.html?slug=${other.slug}` });
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

// ---------- CHATBOT: P'tit Monstre ----------
function initChatbot() {
  const toggle = qs('#chatbot-toggle');
  const panel = qs('#chatbot-panel');
  const closeBtn = qs('#chatbot-close');
  const restartBtn = qs('#chatbot-restart');
  const messages = qs('#chatbot-messages');
  const choicesWrap = qs('#chatbot-choices');
  if (!toggle || !panel) return;

  const bubble = qs('#chatbot-bubble');
  if (bubble) {
    if (localStorage.getItem('ptitMonstreBubbleSeen')) {
      bubble.remove();
    } else {
      const dismissBubble = () => {
        bubble.remove();
        localStorage.setItem('ptitMonstreBubbleSeen', '1');
      };
      qs('#chatbot-bubble-close')?.addEventListener('click', (e) => { e.stopPropagation(); dismissBubble(); });
      toggle.addEventListener('click', dismissBubble, { once: true });
    }
  }

  function parseRange(str) {
    const nums = (str.match(/\d+/g) || []).map(Number);
    if (nums.length === 0) return { min: 0, max: Infinity };
    if (nums.length === 1) return { min: nums[0], max: Infinity };
    return { min: nums[0], max: nums[1] };
  }
  function parseMinAge(str) {
    const m = str.match(/\d+/);
    return m ? Number(m[0]) : 0;
  }

  const STEPS = [
    {
      key: 'category',
      question: 'Quel type de jeu recherches-tu ?',
      options: () => (window.CATEGORIES || [])
        .map(c => ({ label: c.name, value: c.slug }))
        .concat([{ label: 'Peu importe', value: null }]),
      match: (g, value) => value === null || (g.categories || []).includes(value),
    },
    {
      key: 'players',
      question: 'Vous serez combien à jouer ?',
      options: () => [
        { label: '1-2 joueurs', value: [1, 2] },
        { label: '3-4 joueurs', value: [3, 4] },
        { label: '5-6 joueurs', value: [5, 6] },
        { label: '7 joueurs ou plus', value: [7, Infinity] },
        { label: 'Peu importe', value: null },
      ],
      match: (g, value) => {
        if (!value) return true;
        const range = parseRange(g.identity.players);
        return range.min <= value[1] && range.max >= value[0];
      },
    },
    {
      key: 'age',
      question: 'Quel est l’âge des joueurs ?',
      options: () => [
        { label: 'Enfants (6-9 ans)', value: 8 },
        { label: 'Ados (10-13 ans)', value: 12 },
        { label: '14 ans et plus', value: 17 },
        { label: 'Peu importe', value: null },
      ],
      match: (g, value) => value === null || parseMinAge(g.identity.age) <= value,
    },
    {
      key: 'duration',
      question: 'Combien de temps voulez-vous jouer ?',
      options: () => [
        { label: 'Moins de 30 min', value: [0, 30] },
        { label: '30 à 60 min', value: [30, 60] },
        { label: '60 à 90 min', value: [60, 90] },
        { label: 'Plus de 90 min', value: [90, Infinity] },
        { label: 'Peu importe', value: null },
      ],
      match: (g, value) => {
        if (!value) return true;
        const range = parseRange(g.identity.duration);
        return range.min <= value[1] && range.max >= value[0];
      },
    },
    {
      key: 'difficulty',
      question: 'Quel niveau de complexité recherches-tu ?',
      options: () => [
        { label: 'Facile', value: [1, 2] },
        { label: 'Moyenne', value: [3, 4] },
        { label: 'Difficile', value: [5, 6] },
        { label: 'Peu importe', value: null },
      ],
      match: (g, value) => !value || (g.identity.difficulty.stars >= value[0] && g.identity.difficulty.stars <= value[1]),
    },
  ];

  let stepIndex = 0;
  let answers = {};
  let pool = [];

  function addMessage(text, from) {
    messages.appendChild(el('div', { class: `chatbot-msg chatbot-msg--${from}`, text }));
    messages.scrollTop = messages.scrollHeight;
  }

  function renderChoices(options, onPick) {
    choicesWrap.innerHTML = '';
    options.forEach(opt => {
      const btn = el('button', { type: 'button', text: opt.label });
      btn.addEventListener('click', () => onPick(opt));
      choicesWrap.appendChild(btn);
    });
  }

  function askStep() {
    if (stepIndex >= STEPS.length) { showResult(); return; }
    const step = STEPS[stepIndex];
    addMessage(step.question, 'bot');
    renderChoices(step.options(), (opt) => {
      addMessage(opt.label, 'user');
      answers[step.key] = opt.value;
      stepIndex++;
      askStep();
    });
  }

  function showResult() {
    pool = (window.GAMES || []).filter(g => STEPS.every(step => step.match(g, answers[step.key])));
    if (pool.length === 0) {
      addMessage('Je ne trouve aucun jeu qui correspond à tous ces critères… Tu veux recommencer avec d’autres réponses ?', 'bot');
      renderChoices([{ label: 'Recommencer' }], () => restart());
      return;
    }
    suggestOne();
  }

  function suggestOne() {
    if (pool.length === 0) {
      addMessage('J’ai fait le tour de mes idées pour ces critères ! Tu veux changer tes réponses ?', 'bot');
      renderChoices([{ label: 'Recommencer' }], () => restart());
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    const game = pool.splice(idx, 1)[0];
    addMessage(`Je te propose : ${game.name} !`, 'bot');
    renderChoices([
      { label: 'Voir la fiche du jeu', go: true },
      { label: 'Me proposer un autre jeu', go: false },
    ], (opt) => {
      addMessage(opt.label, 'user');
      if (opt.go) {
        window.location.href = `/jeu.html?slug=${game.slug}`;
      } else {
        suggestOne();
      }
    });
  }

  function restart() {
    stepIndex = 0;
    answers = {};
    pool = [];
    messages.innerHTML = '';
    addMessage('Salut, moi c’est P’tit Monstre ! Réponds à quelques questions et je te propose un jeu qui devrait te plaire.', 'bot');
    askStep();
  }

  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !messages.children.length) restart();
  });
  closeBtn.addEventListener('click', () => { panel.hidden = true; });
  restartBtn.addEventListener('click', restart);
}

// ---------- init ----------
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForms();
  initChatbot();
  renderHomeHero();
  renderCategoryGrid();
  renderCategoryPage();
  renderAllGamesPage();
  renderGamePage();
  renderArticlePage();
});
