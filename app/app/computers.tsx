import { View, Text } from 'react-native';

export default function ComputersScreen() {
  console.log('[ComputersScreen] Rendering');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text>Computers Screen</Text>
    </View>
  );
}