import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { MD3LightTheme, Card, Provider as PaperProvider } from 'react-native-paper';
import api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';

export default function MyBookings() {
  const { userId } = useLocalSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await api.get(`/bookings/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data || []);
      } catch {
        Alert.alert('Помилка', 'Не вдалося завантажити бронювання');
      }
    };
    if (userId) fetchBookings();
  }, [userId]);

  const cancelBooking = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev => prev.filter(b => b._id !== id));
      Alert.alert('Успіх', 'Бронювання скасовано');
    } catch {
      Alert.alert('Помилка', 'Не вдалося видалити бронювання');
    }
  };

  const formatBookingTime = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const monthsUk = [
      'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
      'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
    ];
    const formatH = (d: Date) => `${d.getHours()}:00`;
    return `${formatH(s)} - ${formatH(e)}  ${s.getDate()} ${monthsUk[s.getMonth()]}`;
  };

  const renderBooking = ({ item }: any) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pcName}>{item.computerName}</Text>
          <Text style={styles.location}>📍 {item.locationName || 'Невідома локація'}</Text>
          <Text style={styles.time}>
            {formatBookingTime(item.startTime, item.endTime)}
          </Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelBooking(item._id)}>
          <Text style={styles.cancelText}>Скасувати</Text>
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
        <Text style={styles.title}>Мої бронювання</Text>
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={item => item._id.toString()}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>У вас немає бронювань</Text>}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F1F3F6' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#130153', marginTop: 10 },
  card: { marginBottom: 18, padding: 18, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pcName: { fontSize: 18, fontWeight: '600', color: '#130153', marginBottom: 6 },
  location: { fontSize: 15, color: '#555', marginBottom: 8 },
  time: { fontSize: 15, color: 'black', fontWeight: '500' },
  cancelBtn: { backgroundColor: '#d9534f', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  cancelText: { color: 'white', fontWeight: '600', fontSize: 15 },
  backBtn: { marginTop: 12, alignSelf: 'center' },
  backText: { color: '#2F7EF5', fontSize: 23, fontWeight: '600', marginBottom: 8 },
});
