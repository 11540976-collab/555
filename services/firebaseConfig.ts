import firebase from "firebase/compat/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Vite 'define' in vite.config.ts replaces `process.env.FIREBASE_...` with string literals.
// We use `|| import.meta.env.VITE_...` as a fallback for local development or cases where define might miss.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth: Auth;
let db: Firestore;

try {
  // Validate API Key to prevent immediate crash with "auth/invalid-api-key"
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === '') {
    console.warn("Firebase API Key is missing. Check your .env file or build configuration.");
    // We throw here so we can catch it and handle the app state gracefully
    throw new Error("Missing Firebase API Key");
  }

  // Initialize Firebase
  // Use compat/app to avoid TS module resolution issues with "initializeApp" in some environments
  app = firebase.initializeApp(firebaseConfig);
  
  // Initialize Auth and Firestore
  auth = getAuth(app);
  db = getFirestore(app);
  
} catch (error) {
  console.error("Firebase Initialization Failed:", error);
  // App.tsx must handle the case where auth/db are undefined
}

export { auth, db };