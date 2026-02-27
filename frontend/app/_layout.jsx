// app/_layout.jsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import "../global.css";

// Initialize i18n
import "../src/i18n";

// Contexts (ATTENTION : fichiers placés hors du dossier `app/`, par ex. src/context/)
import { LanguageProvider } from "../src/context/LanguageContext"; // named export
import UserProvider from "../src/context/UserContext"; // default export expected

// Error handling note:
// - expo-av is deprecated; migrate to expo-audio for audio functionality
// - Global ErrorUtils is not available in newer Expo/React Native versions
// - If you need error boundaries, use React's ErrorBoundary component pattern

export default function RootLayout() {
  // Children wrapper common to both branches
  const AppChildren = (
    <UserProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* Slot doit être rendu immédiatement pour que le routeur fonctionne */}
        <Slot />
      </SafeAreaView>
    </UserProvider>
  );

  return <LanguageProvider>{AppChildren}</LanguageProvider>;
}
