// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_PKWF56ewvUlxgOnESMcRzpHkI1ET_I8",
    authDomain: "edu-hub-6d472.firebaseapp.com",
    projectId: "edu-hub-6d472",
    storageBucket: "edu-hub-6d472.firebasestorage.app",
    messagingSenderId: "718923597318",
    appId: "1:718923597318:web:8d30e1e3759a72f63c6587",
    measurementId: "G-EF7VGKZRG0",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle Login
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in with Firebase Authentication
        await auth.signInWithEmailAndPassword(email, password);

        // Redirect to index.html on successful login
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error signing in:", error.message);
        alert("Login failed: " + error.message);
    }
});