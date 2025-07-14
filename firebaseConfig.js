import { Platform } from 'react-native';
import { initializeApp as initializeNativeApp, getApps as getNativeApps, getApp as getNativeApp } from '@react-native-firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8nZ_CSHuVgIGg5QKg9Cv7IJodhRks5yk",
  authDomain: "booking-a7656.firebaseapp.com",
  databaseURL: "https://booking-a7656-default-rtdb.firebaseio.com",
  projectId: "booking-a7656",
  storageBucket: "booking-a7656.firebasestorage.app",
  messagingSenderId: "41093959173",
  appId: "1:41093959173:web:954f3089caa49fd922166c",
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