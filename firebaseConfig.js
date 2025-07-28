import { Platform } from 'react-native';

console.log('[FirebaseConfig] Platform.OS:', Platform.OS, 'typeof window:', typeof window);

let firebaseModule;

// Enhanced platform detection
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

if (isWeb) {
  console.log('[FirebaseConfig] Loading firebaseWeb for web environment');
  firebaseModule = require('./firebaseWeb');
} else {
  console.log('[FirebaseConfig] Loading firebaseNative for native environment');
  firebaseModule = require('./firebaseNative');
}

export const { firebaseConfig, app, auth } = firebaseModule;