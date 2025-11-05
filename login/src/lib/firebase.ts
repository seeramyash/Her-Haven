// Import Firebase core and needed services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration (uses env var fallback to provided key)
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || "AIzaSyBU19Ivpod2W9sX8ytAAUnO9kgdf37dqeY",
  authDomain: "woman-saftey-2c3a2.firebaseapp.com",
  projectId: "woman-saftey-2c3a2",
  storageBucket: "woman-saftey-2c3a2.firebasestorage.app",
  messagingSenderId: "403453688765",
  appId: "1:403453688765:web:54b11a8fcaeabf42cd70d4",
  // measurementId omitted; analytics will init only if present
} as const;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Conditionally initialize Analytics to avoid runtime errors when measurementId is absent
let analytics: any;
try {
  if ((firebaseConfig as any).measurementId && typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (_) {
  // ignore analytics init errors in non-browser or missing config
}

// ✅ Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// (Optional) export analytics if you need it later
export { analytics };
