// app/auth/login.tsx
import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import api from "../../utils/api";

export default function Login() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (dto: { nickname: string; password: string }) => {
      const res = await api.post('/auth/login', dto);
      return res.data;
    },
    onSuccess: async (data) => {
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.access_token);
      router.push('/computers');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Login failed');
    },
  });

  const handleLogin = () => {
    setError("");
    if (!nickname || !password) {
      setError("Заповніть всі поля");
      return;
    }
    loginMutation.mutate({ nickname, password });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button mode="outlined" onPress={() => router.push('/auth/register')}>
          Registration
        </Button>
      </View>
      <Text style={styles.title}>Увійти в систему</Text>

      <TextInput
        label="Нікнейм"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />
      <TextInput
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Увійти
      </Button>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginBottom: 12,
  },
});