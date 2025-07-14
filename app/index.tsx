import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getAuth as getNativeAuth } from '@react-native-firebase/auth';
import { app } from '../firebaseConfig';

const API_URL = 'http://localhost:3000';

export default function IndexScreen() {
  console.log('[IndexScreen] Starting render');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [firebaseAuthAvailable, setFirebaseAuthAvailable] = useState(false);
  const router = useRouter();

  // Check Firebase auth availability
  useEffect(() => {
    console.log('[IndexScreen] Checking Firebase module availability');
    console.log('[IndexScreen] @react-native-firebase/auth available:', !!getNativeAuth);
    console.log('[IndexScreen] Firebase app initialized:', !!app);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (async () => {
        try {
          const { getAuth } = await import('firebase/auth');
          console.log('[IndexScreen] firebase/auth available:', !!getAuth);
          setFirebaseAuthAvailable(!!getAuth);
        } catch (err) {
          console.error('[IndexScreen] Error loading firebase/auth:', err);
          setError('Failed to load Firebase authentication');
        }
      })();
    } else {
      console.log('[IndexScreen] Skipping Firebase auth check for non-web or SSR');
    }
  }, []);

  console.log('[IndexScreen] Rendering with user:', user, 'isLoading:', isLoading, 'error:', error);

  useEffect(() => {
    console.log('[IndexScreen] Checking navigation, isLoading:', isLoading);
    if (!isLoading && user) {
      console.log('[IndexScreen] User authenticated, redirecting to /app/index');
      router.replace('/app/index');
    }
  }, [user, isLoading, router]);

  const handleGoogleLogin = async () => {
    console.log('[IndexScreen] Handling Google Login');
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      console.log('[IndexScreen] Cannot perform login during SSR');
      setError('Authentication not available during server rendering');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      let userCredential;
      if (Platform.OS === 'web') {
        if (!firebaseAuthAvailable) {
          throw new Error('Firebase authentication is not available');
        }
        if (!app) {
          throw new Error('Firebase app is not initialized');
        }
        const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        if (!getAuth) {
          throw new Error('firebase.auth is not available');
        }
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        userCredential = await signInWithPopup(auth, provider);
      } else {
        const auth = getNativeAuth(app);
        const provider = new getNativeAuth.GoogleAuthProvider();
        userCredential = await auth.signInWithPopup(provider); // Заглушка для нативных платформ
      }

      const idToken = await userCredential.user.getIdToken();
      console.log('[IndexScreen] Firebase authenticated, idToken:', idToken);

      // Send Firebase ID token to backend
      console.log('[IndexScreen] Sending idToken to backend:', API_URL);
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      console.log('[IndexScreen] Backend response:', data);

      if (response.ok && data.accessToken) {
        setUser({ email: data.email, id: data._id });
      } else {
        throw new Error(data.message || 'Invalid response from backend');
      }
    } catch (error: any) {
      console.error('[IndexScreen] Google Login Error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      console.log('[IndexScreen] Finished Google Login');
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, color: '#000', fontWeight: 'bold', marginBottom: 20 }}>
        Welcome
      </Text>
      {error && <Text style={{ fontSize: 16, color: 'red', marginBottom: 10 }}>{error}</Text>}
      <TouchableOpacity
        style={{
          backgroundColor: '#4285F4',
          padding: 10,
          borderRadius: 5,
          minWidth: 200,
          alignItems: 'center',
          opacity: isLoading || (Platform.OS === 'web' && !firebaseAuthAvailable) ? 0.6 : 1,
        }}
        onPress={() => {
          console.log('[IndexScreen] Button pressed');
          handleGoogleLogin();
        }}
        disabled={isLoading || (Platform.OS === 'web' && !firebaseAuthAvailable)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}