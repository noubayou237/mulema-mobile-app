/**
 * MULEMA — Page Thèmes : Leçons 
 *  Lessons only, exercises have been moved to their own tab.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
  ActivityIndicator, RefreshControl, Animated, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";

import { useThemeStore } from "../../../src/stores/useThemeStore";
import { useLanguageStore } from "../../../src/stores/useLanguageStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

import { useTranslation } from "react-i18next";
import { Colors, Space, Shadow } from "../../../src/theme/tokens";
import { DrawerContent } from "../../../src/components/layout/DrawerContent";
import { useAuthStore } from "../../../src/stores/useAuthStore";

// ID Duala connu — fallback 

const { width } = Dimensions.get("window");
const CARD_W = (width - Space["2xl"] * 2 - Space.lg) / 2;

/* ── Palette — Adjusted to use design tokens where possible ── */
const RED = Colors.primary;
const RED_L = Colors.primary + "15";
const BG = Colors.surface;
const CARD_BG = Colors.surfaceContainerLowest;
const TRACK = Colors.surfaceContainerHigh;
const TEXT = Colors.onSurface;
const TEXT_SUB = Colors.textTertiary;
const FAINT = Colors.textTertiary + "80";

/* ── Icônes par code thème ──────────────────────────────────── */
const ICONS = {
  salutation: "hand-left", salutations: "hand-left",
  famille: "people", family: "people",
  voyage: "airplane",
  nourriture: "restaurant", cuisine: "restaurant",
  animaux: "paw",
  vetement: "shirt", vetements: "shirt",
  nature: "leaf", corps: "body",
  maison: "home", travail: "briefcase",
  sport: "football", couleurs: "color-palette",
  chiffres: "calculator", jours: "calendar",
  pronoms: "chatbubble",
};
const icon = (code) => ICONS[(code ?? "").toLowerCase()] ?? "book-outline";


/* ════════════════════════════════════════════════════════════════
   THEME CARD (Leçons tab)
   ════════════════════════════════════════════════════════════════ */
const ThemeCard = ({ theme, index, onPress }) => {
  const { t, i18n } = useTranslation();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const locked = theme.locked ?? false;
  const pct = theme.lessonsCount > 0
    ? Math.round((theme.lessonsCompleted / theme.lessonsCount) * 100) : 0;

  const R = 34;
  const C2 = 2 * Math.PI * R;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        onPress={() => !locked && onPress(theme)}
        activeOpacity={locked ? 1 : 0.75}
        style={[s.card, locked && s.cardLocked]}
      >
        {/* Anneau SVG + icône */}
        <View style={s.ringWrap}>
          <Svg width={80} height={80} style={StyleSheet.absoluteFill}>
            <Circle cx={40} cy={40} r={R} stroke={locked ? "#E0E0EA" : TRACK} strokeWidth={5} fill="none" />
            {!locked && pct > 0 && (
              <Circle
                cx={40} cy={40} r={R}
                stroke={RED} strokeWidth={5} fill="none"
                strokeDasharray={`${C2} ${C2}`}
                strokeDashoffset={C2 - (pct / 100) * C2}
                strokeLinecap="round"
                rotation="-90" origin="40, 40"
              />
            )}
          </Svg>
          <View style={[s.iconCircle, locked && s.iconCircleLocked]}>
            {locked
              ? <Ionicons name="lock-closed" size={20} color={FAINT} />
              : <Ionicons name={icon(theme.code)} size={24} color={RED} />
            }
          </View>
        </View>

        <Text style={[s.cardName, locked && { color: FAINT }]} numberOfLines={1}>
          {i18n.language.startsWith("en") && theme.name_en ? theme.name_en : theme.name ?? "—"}
        </Text>
        {theme.nameLocal ? (
          <Text style={[s.cardLocal, locked && { color: FAINT }]} numberOfLines={1}>
            {theme.nameLocal}
          </Text>
        ) : null}

        {locked
          ? <Text style={s.lockMsg} numberOfLines={2}>{theme.lockHint || t("lessons.locked")}</Text>
          : <Text style={s.cardPct}>{t("lessons.percentCompleted", { percent: pct })}</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
};


export default function ThemesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading, error: themeError, fetchThemes } = useThemeStore();
  const { data: dash, fetchDashboard } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);

  /* ── Drawer ── */
  const DRAWER_WIDTH = width * 0.78;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: -DRAWER_WIDTH, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, []);

  const handleDrawerNav = (target) => {
    closeDrawer();
    setTimeout(() => {
      switch (target) {
        case "quests": router.push("/modal/quests"); break;
        case "notifications": router.push("/(tabs)/profile/notifications"); break;
        case "change-language": router.push("/modal/change-language"); break;
        case "settings": router.push("/(tabs)/profile/settings"); break;
      }
    }, 300);
  };

  const handleLogout = () => {
    closeDrawer();
    setTimeout(() => {
      Alert.alert(
        t("profile.logout"),
        t("profile.logoutConfirm"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("common.confirm"), style: "destructive", onPress: () => logout() },
        ]
      );
    }, 300);
  };

  const getPatrimonialId = (lang, allLangs) => {
    if (!lang) return null;
    if (lang.type === "patrimonial") return lang.id;
    const langName = (lang.name ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const match = (allLangs || []).find((l) => {
      if (l.type !== "patrimonial") return false;
      const n = l.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return n.includes(langName) || langName.includes(n);
    });
    return match?.id ?? null;
  };

  useEffect(() => {
    const init = async () => {
      if (activeLanguage) {
        const langId = getPatrimonialId(activeLanguage, languages);
        if (langId) fetchThemes(langId);
        fetchDashboard();
        return;
      }
      try {
        const langs = await fetchLanguages();
        const lang = await loadActiveLanguage();
        const langId = getPatrimonialId(lang, langs);
        if (langId) fetchThemes(langId);
        fetchDashboard();
      } catch { }
    };
    init();
  }, [activeLanguage?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    const langId = getPatrimonialId(activeLanguage, languages);
    await Promise.all([langId ? fetchThemes(langId) : Promise.resolve(), fetchDashboard()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu" size={24} color={TEXT} />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>{t("lessons.title", "Thèmes")}</Text>
            <Text style={s.headerSub}>{activeLanguage?.name ?? "Duala"}</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          <View style={s.badge}>
            <Ionicons name="flash" size={13} color="#E8A020" />
            <Text style={s.badgeXP}>{dash?.totalPoints ?? 0}</Text>
          </View>
          <View style={[s.badge, s.badgeHeart]}>
            <Ionicons name="heart" size={13} color="#E53E3E" />
            <Text style={[s.badgeXP, { color: "#E53E3E" }]}>{dash?.hearts ?? 5}</Text>
          </View>
          <View style={s.avatar} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[RED]} tintColor={RED} />
        }
      >
        {/* ── HERO CARD ── */}
        <View style={s.hero}>
          <View style={s.heroBlob} />
          <Text style={s.heroTitle}>
            {t("home.continueLearning", "Apprentissage\nQuotidien")}
          </Text>
          <Text style={s.heroSub}>
            {t("lessons.stepByStep", "Continuez votre voyage linguistique\nà travers la culture Camerounaise.")}
          </Text>
          <View style={s.streakPill}>
            <Text style={s.streakIcon}>✦</Text>
            <Text style={s.streakTxt}>
              {t("stats.streakDaysShort", { count: dash?.streakDays || 0 })}
            </Text>
          </View>
        </View>

        {/* ── CONTENT ── */}
        {isLoading && themes.length === 0 ? (
          <ActivityIndicator size="large" color={RED} style={{ marginVertical: 48 }} />
        ) : !isLoading && themes.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="book-outline" size={44} color={FAINT} />
            <Text style={s.emptyTxt}>
              {t("errors.noThemesRefresh")}
            </Text>
          </View>
        ) : (
          <View>
            {/* Bannière d'erreur (Connexion) */}
            {themeError && (
              <View style={s.errorBanner}>
                <Ionicons name="cloud-offline-outline" size={24} color={RED} />
                <View style={{ flex: 1 }}>
                  <Text style={s.errorTitle}>{t("common.error", "Erreur")}</Text>
                  <Text style={s.errorTxt}>{themeError}</Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={s.retryBtn}>
                  <Ionicons name="refresh" size={18} color={RED} />
                </TouchableOpacity>
              </View>
            )}

            <View style={s.sectionHeader}>
              <Ionicons name="book" size={18} color={RED} />
              <Text style={s.sectionTitle}>{t("lessons.available")}</Text>
            </View>
            <View style={s.grid}>
              {themes.map((theme, idx) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  index={idx}
                  onPress={(t) => router.push(`/(tabs)/lessons/${t.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
      {/* ══ DRAWER OVERLAY ══ */}
      {drawerOpen && (
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.38)", zIndex: 90, opacity: overlayAnim }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* ══ DRAWER PANEL ══ */}
      <Animated.View style={[s.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <DrawerContent
          user={user}
          dashboard={dash}
          onClose={closeDrawer}
          onNav={handleDrawerNav}
          onLogout={handleLogout}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: BG,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Fredoka_600SemiBold", color: TEXT, lineHeight: 22 },
  headerSub: { fontSize: 13, fontFamily: "Nunito-Regular", color: TEXT_SUB },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF7E6",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeHeart: { backgroundColor: "#FFF0F0" },
  badgeXP: { fontSize: 13, fontFamily: "Fredoka_600SemiBold", color: "#E8A020" },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: RED,
  },

  /* Hero */
  hero: {
    backgroundColor: RED,
    borderRadius: 24, padding: 24,
    marginBottom: 20, overflow: "hidden",
  },
  heroBlob: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)", right: -50, top: -50,
  },
  heroTitle: { fontSize: 28, fontFamily: "Fredoka_700Bold", color: "#FFF", lineHeight: 34, marginBottom: 8 },
  heroSub: { fontSize: 14, fontFamily: "Nunito-Regular", color: "rgba(255,255,255,0.82)", lineHeight: 20, marginBottom: 16 },
  streakPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  streakIcon: { color: "#FFD166", fontSize: 12 },
  streakTxt: { fontSize: 12, fontFamily: "Fredoka_600SemiBold", color: "#FFF", letterSpacing: 0.8 },

  /* Section Headers */
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: TEXT,
  },

  /* Grille */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 },

  /* Card (Leçons) */
  card: {
    width: CARD_W, backgroundColor: CARD_BG,
    borderRadius: 20, alignItems: "center",
    paddingVertical: 20, paddingHorizontal: 10,
    shadowColor: "#A0A8C0", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
  },
  cardLocked: { backgroundColor: "#F5F6FA" },

  /* Anneau */
  ringWrap: {
    width: 80, height: 80,
    alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  iconCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: RED_L,
    alignItems: "center", justifyContent: "center",
  },
  iconCircleLocked: { backgroundColor: "#EDEDF2" },

  cardName: { fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: TEXT, marginTop: 10, textAlign: "center" },
  cardLocal: { fontSize: 11, fontFamily: "Nunito-Regular", color: TEXT_SUB, textAlign: "center", marginTop: 1 },
  cardPct: { fontSize: 12, fontFamily: "Nunito-Regular", color: TEXT_SUB, marginTop: 3 },
  lockMsg: { fontSize: 11, fontFamily: "Nunito-Regular", color: FAINT, textAlign: "center", lineHeight: 16, marginTop: 3 },

  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTxt: { fontSize: 14, fontFamily: "Nunito-Regular", color: FAINT, textAlign: "center", marginTop: 12, lineHeight: 20 },

  /* Error banner */
  errorBanner: {
    backgroundColor: RED_L,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: RED + "30",
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: RED,
    marginBottom: 2,
  },
  errorTxt: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    color: TEXT_SUB,
    lineHeight: 18,
  },
  retryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },

  drawer: {
    position: "absolute",
    top: 0, bottom: 0, left: 0,
    width: width * 0.78,
    backgroundColor: "#FFF",
    zIndex: 100,
    ...Shadow.lg,
  },
});
