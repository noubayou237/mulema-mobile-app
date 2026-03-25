import React from "react";
<<<<<<< HEAD
import { TouchableOpacity, Text, StyleSheet } from "react-native";
=======
import { TouchableOpacity, Text } from "react-native";
>>>>>>> feat/settings-page

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
<<<<<<< HEAD
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
=======
  textClassName = ""
}) {
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-border bg-transparent"
  };

  // Determine text color based on variant and custom textClassName
  const getTextColor = () => {
    if (textClassName && textClassName.includes("text-white")) {
      return "text-white";
    }
    if (variant === "outline") {
      return "text-foreground";
    }
    return "text-primary-foreground";
>>>>>>> feat/settings-page
  };

  return (
    <TouchableOpacity
      onPress={onPress}
<<<<<<< HEAD
      disabled={loading || disabled}
      activeOpacity={0.8}
      style={[styles.button, getButtonStyle(), style]}
    >
      <Text style={[styles.text, getTextStyle()]}>
=======
      disabled={loading}
      activeOpacity={0.8}
      className={`py-3 rounded-xl items-center ${
        loading ? "bg-muted" : variants[variant]
      }`}
    >
      <Text className={`font-semibold ${textClassName || getTextColor()}`}>
>>>>>>> feat/settings-page
        {loading ? "Chargement..." : title}
      </Text>
    </TouchableOpacity>
  );
}
<<<<<<< HEAD

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
=======
>>>>>>> feat/settings-page
