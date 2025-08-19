// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: async (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  }
};
