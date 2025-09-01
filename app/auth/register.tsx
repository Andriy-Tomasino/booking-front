import { useState } from "react";
import { View, StyleSheet, Text, ImageBackground, Dimensions, Image } from "react-native";
import { Button, HelperText, TextInput, Checkbox, IconButton } from "react-native-paper";
import { MaskedTextInput } from "react-native-mask-text";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import api from "../../utils/api";

// Очистка телефона и форматирование
function cleanPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('380')) digits = digits.slice(3);
  if (digits.startsWith('80')) digits = digits.slice(2);
  if (digits.length === 9) digits = '0' + digits;

  if (digits.length !== 10) {
    throw new Error('Номер телефона повинен містити 9 цифр після очистки (наприклад, 0991234567)');
  }

  return digits;
}

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async ({ firstName, lastName, nickname, phoneNumber, password }: any) => {
      return api.post('/registrations', { firstName, lastName, nickname, phoneNumber, password });
    },
    onSuccess: () => {
      alert('Успіх', 'Запит на реєстрацію надіслано. Чекайте схвалення адміністратора.');
      router.push('/auth/login');
    },
    onError: (err: any) => {
      console.log('[Register] Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Помилка реєстрації');
    },
  });

  const handleRegister = () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !nickname.trim() || !phone.trim() || !password.trim()) {
      setError('Заповніть всі поля');
      return;
    }
    if (!consent) {
      setError('Необхідно дати згоду на обробку даних');
      return;
    }

    let cleanedPhone: string;
    try {
      cleanedPhone = cleanPhone(phone);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    const phoneNumber = '+380' + cleanedPhone.slice(1); // Убираем 0, добавляем +380
    console.log('[Register] Sending payload:', { firstName, lastName, nickname, phoneNumber, password });

    registerMutation.mutate({ firstName, lastName, nickname, phoneNumber, password });
  };

  return (
    <ImageBackground
      source={require("../images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Логотип */}
        <View style={styles.logoContainer}>
          <Image source={require("../images/labLogo.png")} style={styles.logo} />
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>Intelligent Systems</Text>
            <Text style={styles.logoText}>Laboratory</Text>
          </View>
        </View>

        {/* Заголовок со стрелкой */}
        <View style={styles.titleContainer}>
          <IconButton
            icon="arrow-left"
            size={36}           // ← нормальная большая стрелка
            iconColor="white"
            onPress={() => router.push("/auth/login")}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.title}>Створення акаунту</Text>
        </View>

        {/* Карточка регистрации */}
        <View style={styles.card}>
          <Text style={styles.label}>Ім'я</Text>
          <TextInput
            placeholder="Ім'я"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.label}>Прізвище</Text>
          <TextInput
            placeholder="Прізвище"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.label}>Нікнейм</Text>
          <TextInput
            placeholder="Нікнейм"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.label}>Номер телефону</Text>
          <TextInput
            placeholder="+380 (99) 999-99-99"
            render={(props) => (
              <MaskedTextInput
                {...props}
                mask="+380 (99) 999-99-99"
                onChangeText={(text, rawText) => setPhone(rawText)}
                keyboardType="numeric"
              />
            )}
            value={phone}
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

          <View style={styles.consentContainer}>
            <Checkbox
              status={consent ? 'checked' : 'unchecked'}
              onPress={() => setConsent(!consent)}
            />
            <Text style={styles.consentText}>Даю згоду на обробку даних</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            loading={registerMutation.isLoading}
          >
            <Text style={styles.registerText}>Створити акаунт</Text>
          </Button>

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
    paddingTop: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginRight: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 20,
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
    height: 45,
    marginBottom: 15,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  consentText: {
    fontSize: 14,
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 15,
  },
  registerText: {
    color: "white",
    fontSize: 16,
  },
});
