/**
 * MULEMA — Root _layout.jsx
 * Providers + Auth guard + Language check + Font loading
 */

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
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

// Stores
import { useAuthStore } from "../src/stores/useAuthStore";
import { useLanguageStore } from "../src/stores/useLanguageStore";
import api from "../src/services/api";

// Tokens
import { Colors } from "../src/theme/tokens";

// Background music
import { useBackgroundMusic } from "../src/hooks/useBackgroundMusic";
import OfflineBanner from "../src/components/ui/OfflineBanner";

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

  // Ping Railway every 4 minutes so it never cold-starts mid-session
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => { api.get("/").catch(() => {}); }, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

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
    <AuthGate>
      <OfflineBanner />
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
        <Stack.Screen
          name="modal/story-video"
          options={{ presentation: "fullScreenModal", animation: "fade", headerShown: false }}
        />
      </Stack>
    </AuthGate>
  );
}

// Expo Router picks up this named export and uses it as the error boundary
// for the entire navigator tree. Catches unhandled JS errors in any screen.
export function ErrorBoundary({ error, retry }) {
  const { t } = useTranslation();
  return (
    <View style={s.errorContainer}>
      <Text style={s.errorTitle}>{t("errors.somethingWentWrong")}</Text>
      <Text style={s.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={retry}>
        <Text style={s.retryText}>{t("common.retry")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.onSurface,
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    color: Colors.textTertiary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  retryText: {
    fontSize: 15,
    fontFamily: "Fredoka_600SemiBold",
    color: "#FFF",
  },
});
