// Module de commentaires (fiches jeu + articles). Module autonome (ne
// dépend pas de main.js), sur le même modèle que js/firebase-forms.js :
// écrit dans Firestore (projet partagé ca-monstre-joue) sans compte, avec
// status: 'pending'. Rien de ce qui est écrit ici n'est visible publiquement
// tant que l'admin ne l'a pas approuvé depuis moderation-commentaires.html
// (voir js/moderation-commentaires.js et le bloc `comments` de
// app/firestore.rules). Un commentaire peut avoir des réponses (parentId) —
// un seul niveau de profondeur, comme la plupart des blogs.

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

// Câble un formulaire (le principal ou une mini-form de réponse) : mêmes
// règles de validation/anti-spam pour les deux.
function bindForm(form, { contentType, slug, parentId }, onPosted) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = qs('.comment-name', form);
    const textInput = qs('.comment-text', form);
    const honeypot = qs('.comment-hp', form);

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
      const payload = {
        contentType,
        contentSlug: slug,
        authorName: name.slice(0, 60),
        text: text.slice(0, 1500),
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      if (parentId) payload.parentId = parentId;
      await addDoc(collection(db, 'comments'), payload);
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

// Mini-formulaire de réponse, créé à la demande sous un commentaire.
function buildReplyForm(contentType, slug, parentId) {
  const form = el('form', { class: 'contact-form comment-form comment-reply-form' });
  const nameField = el('div', { class: 'field' });
  nameField.appendChild(el('label', { text: 'Ton pseudo' }));
  nameField.appendChild(el('input', { type: 'text', class: 'comment-name', maxlength: '60', required: '' }));
  const textField = el('div', { class: 'field' });
  textField.appendChild(el('label', { text: 'Ta réponse' }));
  textField.appendChild(el('textarea', { class: 'comment-text', maxlength: '1500', required: '' }));
  const hpWrap = el('div', { class: 'comment-hp-wrap', 'aria-hidden': 'true' });
  hpWrap.appendChild(el('label', { text: 'Laisse ce champ vide' }));
  hpWrap.appendChild(el('input', { type: 'text', class: 'comment-hp', tabindex: '-1', autocomplete: 'off' }));
  const btn = el('button', { type: 'submit', class: 'btn btn--block', text: 'Répondre' });
  const success = el('p', { class: 'form-success', text: 'Merci ! Ta réponse est en attente de validation.' });
  form.appendChild(nameField);
  form.appendChild(textField);
  form.appendChild(hpWrap);
  form.appendChild(btn);
  form.appendChild(success);
  bindForm(form, { contentType, slug, parentId });
  return form;
}

function renderReply(c) {
  const card = el('div', { class: 'comment-card comment-card--reply' });
  const head = el('div', { class: 'comment-card__head' });
  head.appendChild(el('strong', { text: c.authorName || 'Anonyme' }));
  const createdAt = c.createdAt && typeof c.createdAt.toDate === 'function' ? c.createdAt.toDate() : null;
  if (createdAt) head.appendChild(el('span', { class: 'comment-card__date', text: formatDate(createdAt) }));
  card.appendChild(head);
  card.appendChild(renderTextBlock(c.text, 'comment-card__text'));
  return card;
}

function renderComment(c, replies, contentType, slug) {
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

  const toggle = el('button', { type: 'button', class: 'comment-reply-toggle', text: 'Répondre' });
  const replyForm = buildReplyForm(contentType, slug, c.id);
  replyForm.hidden = true;
  toggle.addEventListener('click', () => { replyForm.hidden = !replyForm.hidden; });
  card.appendChild(toggle);
  card.appendChild(replyForm);

  if (replies.length) {
    const repliesWrap = el('div', { class: 'comment-replies' });
    replies.forEach(r => repliesWrap.appendChild(renderReply(r)));
    card.appendChild(repliesWrap);
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
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
  const topLevel = comments.filter(c => !c.parentId);
  const repliesByParent = new Map();
  comments.filter(c => c.parentId).forEach(c => {
    if (!repliesByParent.has(c.parentId)) repliesByParent.set(c.parentId, []);
    repliesByParent.get(c.parentId).push(c);
  });

  list.innerHTML = '';
  topLevel.forEach(c => list.appendChild(renderComment(c, repliesByParent.get(c.id) || [], contentType, slug)));
  if (empty) empty.style.display = topLevel.length ? 'none' : '';
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
  if (form) bindForm(form, { contentType, slug, parentId: null });
}

init();
