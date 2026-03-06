import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
}) {
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-border bg-transparent",
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
      <Text
        className={`font-semibold ${
          variant === "outline"
            ? "text-foreground"
            : "text-primary-foreground"
        }`}
      >
        {loading ? "Chargement..." : title}
      </Text>
    </TouchableOpacity>
  );
}