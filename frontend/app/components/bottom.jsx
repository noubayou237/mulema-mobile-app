import React, { useEffect, useRef } from "react";
import {
<<<<<<< HEAD
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions
=======
  View, TouchableOpacity, Text, StyleSheet,
  Platform, Animated, Easing, Dimensions,
>>>>>>> feat/settings-page
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

const { width } = Dimensions.get("window");
const TAB_COUNT = 5;

// ── Design tokens (aligned with maquette) ─────────────────────────────────
// Maquette: white bar, gray inactive icons+labels, colored active icon+label
// No gradient, no top pill bar — clean Duolingo minimal style
<<<<<<< HEAD
const ACTIVE_COLOR = "#D32F2F"; // red accent (our brand red)
const INACTIVE_COLOR = "#9E9E9E"; // medium gray — clearly visible on white
const LABEL_ACTIVE = "#D32F2F";
const LABEL_INACTIVE = "#757575";
const PILL_BG = "#FFEBEE"; // very light red pill
=======
const ACTIVE_COLOR   = "#D32F2F";   // red accent (our brand red)
const INACTIVE_COLOR = "#9E9E9E";   // medium gray — clearly visible on white
const LABEL_ACTIVE   = "#D32F2F";
const LABEL_INACTIVE = "#757575";
const PILL_BG        = "#FFEBEE";   // very light red pill
>>>>>>> feat/settings-page

// ── Single nav item ────────────────────────────────────────────────────────
const NavItem = ({ item, active, onPress }) => {
  const iconScale = useRef(new Animated.Value(active ? 1.1 : 1)).current;
<<<<<<< HEAD
  const pillOp = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pillH = useRef(new Animated.Value(active ? 1 : 0)).current;
=======
  const pillOp    = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pillH     = useRef(new Animated.Value(active ? 1 : 0)).current;
>>>>>>> feat/settings-page
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
<<<<<<< HEAD
      Animated.spring(iconScale, {
        toValue: active ? 1.12 : 1,
        tension: 140,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.timing(pillOp, {
        toValue: active ? 1 : 0,
        duration: 180,
        useNativeDriver: false
      }),
      Animated.spring(pillH, {
        toValue: active ? 1 : 0,
        tension: 120,
        friction: 9,
        useNativeDriver: false
      })
=======
      Animated.spring(iconScale, { toValue: active ? 1.12 : 1, tension: 140, friction: 7, useNativeDriver: true }),
      Animated.timing(pillOp,    { toValue: active ? 1 : 0,    duration: 180, useNativeDriver: false }),
      Animated.spring(pillH,     { toValue: active ? 1 : 0,    tension: 120, friction: 9, useNativeDriver: false }),
>>>>>>> feat/settings-page
    ]).start();
  }, [active]);

  const handlePress = () => {
    Animated.sequence([
<<<<<<< HEAD
      Animated.spring(pressAnim, {
        toValue: 0.85,
        tension: 400,
        friction: 5,
        useNativeDriver: true
      }),
      Animated.spring(pressAnim, {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true
      })
=======
      Animated.spring(pressAnim, { toValue: 0.85, tension: 400, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 200, friction: 6, useNativeDriver: true }),
>>>>>>> feat/settings-page
    ]).start();
    onPress(item.key);
  };

  const isCenter = item.center;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.tab}>
<<<<<<< HEAD
      <Animated.View
        style={[s.tabInner, { transform: [{ scale: pressAnim }] }]}
      >
        {isCenter ? (
          /* ── Raised center home button — matches maquette home icon ── */
          <Animated.View
            style={[
              s.centerBtn,
              {
                backgroundColor: active ? ACTIVE_COLOR : "#F5F5F5",
                transform: [{ scale: iconScale }],
                shadowOpacity: active ? 0.3 : 0.1
              }
            ]}
          >
            <Ionicons
              name={active ? item.activeIcon : item.icon}
              size={26}
              color={active ? "#fff" : INACTIVE_COLOR}
            />
          </Animated.View>
        ) : (
          <>
            {/* Pill highlight behind active icon */}
            <Animated.View
              style={[
                s.pill,
                {
                  opacity: pillOp,
                  width: pillH.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 46]
                  })
                }
              ]}
            />

            <Animated.View
              style={[s.iconWrap, { transform: [{ scale: iconScale }] }]}
            >
=======
      <Animated.View style={[s.tabInner, { transform: [{ scale: pressAnim }] }]}>

        {isCenter ? (
          /* ── Raised center home button — matches maquette home icon ── */
          <Animated.View style={[s.centerBtn, {
            backgroundColor: active ? ACTIVE_COLOR : "#F5F5F5",
            transform: [{ scale: iconScale }],
            shadowOpacity: active ? 0.3 : 0.1,
          }]}>
            <Ionicons
              name={active ? item.activeIcon : item.icon}
              size={26}
              color={active ? "#fff" : INACTIVE_COLOR}
            />
          </Animated.View>
        ) : (
          <>
            {/* Pill highlight behind active icon */}
            <Animated.View style={[s.pill, {
              opacity: pillOp,
              width: pillH.interpolate({ inputRange: [0, 1], outputRange: [0, 46] }),
            }]} />

            <Animated.View style={[s.iconWrap, { transform: [{ scale: iconScale }] }]}>
>>>>>>> feat/settings-page
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={24}
                color={active ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </Animated.View>

            {item.badge && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.badge}</Text>
              </View>
            )}
          </>
        )}

        {/* Label */}
        <Text
<<<<<<< HEAD
          style={[
            s.label,
            {
              color: active ? LABEL_ACTIVE : LABEL_INACTIVE,
              fontWeight: active ? "800" : "500"
            }
          ]}
=======
          style={[s.label, {
            color:      active ? LABEL_ACTIVE : LABEL_INACTIVE,
            fontWeight: active ? "800" : "500",
          }]}
>>>>>>> feat/settings-page
          numberOfLines={1}
        >
          {item.label}
        </Text>
<<<<<<< HEAD
=======

>>>>>>> feat/settings-page
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Main BottomNav ─────────────────────────────────────────────────────────
export default function BottomNav({ activeKey = "home" }) {
<<<<<<< HEAD
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const mountY = useRef(new Animated.Value(80)).current;
=======
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useTranslation();

  const mountY  = useRef(new Animated.Value(80)).current;
>>>>>>> feat/settings-page
  const mountOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
<<<<<<< HEAD
      Animated.spring(mountY, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: 150,
        useNativeDriver: true
      }),
      Animated.timing(mountOp, {
        toValue: 1,
        duration: 350,
        delay: 150,
        useNativeDriver: true
      })
=======
      Animated.spring(mountY,  { toValue: 0, tension: 60, friction: 10, delay: 150, useNativeDriver: true }),
      Animated.timing(mountOp, { toValue: 1, duration: 350, delay: 150, useNativeDriver: true }),
>>>>>>> feat/settings-page
    ]).start();
  }, []);

  const items = [
    {
      key: "home",
      label: t("nav.home") || "Accueil",
      icon: "home-outline",
      activeIcon: "home",
      route: "/home",
<<<<<<< HEAD
      center: true
=======
      center: true,
>>>>>>> feat/settings-page
    },
    {
      key: "lessons",
      label: t("nav.lessons") || "Leçons",
      icon: "book-outline",
      activeIcon: "book",
<<<<<<< HEAD
      route: "/lessons"
=======
      route: "/lessons",
>>>>>>> feat/settings-page
    },
    {
      key: "exercices",
      label: t("nav.exercises") || "Progression",
      icon: "trophy-outline",
      activeIcon: "trophy",
      route: "/exercices",
<<<<<<< HEAD
      badge: null // removed per maquette — clean look
=======
      badge: null, // removed per maquette — clean look
>>>>>>> feat/settings-page
    },
    {
      key: "community",
      label: t("nav.community") || "Communauté",
      icon: "chatbubbles-outline",
      activeIcon: "chatbubbles",
<<<<<<< HEAD
      route: "/community"
    },
    {
      key: "profile",
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      route: "standalone/profile"
    }
  ];

  const resolvedKey =
    activeKey || items.find((it) => pathname?.includes(it.key))?.key || "home";

  const handlePress = (key) => {
    const item = items.find((it) => it.key === key);
=======
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

  const handlePress = (key) => {
    const item = items.find(it => it.key === key);
>>>>>>> feat/settings-page
    if (item) router.replace(item.route);
  };

  return (
<<<<<<< HEAD
    <Animated.View
      style={[
        s.wrapper,
        { transform: [{ translateY: mountY }], opacity: mountOp }
      ]}
    >
=======
    <Animated.View style={[s.wrapper, { transform: [{ translateY: mountY }], opacity: mountOp }]}>

>>>>>>> feat/settings-page
      {/* White background */}
      <View style={s.bg} />

      {/* Top hairline — matches maquette separator */}
      <View style={s.hairline} />

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
    // position: "absolute",
    // left: 0, right: 0, bottom: 0,
    height: 70,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    zIndex: 200,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12
  },

  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFFFFF" },

  hairline: {
    position: "absolute",
<<<<<<< HEAD
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#EBEBEB",
    zIndex: 1
  },

  row: {
    flexDirection: "row",
    height: 64,
    alignItems: "center"
=======
    left: 0, right: 0, bottom: 0,
    zIndex: 200,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },

  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#FFFFFF" },

  hairline: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 1, backgroundColor: "#EBEBEB", zIndex: 1,
  },

  row: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
>>>>>>> feat/settings-page
  },

  tab: {
    flex: 1,
    height: "100%",
<<<<<<< HEAD
    alignItems: "center",
    justifyContent: "center"
  },

  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    position: "relative"
=======
    alignItems: "center",
    justifyContent: "center",
  },

  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    position: "relative",
>>>>>>> feat/settings-page
  },

  // Pill background — light red tint
  pill: {
    position: "absolute",
    top: -2,
    height: 34,
    borderRadius: 12,
    backgroundColor: PILL_BG,
    zIndex: 0,
<<<<<<< HEAD
    alignSelf: "center"
=======
    alignSelf: "center",
>>>>>>> feat/settings-page
  },

  iconWrap: { zIndex: 1 },

  badge: {
<<<<<<< HEAD
    position: "absolute",
    top: -8,
    right: -14,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: ACTIVE_COLOR,
    borderWidth: 2,
    borderColor: "#FFFFFF"
=======
    position: "absolute", top: -8, right: -14,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 8, backgroundColor: ACTIVE_COLOR,
    borderWidth: 2, borderColor: "#FFFFFF",
>>>>>>> feat/settings-page
  },
  badgeText: { fontSize: 7, color: "#fff", fontWeight: "800" },

  // Label — always visible, clearly readable
  label: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.1,
<<<<<<< HEAD
    fontFamily: "Nunito-SemiBold"
=======
    fontFamily: "Nunito-SemiBold",
>>>>>>> feat/settings-page
  },

  safeArea: { height: 20, backgroundColor: "#FFFFFF" },

  // Center home button — slightly raised, rounded square (matches maquette)
  centerBtn: {
<<<<<<< HEAD
    width: 50,
    height: 50,
=======
    width: 50, height: 50,
>>>>>>> feat/settings-page
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
<<<<<<< HEAD
    marginBottom: 2
  }
});
=======
    marginBottom: 2,
  },
});
>>>>>>> feat/settings-page
