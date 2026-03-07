import React, { useEffect, useRef } from "react";
import {
  View, TouchableOpacity, Text, StyleSheet,
  Platform, Animated, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

const { width } = Dimensions.get("window");
const TAB_COUNT = 5;
const TAB_W = width / TAB_COUNT;

// Duolingo color refs:
//   inactive icon/label : #AFAFAF  (medium gray, clearly visible on white)
//   active icon/label   : #D32F2F  (red accent)
//   active pill bg      : #FDECEA  (very light red tint)
//   top indicator bar   : #D32F2F

// ── Single nav item ────────────────────────────────────────────────────────
const NavItem = ({ item, active, onPress }) => {
  const iconScale = useRef(new Animated.Value(active ? 1.1 : 1)).current;
  const dotScale  = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const pillOp    = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pillW     = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, { toValue: active ? 1.12 : 1, tension: 140, friction: 7, useNativeDriver: true }),
      Animated.spring(dotScale,  { toValue: active ? 1 : 0,    tension: 160, friction: 7, useNativeDriver: true }),
      Animated.timing(pillOp,    { toValue: active ? 1 : 0,    duration: 180, useNativeDriver: false }),
      Animated.spring(pillW,     { toValue: active ? 1 : 0,    tension: 120, friction: 9, useNativeDriver: false }),
    ]).start();
  }, [active]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.84, tension: 400, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 200, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(item.key);
  };

  const isCenter = item.center;

  // Active = red, inactive = clearly visible medium gray (Duolingo-style)
  const iconColor  = active ? "#D32F2F" : "#AFAFAF";
  const labelColor = active ? "#D32F2F" : "#5E5E5E";

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.tab}>
      <Animated.View style={[s.tabInner, { transform: [{ scale: pressAnim }] }]}>

        {isCenter ? (
          /* ── FAB home button ── */
          <Animated.View style={[s.centerBtn, { transform: [{ scale: iconScale }] }]}>
            <LinearGradient
              colors={active ? ["#EF3B2C", "#B71C1C"] : ["#EFEFEF", "#E0DADA"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.centerGrad}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={26}
                color={active ? "#fff" : "#AFAFAF"}
              />
            </LinearGradient>
          </Animated.View>
        ) : (
          <>
            {/* Duolingo pill bg — light red tint when active */}
            <Animated.View style={[s.pill, {
              opacity: pillOp,
              width: pillW.interpolate({ inputRange: [0, 1], outputRange: [0, 48] }),
            }]} />

            <Animated.View style={[s.iconWrap, { transform: [{ scale: iconScale }] }]}>
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={24}
                color={iconColor}
              />
            </Animated.View>

            {item.badge && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.badge}</Text>
              </View>
            )}
          </>
        )}

        {/* Label — always visible, never transparent */}
        <Text style={[s.label, { color: labelColor, fontWeight: active ? "800" : "600" }]} numberOfLines={1}>
          {item.label}
        </Text>

        {/* Active underline dot */}
        {!isCenter && (
          <Animated.View style={[s.dot, { transform: [{ scale: dotScale }] }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Top sliding bar ────────────────────────────────────────────────────────
const TopBar = ({ activeIndex }) => {
  const tx = useRef(new Animated.Value(activeIndex * TAB_W + TAB_W / 2 - 20)).current;

  useEffect(() => {
    Animated.spring(tx, {
      toValue: activeIndex * TAB_W + TAB_W / 2 - 20,
      tension: 90, friction: 11,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <Animated.View style={[s.topBar, { transform: [{ translateX: tx }] }]} />
  );
};

// ── Main BottomNav ─────────────────────────────────────────────────────────
export default function BottomNav({ activeKey = "home" }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useTranslation();

  const mountY  = useRef(new Animated.Value(80)).current;
  const mountOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(mountY,  { toValue: 0, tension: 60, friction: 10, delay: 150, useNativeDriver: true }),
      Animated.timing(mountOp, { toValue: 1, duration: 350, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  const items = [
    {
      key: "lessons",
      label: t("nav.lessons"),
      icon: "book-outline",
      activeIcon: "book",
      route: "/lessons",
    },
    {
      key: "exercices",
      label: t("nav.exercises"),
      icon: "trophy-outline",
      activeIcon: "trophy",
      route: "/exercices",
      badge: "LANGUE",
    },
    {
      key: "home",
      label: t("nav.home"),
      icon: "home-outline",
      activeIcon: "home",
      route: "/home",
      center: true,
    },
    {
      key: "community",
      label: t("nav.community"),
      icon: "people-outline",
      activeIcon: "people",
      route: "/community",
    },
    {
      key: "profile",
      label: t("nav.profile") || "Profil",
      icon: "person-outline",
      activeIcon: "person",
      route: "standalone/profile",
    },
  ];

  const resolvedKey = activeKey || items.find(it => pathname?.includes(it.key))?.key || "home";
  const activeIndex = items.findIndex(it => it.key === resolvedKey);

  const handlePress = (key) => {
    const item = items.find(it => it.key === key);
    if (item) router.replace(item.route);
  };

  return (
    <Animated.View style={[s.wrapper, { transform: [{ translateY: mountY }], opacity: mountOp }]}>

      {/* Pure white background */}
      <View style={s.bg} />

      {/* Top hairline border */}
      <View style={s.hairline} />

      {/* Red sliding top indicator */}
      <TopBar activeIndex={activeIndex >= 0 ? activeIndex : 2} />

      <View style={s.row}>
        {items.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={item.key === resolvedKey}
            onPress={handlePress}
          />
        ))}
      </View>

      {Platform.OS === "ios" && <View style={s.safeArea} />}
    </Animated.View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    zIndex: 200,
    // Subtle shadow — Duolingo uses a clean drop shadow
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 16,
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },

  // Duolingo hairline separator
  hairline: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: "#E5E5E5",
    zIndex: 2,
  },

  // Sliding red indicator on top
  topBar: {
    position: "absolute",
    top: 0,
    width: 40, height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "#D32F2F",
    zIndex: 3,
  },

  row: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
  },

  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    position: "relative",
  },

  // Light red pill behind active icon
  pill: {
    position: "absolute",
    top: -2,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FDECEA",
    zIndex: 0,
    alignSelf: "center",
  },

  iconWrap: {
    zIndex: 1,
  },

  badge: {
    position: "absolute",
    top: -8, right: -16,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
    borderWidth: 2, borderColor: "#FFFFFF",
  },
  badgeText: { fontSize: 7, color: "#fff", fontWeight: "800" },

  // Label — clearly visible in ALL states
  label: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: 0.15,
  },

  // Small dot under active label
  dot: {
    marginTop: 3,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#D32F2F",
  },

  safeArea: {
    height: 20,
    backgroundColor: "#FFFFFF",
  },

  // Center FAB
  centerBtn: {
    width: 54, height: 54,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  centerGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});