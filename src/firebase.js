// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtZpneKqVxemRkW6aS_uASv_V0KMDIUcQ",
  authDomain: "nimblearn-ai.firebaseapp.com",
  projectId: "nimblearn-ai",
  storageBucket: "nimblearn-ai.appspot.com",
  messagingSenderId: "267998797651",
  appId: "1:267998797651:web:9d5891e5694f811daccba6",
  measurementId: "G-YN92Q88F8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app);
export {auth, app, db}