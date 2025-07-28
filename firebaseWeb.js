const firebaseConfig = {
  apiKey: "AIzaSyCLuJKDLQ4zPF6xIyAxizQjVA7op5jjwJM",
  authDomain: "booking-8b9a1.firebaseapp.com",
  databaseURL: "https://booking-8b9a1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "booking-8b9a1",
  storageBucket: "booking-8b9a1.firebasestorage.app",
  messagingSenderId: "1035878013136",
  appId: "1:1035878013136:web:5b7bd329dc23e34f61a6d5",
  measurementId: "G-GDHD5KWP8X"
};

let app;
let auth;

try {
  const { initializeApp, getApps, getApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  console.log('[FirebaseWeb] Initialized successfully');
} catch (error) {
  console.error('[FirebaseWeb] Initialization error:', error);
  throw error;
}

export { firebaseConfig, app, auth };