// Envoie les formulaires "Contact" (contact.html) et "Proposer un événement"
// (agenda.html) vers le projet Firebase partagé avec l'app (ca-monstre-joue) :
// Firestore pour les données, Storage pour l'affiche de l'événement. Module
// autonome (ne dépend pas de main.js) — un <script type="module"> s'exécute
// après le parsing du HTML, donc les formulaires existent déjà au moment où
// ce code tourne.
//
// Les soumissions arrivent dans Firestore avec status: 'pending' — elles ne
// sont PAS publiées automatiquement sur /agenda.html (qui reste éditée à la
// main dans js/data.js après vérification, voir le commentaire au-dessus de
// window.EVENTS). Ce script ne fait que collecter la demande.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';

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
const storage = getStorage(app);

function qs(sel, ctx) { return (ctx || document).querySelector(sel); }

function showFeedback(form, kind, message) {
  const wrap = form.parentElement;
  const success = qs('.form-success', wrap);
  let error = qs('.form-error', wrap);
  if (!error && success) {
    error = document.createElement('p');
    error.className = 'form-error';
    success.insertAdjacentElement('afterend', error);
  }
  if (success) success.classList.remove('show');
  if (error) { error.classList.remove('show'); }
  if (kind === 'success' && success) {
    success.classList.add('show');
  } else if (kind === 'error' && error) {
    error.textContent = message || "Une erreur est survenue, réessaie ou écris-nous directement.";
    error.classList.add('show');
  }
}

function setSubmitting(form, isSubmitting) {
  const btn = qs('button[type="submit"]', form);
  if (!btn) return;
  if (isSubmitting) {
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.textContent = 'Envoi...';
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.label || btn.textContent;
    btn.disabled = false;
  }
}

// ---------- Contact ----------
const contactForm = qs('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setSubmitting(contactForm, true);
    const data = Object.fromEntries(new FormData(contactForm).entries());
    try {
      await addDoc(collection(db, 'contactSubmissions'), {
        name: data.name || '',
        email: data.email || '',
        subject: data.subject || '',
        message: data.message || '',
        status: 'new',
        createdAt: serverTimestamp(),
      });
      showFeedback(contactForm, 'success');
      contactForm.reset();
    } catch (err) {
      console.error('Contact submission failed', err);
      showFeedback(contactForm, 'error');
    } finally {
      setSubmitting(contactForm, false);
    }
  });
}

// ---------- Agenda : proposer un événement ----------
const eventForm = qs('#event-form');
if (eventForm) {
  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setSubmitting(eventForm, true);
    const data = Object.fromEntries(new FormData(eventForm).entries());
    const fileInput = qs('#event-image', eventForm);
    const file = fileInput && fileInput.files && fileInput.files[0];
    try {
      let imageUrl = null;
      if (file) {
        const path = `event-submissions/${Date.now()}-${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        imageUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'eventSubmissions'), {
        title: data.title || '',
        date: data.date || '',
        time: data.time || '',
        location: data.location || '',
        description: data.description || '',
        price: data.price || '',
        registrationLink: data.registrationLink || '',
        contact: data.contact || '',
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      showFeedback(eventForm, 'success');
      eventForm.reset();
    } catch (err) {
      console.error('Event submission failed', err);
      showFeedback(eventForm, 'error');
    } finally {
      setSubmitting(eventForm, false);
    }
  });
}
