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

SplashScreen.preventAutoHideAsync();

// 🔹 Loading screen propre
function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" />
    </View>
  );
}

// 🔹 AuthGate
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
  const [loaded] = useFonts({
    NunitoRegular: require("../assets/fonts/Nunito-Regular.ttf"),
    NunitoMedium: require("../assets/fonts/Nunito-Medium.ttf"),
    NunitoSemiBold: require("../assets/fonts/Nunito-SemiBold.ttf"),
    NunitoBold: require("../assets/fonts/Nunito-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <LanguageProvider>
      <UserProvider>
        <SafeAreaView className="flex-1 bg-background">
          <AuthGate />
        </SafeAreaView>
      </UserProvider>
    </LanguageProvider>
  );
}