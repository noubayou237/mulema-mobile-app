/**
 * MULEMA — Root _layout.jsx
 * Providers + Auth guard + Language check + Font loading
 */

import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";

// i18n
import "../src/i18n";
import { initializeLanguage } from "../src/i18n";

// Providers
import { LanguageProvider } from "../src/context/LanguageContext";
import UserProvider from "../src/context/UserContext";

// Stores
import { useAuthStore } from "../src/stores/useAuthStore";
import { useLanguageStore } from "../src/stores/useLanguageStore";

// Tokens
import { Colors } from "../src/theme/tokens";

// Background music
import { useBackgroundMusic } from "../src/hooks/useBackgroundMusic";

function AuthGate({ children }) {
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isSessionLoaded, loadSession } = useAuthStore();
  const { activeLanguage, hasSeenIntro, fetchLanguages, loadActiveLanguage } = useLanguageStore();

  const [isReady, setIsReady] = useState(false);

  // ── Background music (starts once authenticated) ──
  useBackgroundMusic();

  useEffect(() => { 
    initializeLanguage().then(() => loadSession());
  }, []);

  useEffect(() => {
    if (!isSessionLoaded) return;
    if (isAuthenticated) {
      fetchLanguages()
        .then(() => loadActiveLanguage())
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [isSessionLoaded, isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;
    const inAuth       = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";
    // ✅ FIX: explicitly check both group AND screen name so this guard is
    // robust regardless of future route nesting changes.
    const onPageVideo  = inOnboarding && segments[1] === "PageVideo";

    if (!isAuthenticated) {
      if (!inAuth) router.replace("/(auth)/sign-in");
    } else if (!activeLanguage) {
      // No language selected yet — must go through ChoiceLanguage
      if (!inOnboarding) router.replace("/(onboarding)/ChoiceLanguage");
    } else if (!hasSeenIntro) {
      // Language chosen but intro not watched — must go through PageVideo
      if (!onPageVideo) {
        router.replace(`/(onboarding)/PageVideo?lang=${encodeURIComponent(activeLanguage.code)}`);
      }
    } else {
      // Fully onboarded — send out of auth/onboarding zones
      if (inAuth || inOnboarding) router.replace("/(tabs)/home");
    }
  }, [isReady, isAuthenticated, activeLanguage, hasSeenIntro, segments]);

  if (!isReady) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    "Nunito-Regular":  require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Medium":   require("../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold":     require("../assets/fonts/Nunito-Bold.ttf"),
  });

  // Attendre que les polices soient chargées
  if (!fontsLoaded) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <UserProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal/change-language"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="modal/quests"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack>
        </AuthGate>
      </UserProvider>
    </LanguageProvider>
  );
}

const s = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
