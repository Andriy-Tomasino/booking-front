// app/auth/login.tsx
import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button, HelperText } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import api from "../../utils/api";

export default function Login() {
  const [error, setError] = useState("");

  // 🔹 Мутация для логина на backend
  const loginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      console.log("[Login] Sending login request with idToken:", idToken);
      return api.post("/auth/login", { idToken });
    },
    onSuccess: async (res) => {
      console.log("[Login] Login successful:", res.data);

      // сохраняем токен и юзера
      await AsyncStorage.setItem("token", res.data.jwtToken);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      router.replace("/computers");
    },
    onError: (err: any) => {
      console.error("[Login] Login error:", err);
      setError(err.response?.data?.message || "Помилка входу");
    },
  });

  // 🔹 Google login (popup)
  const handleLoginPopup = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      const firebaseToken = await user.getIdToken(true);
      console.log("[Login] Firebase popup successful:", firebaseToken);

      loginMutation.mutate(firebaseToken);
    } catch (err) {
      console.error("[Login] Popup error:", err);
      setError("Помилка входу через Firebase");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Увійти в систему</Text>

      <Button mode="contained" onPress={handleLoginPopup} style={styles.button}>
        Увійти через Google
      </Button>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    marginBottom: 12,
  },
});
