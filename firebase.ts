import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDKFpwQU9W4Njvtmtz6N_Jc2kZjdY_CIEc",
  authDomain: "connectsphare-a27d6.firebaseapp.com",
  databaseURL: "https://connectsphare-a27d6-default-rtdb.firebaseio.com",
  projectId: "connectsphare-a27d6",
  storageBucket: "connectsphare-a27d6.firebasestorage.app",
  messagingSenderId: "277886142393",
  appId: "1:277886142393:web:44fedcbec4e9cc5363d868"
};

// Initialize Firebase using compat API
const app = firebase.initializeApp(firebaseConfig);

// Export Auth instance (Compat/v8 style)
export const auth = firebase.auth();

// Export Database instance (Modular/v9 style)
// We cast app to any because compat app type might not perfectly align with v9 FirebaseApp expected by getDatabase
export const db = getDatabase(app as any);