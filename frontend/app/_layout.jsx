// app/_layout.jsx
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

import "../global.css";
import "../src/i18n";

import { LanguageProvider } from "../src/context/LanguageContext";
import UserProvider from "../src/context/UserContext";

SplashScreen.preventAutoHideAsync();

// 🔹 Loading screen with error handling
function LoadingScreen({ error = false }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color='#FF0000' />
      {error && <Text style={styles.errorText}>Failed to load fonts</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F5F5"
  },
  errorText: {
    marginTop: 16,
    color: "#FF382B",
    fontSize: 14
  }
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NunitoRegular: require("../assets/fonts/Nunito-Regular.ttf"),
    NunitoMedium: require("../assets/fonts/Nunito-Medium.ttf"),
    NunitoSemiBold: require("../assets/fonts/Nunito-SemiBold.ttf"),
    NunitoBold: require("../assets/fonts/Nunito-Bold.ttf")
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading screen only while fonts are loading
  // If there's a font error, we still proceed (fonts will use system default)
  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <UserProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#F9F5F5" }}
            edges={["left", "right"]}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name='splash' />
              <Stack.Screen name='ChoiceLanguage' />
              <Stack.Screen name='PageVideo' />
              <Stack.Screen name='(auth)' />
              <Stack.Screen name='(tabs)' />
            </Stack>
          </SafeAreaView>
        </UserProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
