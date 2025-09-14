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

let app, db, auth;

// Check if we are in a browser environment before initializing
if (typeof window !== 'undefined') {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e: any) {
     if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.projectId
    ) {
        console.error(
          'Firebase config is missing. Please ensure your .env file is set up correctly.'
        );
    } else {
        console.error('Firebase initialization error:', e.message);
    }
    // Set to null if initialization fails
    app = null;
    db = null;
    auth = null;
  }
}


export { app, db, auth };
