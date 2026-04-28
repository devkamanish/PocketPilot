import { useState } from "react";
import { Text, View, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();

  const onSubmit = async () => {
    await login(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-surface-dim" 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-500 rounded-3xl items-center justify-center shadow-md mb-6 transform rotate-3">
             <Text className="text-white text-3xl font-bold">PP</Text>
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">Welcome back</Text>
          <Text className="text-base text-gray-500 mt-2 text-center">Enter your details to pick up where you left off</Text>
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
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text className="text-red-500 text-sm mt-1 mb-3 text-center font-medium">{error}</Text> : null}
          
          <Button 
            title="Log in" 
            onPress={onSubmit} 
            loading={loading} 
            className="mt-4"
          />
        </View>

        <View className="mt-8 gap-4 flex-col">
          <Button 
            variant="ghost" 
            title="Forgot password?" 
            onPress={() => navigation.navigate("ForgotPassword")} 
          />
          <Button 
            variant="ghost" 
            title="Don't have an account? Sign up" 
            onPress={() => navigation.navigate("Register")} 
            className="text-gray-600"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
