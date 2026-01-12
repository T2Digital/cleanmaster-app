import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

// Safe Environment Variable Helper
const getSafeEnv = (key: string, hardcodedFallback: string): string => {
  let value: any = undefined;
  try {
    // @ts-ignore
    value = typeof process !== 'undefined' && process.env ? (process.env[key] || process.env[`NEXT_PUBLIC_${key}`]) : undefined;
  } catch (e) {}

  if (!value || typeof value !== 'string' || value.trim() === "" || value.includes('undefined')) {
    return hardcodedFallback;
  }
  return value.trim();
};

// DIRECT CONFIGURATION - No more empty strings allowed
const firebaseConfig = {
  apiKey: getSafeEnv("FIREBASE_API_KEY", "AIzaSyDZJ_uzBhwPOcvmsWXFrg-1ovDc7YzKMmE"),
  authDomain: getSafeEnv("FIREBASE_AUTH_DOMAIN", "clean-master-16883.firebaseapp.com"),
  projectId: "clean-master-16883", // Hardcoded to prevent 'projects//databases' error loop
  storageBucket: getSafeEnv("FIREBASE_STORAGE_BUCKET", "clean-master-16883.firebasestorage.app"),
  messagingSenderId: getSafeEnv("FIREBASE_MESSAGING_SENDER_ID", "22734760869"),
  appId: getSafeEnv("FIREBASE_APP_ID", "1:22734760869:web:3a103ec69554b7bc48d64c"),
  measurementId: getSafeEnv("FIREBASE_MEASUREMENT_ID", "G-XM7Q2PX8VR")
};

// Initialize Firebase with optimized settings
const app = initializeApp(firebaseConfig);

// Use initializeFirestore instead of getFirestore to have more control over settings
// This avoids some of the common persistence errors in restricted environments
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

export { db };