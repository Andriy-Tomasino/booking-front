import { View, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';
import api from '../utils/api';
import { auth } from '../firebase'; // ✅ импорт напрямую

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Проверка локального токена
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.log('[Home] Token found, redirecting to /computers');
          router.replace('/computers');
          return;
        }

        // 2. Подписка на Firebase state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const idToken = await user.getIdToken(true);
              const res = await api.post('/auth/login', { idToken });

              await AsyncStorage.setItem('token', res.data.jwtToken);
              await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

              console.log('[Home] Backend login successful');
              router.replace('/computers');
            } catch (err: any) {
              console.error('[Home] Auto-login failed:', err.response?.data || err.message);
              await AsyncStorage.clear();
              router.replace('/auth/login');
            }
          } else {
            console.log('[Home] No Firebase user, redirecting to /auth/login');
            router.replace('/auth/login');
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('[Home] Auth check error:', err);
        await AsyncStorage.clear();
        router.replace('/auth/login');
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
