import { Platform } from 'react-native';
import { initializeApp as initializeNativeApp, getApps as getNativeApps, getApp as getNativeApp } from '@react-native-firebase/app';

// Firebase configuration
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

// Initialize Firebase based on platform
let app;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  (async () => {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    await import('firebase/auth');
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  })();
} else {
  app = getNativeApps().length === 0 ? initializeNativeApp(firebaseConfig) : getNativeApp();
}

export { firebaseConfig, app };