import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeI2YL1ChK_93eL6nfcA3RvbCg0xP9rZU",
  authDomain: "cleanmaster-app-65622056-6e2da.firebaseapp.com",
  projectId: "cleanmaster-app-65622056-6e2da",
  storageBucket: "cleanmaster-app-65622056-6e2da.firebasestorage.app",
  messagingSenderId: "117385968185",
  appId: "1:117385968185:web:2040b754613678c4532be8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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