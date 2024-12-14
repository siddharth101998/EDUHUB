// firebase.js (or wherever you set up Firebase)
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_PKWF56ewvUlxgOnESMcRzpHkI1ET_I8",
    authDomain: "edu-hub-6d472.firebaseapp.com",
    projectId: "edu-hub-6d472",
    storageBucket: "edu-hub-6d472.firebasestorage.app",
    messagingSenderId: "718923597318",
    appId: "1:718923597318:web:8d30e1e3759a72f63c6587",
    measurementId: "G-EF7VGKZRG0"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

module.exports = { db };