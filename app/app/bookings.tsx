import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../src/contexts/AuthContext';
import { getUserBookings } from '../../src/api/api';
import { Booking } from '../../src/types/booking.types';

console.log('BookingsScreen loaded');

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, signOut, isLoading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      if (token) {
        try {
          console.log('Fetching bookings');
          const data = await getUserBookings(token);
          setBookings(data);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token]);

  if (authLoading || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <Text style={styles.computerName}>Computer: {item.computerId}</Text>
      <Text>Start: {new Date(item.startTime).toLocaleString()}</Text>
      <Text>End: {new Date(item.endTime).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings available</Text>}
      />
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  computerName: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});