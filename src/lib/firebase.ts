
'use client';

import { initializeApp, getApp, getApps, FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  projectId: "studio-5212431881-c5493",
  appId: "1:284353840756:web:8ac8d6a2c0ebfdcaa57321",
  storageBucket: "studio-5212431881-c5493.firebasestorage.app",
  apiKey: "AIzaSyDoshBdy-GMpQXM78i7OVEWWt04hNzGvOk",
  authDomain: "studio-5212431881-c5493.firebaseapp.com",
  messagingSenderId: "284353840756"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

if (!app) {
    console.error('Firebase initialization failed. Check your configuration.');
}

export { app };
