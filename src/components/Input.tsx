import { TextInput, TextInputProps, View, Text } from "react-native";
import { cn } from "../utils/styles";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
};

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <View className="mb-4 w-full">
      {label && <Text className="text-gray-700 font-medium mb-1.5 ml-1">{label}</Text>}
      <TextInput
        placeholderTextColor="#9ca3af"
        className={cn(
          "w-full bg-surface-light border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900",
          "focus:border-primary-500 focus:bg-white",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1.5 ml-1">{error}</Text>}
    </View>
  );
};
