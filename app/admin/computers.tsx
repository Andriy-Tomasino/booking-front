import { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Portal, Modal, TextInput, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

export default function AdminComputers() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const { data: computers = [] } = useQuery({
    queryKey: ['computers'],
    queryFn: async () => api.get('/computers').then(res => res.data),
  });

  const addMutation = useMutation({
    mutationFn: async (dto) => api.post('/computers', dto),
    onSuccess: () => {
      queryClient.invalidateQueries(['computers']);
      setAddModalVisible(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/computers/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['computers']),
  });

  const locations = ['all', ...new Set(computers.map(c => c.location))];

  const filteredComputers = selectedLocation === 'all' ? computers : computers.filter(c => c.location === selectedLocation);

  const handleAdd = () => {
    addMutation.mutate({ name, location });
  };

  const renderComputer = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={item.name} subtitle={item.location} />
      <Button mode="text" onPress={() => deleteMutation.mutate(item.id)}>
        Видалити
      </Button>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Chip onPress={() => setAddModalVisible(true)}>Додати ПК</Chip>
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
      </View>
      <FlatList
        data={filteredComputers}
        renderItem={renderComputer}
        keyExtractor={item => item.id.toString()}
      />

      <Portal>
        <Modal visible={addModalVisible} onDismiss={() => setAddModalVisible(false)} contentContainerStyle={styles.modal}>
          <TextInput label="Назва" value={name} onChangeText={setName} />
          <TextInput label="Локація" value={location} onChangeText={setLocation} />
          <Button onPress={handleAdd}>Додати</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  locationChip: {
    marginLeft: 5,
  },
  card: { marginBottom: 10 },
  modal: { backgroundColor: 'white', padding: 20, margin: 20 },
});