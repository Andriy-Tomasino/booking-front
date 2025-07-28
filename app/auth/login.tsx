import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[LoginScreen] Setting up auth state listener');
    if (!auth) {
      console.error('[LoginScreen] Auth is undefined');
      setError('Authentication module not initialized');
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        if (user) {
          console.log('[LoginScreen] User authenticated, redirecting to /computers');
          router.replace('/computers');
        }
      },
      (err) => {
        console.error('[LoginScreen] Auth state error:', err);
        setError(err.message);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError('Authentication module not initialized');
      console.error('[LoginScreen] Auth is not initialized');
      return;
    }
    try {
      setIsLoading(true);
      console.log('[LoginScreen] Handling Google Login');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      console.log('[LoginScreen] Firebase authenticated, idToken:', idToken);
      const response = await fetch('http://localhost:3000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      console.log('[LoginScreen] Backend response:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      router.replace('/computers');
    } catch (error) {
      console.error('[LoginScreen] Google Sign-In error:', error);
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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Please sign in to continue</Text>
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