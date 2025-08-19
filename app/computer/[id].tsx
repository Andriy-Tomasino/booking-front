// app/computer/[id].tsx
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { Card, Button, Provider as PaperProvider } from "react-native-paper";
import api from "../../utils/api";

export default function ComputerBookings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [computerName, setComputerName] = useState<string>("");

  // Загружаем бронирования компьютера
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["computer-bookings", id],
    queryFn: async () => {
      const res = await api.get(`/bookings/computer/${id}`);
      if (res.data.length > 0) {
        setComputerName(res.data[0].computer?.name || "Неизвестный ПК");
      } else {
        // если бронирований нет — отдельно загрузим сам компьютер
        const compRes = await api.get(`/computers/${id}`);
        setComputerName(compRes.data?.name || "Неизвестный ПК");
      }
      return res.data;
    },
    enabled: !!id,
  });

  const renderBooking = ({ item }: any) => {
    const start = new Date(item.startTime).toLocaleString();
    const end = new Date(item.endTime).toLocaleString();
    return (
      <Card style={styles.card}>
        <Card.Title title={`Пользователь: ${item.username}`} />
        <Card.Content>
          <Text>Начало: {start}</Text>
          <Text>Конец: {end}</Text>
          <Text>Статус: {item.status}</Text>
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) return <Text>Загрузка...</Text>;
  if (error) return <Text>Ошибка при загрузке бронирований</Text>;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.header}>{computerName}</Text>
        <FlatList
          data={bookings || []}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text>У этого компьютера нет бронирований</Text>}
        />
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Назад
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: { marginBottom: 10 },
  backButton: { marginTop: 10 },
});
