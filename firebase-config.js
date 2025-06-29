// Инициализация SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmS0s4atP885XoLoMAA21ff_LmPaYqvcg",
  authDomain: "rating-kids.firebaseapp.com",
  projectId: "rating-kids",
  storageBucket: "rating-kids.appspot.com", // Исправлено: ".app" → ".com"
  messagingSenderId: "1031565546493",
  appId: "1:1031565546493:web:6fb783c12c9f22653e7f94",
  measurementId: "G-FEK2JMG4LJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
