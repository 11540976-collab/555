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

const ensureAuthReady = () => {
  if (!auth) {
    throw new Error("Firebase Auth 尚未初始化。請檢查 API Key 設定。");
  }
};

const ensureDbReady = () => {
  if (!db) {
    throw new Error("Firebase Firestore 尚未初始化。請檢查 API Key 設定。");
  }
};

// --- Authentication ---

export const registerWithEmail = async (email: string, password: string, username: string): Promise<User> => {
  ensureAuthReady();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Update Display Name
    if (fbUser) {
        await updateProfile(fbUser, {
        displayName: username
        });
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
  ensureAuthReady();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
  if (auth) await signOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    username: fbUser.displayName || 'User',
    email: fbUser.email || ''
  };
};

// --- Data Persistence (Firestore) ---

export const loadData = async (userId: string) => {
  ensureDbReady();
  if (!userId) throw new Error("No user ID provided");

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as { accounts: BankAccount[], transactions: Transaction[], investments: StockHolding[] };
    } else {
        // Initialize new user with demo data in Firestore
        const initialData = {
        accounts: INITIAL_ACCOUNTS.map(a => ({...a, userId})),
        transactions: INITIAL_TRANSACTIONS.map(t => ({...t, userId})),
        investments: INITIAL_INVESTMENTS.map(i => ({...i, userId}))
        };
        // Use setDoc cautiously; ensure Firestore rules allow write
        await setDoc(docRef, initialData);
        return initialData;
    }
  } catch (error) {
      console.error("Firestore Error in loadData:", error);
      // Fallback to local constants if Firestore fails (e.g., permissions or network)
      // allowing the user to at least see the dashboard
      return {
        accounts: INITIAL_ACCOUNTS.map(a => ({...a, userId})),
        transactions: INITIAL_TRANSACTIONS.map(t => ({...t, userId})),
        investments: INITIAL_INVESTMENTS.map(i => ({...i, userId}))
      };
  }
};

export const saveData = async (userId: string, data: { accounts: BankAccount[], transactions: Transaction[], investments: StockHolding[] }) => {
  if (!userId || !db) return;
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Firestore Save Error:", error);
  }
};