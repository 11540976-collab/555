import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 這些值將在 GitHub Actions 部署過程中被自動替換
// 如果您在本地運行，請確保創建 .env 檔案或手動填入測試用的 API Key
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "FIREBASE_AUTH_DOMAIN_PLACEHOLDER",
  projectId: "FIREBASE_PROJECT_ID_PLACEHOLDER",
  storageBucket: "FIREBASE_STORAGE_BUCKET_PLACEHOLDER",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: "FIREBASE_APP_ID_PLACEHOLDER"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);