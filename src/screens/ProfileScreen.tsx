import { useState } from "react";
import { Text, View, Alert, Platform, TouchableOpacity } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";

export const ProfileScreen = ({ navigation }: { navigation?: any }) => {
  const logout = useAuthStore((s) => s.logout);
  const profile = useFinanceStore((s) => s.profile);
  const setProfile = useFinanceStore((s) => s.setProfile);
  
  const [income, setIncome] = useState(profile.income ? String(profile.income) : "");
  const [goal, setGoal] = useState(profile.savingsGoal ? String(profile.savingsGoal) : "20");
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    await setProfile({ ...profile, income: Number(income), savingsGoal: Number(goal) });
    setLoading(false);
    if (Platform.OS === 'web') window.alert("Profile settings saved.");
    else Alert.alert("Success", "Profile settings saved.");
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
            <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Settings</Text>
            <Text className="text-3xl font-extrabold text-gray-900">Profile</Text>
          </View>
        </View>
      }
    >

      <Card title="Financial Profile" className="mb-4">
        <Input
          label="Monthly Income (₹)"
          value={income}
          onChangeText={setIncome}
          placeholder="0.00"
          keyboardType="numeric"
        />
        <Input
          label="Savings Goal (%)"
          value={goal}
          onChangeText={setGoal}
          placeholder="20"
          keyboardType="numeric"
        />
        <Button title="Save Profile" onPress={onSave} loading={loading} className="mt-4" />
      </Card>
      
      <View className="px-2 mt-4 text-center items-center gap-4">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2">
           <Text className="text-2xl">🔒</Text>
        </View>
        <Text className="text-sm text-gray-500 text-center px-4 leading-5 text-balance">
          Session and auth tokens are securely persisted via Expo SecureStore. Your data is synced automatically.
        </Text>
        
        <View className="w-full mt-6">
          <Button 
            title="Log Out" 
            variant="danger" 
            onPress={() => {
              if (Platform.OS === 'web') {
                if (window.confirm("Are you sure you want to log out?")) {
                  logout();
                }
              } else {
                Alert.alert(
                  "Log Out",
                  "Are you sure you want to log out?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Log Out", style: "destructive", onPress: logout }
                  ]
                );
              }
            }} 
          />
        </View>
      </View>
      
      <View className="h-6" />
    </ScreenContainer>
  );
};
