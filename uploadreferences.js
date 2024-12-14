const firebaseAdmin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(require('./edu-hub-6d472-firebase-adminsdk-yynnr-561dae7d7b.json')),
    storageBucket: "edu-hub-6d472.appspot.com",
});

// Firestore reference
const db = firebaseAdmin.firestore();

// Function to upload reference data to Firestore
const uploadReferenceToFirestore = async (reference) => {
    // Ensure all required fields are present
    if (!reference.Id || !reference.CourseId || !reference.Topic || !reference.URL) {
        console.log(`Skipping reference with missing data: ${JSON.stringify(reference)}`);
        return;
    }

    const referenceData = {
        Id: reference.Id,
        CourseId: reference.CourseId,
        Topic: reference.Topic,
        URL: reference.URL
    };

    // Upload the reference data to Firestore
    await db.collection("references").doc(reference.Id.toString()).set(referenceData);
    console.log(`Reference for topic ${reference.Topic} uploaded successfully!`);
};

// Function to parse CSV file and upload data to Firestore
const parseCSVAndUploadData = async (filePath) => {
    const results = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            // Log data for inspection
            console.log("Parsed row:", data);
            results.push(data);
        })
        .on('end', async () => {
            console.log("CSV parsing complete", results);

            // Once CSV parsing is complete, upload data to Firestore
            if (results.length === 0) {
                console.log("No data found in CSV!");
            } else {
                for (const reference of results) {
                    await uploadReferenceToFirestore(reference);
                }
            }
        })
        .on('error', (error) => {
            console.error("Error reading CSV:", error);
        });
};
// API to get all references
app.get('/api/references', async (req, res) => {
    try {
        const snapshot = await db.collection('references').get();
        const references = snapshot.docs.map(doc => doc.data());
        res.json(references);
    } catch (error) {
        console.error("Error getting documents:", error);
        res.status(500).send("Error getting data.");
    }
});

// API to add a new reference
app.post('/api/references', async (req, res) => {
    try {
        const { Id, CourseId, Topic, URL } = req.body;
        const newReference = {
            Id,
            CourseId,
            Topic,
            URL
        };
        await db.collection('references').doc(Id.toString()).set(newReference);
        res.status(201).send("Reference added successfully!");
    } catch (error) {
        console.error("Error adding document:", error);
        res.status(500).send("Error adding data.");
    }
});

// API to update a reference
app.put('/api/references/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Topic, URL } = req.body;
        const referenceRef = db.collection('references').doc(id);
        await referenceRef.update({
            Topic,
            URL
        });
        res.send("Reference updated successfully!");
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).send("Error updating data.");
    }
});

// API to delete a reference
app.delete('/api/references/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('references').doc(id).delete();
        res.send("Reference deleted successfully!");
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).send("Error deleting data.");
    }
});

// Call the function to parse CSV and upload data (pass path to your CSV file here)
const csvFilePath = './data/references.csv'; // Update with your actual file path
parseCSVAndUploadData(csvFilePath);