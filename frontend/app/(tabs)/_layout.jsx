// app/(tabs)/_layout.jsx
import React, { useEffect, useState } from "react";
import { View, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/header";
import BottomNav from "../components/bottom";
import { COLORS } from "../../constants/colors";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

/**
 * Tabs layout centralisé :
 * - redirige vers (auth)/sign-in si pas connecté
 * - affiche un Header réutilisable (avec logout à droite)
 * - cache la tabBar native et affiche BottomNav personnalisé
 */

export default function TabsLayout() {
  const router = useRouter();
  // ⏳ Pendant le chargement du contexte - mais autoriser si session + langue
  const [hasSessionAndLang, setHasSessionAndLang] = useState(false);
  const segments = useSegments();
  const { user, isLoading, logout } = useUser();
  const { t } = useTranslation();

  // 🔐 Protection des tabs - Wait for auth validation before checking
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return; // Wait for auth to finish loading

      // Check if user has a session in storage even if not validated yet
      const hasSession = await AsyncStorage.getItem("userSession");
      const hasLanguage = await AsyncStorage.getItem("selectedLanguage");

      // If no user after loading, but has session with language, allow access
      // The user will be validated later
      if (!user && hasSession && hasLanguage) {
        // User has completed initial setup, allow access
        return;
      }

      // Normal auth check
      if (!user) {
        router.replace("/(auth)/sign-in");
      }
    };

    checkAuth();
  }, [isLoading, user]);

  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem("userSession");
      const lang = await AsyncStorage.getItem("selectedLanguage");
      if (session && lang) {
        setHasSessionAndLang(true);
      }
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background ?? "#fff"
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    );
  }

  // Allow access if user is logged in OR if there's a session with language (initial setup complete)
  if (!user && !hasSessionAndLang) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background ?? "#fff"
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    );
  }

  // logout handler avec confirmation (backend)
  const handleLogout = () => {
    Alert.alert(
      t("profile.logout"),
      t("profile.logoutConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error("Logout error:", err);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  // segment actif pour Header + BottomNav
  const activeSegment = segments[segments.length - 1] || "home";

  // Get translated title for the header
  const getTitle = () => {
    switch (activeSegment) {
      case "home":
        return t("nav.home");
      case "lessons":
        return t("nav.lessons");
      case "exercices":
        return t("nav.exercises");
      case "community":
        return t("nav.community");
      default:
        return t("nav.home");
    }
  };

  const headerRight = (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginRight: 6,
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20
      }}
      activeOpacity={0.8}
    >
      <Ionicons name='log-out-outline' size={18} color='#fff' />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background ?? "#fff" }}>
      {/* Header commun */}
      <Header title={getTitle()} right={headerRight} />

      {/* Tabs (tabBar native cachée) */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }
        }}
      >
        <Tabs.Screen name='home' options={{ title: "Home" }} />
        <Tabs.Screen name='lessons' options={{ title: "Lessons" }} />
        <Tabs.Screen name='exercices' options={{ title: "Exercices" }} />
        <Tabs.Screen name='community' options={{ title: "Community" }} />
      </Tabs>

      {/* Bottom navigation custom */}
      <BottomNav activeKey={activeSegment} />
    </View>
  );
}
