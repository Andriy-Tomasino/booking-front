import { Stack } from 'expo-router';

export default function AuthLayout() {
  console.log('[AuthLayout] Rendering');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}