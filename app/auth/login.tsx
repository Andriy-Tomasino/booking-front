import { useState } from "react";
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity, Dimensions, Image } from "react-native";
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
      const res = await api.post("/auth/login", dto);
      return res.data;
    },
    onSuccess: async (data) => {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.access_token);
      router.push("/computers");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Login failed");
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
    <ImageBackground
      source={require("../images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Логотип в верхнем левом углу */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../images/labLogo.png")}
            style={styles.logo}
          />
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>Intelligent Systems</Text>
            <Text style={styles.logoText}>Laboratory</Text>
          </View>
        </View>

        {/* Заголовок */}
        <Text style={styles.title}>Вхід до акаунту</Text>

        {/* Белый блок */}
        <View style={styles.card}>
          <Text style={styles.label}>Ім'я користувача</Text>
          <TextInput
            placeholder="Username"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>Увійти</Text>
          </Button>

          <TouchableOpacity onPress={() => router.push("/auth/register")}>
            <Text style={styles.register}>Зареєструватися</Text>
          </TouchableOpacity>

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </View>
      </View>
    </ImageBackground>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    left: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 4,
  },
  loginText: {
    color: "white",
    fontSize: 16,
  },
  register: {
    marginTop: 16,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});
