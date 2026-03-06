// components/header.jsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";

export default function Header({ pageName }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();

  const [showWelcome, setShowWelcome] = useState(true);

  // 🟢 Affichage welcome pendant 5 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timer);
  }, []);

  // 🟢 Nom utilisateur dynamique
  const username =
    user?.firstName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  // 🟢 Nom de la page si welcome disparu
  const getPageTitle = () => {
    if (pageName) return pageName;

    switch (pathname) {
      case "/home":
        return t("nav.home");
      case "/lessons":
        return t("nav.lessons");
      case "/exercices":
        return t("nav.exercises");
      case "/community":
        return t("nav.community");
      default:
        return "Mulema";
    }
  };

  const goToProfile = () => {
    router.push("/standalone/profile");
  };

  const goToNotifications = () => {
    router.push("/standalone/notification");
  };

  return (
    <View className="h-16 px-6 flex-row items-center justify-between bg-card border-b border-border">

      {/* LEFT */}
      <View>
        {showWelcome ? (
          <View>
            <Text className="text-base font-regular text-foreground">
              {t("header.welcome")},{" "}
              <Text className="font-bold">{username}</Text> !
            </Text>
            <View className="h-[2px] bg-primary mt-1 w-full rounded-full" />
          </View>
        ) : (
          <Text className="text-xl font-semibold text-foreground">
            {getPageTitle()}
          </Text>
        )}
      </View>

      {/* RIGHT ICONS */}
      <View className="flex-row items-center gap-4">

        {/* Coris */}
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/images/colla.png")}
            className="w-7 h-7"
            resizeMode="contain"
          />
          <Text className="ml-1 text-sm font-bold text-primary">
            05
          </Text>
        </View>

        {/* Notification */}
        <TouchableOpacity
          onPress={goToNotifications}
          activeOpacity={0.7}
          className="relative"
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={24}
            color="#111"
          />
          <View className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full border border-card" />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          onPress={goToProfile}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={30}
            color="#444"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}