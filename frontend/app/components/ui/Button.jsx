import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
  textClassName = "",
  style,
  disabled
}) {
  const getButtonStyle = () => {
    if (loading || disabled) {
      return styles.buttonDisabled;
    }
    switch (variant) {
      case "secondary":
        return styles.buttonSecondary;
      case "outline":
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    if (textClassName && textClassName.includes("text-white")) {
      return styles.textWhite;
    }
    if (variant === "outline") {
      return styles.textOutline;
    }
    return styles.textPrimary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      style={[styles.button, getButtonStyle(), style]}
    >
      <Text style={[styles.text, getTextStyle()]}>
        {loading ? "Chargement..." : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonPrimary: {
    backgroundColor: "#D32F2F"
  },
  buttonSecondary: {
    backgroundColor: "#6B6B6B"
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#F3E8E8",
    backgroundColor: "transparent"
  },
  buttonDisabled: {
    backgroundColor: "#E0E0E0"
  },
  text: {
    fontWeight: "600"
  },
  textWhite: {
    color: "#FFFFFF"
  },
  textOutline: {
    color: "#050303"
  },
  textPrimary: {
    color: "#FFFFFF"
  }
});
