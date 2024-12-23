const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Resolve the path to the firebase_configuration.json file from the 'src' folder
const serviceAccountPath = path.join(__dirname, "../firebase_configuration.json");

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Initialize Firestore

module.exports = { admin, db };
