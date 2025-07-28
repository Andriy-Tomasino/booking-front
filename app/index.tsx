import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Проверяем путь

export default function IndexScreen() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[IndexScreen] Starting render');
    if (!auth) {
      console.error('[IndexScreen] Auth is undefined');
      setError('Authentication module not initialized');
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('[IndexScreen] Rendering with user:', user, 'isLoading:', isLoading, 'error:', error);
      setUser(user);
      if (user) {
        router.replace('/computers');
      }
    }, (err) => {
      console.error('[IndexScreen] Auth state error:', err);
      setError(err.message);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('[IndexScreen] Handling Google Login');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      console.log('[IndexScreen] Firebase authenticated, idToken:', idToken);
      const response = await fetch('http://localhost:3000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      console.log('[IndexScreen] Backend response:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      setUser(result.user);
      router.replace('/computers');
    } catch (error) {
      console.error('[IndexScreen] Google Sign-In error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.prompt}>Please sign in to view computers</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});