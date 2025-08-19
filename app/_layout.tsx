import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // assume installed for data fetching
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="computers" />
            <Stack.Screen name="computer/[id]" />
            <Stack.Screen name="bookings" /> {/* for my bookings, but integrated in computers */}
            <Stack.Screen name="admin" />
            <Stack.Screen name="admin/computers" />
            <Stack.Screen name="admin/bookings" />
            <Stack.Screen name="admin/new-users" />
            <Stack.Screen name="admin/all-users" />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}