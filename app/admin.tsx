import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function Admin() {
  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => router.push('/admin/computers')} style={styles.button}>
        Computers
      </Button>
      <Button mode="contained" onPress={() => router.push('/admin/bookings')} style={styles.button}>
        Bookings
      </Button>
      <Button mode="contained" onPress={() => router.push('/admin/new-users')} style={styles.button}>
        New Users
      </Button>
      <Button mode="contained" onPress={() => router.push('/admin/all-users')} style={styles.button}>
        All users
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { margin: 10, width: '80%' },
});