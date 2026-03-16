import React from "react";
import { Text, StyleSheet } from "react-native";

export default function AppText({
  children,
  variant = "body",
  className = "",
  style
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case "muted":
        return styles.muted;
      case "small":
        return styles.small;
      case "danger":
        return styles.danger;
      default:
        return styles.body;
    }
  };

  return (
    <Text className={`${className}`} style={[getVariantStyle(), style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: "#050303"
  },
  muted: {
    fontSize: 14,
    color: "#6B6B6B"
  },
  small: {
    fontSize: 12,
    color: "#6B6B6B"
  },
  danger: {
    fontSize: 14,
    color: "#D32F2F"
  }
});
