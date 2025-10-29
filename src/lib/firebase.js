import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

let initialized = false;

export function initFirebase() {
  if (initialized) return;
  const { FIREBASE_PROJECT_ID } = process.env;

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('[WARN] GOOGLE_APPLICATION_CREDENTIALS is not set. Set it to your serviceAccountKey.json path.');
  }

  if (!FIREBASE_PROJECT_ID) {
    console.warn('[WARN] FIREBASE_PROJECT_ID is not set.');
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
  });
  initialized = true;
}

export const db = () => admin.firestore();
export const bucket = () => getStorage().bucket();
export const auth = () => admin.auth();
