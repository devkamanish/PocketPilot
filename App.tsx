import "./global.css";
import "react-native-gesture-handler";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import Toast from "react-native-toast-message";
<<<<<<< HEAD
import { notificationService } from "./src/services/notificationService";
import { useFinanceStore } from "./src/store/financeStore";
import { useAuthStore } from "./src/store/authStore";
import { Platform } from "react-native";

function NotificationBootstrap() {
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const bootstrap = async () => {
      const granted = await notificationService.requestPermissions();
      if (granted && subscriptions.length > 0) {
        await notificationService.scheduleAllSubscriptionReminders(subscriptions);
      }
    };

    if (session) {
      bootstrap();
    }
  }, [session, subscriptions.length]);

  return null;
}
=======
import { Analytics } from "@vercel/analytics/react";
>>>>>>> b1c5cb7e80cced39d97f39b96bb813c8cc9af9a8

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
      <NotificationBootstrap />
      <Toast />
      <Analytics />
    </SafeAreaProvider>
  );
}
