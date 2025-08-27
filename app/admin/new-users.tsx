'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../../utils/api';

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

  // Получаем список ожидающих пользователей
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async (): Promise<PendingUser[]> => {
      const res = await api.get('/registrations');
      return res.data;
    },
  });

  // Мутация для одобрения пользователя
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

  // Мутация для отклонения пользователя
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
      <View style={styles.container}>
        <Text>Завантаження...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Немає нових користувачів</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {users.map((user) => (
        <View key={user._id} style={styles.card}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName} ({user.nickname})
          </Text>
          <Text>Телефон: {user.phoneNumber}</Text>
          <Text>Дата: {new Date(user.createdAt).toLocaleString()}</Text>
          <View style={styles.buttons}>
            <Button
              title="Одобрити"
              onPress={() => approveMutation.mutate(user._id)}
              color="#4CAF50"
            />
            <Button
              title="Відхилити"
              onPress={() => rejectMutation.mutate(user._id)}
              color="#F44336"
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
