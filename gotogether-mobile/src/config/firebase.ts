import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY        || '',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN    || '',
  databaseURL:       process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL   || '',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID     || '',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID         || '',
};

// Prevent duplicate initialisation (important with Expo fast-refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const database = getDatabase(app);
export { app };
