import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function Admin() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Admin Panel
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            buttonColor="#1976D2"
            textColor="#fff"
            labelStyle={styles.buttonText}
            onPress={() => router.push('/admin/computers')}
            style={styles.button}
          >
            Computers
          </Button>
          <Button
            mode="contained"
            buttonColor="#1976D2"
            textColor="#fff"
            labelStyle={styles.buttonText}
            onPress={() => router.push('/admin/bookings')}
            style={styles.button}
          >
            Bookings
          </Button>
          <Button
            mode="contained"
            buttonColor="#1976D2"
            textColor="#fff"
            labelStyle={styles.buttonText}
            onPress={() => router.push('/admin/new-users')}
            style={styles.button}
          >
            New Users
          </Button>
          <Button
            mode="contained"
            buttonColor="#1976D2"
            textColor="#fff"
            labelStyle={styles.buttonText}
            onPress={() => router.push('/admin/all-users')}
            style={styles.button}
          >
            All Users
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        buttonColor="#1976D2"
        textColor="#fff"
        labelStyle={styles.buttonText}
        onPress={() => router.push('computers')}
        style={styles.backButton}
      >
        Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f6fa',
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 10,
    elevation: 3,
    backgroundColor: 'white',
  },
  button: {
    marginVertical: 8,
    borderRadius: 12,
  },
  backButton: {
    marginTop: 30,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});
