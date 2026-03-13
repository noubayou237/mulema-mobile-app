// app/standalone/_layout.jsx
import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import Header from "../components/header";
import BottomNav from "../components/bottom";
import { usePathname } from "expo-router";

export default function StandaloneLayout() {
  const pathname = usePathname();

  // Determine active key based on current pathname
  const getActiveKey = () => {
    if (pathname?.includes("profile")) return "profile";
    if (pathname?.includes("notifications")) return "notifications";
    if (pathname?.includes("stats")) return "stats";
    return "profile";
  };

  // Don't show header on profile page
  const showHeader = !pathname?.includes("/profile");

  return (
    <View style={{ flex: 1 }}>
      {showHeader && <Header />}
      <Stack screenOptions={{ headerShown: false }} />
      <BottomNav activeKey={getActiveKey()} />
    </View>
  );
}
