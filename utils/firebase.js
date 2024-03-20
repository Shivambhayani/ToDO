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
const serviceAccount = require("../utils/serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
