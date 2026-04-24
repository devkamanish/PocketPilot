import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const SplashScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>PocketPilot</Text>
    <ActivityIndicator size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: "800" },
});
