import { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import { cn } from "../utils/styles";

type Props = PropsWithChildren<{ title?: string; className?: string }>;

export const Card = ({ title, className, children }: Props) => (
  <View className={cn("bg-white rounded-2xl p-5 shadow-sm border border-gray-100", className)}>
    {title ? <Text className="text-lg font-bold text-gray-900 mb-3">{title}</Text> : null}
    {children}
  </View>
);
