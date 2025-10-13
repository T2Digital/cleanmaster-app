import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's CORRECT Firebase configuration
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
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn('Firestore persistence failed: failed-precondition. Multiple tabs open?');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence.
      console.warn('Firestore persistence failed: unimplemented. Browser not supported.');
    }
  });


export { db };
