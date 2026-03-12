import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
  textClassName = ""
}) {
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-border bg-transparent"
  };

  // Determine text color based on variant and custom textClassName
  const getTextColor = () => {
    if (textClassName && textClassName.includes("text-white")) {
      return "text-white";
    }
    if (variant === "outline") {
      return "text-foreground";
    }
    return "text-primary-foreground";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      className={`py-3 rounded-xl items-center ${
        loading ? "bg-muted" : variants[variant]
      }`}
    >
      <Text className={`font-semibold ${textClassName || getTextColor()}`}>
        {loading ? "Chargement..." : title}
      </Text>
    </TouchableOpacity>
  );
}
