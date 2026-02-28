import React from "react";
import { View } from "react-native";

export default function Card({ children, className = "" }) {
  return (
    <View className={`bg-card rounded-2xl p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}