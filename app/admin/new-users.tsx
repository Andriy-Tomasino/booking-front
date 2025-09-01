'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { MD3LightTheme, Card, Provider as PaperProvider } from 'react-native-paper';
import api from '../../utils/api';
import { router } from 'expo-router';

type PendingUser = {
  _id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  createdAt: string;
};

export default function NewUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async (): Promise<PendingUser[]> => {
      const res = await api.get('/registrations');
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/registrations/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      Alert.alert('Успіх', 'Користувача схвалено');
    },
    onError: (err: any) => {
      Alert.alert('Помилка', err.response?.data?.message || 'Помилка при схваленні');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/registrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      Alert.alert('Успіх', 'Користувача відхилено');
    },
    onError: (err: any) => {
      Alert.alert('Помилка', err.response?.data?.message || 'Помилка при відхиленні');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const monthsUk = [
      'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
      'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
    ];
    return `${d.getDate()} ${monthsUk[d.getMonth()]} ${d.getFullYear()}, ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  return (
    <PaperProvider theme={{ ...MD3LightTheme, colors: { ...MD3LightTheme.colors, surface: 'white', onSurface: 'black' } }}>
      <View style={styles.container}>
        <Text style={styles.title}>Нові користувачі</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {users.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Немає нових користувачів</Text>
          ) : (
            users.map(user => (
              <Card style={styles.card} key={user._id}>
                <View style={styles.cardContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{user.firstName} {user.lastName} ({user.nickname})</Text>
                    <Text style={styles.info}>Телефон: {user.phoneNumber}</Text>
                    <Text style={styles.info}>Дата реєстрації: {formatDate(user.createdAt)}</Text>
                  </View>
                  <View style={styles.buttons}>
                    <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => approveMutation.mutate(user._id)}>
                      <Text style={styles.btnText}>Схвалити</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => rejectMutation.mutate(user._id)}>
                      <Text style={styles.btnText}>Відхилити</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/admin')}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F3F6', paddingHorizontal: 16, paddingTop: 12 },
  scrollContent: { paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: '3%', marginBottom: '8%', color: '#130153' },
  card: { width: '100%', padding: 16, borderRadius: 16, marginBottom: 18, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc' },
  cardContent: { flexDirection: 'column', gap: 12 },
  name: { fontSize: 18, fontWeight: '600', color: '#130153', marginBottom: 4 },
  info: { fontSize: 15, color: '#555' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  approve: { backgroundColor: '#4CAF50' },
  reject: { backgroundColor: '#F44336' },
  btnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  backBtn: { position: 'absolute', bottom: 20, alignSelf: 'center' },
  backText: { color: '#2F7EF5', fontSize: 23, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
