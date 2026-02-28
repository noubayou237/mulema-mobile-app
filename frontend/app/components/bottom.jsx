// components/bottom.jsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function BottomNav({ activeKey = "home" }) {
  const router = useRouter();
  const { t } = useTranslation();

  const items = [
    { key: "home", label: t("nav.home"), icon: "home-outline", lib: "ion" },
    { key: "lessons", label: t("nav.lessons"), icon: "book-open-outline" },
    { key: "exercices", label: t("nav.exercises"), icon: "medal-outline" },
    { key: "community", label: t("nav.community"), icon: "account-group-outline" }
  ];

  return (
    <View className="w-full border-t border-border bg-card">
      <View className="flex-row justify-around items-center h-16">
        {items.map((item) => {
          const active = item.key === activeKey;
          const colorClass = active ? "text-primary" : "text-muted-foreground";

          const IconComponent =
            item.lib === "ion" ? Ionicons : MaterialCommunityIcons;

          return (
            <TouchableOpacity
              key={item.key}
              className="flex-1 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.push(`/${item.key}`)} // 🔥 push au lieu de replace
            >
              <View className="items-center relative">
                <IconComponent
                  name={item.icon}
                  size={24}
                  color={active ? "#FF0000" : "#6B7280"}
                />

                <Text className={`text-xs font-medium mt-1 ${colorClass}`}>
                  {item.label}
                </Text>

                {active && (
                  <View className="absolute -bottom-2 w-6 h-1 bg-primary rounded-full" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}