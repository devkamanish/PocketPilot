import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { cn } from "../utils/styles";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className,
}: ButtonProps) => {
  const baseClasses = "items-center justify-center rounded-xl flex-row overflow-hidden";
  
  const variantClasses = {
    primary: "bg-primary-600 active:bg-primary-700",
    secondary: "bg-surface-dim active:bg-gray-200",
    danger: "bg-red-500 active:bg-red-600",
    ghost: "bg-transparent active:bg-surface-dim",
  };

  const textClasses = {
    primary: "text-white font-semibold",
    secondary: "text-gray-900 font-semibold",
    danger: "text-white font-semibold",
    ghost: "text-primary-600 font-semibold",
  };

  const sizeClasses = {
    sm: "py-2 px-4 min-h-[36px]",
    md: "py-3 px-6 min-h-[48px]",
    lg: "py-4 px-8 min-h-[56px]",
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "white" : "#2563eb"} className="mr-2" />
      ) : null}
      <Text className={cn(textClasses[variant], size === "lg" ? "text-lg" : "text-base")}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
