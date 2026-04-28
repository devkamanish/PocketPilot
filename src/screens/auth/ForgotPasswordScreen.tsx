import { useState } from "react";
import { Alert, Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ForgotPasswordScreen = ({ navigation }: { navigation: any }) => {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const onReset = async () => {
    setLoading(true);
    const ok = await forgotPassword(email.trim());
    setLoading(false);
    if (ok) {
      Alert.alert("Reset link sent", "Check your email to reset your password.");
      navigation.navigate("Login");
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-surface-dim" 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
             <Text className="text-primary-600 text-2xl font-bold">🔒</Text>
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">Reset Password</Text>
          <Text className="text-base text-gray-500 mt-2 text-center text-balance">
            Enter your email and we&apos;ll send you a link to reset your password
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <Input 
            label="Email Address" 
            placeholder="you@example.com" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button 
            title="Send reset link" 
            onPress={onReset} 
            loading={loading}
            className="mt-4"
          />
        </View>

        <View className="mt-8 items-center">
          <Button 
            variant="ghost" 
            title="Back to login" 
            onPress={() => navigation.navigate("Login")} 
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
