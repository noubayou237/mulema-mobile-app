import React from "react";
import { Text } from "react-native";

export default function AppText({
  children,
  variant = "body",
  className = "",
}) {
  const variants = {
    body: "text-base text-foreground",
    muted: "text-sm text-muted-foreground",
    small: "text-xs text-muted-foreground",
    danger: "text-sm text-destructive",
  };

  return (
    <Text className={`${variants[variant]} ${className}`}>
      {children}
    </Text>
  );
}