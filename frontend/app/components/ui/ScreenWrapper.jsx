
import React from "react";
import { View } from "react-native";

export default function ScreenWrapper({ children, className = "" }) {
  return (
    <View className={`flex-1 bg-background px-6 ${className}`}>
      {children}
    </View>
  );
}