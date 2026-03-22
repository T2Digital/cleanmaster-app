// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Helper to get environment variables safely in different environments
const getEnv = (key: string, defaultValue: string): string => {
  let value: any = undefined;
  try {
    // Check import.meta.env (Vite standard)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      value = import.meta.env[`VITE_${key}`] || import.meta.env[key];
    }
    
    // Check process.env (Node/Vercel fallback)
    // @ts-ignore
    if (!value && typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
    }
  } catch (e) {
    // Silence errors during build time
  }

  // Force fallback if value is not a valid non-empty string
  if (typeof value !== 'string' || value.trim().length === 0) {
    return defaultValue;
  }
  
  return value.trim();
};

// Your web app's Firebase configuration - Using Environment Variables
const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY", "AIzaSyDZJ_uzBhwPOcvmsWXFrg-1ovDc7YzKMmE"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN", "clean-master-16883.firebaseapp.com"),
  projectId: getEnv("FIREBASE_PROJECT_ID", "clean-master-16883"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET", "clean-master-16883.firebasestorage.app"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID", "22734760869"),
  appId: getEnv("FIREBASE_APP_ID", "1:22734760869:web:3a103ec69554b7bc48d64c"),
  measurementId: getEnv("FIREBASE_MEASUREMENT_ID", "G-XM7Q2PX8VR")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };