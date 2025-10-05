import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCAg7iQqqlsjFzB_L9sS2LYbJKK8MoVYR0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "saricycle-32a8d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://saricycle-32a8d-default-rtdb.asia-southeast1.firebasedatabase.app", // This is important for Realtime Database
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "saricycle-32a8d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "saricycle-32a8d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1:985375479456:web:9bc795fcb1e1f908b19bc5",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "G-0J6FTXECYC"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export default app; 