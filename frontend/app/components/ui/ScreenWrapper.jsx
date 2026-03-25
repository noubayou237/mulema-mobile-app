import React from "react";
import { View, StyleSheet } from "react-native";

export default function ScreenWrapper({ children, className = "", style }) {
  return (
    <View className={className} style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F5F5",
    paddingHorizontal: 24
  }
});
