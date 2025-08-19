// app/bookings.tsx
import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { Card, Button, Provider as PaperProvider } from 'react-native-paper';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function Bookings() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Loading the user
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  // Request user bookings
  const {
    data: bookings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookings', currentUser?.nickname],
    queryFn: async () => {
      if (!currentUser?.nickname) return [];
      const res = await api.get(`/bookings/user/${currentUser.nickname}`);
      return res.data;
    },
    enabled: !!currentUser,
  });


  // Mutation to remove reservation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      Alert.alert('Success', 'Booking deleted');
      refetch();
    },
    onError: (err: any) => {
      console.error('[Bookings] Delete error:', err);
      const message = err.response?.data?.message || 'Failed to delete';
      Alert.alert('Error', message);
    },
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete your reservation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  };

  const renderBooking = ({ item }: any) => {
    const start = new Date(item.startTime).toLocaleString();
    const end = new Date(item.endTime).toLocaleString();
    return (
      <Card style={styles.card}>
        <Card.Title
          title={`PC: ${item.computerName}`}
          subtitle={`User: ${item.username}`}
        />
        <Card.Content>
          <Text>Start: {start}</Text>
          <Text>End: {end}</Text>
          <Text>Status: {item.status}</Text>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained-tonal"
            onPress={() => handleDelete(item._id)}
            loading={deleteMutation.isLoading}
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) {
    console.error('[Bookings] fetch error:', error);
    return <Text>Error loading reservations</Text>;
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.header}>
          User reservations {currentUser?.nickname}
        </Text>
        <FlatList
          data={bookings || []}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text>You don't have any reservations yet.</Text>}
        />
        <Button
          mode="outlined"
          onPress={() => router.push('/computers')}
          style={styles.backButton}
        >
          Back to computers
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { marginBottom: 10 },
  backButton: { marginTop: 10 },
});
