import { initializeApp } from "firebase/app";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

// Using hardcoded values directly as environment variables can be unreliable in client-side builds
// and these are non-sensitive public Firebase keys.
const firebaseConfig = {
  apiKey: "AIzaSyDZJ_uzBhwPOcvmsWXFrg-1ovDc7YzKMmE",
  authDomain: "clean-master-16883.firebaseapp.com",
  projectId: "clean-master-16883", 
  storageBucket: "clean-master-16883.firebasestorage.app",
  messagingSenderId: "22734760869",
  appId: "1:22734760869:web:3a103ec69554b7bc48d64c",
  measurementId: "G-XM7Q2PX8VR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific settings to avoid persistence loops
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

export { db };