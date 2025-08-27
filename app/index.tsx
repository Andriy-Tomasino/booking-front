// app/index.tsx
import { View, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.log('[Home] Token found, redirecting to /computers');
          router.replace('/computers');
        } else {
          console.log('[Home] No token, redirecting to /auth/login');
          router.replace('/auth/login');
        }
      } catch (err) {
        console.error('[Home] Auth check error:', err);
        await AsyncStorage.clear();
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ textAlign: 'center' }}>Вітаємо! Будь ласка, увійдіть.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});