import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../src/contexts/AuthContext';
import { Link } from 'expo-router';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

console.log('RegisterScreen loaded');

export default function RegisterScreen() {
  const { signInWithGoogle, error, isLoading } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <GoogleSigninButton
          style={styles.googleButton}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signInWithGoogle}
        />
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <Link href="/(auth)/login" style={styles.link}>
        Go to Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  googleButton: { width: 192, height: 48 },
  error: { color: 'red', marginTop: 10, marginBottom: 10, textAlign: 'center' },
  link: { marginTop: 20, color: 'blue', textAlign: 'center' },
});