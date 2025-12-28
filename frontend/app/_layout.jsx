// app/_layout.jsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { COLORS } from "../constants/colors";

// Contexts (ATTENTION : fichiers placés hors du dossier `app/`, par ex. src/context/)
import { LanguageProvider } from "../src/context/LanguageContext"; // named export
import UserProvider from "../src/context/UserContext"; // default export expected

// Clerk (optionnel si tu l'utilises)
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

export default function RootLayout() {
  const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey;

  if (!publishableKey) {
    // On log ici mais on laisse l'app continuer à monter.
    // Cela évite l'erreur "Attempted to navigate before mounting the Root Layout component"
    // si Clerk est mal configuré pendant le dev.
    console.warn(
      "⚠️ Clerk publishableKey not found — ClerkProvider will be skipped. Vérifie ton .env ou app.config.js (expoConfig.extra.clerkPublishableKey)."
    );
  }

  // children wrapper common to both branches
  const AppChildren = (
    <UserProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {/* Slot doit être rendu immédiatement pour que le routeur fonctionne */}
        <Slot />
      </SafeAreaView>
    </UserProvider>
  );

  return (
    <LanguageProvider>
      {/* Si publishableKey présent, on enveloppe avec ClerkProvider.
          Sinon on rend juste les children pour garantir le montage du Slot. */}
      {publishableKey ? (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          {AppChildren}
        </ClerkProvider>
      ) : (
        AppChildren
      )}
    </LanguageProvider>
  );
}
