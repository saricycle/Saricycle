import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBwws4oDwzpd5fmjNLbunfiMGHdS2RSD_4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "saricycle-9d907.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://saricycle-9d907-default-rtdb.asia-southeast1.firebasedatabase.app", // This is important for Realtime Database
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "saricycle-9d907",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "saricycle-9d907.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "11476253695",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:11476253695:web:e50c0de51e769dd2f185ca"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export default app;