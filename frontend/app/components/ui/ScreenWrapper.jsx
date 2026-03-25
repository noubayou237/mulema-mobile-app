<<<<<<< HEAD
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
=======

import React from "react";
import { View } from "react-native";

export default function ScreenWrapper({ children, className = "" }) {
  return (
    <View className={`flex-1 bg-background px-6 ${className}`}>
      {children}
    </View>
  );
}
>>>>>>> feat/settings-page
