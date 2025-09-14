
'use client';

import { initializeApp, getApp, getApps, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  projectId: "studio-5212431881-c5493",
  appId: "1:284353840756:web:8ac8d6a2c0ebfdcaa57321",
  storageBucket: "studio-5212431881-c5493.firebasestorage.app",
  apiKey: "AIzaSyDoshBdy-GMpQXM78i7OVEWWt04hNzGvOk",
  authDomain: "studio-5212431881-c5493.firebaseapp.com",
  messagingSenderId: "284353840756"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e: any) {
  console.error('Firebase initialization error:', e.message);
   // Set to null if initialization fails to prevent further errors
  app = null;
  auth = null;
  db = null;
}


export { app, db, auth };
