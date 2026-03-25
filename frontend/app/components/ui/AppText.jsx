import React from "react";
<<<<<<< HEAD
import { Text, StyleSheet } from "react-native";
=======
import { Text } from "react-native";
>>>>>>> feat/settings-page

export default function AppText({
  children,
  variant = "body",
  className = "",
<<<<<<< HEAD
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
=======
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
>>>>>>> feat/settings-page
