import { View, Text, Button, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { initializeApp } from '@react-native-firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from '@react-native-firebase/auth';
import { firebaseConfig } from '../../firebaseConfig';

const API_URL = 'http://localhost:3000';

export default function LoginScreen() {
  console.log('[LoginScreen] Starting render');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const router = useRouter();

  // Initialize Firebase
  useEffect(() => {
    console.log('[LoginScreen] Checking Firebase module availability');
    console.log('[LoginScreen] @react-native-firebase/app available:', !!initializeApp);
    console.log('[LoginScreen] @react-native-firebase/auth available:', !!getAuth);
    if (Platform.OS === 'web') {
      console.log('[LoginScreen] Initializing Firebase');
      try {
        initializeApp(firebaseConfig);
        console.log('[LoginScreen] Firebase initialized');
      } catch (error) {
        console.error('[LoginScreen] Firebase init error:', error);
        setError('Failed to initialize Firebase');
      }
    }
  }, []);

  console.log('[LoginScreen] Rendering with user:', user, 'isLoading:', isLoading, 'error:', error);

  useEffect(() => {
    console.log('[LoginScreen] Checking navigation, isLoading:', isLoading);
    if (!isLoading && user) {
      console.log('[LoginScreen] User authenticated, redirecting to /app/index');
      router.replace('/app/index');
    }
  }, [user, isLoading, router]);

  const signInWithGoogle = async () => {
    console.log('[LoginScreen] Handling Google Login');
    try {
      setError(null);
      setIsLoading(true);

      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      console.log('[LoginScreen] Firebase authenticated, idToken:', idToken);

      // Send Firebase ID token to backend
      console.log('[LoginScreen] Sending idToken to backend:', API_URL);
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      console.log('[LoginScreen] Backend response:', data);

      if (response.ok && data.accessToken) {
        setUser({ email: data.email, id: data._id });
      } else {
        throw new Error(data.message || 'Invalid response from backend');
      }
    } catch (error: any) {
      console.error('[LoginScreen] Google Login Error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      console.log('[LoginScreen] Finished Google Login');
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 24, color: '#000', fontWeight: 'bold', marginBottom: 20 }}>
        Login Screen
      </Text>
      {error && <Text style={{ fontSize: 16, color: 'red', marginBottom: 10 }}>{error}</Text>}
      <Button
        title={isLoading ? 'Signing in...' : 'Sign in with Google'}
        onPress={signInWithGoogle}
        disabled={isLoading}
      />
    </View>
  );
}