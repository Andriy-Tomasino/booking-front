import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { initializeApp } from '@react-native-firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from '@react-native-firebase/auth';
import firebaseConfig  from '../../firebaseConfig.js';

const API_URL = 'http://localhost:3000';

export default function IndexScreen() {
  console.log('[IndexScreen] Starting render');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const router = useRouter();

  // Initialize Firebase
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('[IndexScreen] Initializing Firebase');
      try {
        initializeApp(firebaseConfig);
        console.log('[IndexScreen] Firebase initialized');
      } catch (error) {
        console.error('[IndexScreen] Firebase init error:', error);
        setError('Failed to initialize Firebase');
      }
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
    try {
      setError(null);
      setIsLoading(true);

      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
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
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={() => {
          console.log('[IndexScreen] Button pressed');
          handleGoogleLogin();
        }}
        disabled={isLoading}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}