import * as firebaseApp from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
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

const app = firebaseApp.initializeApp(firebaseConfig);
export const auth = firebaseAuth.getAuth(app);
export const db = getDatabase(app);