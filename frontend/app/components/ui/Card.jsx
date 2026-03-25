import React from "react";
<<<<<<< HEAD
import { View, StyleSheet } from "react-native";

export default function Card({ children, className = "", style }) {
  return (
    <View 
      className={className}
      style={[styles.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  }
});
=======
import { View } from "react-native";

export default function Card({ children, className = "" }) {
  return (
    <View className={`bg-card rounded-2xl p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}
>>>>>>> feat/settings-page
