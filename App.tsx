import "./global.css";
import "react-native-gesture-handler";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import { notificationService } from "./src/services/notificationService";
import { useFinanceStore } from "./src/store/financeStore";
import { useAuthStore } from "./src/store/authStore";

// Analytics is a web-only package — importing it unconditionally crashes the native APK
const Analytics =
  Platform.OS === "web"
    ? require("@vercel/analytics/react").Analytics
    : () => null;

function NotificationBootstrap() {
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const session = useAuthStore((s) => s.session);

  // Stable fingerprint: captures id + renewal_date + amount changes, not just count.
  // Using subscriptions.length alone misses edits to existing subscriptions.
  const subscriptionKey = subscriptions
    .map((s) => `${s.id}:${s.renewal_date}:${s.amount}`)
    .sort()
    .join("|");

  const scheduledKeyRef = useRef<string>("");

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!session) return;

    // Skip if nothing changed since last scheduling run
    const currentKey = `${session.user.id}|${subscriptionKey}`;
    if (scheduledKeyRef.current === currentKey) return;
    scheduledKeyRef.current = currentKey;

    const bootstrap = async () => {
      try {
        const granted = await notificationService.requestPermissions();
        if (granted && subscriptions.length > 0) {
          await notificationService.scheduleAllSubscriptionReminders(subscriptions);
        }
      } catch (err) {
        // Never let notification errors crash the app
        console.warn("[NotificationBootstrap] scheduling failed:", err);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, subscriptionKey]);

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
      <NotificationBootstrap />
      <Toast />
      {/* Analytics only renders on web; native builds skip it entirely */}
      <Analytics />
    </SafeAreaProvider>
  );
}
