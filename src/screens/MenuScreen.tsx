import { View, Text, TouchableOpacity } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { useNavigation } from "@react-navigation/native";

const MenuItem = ({ icon, title, subtitle, onPress }: any) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} className="flex-row items-center bg-white p-5 rounded-3xl mb-3 shadow-sm border border-gray-100">
    <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center mr-4">
      <Text className="text-2xl">{icon}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-lg font-extrabold text-gray-900 mb-0.5">{title}</Text>
      <Text className="text-sm text-gray-500">{subtitle}</Text>
    </View>
    <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
      <Text className="text-gray-400 font-bold text-lg">›</Text>
    </View>
  </TouchableOpacity>
);

export const MenuScreen = () => {
  const nav = useNavigation<any>();
  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">More</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Menu</Text>
        </View>
      }
    >
      <View className="mt-2">
        <MenuItem 
          icon="🔁" 
          title="Subscriptions" 
          subtitle="Manage your recurring expenses" 
          onPress={() => nav.navigate("Subscriptions")} 
        />
        <MenuItem 
          icon="✨" 
          title="AI Insights" 
          subtitle="Smart spending analysis" 
          onPress={() => nav.navigate("Insights")} 
        />
        <MenuItem 
          icon="👤" 
          title="Profile & Settings" 
          subtitle="Account limits and goals" 
          onPress={() => nav.navigate("Profile")} 
        />
      </View>
    </ScreenContainer>
  );
};
