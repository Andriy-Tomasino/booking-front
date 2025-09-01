import { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Portal, Modal, TextInput, Menu, Provider as PaperProvider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { useRouter } from 'expo-router';

export default function AdminComputers() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();


  const { data: computers = [] } = useQuery({
    queryKey: ['computers'],
    queryFn: async () => api.get('/computers').then(res => res.data),
  });

  const addMutation = useMutation({
    mutationFn: async (dto) => api.post('/computers', dto),
    onSuccess: () => {
      queryClient.invalidateQueries(['computers']);
      setAddModalVisible(false);
      setName('');
      setLocation('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/computers/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['computers']),
  });

  const locations = [...new Set(computers.map(c => c.location).filter(Boolean))];

  const filteredComputers =
    selectedLocation === 'all' ? computers : computers.filter(c => c.location === selectedLocation);

  const handleAdd = () => {
    if (!name || !location) return;
    addMutation.mutate({ name, location });
  };

  const renderComputer = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pcName}>{item.name}</Text>
          <Text style={styles.locationText}>📍 {item.location}</Text>
        </View>
        <Button
          mode="contained"
          style={styles.deleteBtn}
          onPress={() => deleteMutation.mutate(item.id)}
        >
          Видалити
        </Button>
      </View>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Управління ПК</Text>

        {/* Добавление ПК */}
        <Button mode="contained" onPress={() => setAddModalVisible(true)} style={styles.addBtn}>
          Додати ПК
        </Button>

        {/* Фильтр по локации */}
        <Menu
          visible={locationMenuVisible}
          onDismiss={() => setLocationMenuVisible(false)}
          anchor={
            <TouchableOpacity style={styles.locationBox} onPress={() => setLocationMenuVisible(true)}>
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

        {/* Список ПК */}
        <FlatList
          data={filteredComputers}
          renderItem={renderComputer}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>ПК відсутні</Text>}
        />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/admin')}>
                  <Text style={styles.backText}>← Назад</Text>
                </TouchableOpacity>

        {/* Модальное окно добавления */}
        <Portal>
          <Modal visible={addModalVisible} onDismiss={() => setAddModalVisible(false)} contentContainerStyle={styles.modal}>
            <TextInput
              label="Назва ПК"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Локація"
              value={location}
              onChangeText={setLocation}
              style={{ marginBottom: 12 }}
            />
            <Button mode="contained" onPress={handleAdd}>
              Додати
            </Button>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F1F3F6' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#130153', textAlign: 'center', marginBottom: 16, marginVertical: '2%' },
  addBtn: { marginBottom: 25, backgroundColor: '#2F7EF5' },
  locationBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 20,
  },
  locationBoxText: { fontSize: 16, color: 'black' },
  menuContent: { backgroundColor: 'white' },
  menuItemText: { color: 'black', fontSize: 16 },
  menuDivider: { height: 0.5, backgroundColor: '#ccc', marginHorizontal: 12 },
  card: { marginBottom: 18, padding: 16, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pcName: { fontSize: 18, fontWeight: '600', color: '#130153', marginBottom: 6 },
  locationText: { fontSize: 15, color: '#555' },
  deleteBtn: { backgroundColor: '#d9534f' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 },
  backBtn: { marginTop: 12, alignSelf: 'center', backgroundColor: '#2F7EF5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backText: { color: 'white', fontSize: 17, fontWeight: '600' },
});
