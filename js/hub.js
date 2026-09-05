// ============================================================================
// LE HUB DE CMJ — atelier de rédaction interne, collaboratif et temps réel.
//
// Page statique + Firebase (projet partagé `ca-monstre-joue`) :
//  - Auth e-mail/mot de passe, UN compte partagé pour toute l'équipe. L'écran
//    de login ne demande que le mot de passe ; l'e-mail est fixé ci-dessous
//    (HUB_ACCOUNT_EMAIL) et n'est pas un secret.
//  - Firestore : `hubNodes` (l'arbre) + `hubPages` (le contenu), lisibles /
//    modifiables uniquement par l'uid du compte partagé (voir app/firestore.rules,
//    fonction isHubTeam()).
//  - Éditeur : Editor.js (blocs, chargé en <script> dans hub.html).
//  - Temps réel : onSnapshot sur l'arbre et sur la page ouverte ; autosave
//    debouncé ; verrou doux « X est en train d'éditer » (dernier enregistrement
//    gagne, pas de fusion caractère par caractère).
//
// Le « prénom » choisi à l'entrée est purement cosmétique (présence / attribution
// d'affichage) — la sécurité, c'est le mot de passe du compte partagé.
// ============================================================================

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot,
  writeBatch, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: 'AIzaSyDDttOJiQtScP2PDVrK3vJAOexg-OPQx6U',
  authDomain: 'ca-monstre-joue.firebaseapp.com',
  projectId: 'ca-monstre-joue',
  storageBucket: 'ca-monstre-joue.firebasestorage.app',
  messagingSenderId: '229832018399',
  appId: '1:229832018399:web:c90e815ab714a1f5799c6a',
};

// Compte partagé de l'équipe (à créer dans la console Firebase :
// Authentication > Users > Add user, avec cette adresse exacte).
const HUB_ACCOUNT_EMAIL = 'hub@camonstrejoue.ch';

// Prénoms proposés dans la modale « Qui es-tu ? » (window.TEAM n'est pas chargé
// sur cette page — liste courte codée en dur, un champ libre reste possible).
const TEAM_NAMES = ['Alex', 'Camille', 'Guillaume'];

const LOCK_STALE_MS = 90_000;      // un verrou plus vieux que ça est réputé abandonné
const HEARTBEAT_MS = 30_000;       // rafraîchissement du verrou tant que la page est ouverte
const AUTOSAVE_MS = 1_500;         // debounce de l'autosave

// ---------------------------------------------------------------------------
// État global
// ---------------------------------------------------------------------------
let db, auth;
let identity = localStorage.getItem('hubIdentity') || '';
let nodes = [];                    // tous les hubNodes
let nodesById = new Map();
let openId = null;                 // id de la page ouverte
let editor = null;                 // instance Editor.js
let holdsLock = false;             // je détiens le verrou de la page ouverte
let pageUnsub = null;              // onSnapshot de la page ouverte
let heartbeatTimer = null;
let autosaveTimer = null;
let suppressChange = false;        // ignore l'événement onChange pendant un chargement programmatique
let lastLocalSaveAt = 0;
let dragNodeId = null;             // nœud en cours de glisser-déposer dans l'arbre
let dragEndedAt = 0;               // pour ignorer le clic parasite après un drop
const collapsed = new Set(JSON.parse(localStorage.getItem('hubCollapsed') || '[]'));

// ---------------------------------------------------------------------------
// Raccourcis DOM
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const el = {
  login: $('hub-login'), loginForm: $('hub-login-form'), password: $('hub-password'),
  loginBtn: $('hub-login-btn'), loginError: $('hub-login-error'),
  whoami: $('hub-whoami'), whoamiList: $('hub-whoami-list'),
  whoamiOther: $('hub-whoami-other'), whoamiInput: $('hub-whoami-input'),
  confirm: $('hub-confirm'), confirmTitle: $('hub-confirm-title'),
  confirmText: $('hub-confirm-text'), confirmOk: $('hub-confirm-ok'), confirmCancel: $('hub-confirm-cancel'),
  app: $('hub-app'), treeToggle: $('hub-tree-toggle'), tree: $('hub-tree'),
  treeList: $('hub-tree-list'), filter: $('hub-filter'), addFolder: $('hub-add-folder'),
  importBtn: $('hub-import'),
  saveState: $('hub-save-state'), presence: $('hub-presence'),
  identityBtn: $('hub-identity'), signout: $('hub-signout'),
  editorEmpty: $('hub-editor-empty'), editorDoc: $('hub-editor-doc'),
  title: $('hub-title'), editorMeta: $('hub-editor-meta'),
  readonlyBanner: $('hub-readonly-banner'), editorHost: $('hub-editor'),
};

// ---------------------------------------------------------------------------
// Init Firebase
// ---------------------------------------------------------------------------
function initFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (err) {
    console.warn('[hub] cache persistant indisponible, fallback mémoire', err);
    db = getFirestore(app);
  }
  auth = getAuth(app);
}

// ---------------------------------------------------------------------------
// Connexion
// ---------------------------------------------------------------------------
function showLogin(message) {
  el.app.hidden = true;
  el.whoami.hidden = true;
  el.login.hidden = false;
  if (message) { el.loginError.textContent = message; el.loginError.hidden = false; }
}

el.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  el.loginError.hidden = true;
  el.loginBtn.disabled = true;
  el.loginBtn.textContent = 'Connexion…';
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, HUB_ACCOUNT_EMAIL, el.password.value);
    // la suite est pilotée par onAuthStateChanged
  } catch (err) {
    console.warn('[hub] échec connexion', err.code);
    const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
      ? 'Mot de passe incorrect.'
      : err.code === 'auth/network-request-failed'
        ? 'Pas de connexion réseau.'
        : err.code === 'auth/user-not-found' || err.code === 'auth/configuration-not-found'
          ? "Le compte d'équipe n'est pas encore configuré côté Firebase."
          : 'Connexion impossible : ' + err.code;
    el.loginError.textContent = msg;
    el.loginError.hidden = false;
  } finally {
    el.loginBtn.disabled = false;
    el.loginBtn.textContent = 'Entrer';
    el.password.value = '';
  }
});

el.signout.addEventListener('click', async () => {
  await flushAutosave();
  await releaseLock();
  await signOut(auth);
});

// ---------------------------------------------------------------------------
// Modale « Qui es-tu ? »
// ---------------------------------------------------------------------------
function renderWhoami() {
  el.whoamiList.innerHTML = '';
  TEAM_NAMES.forEach((name) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hub-btn';
    b.textContent = name;
    b.addEventListener('click', () => setIdentity(name));
    el.whoamiList.appendChild(b);
  });
}
el.whoamiOther.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = el.whoamiInput.value.trim();
  if (v) setIdentity(v);
});
function setIdentity(name) {
  identity = name;
  localStorage.setItem('hubIdentity', name);
  el.identityBtn.textContent = name;
  el.whoami.hidden = true;
  el.app.hidden = false;
  refreshImportButton();
}
el.identityBtn.addEventListener('click', () => {
  el.whoamiInput.value = identity;
  el.whoami.hidden = false;
});

// ---------------------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------------------
function startApp() {
  el.login.hidden = true;
  el.identityBtn.textContent = identity || '?';
  if (identity) { el.app.hidden = false; } else { renderWhoami(); el.whoami.hidden = false; }
  subscribeNodes();
}

// ---------------------------------------------------------------------------
// Arbre : abonnement + rendu
// ---------------------------------------------------------------------------
function subscribeNodes() {
  onSnapshot(collection(db, 'hubNodes'), (snap) => {
    nodes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    nodesById = new Map(nodes.map((n) => [n.id, n]));
    renderTree();
    refreshImportButton();
    if (openId && !nodesById.has(openId)) closeEditor();
    else if (openId) syncTitleFromNode();
  }, (err) => {
    console.error('[hub] lecture arbre refusée', err);
    showLogin("Accès aux données refusé. Les règles Firestore du Hub ne sont peut-être pas encore en place.");
  });
}

function childrenOf(parentId) {
  return nodes
    .filter((n) => (n.parentId || null) === parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title || '').localeCompare(b.title || ''));
}

function persistCollapsed() {
  localStorage.setItem('hubCollapsed', JSON.stringify([...collapsed]));
}

function renderTree() {
  const filterText = el.filter.value.trim().toLowerCase();
  const visible = computeVisible(filterText);
  el.treeList.innerHTML = '';
  const roots = childrenOf(null);
  for (const node of roots) el.treeList.appendChild(renderNode(node, visible, filterText));
  if (!nodes.length) {
    const p = document.createElement('p');
    p.style.cssText = 'color:#666;font-size:.9rem;padding:10px;';
    p.textContent = 'Aucun dossier pour l’instant.';
    el.treeList.appendChild(p);
  }
}

// Avec un filtre actif : un nœud est visible s'il matche ou s'il a un
// descendant qui matche (et on force l'expansion des dossiers concernés).
function computeVisible(filterText) {
  if (!filterText) return null;
  const match = new Set();
  const hit = (n) => (n.title || '').toLowerCase().includes(filterText);
  const walk = (n) => {
    let visible = hit(n);
    for (const c of childrenOf(n.id)) visible = walk(c) || visible;
    if (visible) match.add(n.id);
    return visible;
  };
  for (const r of childrenOf(null)) walk(r);
  return match;
}

function renderNode(node, visible, filterText) {
  const wrap = document.createElement('div');
  wrap.className = 'hub-node';
  const kids = childrenOf(node.id);
  const isCollapsed = collapsed.has(node.id) && !filterText;

  const row = document.createElement('div');
  row.className = 'hub-node__row';
  if (node.id === openId) row.classList.add('is-active');
  if (visible && !visible.has(node.id)) row.classList.add('is-hidden');

  const caret = document.createElement('span');
  caret.className = 'hub-node__caret' + (node.type === 'page' ? ' is-leaf' : '') + (isCollapsed ? ' is-collapsed' : '');
  caret.textContent = '▼';
  caret.addEventListener('click', (e) => {
    e.stopPropagation();
    if (node.type === 'page') return;
    if (collapsed.has(node.id)) collapsed.delete(node.id); else collapsed.add(node.id);
    persistCollapsed();
    renderTree();
  });

  const icon = document.createElement('span');
  icon.className = 'hub-node__icon';
  icon.textContent = node.type === 'folder' ? (isCollapsed ? '📁' : '📂') : '📄';

  const label = document.createElement('span');
  label.className = 'hub-node__label';
  label.textContent = node.title || 'Sans titre';

  const actions = document.createElement('span');
  actions.className = 'hub-node__actions';
  actions.appendChild(iconAction('↑', 'Monter', (e) => { e.stopPropagation(); moveNode(node, -1); }));
  actions.appendChild(iconAction('↓', 'Descendre', (e) => { e.stopPropagation(); moveNode(node, 1); }));
  if (node.type === 'folder') {
    actions.appendChild(iconAction('＋📁', 'Sous-dossier', (e) => { e.stopPropagation(); createNode('folder', node.id); }));
    actions.appendChild(iconAction('＋📄', 'Article', (e) => { e.stopPropagation(); createNode('page', node.id); }));
  }
  actions.appendChild(iconAction('✏️', 'Renommer', (e) => { e.stopPropagation(); startRename(row, label, node); }));
  actions.appendChild(iconAction('🗑️', 'Supprimer', (e) => { e.stopPropagation(); removeNode(node); }));

  row.append(caret, icon, label, actions);
  row.addEventListener('click', () => {
    if (Date.now() - dragEndedAt < 150) return; // clic parasite juste après un drop
    if (node.type === 'page') openPage(node.id);
    else { if (collapsed.has(node.id)) collapsed.delete(node.id); else collapsed.add(node.id); persistCollapsed(); renderTree(); }
  });
  row.addEventListener('dblclick', (e) => { e.preventDefault(); startRename(row, label, node); });

  // --- glisser-déposer : déplacer un nœud dans un autre dossier -------------
  row.draggable = true;
  row.dataset.nodeId = node.id;
  row.addEventListener('dragstart', (e) => {
    dragNodeId = node.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
    row.classList.add('is-dragging');
  });
  row.addEventListener('dragend', () => {
    dragNodeId = null;
    dragEndedAt = Date.now();
    row.classList.remove('is-dragging');
    clearDropMarks();
  });
  row.addEventListener('dragover', (e) => {
    if (!dragNodeId || dragNodeId === node.id) return;
    if (isInSubtree(node.id, dragNodeId)) return; // pas dans son propre sous-arbre
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearDropMarks();
    row.classList.add(node.type === 'folder' ? 'drop-into' : 'drop-after');
  });
  row.addEventListener('dragleave', () => row.classList.remove('drop-into', 'drop-after'));
  row.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = dragNodeId || e.dataTransfer.getData('text/plain');
    clearDropMarks();
    if (!id || id === node.id || isInSubtree(node.id, id)) return;
    if (node.type === 'folder') await reparentNode(id, node.id, null);
    else await reparentNode(id, node.parentId || null, node.id);
  });
  wrap.appendChild(row);

  if (kids.length) {
    const box = document.createElement('div');
    box.className = 'hub-node__children' + (isCollapsed ? ' is-collapsed' : '');
    for (const c of kids) box.appendChild(renderNode(c, visible, filterText));
    wrap.appendChild(box);
  }
  return wrap;
}

function iconAction(text, title, onClick) {
  const b = document.createElement('button');
  b.type = 'button'; b.title = title; b.textContent = text;
  b.addEventListener('click', onClick);
  return b;
}

function startRename(row, label, node) {
  if (row.querySelector('.hub-node__label-input')) return;
  row.draggable = false; // sinon la sélection de texte déclenche un drag
  const input = document.createElement('input');
  input.className = 'hub-node__label-input';
  input.value = node.title || '';
  label.replaceWith(input);
  input.focus(); input.select();
  const commit = async (save) => {
    const v = input.value.trim();
    input.replaceWith(label);
    row.draggable = true;
    if (save && v && v !== node.title) {
      await updateDoc(doc(db, 'hubNodes', node.id), { title: v, updatedAt: serverTimestamp(), updatedBy: identity });
      if (node.id === openId) el.title.value = v;
    }
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(true); }
    if (e.key === 'Escape') commit(false);
  });
  input.addEventListener('blur', () => commit(true));
}

// ---------------------------------------------------------------------------
// Arbre : CRUD
// ---------------------------------------------------------------------------
async function createNode(type, parentId) {
  const siblings = childrenOf(parentId);
  const order = siblings.length ? Math.max(...siblings.map((s) => s.order ?? 0)) + 1 : 0;
  const ref = doc(collection(db, 'hubNodes'));
  await setDoc(ref, {
    type, parentId: parentId || null,
    title: type === 'folder' ? 'Nouveau dossier' : 'Nouvel article',
    order, createdAt: serverTimestamp(), createdBy: identity,
    updatedAt: serverTimestamp(), updatedBy: identity,
  });
  if (parentId) { collapsed.delete(parentId); persistCollapsed(); }
  if (type === 'page') {
    await setDoc(doc(db, 'hubPages', ref.id), {
      blocks: { blocks: [], version: '2.30.7' },
      updatedAt: serverTimestamp(), updatedBy: identity, editingBy: null,
    });
    openPage(ref.id);
  }
}

el.addFolder.addEventListener('click', () => createNode('folder', null));

async function moveNode(node, dir) {
  const siblings = childrenOf(node.parentId || null);
  const i = siblings.findIndex((s) => s.id === node.id);
  const j = i + dir;
  if (j < 0 || j >= siblings.length) return;
  const a = siblings[i], b = siblings[j];
  const batch = writeBatch(db);
  batch.update(doc(db, 'hubNodes', a.id), { order: b.order ?? j });
  batch.update(doc(db, 'hubNodes', b.id), { order: a.order ?? i });
  await batch.commit();
}

// --- Glisser-déposer -------------------------------------------------------
function clearDropMarks() {
  el.treeList.querySelectorAll('.drop-into, .drop-after')
    .forEach((n) => n.classList.remove('drop-into', 'drop-after'));
}

// candidateId est-il rootId lui-même ou l'un de ses descendants ?
function isInSubtree(candidateId, rootId) {
  let cur = candidateId;
  while (cur) {
    if (cur === rootId) return true;
    cur = nodesById.get(cur)?.parentId || null;
  }
  return false;
}

// Déplace `dragId` sous `newParentId` (null = racine). Si `afterId` est fourni,
// il est inséré juste après ce frère ; sinon à la fin. Les `order` du dossier
// cible sont renumérotés 0,1,2… dans un seul batch.
async function reparentNode(dragId, newParentId, afterId) {
  const drag = nodesById.get(dragId);
  if (!drag) return;
  if (newParentId && isInSubtree(newParentId, dragId)) return;
  if ((drag.parentId || null) === (newParentId || null) && !afterId) return;

  const sibs = childrenOf(newParentId).filter((s) => s.id !== dragId);
  let at = sibs.length;
  if (afterId) {
    const idx = sibs.findIndex((s) => s.id === afterId);
    if (idx >= 0) at = idx + 1;
  }
  sibs.splice(at, 0, drag);

  const batch = writeBatch(db);
  sibs.forEach((s, i) => {
    const patch = { order: i };
    if (s.id === dragId) {
      patch.parentId = newParentId || null;
      patch.updatedAt = serverTimestamp();
      patch.updatedBy = identity;
    }
    batch.update(doc(db, 'hubNodes', s.id), patch);
  });
  await batch.commit();
  if (newParentId) { collapsed.delete(newParentId); persistCollapsed(); }
}

function descendantsOf(id) {
  const out = [];
  const walk = (pid) => { for (const c of childrenOf(pid)) { out.push(c); walk(c.id); } };
  walk(id);
  return out;
}

async function removeNode(node) {
  const sub = descendantsOf(node.id);
  const pages = [node, ...sub].filter((n) => n.type === 'page').length;
  const folders = [node, ...sub].filter((n) => n.type === 'folder').length;
  let text;
  if (!sub.length) {
    text = node.type === 'folder'
      ? `Supprimer le dossier vide « ${node.title} » ?`
      : `Supprimer l'article « ${node.title} » ? Son contenu sera perdu.`;
  } else {
    text = `Supprimer « ${node.title} » et tout ce qu'il contient : ` +
      `${folders} dossier(s) et ${pages} article(s) ? Cette action est définitive.`;
  }
  const ok = await confirmDialog(node.type === 'folder' ? 'Supprimer le dossier' : "Supprimer l'article", text);
  if (!ok) return;

  const all = [node, ...sub];
  const batch = writeBatch(db);
  for (const n of all) {
    batch.delete(doc(db, 'hubNodes', n.id));
    if (n.type === 'page') batch.delete(doc(db, 'hubPages', n.id));
  }
  await batch.commit();
  if (all.some((n) => n.id === openId)) closeEditor();
}

// ---------------------------------------------------------------------------
// Confirmation générique
// ---------------------------------------------------------------------------
function confirmDialog(title, text) {
  el.confirmTitle.textContent = title;
  el.confirmText.textContent = text;
  el.confirm.hidden = false;
  return new Promise((resolve) => {
    const done = (v) => {
      el.confirm.hidden = true;
      el.confirmOk.removeEventListener('click', ok);
      el.confirmCancel.removeEventListener('click', cancel);
      resolve(v);
    };
    const ok = () => done(true);
    const cancel = () => done(false);
    el.confirmOk.addEventListener('click', ok);
    el.confirmCancel.addEventListener('click', cancel);
  });
}

el.filter.addEventListener('input', renderTree);
el.treeToggle.addEventListener('click', () => el.tree.classList.toggle('is-open'));

// Déposer sur le fond de la liste = remonter le nœud à la racine.
el.treeList.addEventListener('dragover', (e) => {
  if (dragNodeId && e.target === el.treeList) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
});
el.treeList.addEventListener('drop', async (e) => {
  if (e.target !== el.treeList) return;
  e.preventDefault();
  const id = dragNodeId || e.dataTransfer.getData('text/plain');
  clearDropMarks();
  if (id) await reparentNode(id, null, null);
});

// ---------------------------------------------------------------------------
// Éditeur : ouverture d'une page
// ---------------------------------------------------------------------------
function syncTitleFromNode() {
  const node = nodesById.get(openId);
  if (node && document.activeElement !== el.title) el.title.value = node.title || '';
}

async function openPage(id) {
  if (id === openId) { el.tree.classList.remove('is-open'); return; }
  await flushAutosave();
  await releaseLock();
  if (pageUnsub) { pageUnsub(); pageUnsub = null; }
  stopHeartbeat();

  openId = id;
  el.tree.classList.remove('is-open');
  renderTree();

  const node = nodesById.get(id);
  el.editorEmpty.hidden = true;
  el.editorDoc.hidden = false;
  el.title.value = node?.title || '';

  await ensureEditor();

  const ref = doc(db, 'hubPages', id);
  let snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, { blocks: { blocks: [], version: '2.30.7' }, updatedAt: serverTimestamp(), updatedBy: identity, editingBy: null });
    snapshot = await getDoc(ref);
  }
  const data = snapshot.data();
  await loadIntoEditor(data.blocks);

  await tryClaimLock(ref, data.editingBy);

  // abonnement live à la page
  pageUnsub = onSnapshot(ref, (s) => {
    if (!s.exists() || s.metadata.hasPendingWrites) return;
    onPageSnapshot(s.data());
  });
}

function closeEditor() {
  openId = null;
  if (pageUnsub) { pageUnsub(); pageUnsub = null; }
  stopHeartbeat();
  holdsLock = false;
  el.editorDoc.hidden = true;
  el.editorEmpty.hidden = false;
  el.presence.hidden = true;
  setSaveState('');
  renderTree();
}

// ---------------------------------------------------------------------------
// Éditeur : instance Editor.js
// ---------------------------------------------------------------------------
function buildTools() {
  const t = {};
  if (window.Header) t.header = { class: window.Header, inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 3 } };
  const ListClass = window.NestedList || window.List;
  if (ListClass) t.list = { class: ListClass, inlineToolbar: true };
  if (window.Checklist) t.checklist = { class: window.Checklist, inlineToolbar: true };
  if (window.Quote) t.quote = { class: window.Quote, inlineToolbar: true };
  if (window.Delimiter) t.delimiter = window.Delimiter;
  if (window.Table) t.table = { class: window.Table, inlineToolbar: true };
  if (window.Marker) t.marker = { class: window.Marker, shortcut: 'CMD+SHIFT+M' };
  if (window.InlineCode) t.inlineCode = { class: window.InlineCode };
  if (window.Underline) t.underline = window.Underline;
  return t;
}

function ensureEditor() {
  if (editor) return editor.isReady;
  if (!window.EditorJS) {
    setSaveState('Éditeur non chargé (réseau ?)');
    return Promise.resolve();
  }
  editor = new window.EditorJS({
    holder: 'hub-editor',
    placeholder: 'Commence à écrire, ou tape « / » pour insérer un bloc…',
    tools: buildTools(),
    onChange: () => {
      if (suppressChange || !holdsLock) return;
      scheduleAutosave();
    },
  });
  return editor.isReady;
}

async function loadIntoEditor(blocksData) {
  if (!editor) return;
  await editor.isReady;
  suppressChange = true;
  try {
    const data = normalizeBlocks(blocksData);
    await editor.render(data);
  } catch (err) {
    console.warn('[hub] rendu blocs impossible', err);
  } finally {
    // laisse passer l'événement onChange déclenché par render()
    setTimeout(() => { suppressChange = false; }, 50);
  }
}

function normalizeBlocks(raw) {
  if (!raw) return { blocks: [] };
  if (Array.isArray(raw)) return { blocks: raw };
  if (Array.isArray(raw.blocks)) return { time: raw.time, blocks: raw.blocks, version: raw.version };
  return { blocks: [] };
}

// ---------------------------------------------------------------------------
// Autosave
// ---------------------------------------------------------------------------
function scheduleAutosave() {
  setSaveState('Modifié…', 'saving');
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(saveNow, AUTOSAVE_MS);
}

async function saveNow() {
  clearTimeout(autosaveTimer);
  if (!openId || !holdsLock || !editor) return;
  try {
    await editor.isReady;
    const out = await editor.save();
    const ref = doc(db, 'hubPages', openId);
    lastLocalSaveAt = Date.now();
    await setDoc(ref, {
      blocks: out,
      updatedAt: serverTimestamp(),
      updatedBy: identity,
      editingBy: { name: identity, at: Date.now() },
    }, { merge: true });
    await updateDoc(doc(db, 'hubNodes', openId), { updatedAt: serverTimestamp(), updatedBy: identity }).catch(() => {});
    setSaveState('Enregistré à ' + new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }), 'saved');
  } catch (err) {
    console.error('[hub] échec enregistrement', err);
    setSaveState('Enregistrement impossible', 'saving');
  }
}

async function flushAutosave() {
  if (autosaveTimer) { clearTimeout(autosaveTimer); await saveNow(); }
}

// titre : enregistrement direct sur le nœud
let titleTimer = null;
el.title.addEventListener('input', () => {
  if (!openId || !holdsLock) return;
  setSaveState('Modifié…', 'saving');
  clearTimeout(titleTimer);
  titleTimer = setTimeout(async () => {
    const v = el.title.value.trim() || 'Sans titre';
    await updateDoc(doc(db, 'hubNodes', openId), { title: v, updatedAt: serverTimestamp(), updatedBy: identity });
    setSaveState('Enregistré', 'saved');
  }, AUTOSAVE_MS);
});

function setSaveState(text, kind) {
  el.saveState.textContent = text;
  el.saveState.className = 'hub-save-state' + (kind ? ' is-' + kind : '');
}

// ---------------------------------------------------------------------------
// Verrou doux + présence
// ---------------------------------------------------------------------------
function lockIsStale(lock) {
  return !lock || !lock.at || (Date.now() - lock.at) > LOCK_STALE_MS;
}

async function tryClaimLock(ref, currentLock) {
  if (!currentLock || lockIsStale(currentLock) || currentLock.name === identity) {
    await setLock(ref, { name: identity, at: Date.now() });
    holdsLock = true;
    setReadonly(false);
    startHeartbeat(ref);
  } else {
    holdsLock = false;
    setReadonly(true, currentLock.name);
  }
  updatePresence(currentLock);
}

async function setLock(ref, value) {
  try { await updateDoc(ref, { editingBy: value }); } catch (err) { console.warn('[hub] verrou', err); }
}

async function releaseLock() {
  stopHeartbeat();
  if (holdsLock && openId) {
    holdsLock = false;
    await setLock(doc(db, 'hubPages', openId), null);
  }
}

function startHeartbeat(ref) {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (holdsLock) setLock(ref, { name: identity, at: Date.now() });
  }, HEARTBEAT_MS);
}
function stopHeartbeat() { if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; } }

function setReadonly(ro, who) {
  el.editorHost.classList.toggle('is-readonly', ro);
  el.title.readOnly = ro;
  if (ro) {
    el.readonlyBanner.hidden = false;
    el.readonlyBanner.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = `✏️ ${who || 'Quelqu’un'} est en train d'éditer cet article — ouvert en lecture seule.`;
    const btn = document.createElement('button');
    btn.className = 'hub-btn hub-btn--sm';
    btn.textContent = 'Éditer quand même';
    btn.addEventListener('click', forceTakeover);
    el.readonlyBanner.append(span, btn);
  } else {
    el.readonlyBanner.hidden = true;
  }
}

async function forceTakeover() {
  if (!openId) return;
  const ref = doc(db, 'hubPages', openId);
  await setLock(ref, { name: identity, at: Date.now() });
  holdsLock = true;
  setReadonly(false);
  startHeartbeat(ref);
  // recharge le contenu le plus récent avant de prendre la main
  const s = await getDoc(ref);
  if (s.exists()) await loadIntoEditor(s.data().blocks);
}

function updatePresence(lock) {
  if (lock && lock.name && lock.name !== identity && !lockIsStale(lock)) {
    el.presence.hidden = false;
    el.presence.textContent = `✏️ ${lock.name} édite`;
  } else {
    el.presence.hidden = true;
  }
}

// ---------------------------------------------------------------------------
// Réception d'une mise à jour live de la page ouverte
// ---------------------------------------------------------------------------
async function onPageSnapshot(data) {
  updatePresence(data.editingBy);

  if (holdsLock) {
    // je suis l'éditeur : dernier enregistrement gagne, je n'écrase pas ma
    // frappe. Si quelqu'un a forcé la reprise, je repasse en lecture seule.
    if (data.editingBy && data.editingBy.name !== identity && !lockIsStale(data.editingBy)) {
      holdsLock = false;
      stopHeartbeat();
      setReadonly(true, data.editingBy.name);
      await loadIntoEditor(data.blocks);
    }
    return;
  }

  // lecture seule : on suit le contenu en direct
  await loadIntoEditor(data.blocks);
  el.editorMeta.textContent = data.updatedBy
    ? 'Dernière modif : ' + data.updatedBy
    : '';

  // le verrou s'est libéré ? on peut proposer de prendre la main
  if (lockIsStale(data.editingBy)) {
    const ref = doc(db, 'hubPages', openId);
    await tryClaimLock(ref, data.editingBy);
  }
}

// ---------------------------------------------------------------------------
// Import du seed OneNote (une seule fois, quand l'arbre est vide)
// ---------------------------------------------------------------------------
function refreshImportButton() {
  el.importBtn.hidden = !(identity && nodes.length === 0);
}

el.importBtn.addEventListener('click', async () => {
  el.importBtn.disabled = true;
  el.importBtn.textContent = 'Import en cours…';
  try {
    const seed = await fetch('/js/hub-seed.json').then((r) => {
      if (!r.ok) throw new Error('hub-seed.json ' + r.status);
      return r.json();
    });
    const now = serverTimestamp();
    let batch = writeBatch(db);
    let count = 0;
    const flush = async () => { await batch.commit(); batch = writeBatch(db); count = 0; };

    for (const n of seed.nodes) {
      batch.set(doc(db, 'hubNodes', n.id), {
        type: n.type, parentId: n.parentId || null, title: n.title,
        order: n.order ?? 0, createdAt: now, createdBy: identity,
        updatedAt: now, updatedBy: identity,
      });
      if (++count >= 400) await flush();
    }
    for (const p of seed.pages) {
      batch.set(doc(db, 'hubPages', p.id), {
        blocks: { blocks: p.blocks, version: '2.30.7' },
        updatedAt: now, updatedBy: identity, editingBy: null,
      });
      if (++count >= 400) await flush();
    }
    if (count) await batch.commit();
    el.importBtn.hidden = true;
  } catch (err) {
    console.error('[hub] import seed', err);
    alert('Import impossible : ' + err.message);
    el.importBtn.disabled = false;
    el.importBtn.textContent = 'Importer le contenu OneNote';
  }
});

// ---------------------------------------------------------------------------
// Sortie propre
// ---------------------------------------------------------------------------
window.addEventListener('pagehide', () => {
  // best effort : libère le verrou (le filet de sécurité réel est le délai
  // d'expiration de 90 s côté lecteur, si ce write n'aboutit pas).
  if (holdsLock && openId) setLock(doc(db, 'hubPages', openId), null);
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushAutosave();
});

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------
initFirebase();
onAuthStateChanged(auth, (user) => {
  if (user) startApp();
  else { closeEditor(); showLogin(); }
});
