import { useState } from "react";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { cn } from "../utils/styles";

const SubscriptionCard = ({ sub }: { sub: any }) => {
  const getDaysLeft = (renewalStr: string) => {
    // Basic day diff logic
    const renewalParams = renewalStr.split("-");
    if (renewalParams.length !== 3) return null;
    const now = new Date();
    const ren = new Date(now.getFullYear(), parseInt(renewalParams[1]) - 1, parseInt(renewalParams[2]));
    if (ren.getTime() < now.getTime()) {
      ren.setFullYear(ren.getFullYear() + 1);
    }
    const diff = Math.ceil((ren.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft(sub.renewal_date);
  const isSoon = daysLeft !== null && daysLeft <= 3;

  return (
    <Card className="mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4 shadow-sm">
           <Text className="text-indigo-600 font-bold text-lg uppercase">{sub.name.substring(0, 1)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 capitalize" numberOfLines={1}>{sub.name}</Text>
          <Text className="text-xs text-gray-500 capitalize">{sub.billing_cycle} • {sub.renewal_date}</Text>
        </View>
      </View>
      <View className="items-end">
         <Text className="text-lg font-bold text-gray-900 mb-1">₹{sub.amount.toFixed(2)}</Text>
         {daysLeft !== null && (
           <View className={cn("px-2 py-0.5 rounded-full", isSoon ? "bg-red-100" : "bg-green-100")}>
             <Text className={cn("text-[10px] font-bold uppercase", isSoon ? "text-red-600" : "text-green-600")}>
               {daysLeft === 0 ? "Today" : `${daysLeft} days`}
             </Text>
           </View>
         )}
      </View>
    </Card>
  );
};

export const SubscriptionsScreen = ({ navigation }: { navigation?: any }) => {
  const session = useAuthStore((s) => s.session);
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const upsertSubscription = useFinanceStore((s) => s.upsertSubscription);
  
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSave = async () => {
    if (!session?.user.id || !name || !amount || !renewalDate) return;
    setLoading(true);
    const payload = {
      id: `${session.user.id}-${name.toLowerCase()}`,
      user_id: session.user.id,
      name,
      amount: Number(amount),
      renewal_date: renewalDate,
      billing_cycle: billingCycle,
    } as const;
    await upsertSubscription(payload);
    await notificationService.scheduleSubscriptionReminders(payload);
    setName("");
    setAmount("");
    setRenewalDate("");
    setLoading(false);
  };

  return (
    <ScreenContainer
      header={
        <View className="flex-row items-center">
          {navigation?.canGoBack?.() && Platform.OS !== 'web' && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
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

      <Card title="Add New Subscription" className="mb-4">
         <Input 
           label="Service Name" 
           value={name} 
           onChangeText={setName} 
           placeholder="e.g. Netflix, Spotify" 
         />
         <View className="flex-row gap-3">
           <View className="flex-1">
             <Input
               label="Amount (₹)"
               value={amount}
               onChangeText={setAmount}
               keyboardType="decimal-pad"
               placeholder="0.00"
             />
           </View>
           <View className="flex-1">
             <Input
               label="Cycle"
               value={billingCycle}
               onChangeText={(v) => setBillingCycle(v === "yearly" ? "yearly" : "monthly")}
               placeholder="monthly"
               autoCapitalize="none"
             />
           </View>
         </View>  
         {Platform.OS === "web" ? (
           <Input
             label="Next Renewal"
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
                   label="Next Renewal"
                   value={renewalDate}
                   placeholder="YYYY-MM-DD"
                   editable={false}
                 />
               </View>
             </TouchableOpacity>
             {showDatePicker && (
               <DateTimePicker
                 value={renewalDate ? new Date(renewalDate.split("-").length === 3 ? renewalDate : Date.now()) : new Date()}
                 mode="date"
                 display="default"
                 onChange={(event: any, selectedDate?: Date) => {
                   setShowDatePicker(false);
                   if (selectedDate && event.type !== 'dismissed') {
                     setRenewalDate(selectedDate.toISOString().split("T")[0]);
                   }
                 }}
               />
             )}
           </View>
         )}
         <Button title="Save Subscription" onPress={onSave} loading={loading} className="mt-2" />
      </Card>
      
      {subscriptions.length > 0 && (
        <View className="px-2 mb-2 mt-2">
          <Text className="text-lg font-bold text-gray-900">Active Subscriptions</Text>
        </View>
      )}

      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.id} sub={sub} />
      ))}

      {subscriptions.length === 0 ? (
        <View className="items-center justify-center py-10">
          <Text className="text-gray-400 text-center px-4">No active subscriptions tracked. Add one above to never miss a payment.</Text>
        </View>
      ) : null}
      
      <View className="h-6" />
    </ScreenContainer>
  );
};
