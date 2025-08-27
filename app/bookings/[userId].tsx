import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Card, Button, Provider as PaperProvider } from 'react-native-paper';
import api from '../../utils/api';

export default function UserBookings() {
  const { userId } = useLocalSearchParams();

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: async () => {
      const res = await api.get(`/bookings/user/${userId}`);
      return res.data || [];
    },
    enabled: !!userId,
  });

  if (isLoading) return <Text>Loading bookings...</Text>;
  if (error) return <Text>Error loading: {error.message}</Text>;

  const renderBooking = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Title
        title={`Computer: ${item.computerName}`}
        subtitle={`From ${new Date(item.startTime).toLocaleString()} to ${new Date(item.endTime).toLocaleString()}`}
      />
      <Card.Content>
        <Text>Status: {item.status}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Your Bookings</Text>
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id.toString()}
          ListEmptyComponent={<Text>No bookings found</Text>}
        />
        <Button mode="contained" onPress={() => router.push('/computers')} style={styles.button}>
          Back to Computers
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  card: { marginBottom: 10 },
  button: { marginTop: 10 },
});
