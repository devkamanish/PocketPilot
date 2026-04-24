import { useState } from "react";
import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();

  const onSubmit = async () => {
    const ok = await register(email.trim(), password);
    if (ok) navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-surface-dim" 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
             <Text className="text-primary-600 text-2xl font-bold">✨</Text>
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">Create Account</Text>
          <Text className="text-base text-gray-500 mt-2 text-center">Join PocketPilot and take control of your finances</Text>
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
          <Input
            label="Password"
            placeholder="Create a strong password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text className="text-red-500 text-sm mt-1 mb-3 text-center font-medium">{error}</Text> : null}
          
          <Button 
            title="Sign up" 
            onPress={onSubmit} 
            loading={loading} 
            className="mt-4"
          />
        </View>

        <View className="mt-8 items-center">
          <Button 
            variant="ghost" 
            title="Already have an account? Log in" 
            onPress={() => navigation.navigate("Login")} 
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
