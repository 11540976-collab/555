import firebase from "firebase/compat/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Helper to safely access import.meta.env
const getMetaEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // ignore errors
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || getMetaEnv('VITE_FIREBASE_API_KEY'),
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || getMetaEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: process.env.FIREBASE_PROJECT_ID || getMetaEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || getMetaEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || getMetaEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: process.env.FIREBASE_APP_ID || getMetaEnv('VITE_FIREBASE_APP_ID')
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;

const isValidApiKey = (key: string | undefined) => {
    if (!key) return false;
    if (key.length < 10) return false; // Basic length check
    if (key.includes("INSERT_KEY") || key.includes("your_api_key")) return false; // Placeholder check
    return true;
};

try {
  // Check if API key is present and looks valid
  if (isValidApiKey(firebaseConfig.apiKey)) {
    app = firebase.initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } else {
    console.warn("Firebase API Key is missing or invalid. Application starting in Demo/Offline Mode.");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  // Do not throw, allow app to continue in offline mode
}

export { auth, db };