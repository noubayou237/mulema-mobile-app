// app/_layout.jsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

// Contexts (ATTENTION : fichiers placés hors du dossier `app/`, par ex. src/context/)
import { LanguageProvider } from "../src/context/LanguageContext"; // named export
import UserProvider from "../src/context/UserContext"; // default export expected

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
