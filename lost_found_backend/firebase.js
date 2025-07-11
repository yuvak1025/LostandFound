const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace \n with actual new line
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket : process.env.FIREBASE_STORAGE_BUCKET
});


const bucket = admin.storage().bucket();


const verifyFirebaseConnection = async () => {
    try {
        const app = admin.app();
        console.log(`Firebase connected: ${app.name}`);
    } catch (error) {
        console.error('Firebase connection error:', error);
    }
};

module.exports = { admin, verifyFirebaseConnection ,bucket };
