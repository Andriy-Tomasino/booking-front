import { View, Text } from 'react-native';

export default function BookingsScreen() {
  console.log('[BookingsScreen] Rendering');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text>Bookings Screen</Text>
    </View>
  );
}