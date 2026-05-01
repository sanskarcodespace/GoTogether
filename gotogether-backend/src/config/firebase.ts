import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.warn('Firebase initialization failed (check private key/env vars).');
  }
} else {
  console.warn('Firebase config missing. Firebase features will not work.');
}

export const db = admin.apps.length ? admin.database() : ({} as any);
export const fcm = admin.apps.length ? admin.messaging() : ({} as any);
export const auth = admin.apps.length ? admin.auth() : ({} as any);

export default admin;
