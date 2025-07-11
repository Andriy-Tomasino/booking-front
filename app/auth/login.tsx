import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { AuthContext } from '../../src/contexts/AuthContext';
import { Link } from 'expo-router';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

console.log('LoginScreen loaded');

export default function LoginScreen() {
  const { signInWithGoogle, error, isLoading } = useContext(AuthContext);

  console.log('Rendering LoginScreen:', { isLoading, error });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.debug}>Loading Login...</Text>
        </>
      ) : (
        <>
          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signInWithGoogle}
          />
          <Button title="Sign in with Google (Fallback)" onPress={signInWithGoogle} color="#4285F4" />
        </>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <Link href="/(auth)/register" style={styles.link}>
        Go to Register
      </Link>
      <Text style={styles.debug}>Login Screen Rendered</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  googleButton: { width: 192, height: 48, marginBottom: 10 },
  error: { color: 'red', marginTop: 10, marginBottom: 10, textAlign: 'center' },
  link: { marginTop: 20, color: 'blue', textAlign: 'center' },
  debug: { marginTop: 20, color: 'gray', textAlign: 'center' },
});