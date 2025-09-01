// app/admin/all-users.tsx
import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { MD3LightTheme, Card, Provider as PaperProvider } from 'react-native-paper';
import api from '../../utils/api';
import { router } from 'expo-router';

export default function AllUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/all');
      setUsers(res.data || []);
    } catch {
      Alert.alert('Помилка', 'Не вдалося завантажити користувачів');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (uid: string) => {
    try {
      await api.delete(`/users/${uid}`);
      setUsers(prev => prev.filter(u => u.uid !== uid));
      Alert.alert('Успіх', 'Користувача видалено');
    } catch {
      Alert.alert('Помилка', 'Не вдалося видалити користувача');
    }
  };

  const renderUser = ({ item }: any) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.firstName || 'N/A'} {item.lastName || 'N/A'}</Text>
          <Text style={styles.userInfo}>Нік: {item.nickname || 'N/A'}</Text>
          <Text style={styles.userInfo}>Телефон: {item.phoneNumber || 'N/A'}</Text>
          <Text style={styles.userInfo}>Роль: {item.role || 'N/A'}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteUser(item.uid)}>
          <Text style={styles.deleteText}>Видалити</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <PaperProvider
      theme={{
        ...MD3LightTheme,
        colors: { ...MD3LightTheme.colors, surface: 'white', onSurface: 'black' },
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Користувачі</Text>
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item.uid}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 30 }}>Немає користувачів</Text>
          }
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/admin')}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F1F3F6' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#130153', marginTop: '3%' },
  card: { marginBottom: 18, padding: 18, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 18, fontWeight: '600', color: '#130153', marginBottom: 6 },
  userInfo: { fontSize: 15, color: '#555', marginBottom: 4 },
  deleteBtn: { backgroundColor: '#d9534f', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  deleteText: { color: 'white', fontWeight: '600', fontSize: 15 },
  backBtn: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#2F7EF5', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  backText: { color: 'white', fontSize: 18, fontWeight: '600' },
});
