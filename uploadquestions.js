const admin = require('firebase-admin');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('./edu-hub-6d472-firebase-adminsdk-yynnr-561dae7d7b.json')),
    storageBucket: "edu-hub-6d472.appspot.com", // Replace with your Firebase project ID
});

const db = admin.firestore();

// Function to parse CSV and upload to Firestore
// Function to parse CSV and upload to Firestore
const uploadQuestions = (csvFilePath) => {
    const questionsData = [];

    // Read and parse the CSV file
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            const documentId = row.ID; // Extract document ID
            const courseId = row.courseId; // Extract courseId
            const questions = JSON.parse(row.questions); // Convert JSON string into an array of questions

            // Prepare data to upload
            questionsData.push({ documentId, courseId, questions });
        })
        .on('end', async () => {
            console.log('CSV file successfully processed');

            // Upload data to Firebase Firestore
            for (const data of questionsData) {
                try {
                    const docRef = db.collection('Questions').doc(data.documentId); // Use the document ID as the document reference
                    await docRef.set({ courseId: data.courseId, questions: data.questions });
                    console.log(`Questions for Course ${data.courseId} uploaded successfully under document ${data.documentId}.`);
                } catch (error) {
                    console.error(`Error uploading questions for Course ${data.courseId} under document ${data.documentId}: `, error);
                }
            }
        });
};
// Call the function with the path to the CSV file
const csvFilePath = './data/question.csv'; // Update with your file path
uploadQuestions(csvFilePath);