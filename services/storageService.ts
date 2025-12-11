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

// --- Authentication ---

export const registerWithEmail = async (email: string, password: string, username: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Update Display Name
    await updateProfile(fbUser, {
      displayName: username
    });
    
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
  await signOut(auth);
};

export const getCurrentUser = (): User | null => {
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
  if (!userId) throw new Error("No user ID provided");

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
    await setDoc(docRef, initialData);
    return initialData;
  }
};

export const saveData = async (userId: string, data: { accounts: BankAccount[], transactions: Transaction[], investments: StockHolding[] }) => {
  if (!userId) return;
  const docRef = doc(db, "users", userId);
  await setDoc(docRef, data, { merge: true });
};