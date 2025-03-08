import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDq8B1oxJDWx78mnhzaqusN_fyrwi27vi8",
  authDomain: "ayam-6f36d.firebaseapp.com",
  databaseURL: "https://ayam-6f36d-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "ayam-6f36d",
  storageBucket: "ayam-6f36d.firebasestorage.app",
  messagingSenderId: "319715347043",
  appId: "1:319715347043:web:4fb8080de318b31f860656",
  measurementId: "G-J1Y7FWTB38"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

