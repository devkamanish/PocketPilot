import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Subscription } from "../types/models";

// Show alerts even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Advance a YYYY-MM-DD date by N months */
const addMonths = (dateStr: string, n: number): Date => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + n);
  return d;
};

/** Advance a YYYY-MM-DD date by N years */
const addYears = (dateStr: string, n: number): Date => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + n);
  return d;
};

/**
 * Returns the next upcoming renewal date as a Date object.
 * If the stored date is in the past, advance by the billing cycle until it is future.
 */
export const getNextRenewalDate = (sub: Subscription): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let renewal = new Date(sub.renewal_date);
  renewal.setHours(0, 0, 0, 0);

  // Advance past dates by cycle increments
  while (renewal < today) {
    if (sub.billing_cycle === "yearly") {
      renewal = addYears(renewal.toISOString().split("T")[0], 1);
    } else {
      renewal = addMonths(renewal.toISOString().split("T")[0], 1);
    }
  }
  return renewal;
};

/** Returns days until next renewal (0 = today, 1 = tomorrow, etc.) */
export const getDaysUntilRenewal = (sub: Subscription): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = getNextRenewalDate(sub);
  return Math.round((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    if (!Device.isDevice) return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("pocketpilot-subs", {
        name: "Subscription Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3b82f6",
      });
    }

    return true;
  },

  /** Cancel all previously scheduled subscription notifications and re-schedule fresh ones */
  async scheduleAllSubscriptionReminders(subscriptions: Subscription[]) {
    if (Platform.OS === "web") return;

    // Cancel all existing subscription notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if ((n.content.data as any)?.type === "subscription_reminder") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    // Re-schedule for each subscription
    for (const sub of subscriptions) {
      await this.scheduleSubscriptionReminders(sub);
    }
  },

  async scheduleSubscriptionReminders(sub: Subscription) {
    if (Platform.OS === "web") return;

    const renewal = getNextRenewalDate(sub);
    const now = new Date();

    // Day-before notification
    const dayBefore = new Date(renewal);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(9, 0, 0, 0); // 9 AM

    if (dayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${sub.name} renews tomorrow`,
          body: `You'll be charged ₹${sub.amount.toFixed(2)}. Be prepared!`,
          data: { type: "subscription_reminder", subId: sub.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dayBefore,
        },
      });
    }

    // Renewal day notification
    const renewalDay = new Date(renewal);
    renewalDay.setHours(8, 0, 0, 0); // 8 AM on renewal day

    if (renewalDay > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💳 ${sub.name} is charging today`,
          body: `₹${sub.amount.toFixed(2)} will be deducted — ${sub.billing_cycle} subscription.`,
          data: { type: "subscription_reminder", subId: sub.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: renewalDay,
        },
      });
    }
  },

  async cancelSubscriptionReminders(subId: string) {
    if (Platform.OS === "web") return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if ((n.content.data as any)?.subId === subId) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  },
};
