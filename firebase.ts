import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// PLACEHOLDER CONFIG - REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForBuildPurpose",
  authDomain: "lp-f4-quiz.firebaseapp.com",
  databaseURL: "https://lp-f4-quiz-default-rtdb.firebaseio.com",
  projectId: "lp-f4-quiz",
  storageBucket: "lp-f4-quiz.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);