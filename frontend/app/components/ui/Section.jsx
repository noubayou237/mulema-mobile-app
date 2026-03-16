import React from "react";
import { View } from "react-native";

export default function Section({ children, className = "" }) {
  return (
    <View className={`mb-6 ${className}`}>
      {children}
    </View>
  );
}