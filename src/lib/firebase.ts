import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqWUN3QyceYrvqHXdbLdAYzIcrg8efXO8",
  authDomain: "ielts-jakir.firebaseapp.com",
  projectId: "ielts-jakir",
  storageBucket: "ielts-jakir.firebasestorage.app",
  messagingSenderId: "412154848714",
  appId: "1:412154848714:web:3a8ada743d1c2b00675b33",
  measurementId: "G-C6MDJ0NBJZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
