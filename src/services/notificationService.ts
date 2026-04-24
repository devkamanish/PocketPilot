import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Subscription } from "../types/models";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async registerForPushPermissions() {
    // Expo Go on Android does not support remote push notifications.
    if (Constants.appOwnership === "expo" && Platform.OS === "android") {
      return false;
    }

    if (!Device.isDevice) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    return true;
  },

  async scheduleSubscriptionReminders(sub: Subscription) {
    if (Platform.OS === "web") return;

    const renewal = new Date(sub.renewal_date);
    const threeDaysBefore = new Date(renewal);
    threeDaysBefore.setDate(renewal.getDate() - 3);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${sub.name} renews in 3 days`,
        body: `Upcoming charge: ₹${sub.amount.toFixed(2)}`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: threeDaysBefore },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${sub.name} renewal today`,
        body: `Charge due: ₹${sub.amount.toFixed(2)}`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: renewal },
    });
  },
};
