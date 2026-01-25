import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  Auth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Firebase configuration
// Replace these values with your Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase App (singleton pattern)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Auth
// For React Native, we use a custom persistence layer with AsyncStorage
// For web, we use the default browser persistence
const getFirebaseAuth = (): Auth => {
  // Check if already initialized
  try {
    return getAuth(app);
  } catch {
    // Not initialized yet, initialize with appropriate persistence
    if (Platform.OS === "web") {
      return initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
      });
    }
    // For native platforms, use default auth (handles persistence internally)
    return initializeAuth(app);
  }
};

// Try to get existing auth instance or initialize new one
let auth: Auth;
try {
  auth = getAuth(app);
} catch {
  auth = getFirebaseAuth();
}

export { auth };
export default app;
