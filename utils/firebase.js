// import { initializeApp } from "firebase/app";
// import firebase from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// const firebaseConfig = {
//     apiKey: "AIzaSyBgkxRf3jaQl8NzYEuFK2llTVzqMHrWREY",
//     authDomain: "smart-todo-ffb67.firebaseapp.com",
//     projectId: "smart-todo-ffb67",
//     storageBucket: "smart-todo-ffb67.appspot.com",
//     messagingSenderId: "996408600",
//     appId: "1:996408600:web:e3578d7c582cd9a3e9b26d",
//     measurementId: "G-BQHG9FB2C4",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = firebase.getAnalytics(app);

require("dotenv").config();
const admin = require("firebase-admin");
// const serviceAccount = require("../utils/serviceAccountKey.json");

const serviceAccounts = {
    type: process.env.FIREBASE_ACCOUNT_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URI,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URI,
    universe_domain: process.env.REBASE_UNIVERSE_DOMAIN,
};

const serviceAccountJSON = JSON.stringify(serviceAccounts);
const serviceAccount = JSON.parse(serviceAccountJSON);

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
