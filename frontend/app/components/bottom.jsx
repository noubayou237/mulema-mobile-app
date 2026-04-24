import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions
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
const ACTIVE_COLOR = "#D32F2F"; // red accent (our brand red)
const INACTIVE_COLOR = "#9E9E9E"; // medium gray — clearly visible on white
const LABEL_ACTIVE = "#D32F2F";
const LABEL_INACTIVE = "#757575";
const PILL_BG = "#FFEBEE"; // very light red pill

// ── Single nav item ────────────────────────────────────────────────────────
const NavItem = ({ item, active, onPress }) => {
  const iconScale = useRef(new Animated.Value(active ? 1.1 : 1)).current;
  const pillOp = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pillH = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, [active]);

  const handlePress = () => {
    Animated.sequence([
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
    ]).start();
    onPress(item.key);
  };

  const isCenter = item.center;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.tab}>
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
          style={[
            s.label,
            {
              color: active ? LABEL_ACTIVE : LABEL_INACTIVE,
              fontWeight: active ? "800" : "500"
            }
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Main BottomNav ─────────────────────────────────────────────────────────
export default function BottomNav({ activeKey = "home" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const mountY = useRef(new Animated.Value(80)).current;
  const mountOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, []);

  const items = [
    {
      key: "home",
      label: t("nav.home") || "Accueil",
      icon: "home-outline",
      activeIcon: "home",
      route: "/(tabs)/home",
      center: true
    },
    {
      key: "lessons",
      label: t("nav.lessons") || "Leçons",
      icon: "book-outline",
      activeIcon: "book",
      route: "/(tabs)/lessons"
    },
    {
      key: "exercices",
      label: t("nav.exercises") || "Progression",
      icon: "trophy-outline",
      activeIcon: "trophy",
      route: "/(tabs)/exercises",
      badge: null // removed per maquette — clean look
    },
    {
      key: "community",
      label: t("nav.community") || "Communauté",
      icon: "chatbubbles-outline",
      activeIcon: "chatbubbles",
      route: "/(tabs)/community"
    },
    {
      key: "profile",
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      route: "/(tabs)/profile"
    }
  ];

  const resolvedKey =
    activeKey || items.find((it) => pathname?.includes(it.key))?.key || "home";

  const handlePress = (key) => {
    const item = items.find((it) => it.key === key);
    if (item) router.replace(item.route);
  };

  return (
    <Animated.View
      style={[
        s.wrapper,
        { transform: [{ translateY: mountY }], opacity: mountOp }
      ]}
    >
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
  },

  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },

  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    position: "relative"
  },

  // Pill background — light red tint
  pill: {
    position: "absolute",
    top: -2,
    height: 34,
    borderRadius: 12,
    backgroundColor: PILL_BG,
    zIndex: 0,
    alignSelf: "center"
  },

  iconWrap: { zIndex: 1 },

  badge: {
    position: "absolute",
    top: -8,
    right: -14,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: ACTIVE_COLOR,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  badgeText: { fontSize: 7, color: "#fff", fontWeight: "800" },

  // Label — always visible, clearly readable
  label: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.1,
    fontFamily: "Nunito-SemiBold"
  },

  safeArea: { height: 20, backgroundColor: "#FFFFFF" },

  // Center home button — slightly raised, rounded square (matches maquette)
  centerBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 2
  }
});
