import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, AuthContext } from '../src/contexts/AuthContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

console.log('RootLayout loading');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { token, isLoading, error } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('Preparing splash screen');
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Splash screen error:', e);
      } finally {
        console.log('Hiding splash screen');
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    if (isLoading) {
      console.log('Auth is loading, skipping navigation');
      return;
    }
    console.log('Checking auth state:', { token, segments, error });
    const inAuthGroup = segments[0] === 'auth';
    if (!token && !inAuthGroup) {
      console.log('Redirecting to login');
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      console.log('Redirecting to computers');
      router.replace('/app/computers');
    }
  }, [token, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
        {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="app" />
    </Stack>
  );
}