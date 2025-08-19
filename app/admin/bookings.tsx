import { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { List, Button, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState('all');

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: async () => api.get('/bookings/all').then(res => res.data),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => api.delete(`/bookings/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['allBookings']),
  });

  // список уникальных локаций (вытягиваем из бронирований)
  const locations = ['all', ...new Set(bookings.map(b => b.computer?.location).filter(Boolean))];

  // фильтрация по локации
  const filteredBookings =
    selectedLocation === 'all'
      ? bookings
      : bookings.filter(b => b.computer?.location === selectedLocation);

  return (
    <View style={styles.container}>
      {/* Фильтр по локациям */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationContainer}>
        {locations.map(loc => (
          <Chip
            key={loc}
            selected={selectedLocation === loc}
            onPress={() => setSelectedLocation(loc)}
            style={styles.locationChip}
          >
            {loc}
          </Chip>
        ))}
      </ScrollView>

      {/* Список бронирований */}
      <FlatList
        data={filteredBookings}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.computer?.name || 'ПК'} - ${item.user?.username || item.username}`}
            description={`${item.startTime} - ${item.endTime}`}
            right={() => (
              <Button onPress={() => cancelMutation.mutate(item._id)}>Скасувати</Button>
            )}
          />
        )}
        keyExtractor={item => item._id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  locationContainer: { flexDirection: 'row', marginBottom: 10 },
  locationChip: { marginRight: 5 },
});
