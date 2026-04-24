import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenContainerProps = PropsWithChildren & {
  header?: ReactNode;
};

export const ScreenContainer = ({ children, header }: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top + 20 }}>
      {header && <View className="px-4 pb-3 bg-[#f9fafb] z-10 border-b border-gray-100">{header}</View>}
      <ScrollView 
        contentContainerStyle={{ 
          padding: 16, 
          paddingBottom: insets.bottom + 140,
          gap: 16
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
};
