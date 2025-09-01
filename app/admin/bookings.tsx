import { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { Card, Menu, Provider as PaperProvider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { router } from 'expo-router';

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

  // Получаем все бронирования
  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    },
  });

  // Мутация для отмены бронирования
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/bookings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allBookings']);
      Alert.alert('Успіх', 'Бронювання скасовано');
    },
    onError: () => Alert.alert('Помилка', 'Не вдалося скасувати бронювання'),
  });

  const locations = [...new Set(bookings.map(b => b.computer?.location).filter(Boolean))];

  const filteredBookings =
    selectedLocation === 'all'
      ? bookings
      : bookings.filter(b => b.computer?.location === selectedLocation);

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
          <Text style={styles.pcName}>{item.computer?.name || 'ПК'}</Text>
          <Text style={styles.username}>User: {item.user?.username || item.username}</Text>
          <Text style={styles.location}>📍 {item.computer?.location || 'Невідома локація'}</Text>
          <Text style={styles.time}>{formatBookingTime(item.startTime, item.endTime)}</Text>
        </View>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => cancelMutation.mutate(item._id)}
        >
          <Text style={styles.cancelText}>Скасувати</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Всі бронювання</Text>

        {/* Фильтр по локации */}
        <Menu
          visible={locationMenuVisible}
          onDismiss={() => setLocationMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.locationBox}
              onPress={() => setLocationMenuVisible(true)}
            >
              <Text style={styles.locationBoxText}>
                {selectedLocation === 'all' ? 'Всі кімнати' : selectedLocation}
              </Text>
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          {locations.map((loc, idx) => (
            <View key={loc}>
              <Menu.Item
                title={loc}
                onPress={() => {
                  setSelectedLocation(loc);
                  setLocationMenuVisible(false);
                }}
                titleStyle={styles.menuItemText}
              />
              {idx < locations.length - 1 && <View style={styles.menuDivider} />}
            </View>
          ))}
        </Menu>

        {/* Список бронирований */}
        <FlatList
          data={filteredBookings}
          renderItem={renderBooking}
          keyExtractor={item => item._id}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Бронювання відсутні</Text>}
        />

        {/* Кнопка назад */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/admin')}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F1F3F6' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#130153', textAlign: 'center', marginBottom: 16, marginTop: '3%' },
  locationBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 12,
  },
  locationBoxText: { fontSize: 16, color: 'black' },
  menuContent: { backgroundColor: 'white' },
  menuItemText: { fontSize: 16, color: 'black' },
  menuDivider: { height: 0.5, backgroundColor: '#ccc', marginHorizontal: 12 },
  card: { marginBottom: 18, padding: 18, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pcName: { fontSize: 18, fontWeight: '600', color: '#130153', marginBottom: 6 },
  username: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 4 },
  location: { fontSize: 15, color: '#2F7EF5', marginBottom: 8 },
  time: { fontSize: 15, color: '#130153', fontWeight: '500' },
  cancelBtn: { backgroundColor: '#d9534f', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  cancelText: { color: 'white', fontWeight: '600', fontSize: 15 },
  backBtn: { marginTop: 12, alignSelf: 'center', backgroundColor: '#2F7EF5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backText: { color: 'white', fontSize: 17, fontWeight: '600' },
});
