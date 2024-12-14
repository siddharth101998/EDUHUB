const admin = require('firebase-admin');
const fs = require("fs");
const csv = require("csv-parser");

admin.initializeApp({
    credential: admin.credential.cert(require('./edu-hub-6d472-firebase-adminsdk-yynnr-561dae7d7b.json')),
    databaseURL: "https://edu-hub-6d472.firebaseio.com",  // Replace with your actual Firebase Database URL

});

module.exports = admin;
// Initialize Firebase Admin SDK using the service account
