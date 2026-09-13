// Modération des commentaires (fiches jeu + articles). Page interne,
// protégée par le compte administrateur déjà utilisé côté app (uid codé
// dans isAdmin(), voir app/firestore.rules) — pas de nouveau compte à créer.
// La vraie barrière de sécurité est la règle Firestore : un compte qui n'est
// pas admin peut se connecter ici mais toute lecture/écriture sur `comments`
// (au-delà des commentaires déjà approuvés) sera refusée côté serveur.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore, collection, query, where, onSnapshot,
  doc, updateDoc, deleteDoc, deleteField, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDDttOJiQtScP2PDVrK3vJAOexg-OPQx6U',
  authDomain: 'ca-monstre-joue.firebaseapp.com',
  projectId: 'ca-monstre-joue',
  storageBucket: 'ca-monstre-joue.firebasestorage.app',
  messagingSenderId: '229832018399',
  appId: '1:229832018399:web:c90e815ab714a1f5799c6a',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const elLogin = $('mod-login');
const elLoginForm = $('mod-login-form');
const elEmail = $('mod-email');
const elPassword = $('mod-password');
const elLoginBtn = $('mod-login-btn');
const elLoginError = $('mod-login-error');
const elApp = $('mod-app');
const elSignout = $('mod-signout');
const elPendingList = $('mod-pending-list');
const elPendingEmpty = $('mod-pending-empty');
const elPendingCount = $('mod-pending-count');
const elApprovedList = $('mod-approved-list');
const elApprovedEmpty = $('mod-approved-empty');

let unsubPending = null;
let unsubApproved = null;

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  (children || []).forEach(c => c && node.appendChild(c));
  return node;
}

function formatDate(ts) {
  const d = ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
  if (!d) return '';
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function contentLink(c) {
  const path = c.contentType === 'game' ? '/jeu.html' : '/article.html';
  return `${path}?slug=${encodeURIComponent(c.contentSlug || '')}`;
}

function renderTextBlock(text) {
  const p = el('p', { class: 'mod-card__text' });
  String(text || '').split('\n').forEach((line, i) => {
    if (i > 0) p.appendChild(document.createElement('br'));
    p.appendChild(document.createTextNode(line));
  });
  return p;
}

function renderPendingCard(id, c) {
  const card = el('div', { class: 'mod-card' });
  const head = el('div', { class: 'mod-card__head' });
  head.appendChild(el('strong', { text: c.authorName || 'Anonyme' }));
  head.appendChild(el('a', { href: contentLink(c), target: '_blank', rel: 'noopener', class: 'mod-card__link', text: c.contentSlug || '' }));
  head.appendChild(el('span', { class: 'mod-card__date', text: formatDate(c.createdAt) }));
  card.appendChild(head);
  card.appendChild(renderTextBlock(c.text));

  const actions = el('div', { class: 'mod-card__actions' });
  const approveBtn = el('button', { type: 'button', class: 'mod-btn mod-btn--primary', text: 'Approuver' });
  approveBtn.addEventListener('click', async () => {
    approveBtn.disabled = true;
    try {
      await updateDoc(doc(db, 'comments', id), { status: 'approved' });
    } catch (err) {
      console.error('Approve failed', err);
      approveBtn.disabled = false;
    }
  });
  const deleteBtn = el('button', { type: 'button', class: 'mod-btn mod-btn--danger', text: 'Supprimer' });
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Supprimer définitivement ce commentaire ?')) return;
    deleteBtn.disabled = true;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Delete failed', err);
      deleteBtn.disabled = false;
    }
  });
  actions.appendChild(approveBtn);
  actions.appendChild(deleteBtn);
  card.appendChild(actions);
  return card;
}

function renderApprovedCard(id, c) {
  const card = el('div', { class: 'mod-card' });
  const head = el('div', { class: 'mod-card__head' });
  head.appendChild(el('strong', { text: c.authorName || 'Anonyme' }));
  head.appendChild(el('a', { href: contentLink(c), target: '_blank', rel: 'noopener', class: 'mod-card__link', text: c.contentSlug || '' }));
  head.appendChild(el('span', { class: 'mod-card__date', text: formatDate(c.createdAt) }));
  card.appendChild(head);
  card.appendChild(renderTextBlock(c.text));

  const replyWrap = el('div', { class: 'mod-reply' });
  const replyInput = el('textarea', { class: 'mod-reply__input', placeholder: 'Réponse publique de Ça Monstre Joue (optionnel)…' });
  replyInput.value = (c.reply && c.reply.text) || '';
  replyWrap.appendChild(replyInput);
  const replyActions = el('div', { class: 'mod-card__actions' });
  const saveReplyBtn = el('button', { type: 'button', class: 'mod-btn', text: 'Enregistrer la réponse' });
  saveReplyBtn.addEventListener('click', async () => {
    saveReplyBtn.disabled = true;
    try {
      const text = replyInput.value.trim();
      if (text) {
        await updateDoc(doc(db, 'comments', id), { reply: { text: text.slice(0, 1500), createdAt: serverTimestamp() } });
      } else {
        await updateDoc(doc(db, 'comments', id), { reply: deleteField() });
      }
    } catch (err) {
      console.error('Reply save failed', err);
    } finally {
      saveReplyBtn.disabled = false;
    }
  });
  replyActions.appendChild(saveReplyBtn);

  const deleteBtn = el('button', { type: 'button', class: 'mod-btn mod-btn--danger', text: 'Supprimer' });
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Supprimer définitivement ce commentaire ?')) return;
    deleteBtn.disabled = true;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error('Delete failed', err);
      deleteBtn.disabled = false;
    }
  });
  replyActions.appendChild(deleteBtn);
  replyWrap.appendChild(replyActions);
  card.appendChild(replyWrap);
  return card;
}

function watchComments() {
  unsubPending = onSnapshot(
    query(collection(db, 'comments'), where('status', '==', 'pending')),
    (snap) => {
      const docs = snap.docs.slice().sort((a, b) => (a.data().createdAt?.toMillis?.() || 0) - (b.data().createdAt?.toMillis?.() || 0));
      elPendingList.innerHTML = '';
      docs.forEach(d => elPendingList.appendChild(renderPendingCard(d.id, d.data())));
      elPendingCount.textContent = String(docs.length);
      elPendingEmpty.hidden = docs.length > 0;
    },
    (err) => console.error('Pending comments watch failed', err),
  );

  unsubApproved = onSnapshot(
    query(collection(db, 'comments'), where('status', '==', 'approved')),
    (snap) => {
      const docs = snap.docs.slice().sort((a, b) => (b.data().createdAt?.toMillis?.() || 0) - (a.data().createdAt?.toMillis?.() || 0));
      elApprovedList.innerHTML = '';
      docs.forEach(d => elApprovedList.appendChild(renderApprovedCard(d.id, d.data())));
      elApprovedEmpty.hidden = docs.length > 0;
    },
    (err) => console.error('Approved comments watch failed', err),
  );
}

function stopWatching() {
  if (unsubPending) { unsubPending(); unsubPending = null; }
  if (unsubApproved) { unsubApproved(); unsubApproved = null; }
}

elLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  elLoginError.hidden = true;
  elLoginBtn.disabled = true;
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, elEmail.value.trim(), elPassword.value);
  } catch (err) {
    console.error('Sign-in failed', err);
    elLoginError.textContent = 'Connexion refusée — vérifie l\'e-mail et le mot de passe.';
    elLoginError.hidden = false;
  } finally {
    elLoginBtn.disabled = false;
  }
});

elSignout.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    elLogin.hidden = true;
    elApp.hidden = false;
    elPassword.value = '';
    watchComments();
  } else {
    elApp.hidden = true;
    elLogin.hidden = false;
    stopWatching();
  }
});
