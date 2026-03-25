import React from "react";
<<<<<<< HEAD
import { Text, StyleSheet } from "react-native";

export default function AppTitle({ children, className = "", style }) {
  return (
    <Text
      className={`text-2xl font-semibold text-foreground ${className}`}
      style={[styles.title, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#050303"
  }
});
=======
import { Text } from "react-native";

export default function AppTitle({ children, className = "" }) {
  return (
    <Text className={`text-2xl font-semibold text-foreground ${className}`}>
      {children}
    </Text>
  );
}
>>>>>>> feat/settings-page
