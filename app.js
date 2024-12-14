const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require('./firebaseConfig');  // Make sure the path is correct
require("dotenv").config();





const app = express();
app.use(bodyParser.json());
app.use(cors());

// Login API

const { db } = require('./firebase');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { doc, setDoc, getDoc } = require('firebase/firestore');

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required." });
    }

    try {
        // Use Firebase Authentication to verify email and password
        const auth = admin.auth();
        const user = await auth.getUserByEmail(email);

        // Verify password against Firebase Authentication (Firebase doesn't store plain passwords)
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // If needed, compare password using bcrypt or any other method
        // Note: Firebase doesn't store plain-text passwords, so you won't have access to them here.

        // Retrieve user details from Firestore
        const db = admin.firestore();
        const userDoc = await db.collection("users").doc(user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).send({ message: "User details not found in Firestore" });
        }

        const userData = userDoc.data();
        return res.status(200).send({ message: "Login successful", user: userData });
    } catch (error) {
        return res.status(500).send({ message: "Error logging in", error: error.message });
    }
});
// Signup API

//const { auth, db } = require('./firebase'); // Firebase initialization

app.post('/api/signup', async (req, res) => {
    const { name, email, phone, address, password, confirmPassword, gender } = req.body;

    // Validate if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    try {
        // First, check if the user exists in Firebase Authentication
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create the user using Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Now, add the user's additional data to Firestore
        const userRef = doc(db, "users", user.uid); // Reference to Firestore document
        const newUser = {
            uid: user.uid,
            name,
            email,
            phone,
            address,
            gender,
            role: 'user',  // Default role
            createdAt: new Date().toISOString(),
        };

        // Add user data to Firestore
        await setDoc(userRef, newUser);

        // Send success response
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const { collection, getDocs } = require("firebase/firestore");

// GET endpoint to fetch all users
app.get("/api/users", async (req, res) => {
    try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);

        const users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

app.post('/api/add-course', async (req, res) => {
    const { courseId, courseName } = req.body;
    try {
        await db.collection('courses').doc(courseId).set({ courseName });
        res.status(200).send("Course added successfully.");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('api/add-questions', async (req, res) => {
    const { courseId, questions } = req.body;
    try {
        await db.collection('questions').doc(courseId).set({ questions });
        res.status(200).send("Questions added successfully.");
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.get('/api/get-questions/:courseId', async (req, res) => {
    const courseId = req.params.courseId; // Corrected parameter name

    try {
        const docRef = doc(db, 'Questions', courseId); // Firestore reference to the document
        const docSnap = await getDoc(docRef); // Fetch the document

        if (!docSnap.exists()) {
            return res.status(404).send("No questions found for this course.");
        }

        const data = docSnap.data(); // Get the document data
        if (!data.questions || data.questions.length === 0) {
            return res.status(404).send("No questions found for this course.");
        }

        // Send the questions data
        res.status(200).json(data.questions);
    } catch (error) {
        console.error("Error getting questions: ", error);
        res.status(500).send("Internal server error");
    }
});



app.post('/api/calculate-score', async (req, res) => {
    const { courseId, studentAnswers } = req.body;
    try {
        const doc = await db.collection('questions').doc(courseId).get();
        if (doc.exists) {
            const { questions } = doc.data();
            let score = 0;

            questions.forEach((q, index) => {
                if (q.answer === studentAnswers[index]) {
                    score += 1;
                }
            });

            res.status(200).json({ score });
        } else {
            res.status(404).send("Questions not found.");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Assuming you're using Firebase and Express
app.get('/api/get-courses', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'course')); // Correct usage for Firestore v9+ modular SDK

        if (snapshot.empty) {
            return res.status(404).send("No courses found.");
        }

        const courses = snapshot.docs.map(doc => ({
            id: doc.id,                   // Document ID
            name: doc.data().courseName   // Course Name
        }));

        console.log(courses);
        res.status(200).json(courses); // Send back the list of courses
    } catch (error) {
        console.error("Error fetching courses: ", error);
        res.status(500).send("Internal server error");
    }
});
app.get('/api/get-courses-by-module', async (req, res) => {
    const { moduleId } = req.query;  // Get moduleId from query parameter

    if (!moduleId) {
        return res.status(400).send("Module ID is required.");
    }

    try {
        const snapshot = await getDocs(collection(db, 'course')); // Get all courses from Firestore

        if (snapshot.empty) {
            return res.status(404).send("No courses found.");
        }

        // Filter courses based on the moduleId
        const courses = snapshot.docs
            .filter(doc => doc.data().moduleId === moduleId)  // Filter by moduleId
            .map(doc => ({
                id: doc.id,
                name: doc.data().courseName,   // Course Name
                description: doc.data().description,  // Assuming you have a description field
            }));

        if (courses.length === 0) {
            return res.status(404).send("No courses found for this module.");
        }

        console.log(courses);  // Debugging line
        res.status(200).json(courses); // Send filtered courses

    } catch (error) {
        console.error("Error fetching courses: ", error);
        res.status(500).send("Internal server error");
    }
});

app.get('/api/get-modules', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'Module'));  // Firestore collection reference

        if (snapshot.empty) {
            return res.status(404).send("No modules found.");
        }

        const modules = snapshot.docs.map(doc => ({
            id: doc.id,           // Document ID
            name: doc.data().Name // Module Name
        }));

        console.log(modules);
        res.status(200).json(modules); // Send the list of modules
    } catch (error) {
        console.error("Error fetching modules: ", error);
        res.status(500).send("Internal server error");
    }
});
app.get('/api/references', async (req, res) => {
    try {
        const { CourseId } = req.query; // Changed courseId to CourseId

        // Check if CourseId is provided
        if (!CourseId) {
            return res.status(400).send("Course ID is required");
        }

        // Reference to the 'references' collection
        const referencesCollection = collection(db, 'references');

        // Query the collection to find documents with the matching CourseId
        const snapshot = await getDocs(referencesCollection);

        if (snapshot.empty) {
            return res.status(404).send("No references found for the provided CourseId");
        }

        // Filter references by CourseId (no need to parse to integer since CourseId is a string)
        const referencesData = snapshot.docs
            .filter(doc => doc.data().CourseId === CourseId) // Changed courseId to CourseId
            .map(doc => ({
                id: doc.id,           // Document ID
                ...doc.data()         // Reference data
            }));

        if (referencesData.length === 0) {
            return res.status(404).send("No references found for the provided CourseId");
        }

        // Send the filtered references data as a JSON response
        res.status(200).json(referencesData);
    } catch (error) {
        console.error("Error fetching references: ", error);
        res.status(500).send("Internal server error");
    }
});





// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));