import React from "react";
import { Text } from "react-native";

export default function AppTitle({ children, className = "" }) {
  return (
    <Text className={`text-2xl font-semibold text-foreground ${className}`}>
      {children}
    </Text>
  );
}