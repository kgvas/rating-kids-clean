import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeWspvFMsdh-PAx2COIau3W9sTypuXI34",
  authDomain: "rating-kids-c2983.firebaseapp.com",
  projectId: "rating-kids-c2983",
  storageBucket: "rating-kids-c2983.firebasestorage.app",
  messagingSenderId: "156035607480",
  appId: "1:156035607480:web:2d2b4f85503b950c19bd4d",
  measurementId: "G-L4271P4VQB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
