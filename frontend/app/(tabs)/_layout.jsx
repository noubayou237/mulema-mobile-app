// app/(tabs)/_layout.jsx
import React, { useEffect } from "react";
import { View, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/header";
import BottomNav from "../components/bottom";
import { COLORS } from "../../constants/colors";
import { useUser } from "../../src/context/UserContext";

/**
 * Tabs layout centralisé :
 * - redirige vers (auth)/sign-in si pas connecté
 * - affiche un Header réutilisable (avec logout à droite)
 * - cache la tabBar native et affiche BottomNav personnalisé
 */

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading, logout } = useUser();

  // 🔐 Protection des tabs
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoading, user]);

  // ⏳ Pendant le chargement du contexte
  if (isLoading || !user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background ?? "#fff",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // logout handler avec confirmation (backend)
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error("Logout error:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // segment actif pour Header + BottomNav
  const activeSegment = segments[segments.length - 1] || "home";

  const headerRight = (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginRight: 6,
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="log-out-outline" size={18} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background ?? "#fff" }}>
      {/* Header commun */}
      <Header title={titleForSegment(activeSegment)} right={headerRight} />

      {/* Tabs (tabBar native cachée) */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="lessons" options={{ title: "Lessons" }} />
        <Tabs.Screen name="exercices" options={{ title: "Exercices" }} />
        <Tabs.Screen name="community" options={{ title: "Community" }} />
      </Tabs>

      {/* Bottom navigation custom */}
      <BottomNav activeKey={activeSegment} />
    </View>
  );
}

/* Helper pour le titre du Header */
function titleForSegment(seg) {
  switch (seg) {
    case "home":
      return "Home";
    case "lessons":
      return "Lessons";
    case "exercices":
      return "Exercices";
    case "community":
      return "Community";
    default:
      return "Home";
  }
}
