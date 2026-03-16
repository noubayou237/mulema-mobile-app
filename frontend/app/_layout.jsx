
// app/_layout.jsx
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../src/constants/colors";

// Initialize i18n
import "../src/i18n";

// Contexts
import { LanguageProvider } from "../src/context/LanguageContext";
import UserProvider from "../src/context/UserContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <UserProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </UserProvider>
    </LanguageProvider>
  );
}
