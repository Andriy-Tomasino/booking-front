import { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  MD3LightTheme,
  Card,
  Provider as PaperProvider,
  Menu,
} from "react-native-paper";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Computers() {
  const [computers, setComputers] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const res = await api.get("/computers");
        const normalized = (res.data || []).map((c: any) => ({
          ...c,
          id: c.id || c._id?.toString(), // нормализация
        }));
        setComputers(normalized);
      } catch {
        Alert.alert("Помилка", "Не вдалося завантажити комп’ютери");
      }
    };
    fetchComputers();
  }, []);

  const locations = [
    "all",
    ...new Set(computers.map((c) => c.location).filter(Boolean)),
  ];
  const filteredComputers =
    selectedLocation === "all"
      ? computers
      : computers.filter((c) => c.location === selectedLocation);

  const formatDate = (date: Date) => {
    const monthsUk = [
      "січня",
      "лютого",
      "березня",
      "квітня",
      "травня",
      "червня",
      "липня",
      "серпня",
      "вересня",
      "жовтня",
      "листопада",
      "грудня",
    ];
    return `${date.getDate()} ${monthsUk[date.getMonth()]}`;
  };

  const hours = Array.from({ length: 9 }, (_, i) => 9 + i);

  const handleBooking = async (
    item: any,
    h: number,
    booking: any,
    isMine: boolean
  ) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    if (isMine) {
      try {
        await api.delete(`/bookings/${booking.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComputers((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? { ...c, bookings: c.bookings.filter((b: any) => b.id !== booking.id) }
              : c
          )
        );
        Alert.alert("Успіх", "Бронювання скасовано");
      } catch {
        Alert.alert("Помилка", "Не вдалося видалити бронювання");
      }
      return;
    }

    if (!booking) {
      try {
        const startDate = new Date(currentDate);
        startDate.setHours(h, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        const res = await api.post(
          "/bookings",
          {
            computerId: item.id,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            userId: currentUser?.uid,
            username:
              currentUser?.username || currentUser?.name || "Користувач",
            computerName: item.name,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newBooking = res.data;
        setComputers((prev) =>
          prev.map((c) =>
            c.id === item.id ? { ...c, bookings: [...c.bookings, newBooking] } : c
          )
        );
        Alert.alert("Успіх", "Бронювання створено");
      } catch (err: any) {
        Alert.alert(
          "Помилка",
          err.response?.data?.message || "Не вдалося забронювати"
        );
      }
    }
  };

  const renderComputer = ({ item }: any) => {
    const isExpanded = expanded === item.id;
    const todaysBookings = (item.bookings || []).filter((b: any) => {
      const start = new Date(b.startTime);
      return start.toDateString() === currentDate.toDateString();
    });

    const busyCount = todaysBookings.length;
    const freeCount = hours.length - busyCount;

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => setExpanded(isExpanded ? null : item.id)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.pcName}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.statusText}>Зайнято: {busyCount} г</Text>
            <Text style={styles.statusText}>Вільно: {freeCount} г</Text>
          </View>

          {!isExpanded ? (
            <View style={styles.scale}>
              {hours.map((h) => {
                const booking = item.bookings?.find(
                  (b: any) => new Date(b.startTime).getHours() === h
                );
                const isMine = booking?.userId === currentUser?.uid;
                return (
                  <View
                    key={h}
                    style={[
                      styles.scaleBlock,
                      isMine
                        ? { backgroundColor: "#2F7EF5" }
                        : booking
                        ? { backgroundColor: "#130153" }
                        : { backgroundColor: "#F1F3F6" },
                    ]}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.tiles}>
              {hours.map((h) => {
                const booking = item.bookings?.find(
                  (b: any) => new Date(b.startTime).getHours() === h
                );
                const isMine = booking?.userId === currentUser?.uid;

                return (
                  <TouchableOpacity
                    key={h}
                    disabled={booking && !isMine}
                    onPress={() => handleBooking(item, h, booking, isMine)}
                    style={[
                      styles.tile,
                      isMine
                        ? { backgroundColor: "#2F7EF5" }
                        : booking
                        ? { backgroundColor: "#130153" }
                        : { backgroundColor: "#F1F3F6" },
                    ]}
                  >
                    <Text
                      style={{
                        color: booking ? "white" : "#130153",
                        fontWeight: "500",
                      }}
                    >{`${h}:00`}</Text>
                    {booking && !isMine && booking.username && (
                      <Text
                        style={{ color: "white", fontSize: 12, marginTop: 2 }}
                      >
                        {booking.username}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <PaperProvider
      theme={{
        ...MD3LightTheme,
        colors: { ...MD3LightTheme.colors, surface: "white", onSurface: "black" },
      }}
    >
      <View style={styles.container}>
        {/* Топ-бар с меню */}
        <View style={styles.topBar}>
          <Menu
            visible={locationMenuVisible}
            onDismiss={() => setLocationMenuVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <TouchableOpacity
                style={styles.locationBox}
                onPress={() => setLocationMenuVisible(true)}
              >
                <Text style={styles.locationBoxText}>
                  {selectedLocation === "all"
                    ? "Всі кімнати"
                    : selectedLocation}
                </Text>
              </TouchableOpacity>
            }
          >
            {locations.map((loc, idx) => (
              <View key={loc}>
                <Menu.Item
                  onPress={() => {
                    setSelectedLocation(loc);
                    setLocationMenuVisible(false);
                  }}
                  title={loc}
                  titleStyle={styles.menuItemText}
                />
                {idx < locations.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </View>
            ))}
          </Menu>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <View style={styles.gearWrapper}>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <Image
                    source={require("./images/menu.png")}
                    style={{ width: 28, height: 28, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              </View>
            }
          >
            {currentUser?.role === "admin" && (
              <>
                <Menu.Item
                  onPress={() => router.push("/admin")}
                  title="Адміністрування"
                  titleStyle={styles.menuItemText}
                />
                <View style={styles.menuDivider} />
              </>
            )}
            <Menu.Item
              onPress={() => router.push(`/bookings/${currentUser?.uid || ""}`)}
              title="Мої бронювання"
              titleStyle={styles.menuItemText}
            />
            <View style={styles.menuDivider} />
            <Menu.Item
              onPress={() => router.push("/auth/login")}
              title="Вийти"
              titleStyle={styles.menuItemText}
            />
          </Menu>
        </View>

        {/* Дата */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => {
              const prev = new Date(currentDate);
              prev.setDate(prev.getDate() - 1);
              if (prev >= new Date(new Date().setHours(0, 0, 0, 0)))
                setCurrentDate(prev);
            }}
          >
            <Image
              source={require("./images/switchDate.png")}
              style={[styles.switchIcon, { transform: [{ rotate: "180deg" }] }]}
            />
          </TouchableOpacity>

          <Text style={styles.dateText}>{formatDate(currentDate)}</Text>

          <TouchableOpacity
            onPress={() => {
              const next = new Date(currentDate);
              next.setDate(next.getDate() + 1);
              setCurrentDate(next);
            }}
          >
            <Image
              source={require("./images/switchDate.png")}
              style={styles.switchIcon}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredComputers}
          renderItem={renderComputer}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>Немає доступних комп'ютерів</Text>}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F1F3F6",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "2%",
  },
  locationBox: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#aaa",
    paddingHorizontal: 90,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "white",
  },
  locationBoxText: { color: "black", fontSize: 16, fontWeight: "500" },
  menuContent: { backgroundColor: "white", borderRadius: 8 },
  menuItemText: { color: "black", fontSize: 16 },
  menuDivider: {
    height: 0.5,
    backgroundColor: "#bbb",
    marginHorizontal: 12,
    width: "90%",
    alignSelf: "center",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: "5%",
  },
  dateText: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  switchIcon: { width: 28, height: 28, resizeMode: "contain" },
  card: {
    marginBottom: 25,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: "3%",
    alignItems: "center",
    marginHorizontal: "5%",
  },
  pcName: { fontSize: 18, fontWeight: "600", color: "#130153" },
  location: { fontSize: 16, fontWeight: "600", color: "blue" },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
    marginHorizontal: "5%",
  },
  statusText: { fontSize: 14 },
  scale: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: "3%",
    height: 18,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: "3%",
  },
  scaleBlock: { flex: 1 },
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: "2%",
    marginHorizontal: "5%",
    gap: "5%",
    justifyContent: "center",
  },
  tile: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#130153",
    alignItems: "center",
    justifyContent: "center",
  },
});
