import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDErZKWWfqgeSsxFLCknMzZpwFo9Q1F_Uc",
  authDomain: "safar-hackathon-58a69.firebaseapp.com",
  projectId: "safar-hackathon-58a69",
  storageBucket: "safar-hackathon-58a69.firebasestorage.app",
  messagingSenderId: "677310592780",
  appId: "1:677310592780:web:8a749a5293f6198441bb29"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);