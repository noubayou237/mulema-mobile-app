/**
 * MULEMA — Page Thèmes : Leçons & Exercices (Two-Tab Layout)
 *  "Le saviez-vous" removed
 *  Lessons and Exercises separated into two tabs
 * Correction #10: Theme completion → cultural video unlock
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
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useThemeStore } from "../../../src/stores/useThemeStore";
import { useLanguageStore } from "../../../src/stores/useLanguageStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

import { useTranslation } from "react-i18next";
import { Colors, Typo, Space, Radius, Shadow } from "../../../src/theme/tokens";

// ID Duala connu — fallback si AsyncStorage vide
const DUALA_ID = "c81daa9d-7be2-4896-91c8-7531c994aec5";

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
const GREEN = Colors.success || "#2E7D32";
const GREEN_L = (Colors.success || "#2E7D32") + "15";
const GOLD = Colors.secondary || "#F9A825";

/* ── Tab constants ── */
// These will be translated dynamically inside the component now

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

/* ── Exercise type icons ────────────────────────────────────── */
const EX_ICONS = {
  matching: "grid-outline",
  complete: "create-outline",
  listen_write: "ear-outline",
  listen_select: "images-outline",
};

/* ════════════════════════════════════════════════════════════════
   THEME CARD (Leçons tab)
   ════════════════════════════════════════════════════════════════ */
const ThemeCard = ({ theme, index, onPress }) => {
  const { t } = useTranslation();
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
          {t("common.theLanguage") === "en" && theme.name_en ? theme.name_en : theme.name ?? "—"}
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

/* ════════════════════════════════════════════════════════════════
   EXERCISE CARD (Exercices tab)
   ════════════════════════════════════════════════════════════════ */
const ExerciseThemeCard = ({ theme, index, onPress, isCompleted, hasReward }) => {
  const { t } = useTranslation();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const locked = theme.locked ?? false;
  const exercisesDone = theme.exercisesCompleted ?? 0;
  const exercisesTotal = theme.exercisesCount ?? 3;
  const pct = exercisesTotal > 0 ? Math.round((exercisesDone / exercisesTotal) * 100) : 0;
  const allDone = pct >= 100;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        onPress={() => !locked && onPress(theme)}
        activeOpacity={locked ? 1 : 0.75}
        style={[s.exCard, locked && s.cardLocked, allDone && s.exCardDone]}
      >
        <View style={s.exCardTop}>
          <View style={[s.exIconCircle, locked && s.iconCircleLocked, allDone && { backgroundColor: GREEN_L }]}>
            {locked
              ? <Ionicons name="lock-closed" size={20} color={FAINT} />
              : allDone
                ? <Ionicons name="checkmark-circle" size={24} color={GREEN} />
                : <Ionicons name={icon(theme.code)} size={24} color={RED} />
            }
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.exCardName, locked && { color: FAINT }]} numberOfLines={1}>
              {t("common.theLanguage") === "en" && theme.name_en ? theme.name_en : theme.name ?? "—"}
            </Text>
            <Text style={[s.exCardSub, locked && { color: FAINT }]}>
              {locked
                ? (theme.lockHint || t("lessons.completeToUnlock"))
                : allDone
                  ? t("exercises.allDone")
                  : t("exercises.count", { count: exercisesDone, total: exercisesTotal })
              }
            </Text>
          </View>
          {/* Reward indicator */}
          {allDone && hasReward && (
            <View style={s.rewardBadge}>
              <Ionicons name="videocam" size={14} color="#FFF" />
            </View>
          )}
          {!locked && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={allDone ? GREEN : TEXT_SUB}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>

        {/* Progress bar */}
        {!locked && (
          <View style={s.exProgress}>
            <View style={[s.exProgressFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: allDone ? GREEN : RED }]} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ════════════════════════════════════════════════════════════════
   TAB SELECTOR
   ════════════════════════════════════════════════════════════════ */
const TabSelector = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const TABS = [t("nav.lessons", "Leçons"), t("nav.exercises", "Exercices")];
  const slideAnim = useRef(new Animated.Value(activeTab === 0 ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab,
      tension: 68,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const tabWidth = (width - 32) / 2;

  return (
    <View style={s.tabBar}>
      {/* Animated pill behind active tab */}
      <Animated.View
        style={[
          s.tabPill,
          {
            width: tabWidth,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, tabWidth],
              }),
            }],
          },
        ]}
      />
      {TABS.map((tab, idx) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabChange(idx)}
          activeOpacity={0.7}
          style={[s.tabItem, { width: tabWidth }]}
        >
          <Ionicons
            name={idx === 0 ? "book" : "barbell"}
            size={16}
            color={activeTab === idx ? "#FFF" : TEXT_SUB}
          />
          <Text style={[s.tabText, activeTab === idx ? { color: "#ffffff" } : null]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* ════════════════════════════════════════════════════════════════
   SCREEN
   ════════════════════════════════════════════════════════════════ */
export default function ThemesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading, fetchThemes } = useThemeStore();
  const { data: dash, fetchDashboard } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Theme completion tracking for cultural video unlock
  const [completedThemes, setCompletedThemes] = useState({});

  // Load completed theme state from AsyncStorage
  useEffect(() => {
    const loadCompleted = async () => {
      try {
        const stored = await AsyncStorage.getItem("completed_themes");
        if (stored) setCompletedThemes(JSON.parse(stored));
      } catch { }
    };
    loadCompleted();
  }, []);

  const getPatrimonialId = (lang, allLangs) => {
    if (!lang) return DUALA_ID;
    if (lang.type === "patrimonial") return lang.id;
    const langName = (lang.name ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const match = (allLangs || []).find((l) => {
      if (l.type !== "patrimonial") return false;
      const n = l.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return n.includes(langName) || langName.includes(n);
    });
    return match?.id ?? DUALA_ID;
  };

  useEffect(() => {
    const init = async () => {
      if (activeLanguage) {
        const langId = getPatrimonialId(activeLanguage, languages);
        fetchThemes(langId);
        fetchDashboard();
        return;
      }
      try {
        const langs = await fetchLanguages();
        const lang = await loadActiveLanguage();
        const langId = getPatrimonialId(lang, langs);
        fetchThemes(langId);
        fetchDashboard();
        return;
      } catch { }
      fetchThemes(DUALA_ID);
      fetchDashboard();
    };
    init();
  }, [activeLanguage?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    const langId = getPatrimonialId(activeLanguage, languages);
    await Promise.all([fetchThemes(langId), fetchDashboard()]);
    setRefreshing(false);
  };

  // Handle exercise theme press → navigate to exercise
  const handleExerciseThemePress = useCallback((theme) => {
    const code = (theme.code ?? theme.name ?? "").toLowerCase();
    // Navigate to the exercise for this theme
    router.push(`/exercices/${code}/exos1`);
  }, [router]);

  // Handle theme completion video
  const handleWatchRewardVideo = useCallback((theme) => {
    const langName = (activeLanguage?.name ?? "").toLowerCase();
    router.push({
      pathname: "/PageVideo",
      params: { lang: langName, themeId: theme.id, themeName: theme.name },
    });
  }, [activeLanguage, router]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.menuBtn}>
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

      {/* ── TAB SELECTOR ── */}
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

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
            {activeTab === 0 ? t("home.continueLearning", "Apprentissage\nQuotidien") : t("exercises.title", "Exercices\nPratiques")}
          </Text>
          <Text style={s.heroSub}>
            {activeTab === 0
              ? t("lessons.stepByStep", "Continuez votre voyage linguistique\nà travers la culture Camerounaise.")
              : t("exercises.introText", "Testez vos connaissances et\ndébloquez du contenu culturel.")}
          </Text>
          <View style={s.streakPill}>
            <Text style={s.streakIcon}>✦</Text>
            <Text style={s.streakTxt}>
              {t("stats.streakDaysShort", { count: dash?.streakDays || 0 })}
            </Text>
          </View>
        </View>

        {/* ── CONTENT BASED ON ACTIVE TAB ── */}
        {isLoading && themes.length === 0 ? (
          <ActivityIndicator size="large" color={RED} style={{ marginVertical: 48 }} />
        ) : !isLoading && themes.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="book-outline" size={44} color={FAINT} />
            <Text style={s.emptyTxt}>
              {t("errors.noThemesRefresh")}
            </Text>
          </View>
        ) : activeTab === 0 ? (
          /* ── LEÇONS TAB ── */
          <View>
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
        ) : (
          /* ── EXERCICES TAB ── */
          <View>
            <View style={s.sectionHeader}>
              <Ionicons name="barbell" size={18} color={RED} />
              <Text style={s.sectionTitle}>{t("exercises.byTheme")}</Text>
            </View>
            <Text style={s.sectionSubtitle}>
              {t("exercises.rewardHint")}
            </Text>
            {themes.map((theme, idx) => {
              const allDone = (theme.exercisesCompleted ?? 0) >= (theme.exercisesCount ?? 3) && (theme.exercisesCount ?? 3) > 0;
              const hasReward = allDone; // Cultural video available when theme is complete
              return (
                <ExerciseThemeCard
                  key={theme.id}
                  theme={theme}
                  index={idx}
                  isCompleted={allDone}
                  hasReward={hasReward}
                  onPress={(t) => {
                    if (allDone && hasReward) {
                      // Theme completed → offer to watch cultural video or redo
                      handleWatchRewardVideo(t);
                    } else {
                      handleExerciseThemePress(t);
                    }
                  }}
                />
              );
            })}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
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

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: "#F8D7DA",
    borderRadius: 16, padding: 4,
    position: "relative",
  },
  tabPill: {
    position: "absolute",
    top: 4, left: 4,
    height: 40, borderRadius: 12,
    backgroundColor: RED,
    shadowColor: RED, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  tabItem: {
    height: 40, borderRadius: 12,
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 6, zIndex: 1,
  },
  tabText: {
    fontSize: 14, fontFamily: "Fredoka_600SemiBold",
    color: TEXT_SUB,
  },
  tabTextActive: { color: "#FFF" },

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
  sectionSubtitle: {
    fontSize: 13, fontFamily: "Nunito-Regular", color: TEXT_SUB,
    marginBottom: 16, lineHeight: 18,
  },

  /* Grille (Leçons) */
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

  /* Exercise Theme Card */
  exCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#A0A8C0", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  exCardDone: {
    borderLeftWidth: 4, borderLeftColor: GREEN,
  },
  exCardTop: {
    flexDirection: "row", alignItems: "center",
  },
  exIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: RED_L,
    alignItems: "center", justifyContent: "center",
  },
  exCardName: {
    fontSize: 15, fontFamily: "Fredoka_600SemiBold", color: TEXT,
  },
  exCardSub: {
    fontSize: 12, fontFamily: "Nunito-Regular", color: TEXT_SUB, marginTop: 2,
  },
  exProgress: {
    height: 6, backgroundColor: TRACK,
    borderRadius: 3, marginTop: 12, overflow: "hidden",
  },
  exProgressFill: {
    height: "100%", borderRadius: 3,
  },
  rewardBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: GOLD,
    alignItems: "center", justifyContent: "center",
    marginLeft: 8,
  },

  /* Empty */
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTxt: { fontSize: 14, fontFamily: "Nunito-Regular", color: FAINT, textAlign: "center", marginTop: 12, lineHeight: 20 },
});
