// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLuJKDLQ4zPF6xIyAxizQjVA7op5jjwJM",
  authDomain: "booking-8b9a1.firebaseapp.com",
  databaseURL: "https://booking-8b9a1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "booking-8b9a1",
  storageBucket: "booking-8b9a1.appspot.com",
  messagingSenderId: "1035878013136",
  appId: "1:1035878013136:web:5b7bd329dc23e34f61a6d5",
  measurementId: "G-GDHD5KWP8X",
};

// Инициализация
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
