const admin = require('firebase-admin');
const serviceAccount = require('./bank-c2835-firebase-adminsdk-rrtnf-e47b879c20.json'); // Update the path

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bank-c2835-default-rtdb.firebaseio.com/', // Replace with your database URL
});

// Export Firebase Admin SDK instance
module.exports = admin;
