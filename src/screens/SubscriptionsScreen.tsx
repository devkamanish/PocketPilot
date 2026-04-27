import { useState } from "react";
import { Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  notificationService,
  getDaysUntilRenewal,
  getNextRenewalDate,
} from "../services/notificationService";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { Subscription } from "../types/models";
import { cn } from "../utils/styles";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const confirmDelete = (message: string, onConfirm: () => void) => {
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert("Delete Subscription", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ]);
  }
};

// ─── Subscription Card ─────────────────────────────────────────────────────────
const SubscriptionCard = ({
  sub,
  onDelete,
}: {
  sub: Subscription;
  onDelete: () => void;
}) => {
  const daysLeft = getDaysUntilRenewal(sub);
  const nextRenewal = getNextRenewalDate(sub);

  const urgency =
    daysLeft === 0
      ? { label: "Due Today", bg: "bg-red-100", text: "text-red-700", dot: "#ef4444" }
      : daysLeft === 1
      ? { label: "Tomorrow", bg: "bg-orange-100", text: "text-orange-700", dot: "#f97316" }
      : daysLeft <= 5
      ? { label: `${daysLeft} days`, bg: "bg-amber-100", text: "text-amber-700", dot: "#f59e0b" }
      : { label: `${daysLeft} days`, bg: "bg-green-100", text: "text-green-700", dot: "#10b981" };

  // Icon letter with a color derived from name
  const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];
  const colorIdx =
    sub.name.charCodeAt(0) % colors.length;
  const iconColor = colors[colorIdx];
  const iconBg = iconColor + "20"; // 12% opacity hex

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ color: iconColor, fontWeight: "800", fontSize: 18, textTransform: "uppercase" }}>
          {sub.name.substring(0, 1)}
        </Text>
      </View>

      {/* Details */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: "#111827", textTransform: "capitalize" }}
          numberOfLines={1}
        >
          {sub.name}
        </Text>
        <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          {sub.billing_cycle === "monthly" ? "Monthly" : "Yearly"} •{" "}
          Renews {formatDate(nextRenewal)}
        </Text>
      </View>

      {/* Amount + badge + delete */}
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
          ₹{sub.amount.toFixed(2)}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            backgroundColor: urgency.bg.replace("bg-", ""),
          }}
          className={urgency.bg}
        >
          <Text className={cn("text-[10px] font-bold uppercase", urgency.text)}>
            {urgency.label}
          </Text>
        </View>
      </View>

      {/* Delete button */}
      <TouchableOpacity
        onPress={() =>
          confirmDelete(`Remove "${sub.name}" from your subscriptions?`, onDelete)
        }
        style={{
          marginLeft: 10,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#fef2f2",
          alignItems: "center",
          justifyContent: "center",
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Billing Cycle Picker ──────────────────────────────────────────────────────
const CyclePicker = ({
  value,
  onChange,
}: {
  value: "monthly" | "yearly";
  onChange: (v: "monthly" | "yearly") => void;
}) => (
  <View style={{ flex: 1 }}>
    <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Cycle</Text>
    <View style={{ flexDirection: "row", gap: 8 }}>
      {(["monthly", "yearly"] as const).map((cycle) => (
        <TouchableOpacity
          key={cycle}
          onPress={() => onChange(cycle)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: value === cycle ? "#3b82f6" : "#e5e7eb",
            backgroundColor: value === cycle ? "#eff6ff" : "#fff",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: value === cycle ? "#3b82f6" : "#6b7280",
              textTransform: "capitalize",
            }}
          >
            {cycle}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const SubscriptionsScreen = ({ navigation }: { navigation?: any }) => {
  const session = useAuthStore((s) => s.session);
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const upsertSubscription = useFinanceStore((s) => s.upsertSubscription);
  const deleteSubscription = useFinanceStore((s) => s.deleteSubscription);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSave = async () => {
    if (!session?.user.id || !name.trim() || !amount || !renewalDate) {
      Toast.show({ type: "error", text1: "Missing fields", text2: "Fill in all fields before saving." });
      return;
    }
    setLoading(true);
    try {
      const payload: Subscription = {
        id: `${session.user.id}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        user_id: session.user.id,
        name: name.trim(),
        amount: Number(amount),
        renewal_date: renewalDate,
        billing_cycle: billingCycle,
      };
      await upsertSubscription(payload);
      // Cancel any old reminders for this sub then re-schedule
      await notificationService.cancelSubscriptionReminders(payload.id);
      await notificationService.scheduleSubscriptionReminders(payload);
      setName("");
      setAmount("");
      setRenewalDate("");
      Toast.show({ type: "success", text1: "Saved!", text2: `${payload.name} subscription added.` });
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e?.message ?? "Could not save." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sub: Subscription) => {
    try {
      await deleteSubscription(sub.id);
      await notificationService.cancelSubscriptionReminders(sub.id);
      Toast.show({ type: "success", text1: "Deleted", text2: `${sub.name} removed.` });
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e?.message ?? "Could not delete." });
    }
  };

  // Sort: most urgent first
  const sorted = [...subscriptions].sort(
    (a, b) => getDaysUntilRenewal(a) - getDaysUntilRenewal(b)
  );

  return (
    <ScreenContainer
      header={
        <View className="flex-row items-center">
          {navigation?.canGoBack?.() && Platform.OS !== "web" && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3 w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-xl font-bold text-gray-600">‹</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Recurring</Text>
            <Text className="text-3xl font-extrabold text-gray-900">Subscriptions</Text>
          </View>
        </View>
      }
    >
      {/* Add form */}
      <Card title="Add New Subscription" className="mb-4">
        <Input
          label="Service Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Netflix, Spotify"
        />
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
          <CyclePicker value={billingCycle} onChange={setBillingCycle} />
        </View>

        {Platform.OS === "web" ? (
          <Input
            label="Next Renewal Date"
            value={renewalDate}
            onChangeText={setRenewalDate}
            placeholder="YYYY-MM-DD"
            {...({ type: "date" } as any)}
          />
        ) : (
          <View>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowDatePicker(true)}>
              <View style={{ pointerEvents: "none" } as any}>
                <Input
                  label="Next Renewal Date"
                  value={renewalDate}
                  placeholder="Tap to pick a date"
                  editable={false}
                />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={renewalDate ? new Date(renewalDate) : new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate && event.type !== "dismissed") {
                    setRenewalDate(selectedDate.toISOString().split("T")[0]);
                  }
                }}
              />
            )}
          </View>
        )}

        <Button title="Save Subscription" onPress={onSave} loading={loading} className="mt-3" />
      </Card>

      {/* List */}
      {sorted.length > 0 && (
        <View style={{ paddingHorizontal: 2, marginBottom: 8, marginTop: 4 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>
            Active Subscriptions
          </Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            Sorted by urgency · notifications scheduled
          </Text>
        </View>
      )}

      {sorted.map((sub) => (
        <SubscriptionCard key={sub.id} sub={sub} onDelete={() => handleDelete(sub)} />
      ))}

      {sorted.length === 0 && (
        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
          <Text style={{ fontSize: 32, marginBottom: 10 }}>📭</Text>
          <Text style={{ color: "#9ca3af", textAlign: "center", paddingHorizontal: 16 }}>
            No active subscriptions tracked.{"\n"}Add one above to never miss a payment.
          </Text>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScreenContainer>
  );
};
