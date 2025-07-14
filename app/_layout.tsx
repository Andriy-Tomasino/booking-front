import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export default function RootLayout() {
  console.log('[RootLayout] Entering RootLayout render');

  useEffect(() => {
    console.log('[RootLayout] Preparing splash screen');
    const prepare = async () => {
      try {
        console.log('[RootLayout] Loading resources');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('[RootLayout] Hiding splash screen');
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('[RootLayout] Error during preparation:', e);
      }
    };
    prepare();
  }, []);

  console.log('[RootLayout] Rendering stack navigator');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="app/index" />
      <Stack.Screen name="app/bookings" />
      <Stack.Screen name="app/computers" />
    </Stack>
  );
}