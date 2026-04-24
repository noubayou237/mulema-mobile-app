import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
  ActivityIndicator, RefreshControl, Animated, Easing,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeStore } from "../../src/stores/useThemeStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { useDashboardStore } from "../../src/stores/useDashboardStore";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { DrawerContent } from "../../src/components/layout/DrawerContent";

import { useTranslation } from "react-i18next";
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";


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
   EXERCISE CARD (Exercices tab)
   ════════════════════════════════════════════════════════════════ */
const ExerciseThemeCard = ({ theme, index, onPress, isCompleted, hasReward }) => {
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
              {i18n.language.startsWith("en") && theme.name_en ? theme.name_en : theme.name ?? "—"}
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

export default function ExercisesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading, fetchThemes } = useThemeStore();
  const { data: dash, fetchDashboard } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);

  /* ── Drawer ── */
  const { width: SCREEN_W } = Dimensions.get("window");
  const DRAWER_WIDTH = SCREEN_W * 0.78;
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

  const handleExerciseThemePress = useCallback((theme) => {
    const allDone = (theme.exercisesCompleted ?? 0) >= (theme.exercisesCount ?? 3) && (theme.exercisesCount ?? 3) > 0;
    if (allDone) {
      // Theme complete — show story video (which marks videoWatched and unlocks the next theme)
      const langCode = (activeLanguage?.name ?? activeLanguage?.code ?? "duala")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z]/g, "")
        .trim();
      router.push(`/modal/onboarding-video?themeId=${theme.id}&langCode=${langCode}`);
    } else {
      router.push(`/(tabs)/lessons/${theme.id}/exercise/session`);
    }
  }, [router, activeLanguage]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu" size={24} color={TEXT} />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>{t("nav.exercises", "Exercices")}</Text>
            <Text style={s.headerSub}>{activeLanguage?.name ?? "Duala"}</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          <View style={[s.badge, { backgroundColor: RED_L }]}>
            <Ionicons name="flash" size={13} color={RED} />
            <Text style={[s.badgeXP, { color: RED }]}>{dash?.totalPoints ?? 0}</Text>
          </View>
          <View style={[s.badge, s.badgeHeart]}>
            <Ionicons name="heart" size={13} color={RED} />
            <Text style={[s.badgeXP, { color: RED }]}>{dash?.hearts ?? 5}</Text>
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
        <View style={s.hero}>
          <View style={s.heroBlob} />
          <Text style={s.heroTitle}>
            {t("exercises.title", "Exercices\nPratiques")}
          </Text>
          <Text style={s.heroSub}>
            {t("exercises.introText", "Testez vos connaissances et\ndébloquez du contenu culturel.")}
          </Text>
          <View style={s.streakPill}>
            <Text style={[s.streakIcon, { color: GREEN }]}>✦</Text>
            <Text style={s.streakTxt}>
              {t("stats.streakDaysShort", { count: dash?.streakDays || 0 })}
            </Text>
          </View>
        </View>

        {isLoading && themes.length === 0 ? (
          <ActivityIndicator size="large" color={RED} style={{ marginVertical: 48 }} />
        ) : !isLoading && themes.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="barbell-outline" size={44} color={FAINT} />
            <Text style={s.emptyTxt}>
              {t("errors.noThemesRefresh")}
            </Text>
          </View>
        ) : (
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
              const hasReward = allDone;
              return (
                <ExerciseThemeCard
                  key={theme.id}
                  theme={theme}
                  index={idx}
                  isCompleted={allDone}
                  hasReward={hasReward}
                  onPress={(t) => handleExerciseThemePress(t)}
                />
              );
            })}
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
      <Animated.View style={[s.drawerPanel, { transform: [{ translateX: drawerAnim }] }]}>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

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
  streakIcon: { fontSize: 12 },
  streakTxt: { fontSize: 12, fontFamily: "Fredoka_600SemiBold", color: "#FFF", letterSpacing: 0.8 },

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
  iconCircleLocked: { backgroundColor: "#EDEDF2" },
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

  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTxt: { fontSize: 14, fontFamily: "Nunito-Regular", color: FAINT, textAlign: "center", marginTop: 12, lineHeight: 20 },
  drawerPanel: {
    position: "absolute",
    top: 0, bottom: 0, left: 0,
    width: Dimensions.get("window").width * 0.78,
    backgroundColor: "#FFF",
    zIndex: 100,
    ...Shadow.lg,
  },
});
