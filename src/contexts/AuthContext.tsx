import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_URL } from '../constants/config';

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  user: { email: string; id: string } | null;
  setUser: (user: { email: string; id: string } | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  error: null,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Configuring GoogleSignin');
    try {
      GoogleSignin.configure({
        webClientId: '544285951373-c39rqvk4ksomf0he6ngvi27c34ri3bjr.apps.googleusercontent.com',
        offlineAccess: true,
      });
    } catch (e) {
      console.error('GoogleSignin configure error:', e);
      setError('Failed to configure Google Sign-In');
    }

    const loadAuthData = async () => {
      console.log('Starting loadAuthData');
      try {
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Retrieved token:', storedToken);
        const storedUser = await AsyncStorage.getItem('user');
        console.log('Retrieved user:', storedUser);
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error loading auth data:', e);
        setError('Failed to load auth data');
      } finally {
        console.log('Finished loadAuthData, setting isLoading to false');
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    console.log('Saving auth data:', { token, user });
    const saveAuthData = async () => {
      try {
        if (token) {
          await AsyncStorage.setItem('token', token);
        } else {
          await AsyncStorage.removeItem('token');
        }
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Error saving auth data:', e);
        setError('Failed to save auth data');
      }
    };
    saveAuthData();
  }, [token, user]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Checking Play Services');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Initiating Google Sign-In');
      const userInfo = await GoogleSignin.signIn();
      const { idToken, user } = userInfo;
      console.log('Google Sign-In successful, idToken:', !!idToken);
      if (idToken) {
        console.log('Sending Google idToken to backend');
        const response = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const data = await response.json();
        console.log('Backend response:', data);
        if (data.token && data.user) {
          setToken(data.token);
          setUser({ email: user.email, id: user.id });
        } else {
          throw new Error('Invalid response from backend');
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      console.log('Finished signInWithGoogle, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('Initiating sign out');
      await GoogleSignin.signOut();
      setToken(null);
      setUser(null);
      setError(null);
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      setError(error.message || 'Failed to sign out');
    } finally {
      console.log('Finished signOut, setting isLoading to false');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, signInWithGoogle, signOut, error, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};