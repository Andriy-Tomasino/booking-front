import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    console.log('[RootLayout] Entering RootLayout render');
    LogBox.ignoreLogs(['Require cycle']);
    console.log('[RootLayout] Rendering stack navigator');
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home', headerShown: true }} />
      <Stack.Screen name="auth/login" options={{ title: 'Login', headerShown: true }} />
      <Stack.Screen name="auth/register" options={{ title: 'Register', headerShown: true }} />
      <Stack.Screen name="computers" options={{ title: 'Computers', headerShown: true }} />
      <Stack.Screen name="bookings" options={{ title: 'Bookings', headerShown: true }} />
      <Stack.Screen name="computer/[id]" options={{ title: 'Computer Details', headerShown: true }} />
    </Stack>
  );
}