// utils/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:3000', // твой бэкенд
});

// Интерцептор для добавления токена в каждый запрос
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок авторизации (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized! Clearing token.');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Здесь можно сделать редирект на /auth/login, если используешь expo-router
    }
    return Promise.reject(error);
  }
);

export default api;
