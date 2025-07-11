import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../src/contexts/AuthContext';
import { getComputers } from '../../src/api/api';
import { connectSocket, disconnectSocket } from '../../src/api/socket';
import { Computer } from '../../src/types/computer.types';

console.log('ComputersScreen loaded');

export default function ComputersScreen() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, signOut, isLoading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchComputers = async () => {
      if (token) {
        try {
          console.log('Fetching computers');
          const data = await getComputers(token);
          setComputers(data);
        } catch (error) {
          console.error('Error fetching computers:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchComputers();

    if (token) {
      connectSocket((data) => {
        console.log('Received computers status:', data);
        setComputers(data);
      });
    }

    return () => disconnectSocket();
  }, [token]);

  if (authLoading || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderComputer = ({ item }: { item: Computer }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: item.isPoweredOn ? 'green' : 'red',
            marginRight: 10,
          }}
        />
        <Text style={styles.computerName}>{item.name}</Text>
      </View>
      <Text style={styles.status}>
        Status: {item.isPoweredOn ? 'Online' : 'Offline'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={computers}
        renderItem={renderComputer}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No computers available</Text>}
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
  status: { fontSize: 14, color: 'gray' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});