// app/computer/[computerId].tsx
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

async function fetchBookingsByComputerId(computerId: string) {
  const res = await fetch(`http://localhost:3000/bookings/computer/${computerId}`);
  if (!res.ok) throw new Error("Ошибка при загрузке бронирований");
  return res.json();
}

export default function ComputerBookings() {
  const { computerId } = useLocalSearchParams<{ computerId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", computerId],
    queryFn: () => fetchBookingsByComputerId(computerId),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Ошибка загрузки бронирований</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text>У этого компьютера нет бронирований</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item._id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Title title={`Бронирование #${item.computer.slice(-4)}`} />
          <Card.Content>
            <Text>Пользователь: {item.username}</Text>
            <Text>Компьютер: {item.computerName}</Text>
            <Text>
              Время:{" "}
              {new Date(item.startTime).toLocaleString()} —{" "}
              {new Date(item.endTime).toLocaleString()}
            </Text>
            <Text>Статус: {item.status}</Text>
          </Card.Content>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
});
