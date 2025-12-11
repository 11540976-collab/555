import { BankAccount, StockHolding, Transaction, User } from "../types";
import { INITIAL_ACCOUNTS, INITIAL_INVESTMENTS, INITIAL_TRANSACTIONS } from "../constants";
import { db, auth } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// --- Helpers ---

const DEMO_USER_KEY = 'fintrack_demo_user';

// Check if we are in demo mode (no firebase)
const isDemoMode = () => !auth || !db;

// --- Authentication ---

export const registerWithEmail = async (email: string, password: string, username: string): Promise<User> => {
  if (isDemoMode()) {
    // Demo Mode: Simulate registration locally
    console.log("Demo Mode: Registering locally");
    const user: User = {
      id: 'demo-' + Date.now(),
      username: username,
      email: email
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    return user;
  }

  // Firebase Mode
  try {
    // @ts-ignore - auth checked in isDemoMode
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
    const fbUser = userCredential.user;

    if (fbUser) {
        await updateProfile(fbUser, { displayName: username });
    }
    
    const user: User = {
      id: fbUser.uid,
      username: username || 'User',
      email: fbUser.email || ''
    };
    return user;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  if (isDemoMode()) {
    // Demo Mode: Simulate login (allow any credentials or check against last saved demo user)
    console.log("Demo Mode: Logging in locally");
    const stored = localStorage.getItem(DEMO_USER_KEY);
    // If we have a stored demo user, return it, otherwise create a session for this email
    if (stored) {
        const u = JSON.parse(stored);
        if (u.email === email) return u;
    }
    // Create new session if no match found (Demo convenience)
    const user: User = {
        id: 'demo-user',
        username: email.split('@')[0],
        email: email
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    return user;
  }

  // Firebase Mode
  try {
    // @ts-ignore
    const userCredential = await signInWithEmailAndPassword(auth!, email, password);
    const fbUser = userCredential.user;
    
    const user: User = {
      id: fbUser.uid,
      username: fbUser.displayName || 'User',
      email: fbUser.email || ''
    };
    return user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (isDemoMode()) {
    localStorage.removeItem(DEMO_USER_KEY);
    return;
  }
  
  // @ts-ignore
  if (auth) await signOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (isDemoMode()) {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      return stored ? JSON.parse(stored) : null;
  }

  // @ts-ignore
  if (!auth) return null;
  // @ts-ignore
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    username: fbUser.displayName || 'User',
    email: fbUser.email || ''
  };
};

// --- Data Persistence ---

export const loadData = async (userId: string) => {
  if (!userId) throw new Error("No user ID provided");

  // Try Firebase first if available
  if (db) {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as { accounts: BankAccount[], transactions: Transaction[], investments: StockHolding[] };
        }
    } catch (error) {
        console.error("Firestore Load Error (falling back to local):", error);
    }
  }

  // Fallback: LocalStorage or Constants
  // This handles both "Demo Mode" and "Offline Mode"
  const localData = localStorage.getItem(`fintrack_data_${userId}`);
  if (localData) {
      return JSON.parse(localData);
  }

  // Default Data
  const initialData = {
    accounts: INITIAL_ACCOUNTS.map(a => ({...a, userId})),
    transactions: INITIAL_TRANSACTIONS.map(t => ({...t, userId})),
    investments: INITIAL_INVESTMENTS.map(i => ({...i, userId}))
  };

  // If in firebase mode and this is a new user, try to init firestore
  if (db) {
     try {
         await setDoc(doc(db, "users", userId), initialData);
     } catch (e) { /* ignore write errors */ }
  }

  return initialData;
};

export const saveData = async (userId: string, data: { accounts: BankAccount[], transactions: Transaction[], investments: StockHolding[] }) => {
  if (!userId) return;

  // Always save to LocalStorage (acts as cache/offline/demo storage)
  localStorage.setItem(`fintrack_data_${userId}`, JSON.stringify(data));

  // If Firebase is available, save there too
  if (db) {
    try {
        const docRef = doc(db, "users", userId);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Firestore Save Error:", error);
    }
  }
};