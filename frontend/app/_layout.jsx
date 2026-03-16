
// app/_layout.jsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator } from "react-native";

import "../global.css";
import "../src/i18n";

import { LanguageProvider } from "../src/context/LanguageContext";
import UserProvider, { useUser } from "../src/context/UserContext";

// Empêche le splash de disparaître avant que l'app soit prête
SplashScreen.preventAutoHideAsync().catch(() => {});

// Loading screen
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// AuthGate : décide si l'utilisateur est connecté
function AuthGate() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NunitoRegular: require("../assets/fonts/Nunito-Regular.ttf"),
    NunitoMedium: require("../assets/fonts/Nunito-Medium.ttf"),
    NunitoSemiBold: require("../assets/fonts/Nunito-SemiBold.ttf"),
    NunitoBold: require("../assets/fonts/Nunito-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // Attendre que les fonts soient chargées
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <LanguageProvider>
      <UserProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <AuthGate />
        </SafeAreaView>
      </UserProvider>
    </LanguageProvider>
  );
}
