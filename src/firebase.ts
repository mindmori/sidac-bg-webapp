// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIVM_n_f61BGjc0DnLk3xq7nwNPffG8zs",
  authDomain: "sidac-bg-webapp.firebaseapp.com",
  databaseURL: "https://sidac-bg-webapp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sidac-bg-webapp",
  storageBucket: "sidac-bg-webapp.firebasestorage.app",
  messagingSenderId: "838936677354",
  appId: "1:838936677354:web:6bb735b442d5effd5d8093"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);