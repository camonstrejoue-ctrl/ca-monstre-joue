// Module de commentaires (fiches jeu + articles). Module autonome (ne
// dépend pas de main.js), sur le même modèle que js/firebase-forms.js :
// écrit dans Firestore (projet partagé ca-monstre-joue) sans compte, avec
// status: 'pending'. Rien de ce qui est écrit ici n'est visible publiquement
// tant que l'admin ne l'a pas approuvé depuis moderation-commentaires.html
// (voir js/moderation-commentaires.js et le bloc `comments` de
// app/firestore.rules).

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDDttOJiQtScP2PDVrK3vJAOexg-OPQx6U',
  authDomain: 'ca-monstre-joue.firebaseapp.com',
  projectId: 'ca-monstre-joue',
  storageBucket: 'ca-monstre-joue.firebasestorage.app',
  messagingSenderId: '229832018399',
  appId: '1:229832018399:web:c90e815ab714a1f5799c6a',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RATE_LIMIT_MS = 60 * 1000;

function qs(sel, ctx) { return (ctx || document).querySelector(sel); }

// Construction DOM sûre : `text` passe toujours par textContent, jamais par
// innerHTML — un commentaire contenant "<script>" ou une balise doit
// s'afficher tel quel, jamais s'exécuter.
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  (children || []).forEach(c => c && node.appendChild(c));
  return node;
}

function getParam(name) { return new URLSearchParams(window.location.search).get(name); }
// Même logique que getSlugFromPath() dans js/main.js, pour les URLs
// générées au déploiement (ex. /jeu/finspan/).
function getSlugFromPath() {
  const parts = window.location.pathname.split('/').filter(p => p && p !== 'index.html');
  return parts.length ? parts[parts.length - 1] : null;
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Convertit un texte libre en bloc <p> avec des <br> entre les lignes, sans
// jamais passer par innerHTML.
function renderTextBlock(text, className) {
  const p = el('p', { class: className });
  String(text || '').split('\n').forEach((line, i) => {
    if (i > 0) p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode(line));
  });
  return p;
}

function renderComment(c) {
  const card = el('div', { class: 'comment-card' });
  const head = el('div', { class: 'comment-card__head' });
  head.appendChild(el('strong', { text: c.authorName || 'Anonyme' }));
  const createdAt = c.createdAt && typeof c.createdAt.toDate === 'function' ? c.createdAt.toDate() : null;
  if (createdAt) head.appendChild(el('span', { class: 'comment-card__date', text: formatDate(createdAt) }));
  card.appendChild(head);
  card.appendChild(renderTextBlock(c.text, 'comment-card__text'));
  if (c.reply && c.reply.text) {
    const reply = el('div', { class: 'comment-reply' });
    reply.appendChild(el('strong', { class: 'comment-reply__label', text: 'Réponse de Ça Monstre Joue' }));
    reply.appendChild(renderTextBlock(c.reply.text, 'comment-reply__text'));
    card.appendChild(reply);
  }
  return card;
}

async function loadComments(contentType, slug, list, empty) {
  const q = query(
    collection(db, 'comments'),
    where('contentType', '==', contentType),
    where('contentSlug', '==', slug),
    where('status', '==', 'approved'),
  );
  let snap;
  try {
    snap = await getDocs(q);
  } catch (err) {
    console.error('Chargement des commentaires impossible', err);
    return;
  }
  // Tri côté client (pas d'orderBy côté serveur) : évite d'avoir à créer un
  // index composite Firestore pour un volume de commentaires par page qui
  // restera de toute façon modeste.
  const comments = snap.docs
    .map(d => d.data())
    .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
  list.innerHTML = '';
  comments.forEach(c => list.appendChild(renderComment(c)));
  if (empty) empty.style.display = comments.length ? 'none' : '';
}

function ensureErrorEl(form) {
  let error = qs('.form-error', form);
  if (!error) {
    const success = qs('.form-success', form);
    error = document.createElement('p');
    error.className = 'form-error';
    if (success) success.insertAdjacentElement('afterend', error);
    else form.appendChild(error);
  }
  return error;
}

function showFeedback(form, kind, message) {
  const success = qs('.form-success', form);
  const error = ensureErrorEl(form);
  if (success) success.classList.remove('show');
  error.classList.remove('show');
  if (kind === 'success' && success) {
    success.classList.add('show');
  } else if (kind === 'error') {
    error.textContent = message || 'Une erreur est survenue, réessaie plus tard.';
    error.classList.add('show');
  }
}

function initForm(contentType, slug, form, onPosted) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = qs('#comment-name', form);
    const textInput = qs('#comment-text', form);
    const honeypot = qs('#comment-hp', form);

    // Honeypot rempli = bot. On "réussit" en apparence (pas d'indice pour le
    // script qui a rempli le formulaire) sans rien écrire en base.
    if (honeypot && honeypot.value) {
      form.reset();
      showFeedback(form, 'success');
      return;
    }

    const name = (nameInput.value || '').trim();
    const text = (textInput.value || '').trim();
    if (!name || !text) {
      showFeedback(form, 'error', 'Merci de remplir ton pseudo et ton commentaire.');
      return;
    }
    if (name.length > 60 || text.length > 1500) {
      showFeedback(form, 'error', 'Ton pseudo ou ton commentaire est trop long.');
      return;
    }

    const rateLimitKey = `cmj-comment-cooldown-${contentType}-${slug}`;
    const last = Number(localStorage.getItem(rateLimitKey) || 0);
    if (Date.now() - last < RATE_LIMIT_MS) {
      showFeedback(form, 'error', 'Merci de patienter un instant avant de reposter.');
      return;
    }

    const btn = qs('button[type="submit"]', form);
    if (btn) btn.disabled = true;
    try {
      await addDoc(collection(db, 'comments'), {
        contentType,
        contentSlug: slug,
        authorName: name.slice(0, 60),
        text: text.slice(0, 1500),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      try { localStorage.setItem(rateLimitKey, String(Date.now())); } catch (_) { /* stockage indisponible, tant pis */ }
      form.reset();
      showFeedback(form, 'success');
      if (onPosted) onPosted();
    } catch (err) {
      console.error('Comment submission failed', err);
      showFeedback(form, 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

function init() {
  const section = qs('#comments-section');
  if (!section) return;
  const contentType = section.dataset.contentType;
  const slug = getParam('slug') || getSlugFromPath();
  if (!contentType || !slug) return;

  const list = qs('#comments-list', section);
  const empty = qs('#comments-empty', section);
  const form = qs('#comment-form', section);

  if (list) loadComments(contentType, slug, list, empty);
  if (form) initForm(contentType, slug, form, () => {
    // Le commentaire posté est en attente : pas de rechargement de la liste
    // (il n'apparaîtrait pas tant qu'il n'est pas approuvé), le message de
    // succès suffit à confirmer l'envoi.
  });
}

init();
