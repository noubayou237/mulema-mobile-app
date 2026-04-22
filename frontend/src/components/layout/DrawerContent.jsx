import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Colors, Typo, Space, Radius, Shadow } from "../../theme/tokens";

const RED = Colors.primary;
const RED_L = Colors.primary + "15";
const GREEN = Colors.success || "#2E7D32";
const GOLD = Colors.secondaryContainer || "#FD9D1A";

const DrawerItem = ({ icon, label, onPress, highlighted }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[dr.menuItem, highlighted && dr.menuItemHL]}
  >
    <View style={[dr.menuIcon, highlighted && { backgroundColor: RED_L }]}>
      <Ionicons
        name={icon}
        size={20}
        color={highlighted ? RED : Colors.textTertiary}
      />
    </View>
    <Text style={[Typo.titleSm, {
      marginLeft: Space.lg,
      color: highlighted ? RED : Colors.onSurface,
    }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const DrawerContent = ({ user, dashboard, onClose, onNav, onLogout }) => {
  const { t } = useTranslation();
  return (
    <View style={dr.container}>
      {/* Bande décorative en haut */}
      <View style={dr.topStripe} />

      <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={dr.closeBtn}>
        <Ionicons name="close" size={22} color={Colors.onSurface} />
      </TouchableOpacity>

      {/* Profil */}
      <View style={dr.profileRow}>
        <View style={dr.avatarRing}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={dr.avatar} contentFit="cover" />
          ) : (
            <View style={[dr.avatar, { backgroundColor: RED_L, alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="person" size={28} color={RED} />
            </View>
          )}
        </View>
        <View style={{ marginLeft: Space.lg, flex: 1 }}>
          <Text style={[Typo.titleLg, { color: Colors.onSurface }]} numberOfLines={1}>
            {user?.name || t("common.user")}
          </Text>
          <View style={dr.levelBadge}>
            <Ionicons name="star" size={11} color={GOLD} />
            <Text style={[Typo.labelSm, { color: RED, marginLeft: 4 }]}>
              {t("home.scholarLevel", { level: Math.floor((dashboard?.totalPoints || 0) / 100) })}
            </Text>
          </View>
        </View>
      </View>

      {/* Streak (Racines) */}
      <View style={dr.streakBadge}>
        <Ionicons name="leaf" size={15} color={GREEN} />
        <Text style={[Typo.labelLg, { color: Colors.onSurface, marginLeft: Space.sm }]}>
          {t("stats.rootsCount", { count: dashboard?.streakDays || 0 })}
        </Text>
      </View>

      <View style={dr.divider} />

      <Text style={[Typo.labelSm, { color: Colors.textTertiary, marginBottom: Space.md }]}>
        {t("common.quickAccess")}
      </Text>

      <DrawerItem icon="ribbon-outline" label={t("nav.quests")} onPress={() => onNav("quests")} />
      <DrawerItem icon="notifications-outline" label={t("settings.notifications")} onPress={() => onNav("notifications")} />
      <DrawerItem icon="language-outline" label={t("settings.language")} onPress={() => onNav("change-language")} />
      <DrawerItem icon="settings-outline" label={t("settings.title")} onPress={() => onNav("settings")} highlighted />

      <View style={{ flex: 1 }} />

      <TouchableOpacity onPress={onLogout} activeOpacity={0.7} style={dr.logoutBtn}>
        <Ionicons name="log-out-outline" size={18} color={RED} />
        <Text style={[Typo.titleSm, { color: RED, marginLeft: Space.md }]}>
          {t("profile.logout")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const dr = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Space["4xl"],
    paddingTop: 40,
  },
  topStripe: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 6,
    backgroundColor: RED,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: Space.sm,
    marginBottom: Space.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Space["2xl"],
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: RED_L,
    padding: 2,
  },
  avatar: {
    flex: 1,
    borderRadius: 30,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: RED_L,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN + "10",
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    marginBottom: Space["2xl"],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceVariant,
    marginBottom: Space["2xl"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
    borderRadius: Radius.lg,
    marginBottom: Space.sm,
  },
  menuItemHL: {
    backgroundColor: RED_L + "10",
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
  },
});
