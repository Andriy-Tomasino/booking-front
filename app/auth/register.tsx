import { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MaskedTextInput } from 'react-native-mask-text';
import api from '../../utils/api';

// Очистка телефона и форматирование
function cleanPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('380')) digits = digits.slice(3);
  if (digits.startsWith('80')) digits = digits.slice(2);
  if (digits.length === 9) digits = '0' + digits;

  if (digits.length !== 10) {
    throw new Error('Номер телефона должен содержать 9 цифр после очистки (например, 0991234567)');
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

  const registerMutation = useMutation({
    mutationFn: async ({ firstName, lastName, nickname, phoneNumber, password }: any) => {
      return api.post('/registrations', { firstName, lastName, nickname, phoneNumber, password });
    },
    onSuccess: () => {
      Alert.alert('Успіх', 'Запит на реєстрацію надіслано. Чекайте схвалення адміністратора.');
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

    let cleanedPhone: string;
    try {
      cleanedPhone = cleanPhone(phone);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    const phoneNumber = '+380' + cleanedPhone.slice(1); // Убираем ведущий 0, добавляем +380

    console.log('[Register] Sending payload:', { firstName, lastName, nickname, phoneNumber, password });

    registerMutation.mutate({ firstName, lastName, nickname, phoneNumber, password });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button mode="outlined" onPress={() => router.push('/auth/login')}>
          Login
        </Button>
      </View>

      <TextInput label="Ім'я" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput label="Прізвище" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput label="Нікнейм" value={nickname} onChangeText={setNickname} style={styles.input} />

      <TextInput
        label="Номер телефону"
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
      />

      <TextInput
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        style={styles.button}
        loading={registerMutation.isLoading}
      >
        Регістрація
      </Button>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  input: { marginBottom: 12 },
  button: { marginTop: 10 },
});
