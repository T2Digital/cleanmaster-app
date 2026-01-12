import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZJ_uzBhwPOcvmsWXFrg-1ovDc7YzKMmE",
  authDomain: "clean-master-16883.firebaseapp.com",
  projectId: "clean-master-16883",
  storageBucket: "clean-master-16883.firebasestorage.app",
  messagingSenderId: "22734760869",
  appId: "1:22734760869:web:3a103ec69554b7bc48d64c",
  measurementId: "G-XM7Q2PX8VR"
};

// Ensure app is initialized exactly once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore and export
const db = getFirestore(app);

export { db };