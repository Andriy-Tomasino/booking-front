import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { Card, Button, Portal, Modal, TextInput, List, Chip, Provider as PaperProvider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaskedTextInput } from 'react-native-mask-text';

export default function Computers() {
  const queryClient = useQueryClient();
  const [computers, setComputers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState<any>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          console.log('[Computers] Loaded user:', JSON.stringify(user, null, 2));
          setCurrentUser(user);
        } else {
          console.warn('[Computers] No user found in AsyncStorage');
        }
      } catch (err) {
        console.error('[Computers] Error loading user:', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const res = await api.get('/computers');
        setComputers(res.data || []);
      } catch (err) {
        console.error('[Computers] Fetch computers error:', err);
        Alert.alert('Error', 'Failed to load computer list');
      }
    };
    fetchComputers();
  }, []);

  const bookingMutation = useMutation({
    mutationFn: async (dto: any) => {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');  // ИСПРАВЛЕНО: Добавил проверку токена
      console.log('[Computers] JWT Token:', token);
      console.log('[Computers] Sending booking request:', JSON.stringify(dto, null, 2));
      const res = await api.post('/bookings', dto, {  // ИСПРАВЛЕНО: Добавил headers, если api не имеет по умолчанию
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[Computers] Booking response:', JSON.stringify(res.data, null, 2));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['computers']);
      setBookModalVisible(false);
      setDate('');
      setStartTime('');
      setEndTime('');
      Alert.alert('Success', 'Reservation created');
    },
    onError: (err: any) => {
      console.error('[Computers] Booking error:', JSON.stringify(err.response?.data, null, 2));
      const message = err.response?.data?.message || 'Failed to book';
      Alert.alert('Error', message);
    },
  });

  const handleBook = () => {
    if (!selectedComputer || !currentUser) {
      Alert.alert('Error', 'Incorrect user or computer data');
      return;
    }

    if (!date || !startTime || !endTime) {
      Alert.alert('Error', 'Fill in the date and time of your reservation');
      return;
    }

    const [dd, mm, yyyy] = date.split('-');
    const startISO = `${yyyy}-${mm}-${dd}T${startTime}:00.000Z`;
    const endISO = `${yyyy}-${mm}-${dd}T${endTime}:00.000Z`;

    const startDate = new Date(startISO);
    const endDate = new Date(endISO);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      Alert.alert('Error', 'Incorrect date or time');
      return;
    }

    console.log('[Computers] Booking computer:', JSON.stringify(selectedComputer, null, 2));

    bookingMutation.mutate({
      computerId: selectedComputer._id,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      username: currentUser.nickname || 'Unknown',
      computerName: selectedComputer.name || 'Unknown',
    });
  };

  const locations = ['all', ...new Set(computers.map(c => c.location).filter(Boolean))];
  const filteredComputers = selectedLocation === 'all'
    ? computers
    : computers.filter(c => c.location === selectedLocation);

  const renderComputer = ({ item }: any) => {
    const color = item.isAvailable ? 'green' : 'red';
    return (
      <Card style={styles.card}>
        <Card.Title title={item.name || 'Without name'} subtitle={item.location || 'Without location'} />
        <View style={[styles.status, { backgroundColor: color }]} />
        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedComputer(item);
              setBookModalVisible(true);
            }}
            disabled={!item._id || item.isAvailable === false}  // ИСПРАВЛЕНО: Изменил на item._id (предполагая id -> _id), и disabled только если явно false
          >
            Book
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push(`/computer/${item._id}`)}
          >
            Booking by this PC
          </Button>
        </View>
      </Card>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Button mode="outlined" onPress={() => router.push('/auth/login')}>
            Sign in
          </Button>
          <List.Accordion title="Sort for rooms" style={styles.accordion}>
            {locations.map(loc => (
              <Chip key={loc} selected={selectedLocation === loc} onPress={() => setSelectedLocation(loc)}>
                {loc}
              </Chip>
            ))}
          </List.Accordion>
        </View>
        <Text>Current user: {currentUser?.nickname || 'Didnt enter'}</Text>
        <FlatList
          data={filteredComputers}
          renderItem={renderComputer}
          keyExtractor={item => item._id.toString()}  // ИСПРАВЛЕНО: Убрал random, используем _id
          ListEmptyComponent={<Text>No computers available</Text>}
        />
        <Button
          mode="contained"
          onPress={() => router.push(`/bookings/${currentUser?.uid || ''}`)}
          style={styles.bottomButton}
          disabled={!currentUser?.uid}
        >
          All bookings
        </Button>
        {currentUser?.role === 'admin' && (
          <Button
            mode="contained"
            onPress={() => router.push('/admin')}
            style={styles.bottomButton}
          >
            Admin page
          </Button>
        )}
        <Portal>
          <Modal
            visible={bookModalVisible}
            onDismiss={() => setBookModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <Text>Book {selectedComputer?.name || 'PC'}</Text>
            <MaskedTextInput
              mask="99-99-9999"
              onChangeText={(text) => setDate(text)}
              value={date}
              style={styles.input}
              keyboardType="numeric"
              placeholder="DD-MM-YYYY"
            />
            <MaskedTextInput
              mask="99:99"
              onChangeText={(text) => setStartTime(text)}
              value={startTime}
              style={styles.input}
              keyboardType="numeric"
              placeholder="HH:MM"
            />
            <MaskedTextInput
              mask="99:99"
              onChangeText={(text) => setEndTime(text)}
              value={endTime}
              style={styles.input}
              keyboardType="numeric"
              placeholder="HH:MM"
            />
            <Button
              mode="contained"
              onPress={handleBook}
              loading={bookingMutation.isPending}  // ИСПРАВЛЕНО: isLoading -> isPending для tanstack
            >
              Book
            </Button>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  accordion: { flex: 1, marginLeft: 10 },
  card: { marginBottom: 10 },
  status: { width: 20, height: 20, borderRadius: 10, alignSelf: 'flex-end' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  bottomButton: { marginTop: 10 },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  input: { marginBottom: 10 },
});