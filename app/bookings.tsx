import { useState, useEffect } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { Card, Button, Provider as PaperProvider } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import api from "../utils/api";

export default function ComputerBookings() {
  const { computerId } = useLocalSearchParams();

  const { data: bookings, error, isLoading } = useQuery({
    queryKey: ["bookings", computerId],
    queryFn: async () => {
      if (!computerId) throw new Error("Computer ID is missing");
      console.log("[ComputerBookings] Fetching bookings for computerId:", computerId);
      const res = await api.get(`/bookings/computer/${computerId}`);
      return res.data || [];
    },
    enabled: !!computerId,
  });

  if (isLoading) return <Text>Loading bookings...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const renderBooking = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Title
        title={`Booking by ${item.username}`}
        subtitle={`From ${new Date(item.startTime).toLocaleString()} to ${new Date(item.endTime).toLocaleString()}`}
      />
      <Card.Content>
        <Text>Status: {item.status}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Bookings for Computer</Text>
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item._id.toString()}
          ListEmptyComponent={<Text>No bookings for this computer</Text>}
        />
        <Button mode="contained" onPress={() => router.push("/computers")} style={styles.button}>
          Back to Computers
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: { marginBottom: 10 },
  button: { marginTop: 10 },
});
