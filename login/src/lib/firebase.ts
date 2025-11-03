// Import Firebase core and needed services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: "authentication-bfc77.firebaseapp.com",
  projectId: "authentication-bfc77",
  storageBucket: "authentication-bfc77.firebasestorage.app",
  messagingSenderId: "482381345437",
  appId: "1:482381345437:web:38cfa498f45f270fa21a74",
  measurementId: "G-MQWW6GZVJK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// (Optional) export analytics if you need it later
export { analytics };
