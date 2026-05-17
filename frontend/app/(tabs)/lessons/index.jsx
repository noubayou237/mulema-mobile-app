/**
 * MULEMA — Page Thèmes : Leçons 
 *  Lessons only, exercises have been moved to their own tab.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
  ActivityIndicator, RefreshControl, Animated, Easing, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useThemeStore } from "../../../src/stores/useThemeStore";
import { useLanguageStore } from "../../../src/stores/useLanguageStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

import { useTranslation } from "react-i18next";
import { Colors, Space, Shadow } from "../../../src/theme/tokens";
import { DrawerContent } from "../../../src/components/layout/DrawerContent";
import { useAuthStore } from "../../../src/stores/useAuthStore";
import { getDualaVirtualData } from "../../data/dualaLessonsData";
import { getGhomalaVirtualData } from "../../data/ghomalaLessonsData";

// ID Duala connu — fallback 

const { width } = Dimensions.get("window");
const SCREEN_W = width;
const CARD_W = (width - Space["2xl"] * 2 - Space.lg) / 2;

// Legacy constants removed in favor of design tokens


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
   SYNC BAR — subtle animated indicator during background refresh
   ════════════════════════════════════════════════════════════════ */
const SyncBar = () => {
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={syncStyles.wrap}>
      <View style={syncStyles.track}>
        <Animated.View
          style={[syncStyles.bar, { transform: [{ translateX: slideAnim }] }]}
        />
      </View>
      <View style={syncStyles.labelRow}>
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={syncStyles.label}>Synchronisation...</Text>
      </View>

    </View>
  );
};

const syncStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 4 },
  track: {
    height: 3, backgroundColor: Colors.primary + "15",
    borderRadius: 2, overflow: "hidden",
  },
  bar: {
    width: width * 0.4, height: "100%",
    backgroundColor: Colors.primary, borderRadius: 2,
  },

  labelRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingTop: 4,
  },
  label: {
    fontSize: 11, fontFamily: "Nunito-Regular",
    color: Colors.TEXT_SUB,
  },
});

/* ════════════════════════════════════════════════════════════════
   THEME CARD (Leçons tab)
   ════════════════════════════════════════════════════════════════ */
const ThemeCard = ({ theme, index, onPress, onPressIn }) => {
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
  const pct = theme.lessoansCount > 0
    ? Math.round((theme.lessonsCompleted / theme.lessonsCount) * 100) : 0;

  const R = 34;
  const C2 = 2 * Math.PI * R;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        onPress={() => !locked && onPress && onPress(theme)}
        onPressIn={() => !locked && onPressIn && onPressIn(theme)}
        activeOpacity={locked ? 1 : 0.75}
        style={[s.card, locked && s.cardLocked]}
      >
        {/* Icône sans anneau de progression percentage */}
        <View style={s.ringWrap}>
          <View style={[s.iconCircle, locked && s.iconCircleLocked]}>
            {locked
              ? <Ionicons name="lock-closed" size={20} color={Colors.FAINT} />
              : <Ionicons name={icon(theme.code)} size={24} color={Colors.primary} />
            }
          </View>
        </View>

        <Text style={[s.cardName, locked && { color: Colors.FAINT }]} numberOfLines={1}>
          {theme.code === 'fondations'
            ? t("lessons.foundations")
            : (i18n.language.startsWith("en") && theme.name_en ? theme.name_en : (theme.name ?? "—")).replace(/Niveau \d+\s*:\s*/gi, "")
          }
        </Text>
        {theme.nameLocal ? (
          <Text style={[s.cardLocal, locked && { color: Colors.FAINT }]} numberOfLines={1}>
            {theme.nameLocal}
          </Text>
        ) : null}

        <View style={[s.statusBadge, { backgroundColor: locked ? "#EDEDF2" : Colors.GREEN_L }]}>
          <Text style={[s.statusTxt, { color: locked ? Colors.FAINT : Colors.GREEN }]}>
            {locked ? (theme.lockHint || t("lessons.locked")) : "Unlocked"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


export default function ThemesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading, error: themeError, fetchThemes, setVirtualData } = useThemeStore();
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
    await Promise.all([langId ? fetchThemes(langId, true) : Promise.resolve(), fetchDashboard()]);
    setRefreshing(false);
  };

  // Force-refresh themes every time this screen comes into focus so that
  // progress and lock states reflect any lessons/exercises just completed.
  useFocusEffect(
    useCallback(() => {
      const langId = getPatrimonialId(activeLanguage, languages);
      if (langId) fetchThemes(langId, true);
    }, [activeLanguage?.id, languages])
  );

  /* Bassa Custom Lessons Logic */
  const langCode = (activeLanguage?.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isBassa = langCode.includes("bassa");
  const isDuala = langCode.includes("duala") || langCode.includes("douala");
  const isGhomala = langCode.includes("ghomala") || langCode.includes("ghomal");
  const getBassaLessons = () => {
    const defaultThemeId = themes && themes.length > 0 ? themes[0].id : "dummy";

    const joursTheme = (themes || []).find((t) => t.code === "jours" || (t.name && t.name.toLowerCase().includes("jour")));
    const verbesTheme = (themes || []).find((t) => t.code === "verbes" || (t.name && t.name.toLowerCase().includes("verbe")));

    const joursId = joursTheme ? joursTheme.id : defaultThemeId;
    const verbesId = verbesTheme ? verbesTheme.id : defaultThemeId;

    const res = [
      {
        id: "jours_semaine",
        name: joursTheme?.name || "Les 7 jours de la semaine",
        nameLocal: joursTheme?.nameLocal || "Mànōk má sɔ̂ŋ",
        code: "jours",
        themeId: joursId,
        lessonsCount: 7,
        lessonsCompleted: 0,
      }
    ];

    const verbs = [
      { id: "verbe_avoir", name: "Verbe Avoir", nameLocal: "Bìhíkìí" },
      { id: "verbe_etre", name: "Verbe Être", nameLocal: "Bìhíkìí" },
      { id: "verbe_manger", name: "Verbe Manger", nameLocal: "Bìhíkìí" },
      { id: "verbe_acheter", name: "Verbe Acheter", nameLocal: "Bìhíkìí" },
      { id: "verbe_marcher", name: "Verbe Marcher", nameLocal: "Bìhíkìí" },
      { id: "verbe_prendre", name: "Verbe Prendre", nameLocal: "Bìhíkìí" },
    ];

    verbs.forEach((v) => {
      res.push({
        ...v,
        code: "verbes",
        themeId: verbesId,
        lessonsCount: 6,
        lessonsCompleted: 0,
      });
    });

    // Use per-theme counters from backend
    const counts = {};
    return res.map((item, idx) => {
      const code = item.code;
      if (counts[code] === undefined) counts[code] = 0;
      const themeIdx = counts[code]++;

      const theme = code === "jours" ? joursTheme : verbesTheme;
      const isThemeLocked = theme ? theme.locked : idx >= 2;
      const lessonsCompletedCount = theme ? theme.lessonsCompleted : 0;
      const categoryStatus = theme?.categories?.[themeIdx];
      // Mirror the adventure tree: first 2 always unlocked, then use per-category DB flags
      const isUnlocked = !isThemeLocked && (
        themeIdx < 2 ||
        categoryStatus?.isUnlocked ||
        categoryStatus?.isCompleted
      );
      return {
        ...item,
        lessonsCompleted: themeIdx < lessonsCompletedCount ? item.lessonsCount : 0,
        locked: !isUnlocked,
      };
    });
  };

  /* Duala Custom Lessons Logic — uses same UUID-based pattern as Bassa */
  const getDualaLessons = () => {
    // Use the first/only Duala theme as the source of truth (same as Bassa)
    const defaultTheme = (themes || [])[0];
    const defaultThemeId = defaultTheme ? defaultTheme.id : null;

    const items = [
      { id: "duala_jour", name: "Les sept jours de la semaine", nameLocal: "Minya mi mbu", code: "jours", lessonsCount: 1 },
      { id: "duala_avoir", name: "Le verbe avoir", nameLocal: "Bìhíkìí", code: "verbes", lessonsCount: 1 },
      { id: "duala_etre", name: "Le verbe être", nameLocal: "Bìhíkìí", code: "verbes", lessonsCount: 1 },
      { id: "duala_pronoms", name: "Les pronoms personnels", nameLocal: "Bipapa", code: "pronoms", lessonsCount: 1 },
      { id: "duala_chiffres", name: "Les chiffres 1-9 en duala", nameLocal: "Langa", code: "chiffres", lessonsCount: 1 },
      { id: "duala_couleurs", name: "Les couleurs", nameLocal: "Langi", code: "couleurs", lessonsCount: 1 },
    ];
    const counts = {};
    return items.map((item, idx) => {
      const code = item.code || item.id;
      if (counts[code] === undefined) counts[code] = 0;
      const themeIdx = counts[code]++;

      // Match theme by code OR name (same pattern as Bassa)
      const theme = (themes || []).find(t =>
        t.code === item.code ||
        (t.name && t.name.toLowerCase().includes(item.code))
      ) || defaultTheme;
      const isThemeLocked = theme ? theme.locked : idx >= 2;
      // ALWAYS use real UUID — never fall back to virtual string ID
      const themeId = theme ? theme.id : defaultThemeId || item.id;
      const lessonsCompletedCount = theme ? theme.lessonsCompleted : 0;
      const categoryStatus = theme?.categories?.[idx];
      // Mirror the adventure tree: first 2 always unlocked, then use per-category DB flags
      const isUnlocked = !isThemeLocked && (
        idx < 2 ||
        categoryStatus?.isUnlocked ||
        categoryStatus?.isCompleted
      );
      return {
        ...item,
        themeId,
        lessonsCompleted: idx < lessonsCompletedCount ? item.lessonsCount : 0,
        locked: !isUnlocked,
      };
    });
  };

  /* Ghomala Custom Lessons Logic — uses same UUID-based pattern as Bassa */
  const getGhomalaLessons = () => {
    // Use the first/only Ghomala theme as the source of truth (same as Bassa)
    const defaultTheme = (themes || [])[0];
    const defaultThemeId = defaultTheme ? defaultTheme.id : null;

    const items = [
      { id: "ghomala_jour", name: "Les jours de la semaine en ghomala", code: "jours", lessonsCount: 1 },
      { id: "ghomala_avoir", name: "Le verbe avoir en ghomala", code: "verbes", lessonsCount: 1 },
      { id: "ghomala_etre", name: "Le verbe être en ghomala", code: "verbes", lessonsCount: 1 },
      { id: "ghomala_chiffres", name: "Les chiffres 0-9 en ghomala", code: "chiffres", lessonsCount: 1 },
      { id: "ghomala_manger", name: "Le verbe manger en ghomala", code: "verbes", lessonsCount: 1 },
      { id: "ghomala_marcher", name: "Le verbe marcher en ghomala", code: "verbes", lessonsCount: 1 },
      { id: "ghomala_acheter", name: "Le verbe acheter en ghomala", code: "verbes", lessonsCount: 1 },
    ];
    const counts = {};
    return items.map((item, idx) => {
      const code = item.code || item.id;
      if (counts[code] === undefined) counts[code] = 0;
      const themeIdx = counts[code]++;

      // Match theme by code OR name (same pattern as Bassa)
      const theme = (themes || []).find(t =>
        t.code === item.code ||
        (t.name && t.name.toLowerCase().includes(item.code))
      ) || defaultTheme;
      const isThemeLocked = theme ? theme.locked : idx >= 2;
      // ALWAYS use real UUID — never fall back to virtual string ID
      const themeId = theme ? theme.id : defaultThemeId || item.id;
      const lessonsCompletedCount = theme ? theme.lessonsCompleted : 0;
      const categoryStatus = theme?.categories?.[idx];
      // Mirror the adventure tree: first 2 always unlocked, then use per-category DB flags
      const isUnlocked = !isThemeLocked && (
        idx < 2 ||
        categoryStatus?.isUnlocked ||
        categoryStatus?.isCompleted
      );
      return {
        ...item,
        themeId,
        lessonsCompleted: idx < lessonsCompletedCount ? item.lessonsCount : 0,
        locked: !isUnlocked,
      };
    });
  };

  const displayItems = isBassa ? getBassaLessons() : isDuala ? getDualaLessons() : isGhomala ? getGhomalaLessons() : themes;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu" size={24} color={Colors.onSurface} />
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


      {/* ── Syncing indicator (background refresh) ── */}
      {isLoading && displayItems.length > 0 && (
        <SyncBar />
      )}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
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
            <Text style={[s.streakIcon, { color: "#FFD166" }]}>✦</Text>
            <Text style={s.streakTxt}>
              {t("stats.streakDaysShort", { count: dash?.streakDays || 0 })}
            </Text>
          </View>
        </View>


        {/* ── CONTENT ── */}
        {isLoading && displayItems.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 48 }} />

        ) : !isLoading && displayItems.length === 0 ? (
          <View style={[s.empty, { opacity: 0.6 }]}>
            <Ionicons name="book-outline" size={44} color={Colors.FAINT} />
            <Text style={s.emptyTitle}>
              {t("lessons.nothingToReview") || "Rien à réviser"}
            </Text>
            <Text style={s.emptyTxt}>
              {t("lessons.nothingFound") || "Aucun thème ne correspond à votre recherche."}
            </Text>
          </View>
        ) : (
          <View>
            {/* Bannière d'erreur (Connexion) */}
            {themeError && (
              <View style={s.errorBanner}>
                <Ionicons name="cloud-offline-outline" size={24} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.errorTitle}>{t("common.error", "Erreur")}</Text>
                  <Text style={s.errorTxt}>{themeError}</Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={s.retryBtn}>
                  <Ionicons name="refresh" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}


            <View style={s.sectionHeader}>
              <Ionicons name="book" size={18} color={Colors.primary} />
              <Text style={s.sectionTitle}>{t("lessons.available")}</Text>
            </View>

            <View style={s.grid}>
              {displayItems.map((item, idx) => (
                <ThemeCard
                  key={item.id}
                  theme={item}
                  index={idx}
                  onPress={(item) => {
                    if (isGhomala || isDuala || isBassa) {
                      router.push({
                        pathname: `/(tabs)/lessons/${item.themeId || item.id}`,
                        params: { title: item.name, category: item.name },
                      });
                      return;
                    }
                    router.push(`/(tabs)/lessons/${item.id}`);
                  }}
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
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: SCREEN_W > 400 ? 28 : 24, fontFamily: "Fredoka_700Bold", color: Colors.onSurface, marginBottom: 4 },
  headerSub: { fontSize: 13, fontFamily: "Nunito-Regular", color: Colors.TEXT_SUB },
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
    backgroundColor: Colors.primary,
  },

  /* Hero */
  hero: {
    backgroundColor: Colors.primary,
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
  streakIcon: { fontSize: 12 },
  streakTxt: { fontSize: 12, fontFamily: "Fredoka_600SemiBold", color: "#FFF", letterSpacing: 0.8 },

  /* Section Headers */
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: Colors.onSurface,
  },

  /* Grille */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 },

  /* Card (Leçons) */
  card: {
    width: CARD_W, backgroundColor: Colors.surfaceContainerLowest,
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
    backgroundColor: Colors.primary + "15",
    alignItems: "center", justifyContent: "center",
  },
  iconCircleLocked: { backgroundColor: "#EDEDF2" },

  cardName: { fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: Colors.onSurface, marginTop: 10, textAlign: "center" },
  cardLocal: { fontSize: 11, fontFamily: "Nunito-Regular", color: Colors.TEXT_SUB, textAlign: "center", marginTop: 1 },
  cardPct: { fontSize: 12, fontFamily: "Nunito-Regular", color: Colors.TEXT_SUB, marginTop: 3 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusTxt: {
    fontSize: 12,
    fontFamily: "Fredoka_600SemiBold",
  },
  lockMsg: { fontSize: 11, fontFamily: "Nunito-Regular", color: Colors.FAINT, textAlign: "center", lineHeight: 16, marginTop: 3 },

  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTxt: { fontSize: 14, fontFamily: "Nunito-Regular", color: Colors.FAINT, textAlign: "center", marginTop: 12, lineHeight: 20 },

  /* Error banner */
  errorBanner: {
    backgroundColor: Colors.primary + "15",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.primary,
    marginBottom: 2,
  },
  errorTxt: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    color: Colors.TEXT_SUB,
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
