// app/(tabs)/_layout.jsx
import React from "react";
import { View, Alert, TouchableOpacity } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";

import Header from "../components/header";
import BottomNav from "../components/bottom";

export default function TabsLayout() {
  const segments = useSegments();
  const { logout } = useUser();
  const { t } = useTranslation();

  const activeSegment = segments[segments.length - 1] || "home";

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
            await logout();
          }
        }
      ],
      { cancelable: true }
    );
  };

  const headerRight = (
    <TouchableOpacity
      onPress={handleLogout}
      className="mr-2 bg-primary p-2 rounded-full"
      activeOpacity={0.8}
    >
      <Ionicons name="log-out-outline" size={18} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <Header pageName={getTitle()} right={headerRight} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="lessons" />
        <Tabs.Screen name="exercices" />
        <Tabs.Screen name="community" />
      </Tabs>

      <BottomNav activeKey={activeSegment} />
    </View>
  );
}