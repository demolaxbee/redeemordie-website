import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyBU2dWUR3yZxRzvUXMvAcLgNCebb_rt30o",
    authDomain: "redeemordie-4651e.firebaseapp.com",
    projectId: "redeemordie-4651e",
    storageBucket: "redeemordie-4651e.firebasestorage.app",
    messagingSenderId: "430885883268",
    appId: "1:430885883268:web:94417402f477f1e43e21d1",
    measurementId: "G-E9WXYDVZQV"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 