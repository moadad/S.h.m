import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAJFc1INw5yKParhl-kLc4hoha1en0D7fo",
  authDomain: "erb-sestem.firebaseapp.com",
  projectId: "erb-sestem",
  storageBucket: "erb-sestem.firebasestorage.app",
  messagingSenderId: "246580061197",
  appId: "1:246580061197:web:322bd35082c6b78a62a144"
};

const CLOUDINARY = {
  cloudName: 'Sham miser',
  uploadPreset: 'dueuyivqo'
};

const ADMIN_UID = 'SjJVfCdj0xb4EOZ7lFjmSLQ0oy32';
const ADMIN_EMAIL = 'Admin@shm.local';
const PRIMARY_NOTIFICATION_EMAIL = 'lanakids83@gmail.com';
const PUBLIC_URL = 'https://moadad.github.io/S.h.m/';
const GOOGLE_VERIFICATION_FILE = 'google89cc9db4731079f1.html';
const GOOGLE_VERIFICATION_TOKEN = 'google89cc9db4731079f1';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.SHM_APP = {
  app,
  auth,
  db,
  CLOUDINARY,
  ADMIN_UID,
  ADMIN_EMAIL,
  PRIMARY_NOTIFICATION_EMAIL,
  PUBLIC_URL,
  GOOGLE_VERIFICATION_FILE,
  GOOGLE_VERIFICATION_TOKEN,
  firebaseConfig
};

export {
  app,
  auth,
  db,
  CLOUDINARY,
  ADMIN_UID,
  ADMIN_EMAIL,
  PRIMARY_NOTIFICATION_EMAIL,
  PUBLIC_URL,
  GOOGLE_VERIFICATION_FILE,
  GOOGLE_VERIFICATION_TOKEN
};
