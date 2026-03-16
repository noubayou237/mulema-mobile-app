import React from "react";
import { View, Text, TextInput } from "react-native";

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  autoCapitalize = "none",
  keyboardType = "default",
  error,
}) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1">
          {label}
        </Text>
      )}

      <TextInput
        className={`bg-card border rounded-xl px-4 py-3 text-foreground ${
          error ? "border-destructive" : "border-border"
        }`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />

      {error && (
        <Text className="text-destructive text-xs mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}