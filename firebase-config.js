// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmS0s4atP885XoLoMAA21ff_LmPaYqvcg",
  authDomain: "rating-kids.firebaseapp.com",
  projectId: "rating-kids",
  storageBucket: "rating-kids.firebasestorage.app",
  messagingSenderId: "1031565546493",
  appId: "1:1031565546493:web:6fb783c12c9f22653e7f94",
  measurementId: "G-FEK2JMG4LJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);