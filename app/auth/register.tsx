import { useState, useRef } from 'react';
import { View, Alert, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import {
    getAuth,
    signInWithPhoneNumber,
    PhoneAuthProvider,
    signInWithCredential,
    RecaptchaVerifier,
} from 'firebase/auth';
import app from '../../firebaseConfig';
import api from '../../utils/api';
import { useMutation } from '@tanstack/react-query';

const auth = getAuth(app);

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');
  const recaptchaVerifier = useRef(null);

  const registerMutation = useMutation({
    mutationFn: async ({ idToken, firstName, lastName, nickname }) =>
      api.post('/registrations', { idToken, firstName, lastName, nickname }),
    onSuccess: () => {
      Alert.alert('Успіх', 'Запит на реєстрацію надіслано. Чекайте схвалення адміністратора.');
      setConfirmation(null);
      setCode('');
    },
    onError: (err) => setError(err.response?.data?.message || 'Помилка реєстрації'),
  });

  const sendCode = async () => {
    try {
      setError('');
      if (!firstName || !lastName || !nickname || phone.length !== 9) {
        setError('Заповніть всі поля');
        return;
      }
      const fullPhone = '+380' + phone;

      let appVerifier;
      if (Platform.OS === 'web') {
        if (!recaptchaVerifier.current) {
          recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        }
        appVerifier = recaptchaVerifier.current;
      } else {
        appVerifier = recaptchaVerifier.current;
      }

      const conf = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmation(conf);
    } catch (e) {
      setError(e.message || 'Помилка надсилання коду');
      if (Platform.OS === 'web' && recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
    }
  };

  const verifyCode = async () => {
    try {
      setError('');
      if (!confirmation) {
        setError('Спочатку надішліть код');
        return;
      }
      const credential = PhoneAuthProvider.credential(confirmation.verificationId, code);
      const result = await signInWithCredential(auth, credential);
      const idToken = await result.user.getIdToken();
      registerMutation.mutate({ idToken, firstName, lastName, nickname });
    } catch (e) {
      setError('Неправильний код або помилка верифікації');
    } finally {
      if (Platform.OS === 'web' && recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && <div id="recaptcha-container" />}
      <TextInput label="Ім'я" value={firstName} onChangeText={setFirstName} disabled={!!confirmation} />
      <TextInput label="Прізвище" value={lastName} onChangeText={setLastName} disabled={!!confirmation} />
      <TextInput label="Нікнейм" value={nickname} onChangeText={setNickname} disabled={!!confirmation} />
      <TextInput
        label="Номер телефону (9 цифр)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="numeric"
        maxLength={9}
        disabled={!!confirmation}
      />
      {!confirmation ? (
        <Button mode="contained" onPress={sendCode} style={styles.button}>
          Надіслати код
        </Button>
      ) : (
        <>
          <TextInput label="Код підтвердження" value={code} onChangeText={setCode} keyboardType="numeric" />
          <Button mode="contained" onPress={verifyCode} style={styles.button} loading={registerMutation.isPending}>
            Регістрація
          </Button>
        </>
      )}
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  button: { marginTop: 10 },
});

