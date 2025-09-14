
'use client';

import { initializeApp, getApp, getApps, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let auth;
let db;

if (typeof window !== 'undefined') {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e: any) {
    console.error('Firebase initialization error:', e.message);
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error(
        'Firebase config is missing or incomplete. Please ensure your .env file is set up correctly with all NEXT_PUBLIC_FIREBASE_ variables.'
      );
    }
    // Set to null if initialization fails to prevent further errors
    app = null;
    auth = null;
    db = null;
  }
}

export { app, db, auth };
