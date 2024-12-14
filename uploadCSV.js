const firebaseAdmin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(require('./edu-hub-6d472-firebase-adminsdk-yynnr-561dae7d7b.json')),
    storageBucket: "edu-hub-6d472.appspot.com", // Replace with your Firebase project ID
});

// Firestore reference
const db = firebaseAdmin.firestore();
const bucket = firebaseAdmin.storage().bucket();

// Function to upload course data to Firestore
const uploadCourseToFirestore = async (course) => {
    const courseData = {
        courseId: course.courseId,
        courseName: course.courseName,
        moduleId: course.moduleId

    };

    // Upload the course data to Firestore
    await db.collection("course").doc(course.courseId.toString()).set(courseData);
    console.log(`Course ${course.courseName} uploaded successfully!`);
};

// Function to parse CSV file and upload data to Firestore
const parseCSVAndUploadData = async (filePath) => {
    const results = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log("CSV parsing complete", results);

            // Once CSV parsing is complete, upload data to Firestore
            for (const course of results) {
                await uploadCourseToFirestore(course);
            }
        });
};

// Call the function to parse CSV and upload data (pass path to your CSV file here)
const csvFilePath = './data/courses.csv'; // Update with your file path
parseCSVAndUploadData(csvFilePath);