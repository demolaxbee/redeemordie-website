import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if we're in development or if Firebase is properly configured
const isFirebaseConfigured = !!(
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN &&
  process.env.REACT_APP_FIREBASE_PROJECT_ID &&
  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET &&
  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.REACT_APP_FIREBASE_APP_ID
);

if (!isFirebaseConfigured) {
  console.error('Firebase configuration missing. Please set all required environment variables:');
  console.error('- REACT_APP_FIREBASE_API_KEY');
  console.error('- REACT_APP_FIREBASE_AUTH_DOMAIN');
  console.error('- REACT_APP_FIREBASE_PROJECT_ID');
  console.error('- REACT_APP_FIREBASE_STORAGE_BUCKET');
  console.error('- REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
  console.error('- REACT_APP_FIREBASE_APP_ID');
  console.error('- REACT_APP_FIREBASE_MEASUREMENT_ID (optional)');
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

// Only initialize Firebase if properly configured
let app: any = null;
let analytics: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    if (process.env.REACT_APP_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app);
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not initialized due to missing configuration');
}

export { analytics, auth, db, storage }; 