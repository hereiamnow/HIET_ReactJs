// File: firebase.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 7, 2025
// Time: 10:48 PM CDT

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This configuration object is used to initialize Firebase.
// Ensure that the keys and identifiers are correct and match your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCh0cvqGXCSkcAjPQpn-DeVCEySrmrHETw",
  authDomain: "humidor-hub.firebaseapp.com",
  projectId: "humidor-hub",
  storageBucket: "humidor-hub.firebasestorage.app",
  messagingSenderId: "818153362018",
  appId: "1:818153362018:web:68fccfbb8e45078dd7b73b"
};

// Initialize Firebase using the correct 'firebaseConfig' variable
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
// These exports can be used in other parts of your application to interact with Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const firebaseConfigExport = firebaseConfig; // This line is fine and can stay