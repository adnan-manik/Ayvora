import * as firebaseApp from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = process.env.FIREBASE_CONFIG;

// Use type casting to bypass TS errors when module types don't match runtime exports
const app = (firebaseApp as any).getApps().length === 0 
  ? (firebaseApp as any).initializeApp(firebaseConfig) 
  : (firebaseApp as any).getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);