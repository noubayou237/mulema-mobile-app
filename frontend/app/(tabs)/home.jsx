/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Home Screen  v2.0                                      ║
 * ║  App Red UI · Animations cascade · Bottom Sheet                  ║
 * ║  Drawer · Exercices du jour · Navigation complète                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 *  app/(tabs)/home.jsx
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  PanResponder,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { useThemeStore } from "../../src/stores/useThemeStore";
import { useDashboardStore } from "../../src/stores/useDashboardStore";
import { DrawerContent } from "../../src/components/layout/DrawerContent";

import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "../../src/i18n";

/* ── Palette ── */
const RED = Colors.primary;
const RED_L = Colors.primary + "15";
const GREEN = Colors.success || "#2E7D32";
const GREEN_L = GREEN + "15";
const GOLD = Colors.secondaryContainer || "#FD9D1A";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_W * 0.78;
const CARD_W = (SCREEN_W - Space["2xl"] * 2 - Space.md) / 2;

/* ── Icônes de thème ── */
const THEME_ICONS = {
  salutation: "hand-left",
  famille: "people",
  voyage: "airplane",
  nourriture: "restaurant",
  animaux: "paw",
  vetement: "shirt",
};
const getIcon = (name) => {
  const n = (name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [k, v] of Object.entries(THEME_ICONS)) { if (n.includes(k)) return v; }
  return "book";
};

/* ── Exercices basés sur les thèmes (Dynamique) ── */
const getThemeExos = (themes) => {
  if (!themes || themes.length === 0) return [];
  // Afficher les thèmes actifs (commencés)
  const activeThemes = themes.filter((t) => t.lessonsCount > 0 && t.lessonsCompleted > 0);
  
  if (activeThemes.length === 0) {
    // S'il n'a rien commencé, on propose le premier thème dispo
    const first = themes[0];
    return [{
      id: first.id,
      label: first.name,
      icon: getIcon(first.name),
      route: `/(tabs)/lessons/${first.id}`,
      done: false,
    }];
  }

  // Trier par les plus récents (les moins complétés d'abord, ou simplement les 3 premiers)
  return activeThemes.slice(0, 3).map(theme => ({
    id: theme.id,
    label: theme.name,
    icon: getIcon(theme.name),
    route: `/(tabs)/lessons/${theme.id}`,
    done: theme.lessonsCompleted >= theme.lessonsCount,
  }));
};

// Drawer Content moved to shared component

/* ════════════════════════════════════════════════════════════════════
   HOME HEADER
   ════════════════════════════════════════════════════════════════════ */

const HomeHeader = ({ streak = 0, xp = 0, onMenuPress, currentLang, onToggleLang }) => {
  const { t } = useTranslation();
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={s.menuBtn}>
          <Ionicons name="menu" size={22} color={RED} />
        </TouchableOpacity>
        <Image source={require("../../assets/images/logo.png")} style={{ width: 72, height: 72, marginLeft: Space.sm }} contentFit="contain" />
      </View>

      <View style={s.headerRight}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              t("settings.selectLanguage"),
              t("settings.selectLanguageDesc"),
              [
                { text: "Français", onPress: () => onToggleLang('fr') },
                { text: "English", onPress: () => onToggleLang('en') },
                { text: t("common.cancel"), style: "cancel" }
              ]
            );
          }}
          activeOpacity={0.7}
          style={[s.headerBadge, { backgroundColor: RED_L, paddingHorizontal: 8, paddingVertical: 6 }]}
        >
          <Ionicons name="globe-outline" size={18} color={RED} />
        </TouchableOpacity>
        <View style={[s.headerBadge, { backgroundColor: GREEN_L, marginLeft: Space.xs }]}>
          <Ionicons name="leaf" size={14} color={GREEN} />
          <Text style={[Typo.labelLg, { color: Colors.onSurface, marginLeft: 4 }]}>{streak}</Text>
        </View>
        <View style={[s.headerBadge, { backgroundColor: "#FFF7E6", marginLeft: Space.sm }]}>
          <Ionicons name="restaurant" size={13} color={GOLD} />
          <Text style={[Typo.labelLg, { color: Colors.onSurface, marginLeft: 3 }]}>{xp} {t("common.prawns")}</Text>
        </View>
      </View>
    </View>
  );
};

/* ════════════════════════════════════════════════════════════════════
   LANGUAGE BANNER
   ════════════════════════════════════════════════════════════════════ */

const LangBanner = ({ lang, onPress }) => {
  const { t } = useTranslation();
  if (!lang) return null;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.langBanner}>
      <View style={s.langDot} />
      <Text style={[Typo.labelLg, { color: RED, marginLeft: Space.md, flex: 1 }]}>
        {lang.name}
      </Text>
      <Text style={[Typo.bodySm, { color: RED }]}>{t("common.edit")}</Text>
      <Ionicons name="chevron-forward" size={13} color={RED} style={{ marginLeft: 2 }} />
    </TouchableOpacity>
  );
};

/* ════════════════════════════════════════════════════════════════════
   DASHBOARD CARD
   ════════════════════════════════════════════════════════════════════ */

const DashCard = ({ user, percent = 0, mins = 0, goal = 40, onContinue }) => {
  const { t } = useTranslation();
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, {
      toValue: percent / 100,
      duration: 1100,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent]);

  return (
    <View style={[s.dashCard, Shadow.md]}>
      {/* Déco géométrique */}
      <View style={s.dashDeco1} />
      <View style={s.dashDeco2} />

      <Text style={[Typo.labelSm, { color: "rgba(255,255,255,0.8)", marginBottom: Space.xs }]}>
        {t("home.yourProgress").toUpperCase()}
      </Text>
      <Text style={[Typo.headlineLg, { color: "#fff", marginBottom: Space["2xl"] }]}>
        {user?.name ? t("home.welcomeUser", { name: user.name, defaultValue: `Bienvenue, ${user.name} ` }) : t("home.welcome")}
      </Text>

      <View style={s.goalRow}>
        <Text style={[Typo.labelLg, { color: "rgba(255,255,255,0.8)" }]}>{t("home.dailyGoal")}</Text>
        <Text style={[Typo.bodyMd, { color: "#fff" }]}>{mins}/{goal} min</Text>
      </View>

      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, {
          width: bar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }]} />
        <View style={s.progressLabel}>
          <Text style={[Typo.labelMd, { color: "#FFF" }]}>{percent}%</Text>
        </View>
      </View>

      {/* Stats rapides */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Ionicons name="book-outline" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={[Typo.labelSm, { color: "rgba(255,255,255,0.8)", marginLeft: 6 }]}>
            {mins} min
          </Text>
        </View>
        <View style={s.statItem}>
          <Ionicons name="trophy-outline" size={16} color={GOLD} />
          <Text style={[Typo.labelSm, { color: GOLD, marginLeft: 6 }]}>
            {percent >= 100 ? t("home.goalReached") : t("home.remainingPercent", { count: 100 - percent })}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onContinue} activeOpacity={0.85} style={s.continueBtn}>
        <Ionicons name="play" size={16} color={RED} />
        <Text style={[Typo.titleSm, { color: RED, marginLeft: Space.sm }]}>
          {t("home.continueLearning")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/* ════════════════════════════════════════════════════════════════════
   THEME CARD
   ════════════════════════════════════════════════════════════════════ */

const ThemeCard = ({ theme, onPress }) => {
  const { t, i18n } = useTranslation();
  const pct = theme.lessonsCount > 0 ? Math.round((theme.lessonsCompleted / theme.lessonsCount) * 100) : 0;
  const locked = theme.locked;
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => !locked && onPress(theme)}
        onPressIn={!locked ? pressIn : undefined}
        onPressOut={!locked ? pressOut : undefined}
        activeOpacity={locked ? 1 : 0.9}
        style={[s.themeCard, Shadow.sm, locked && { opacity: 0.45 }]}
      >
        {pct > 0 && <View style={[s.themeProgress, { width: `${pct}%` }]} />}

        <View style={s.themeTop}>
          <View style={[s.themeIcon, { backgroundColor: locked ? Colors.surfaceVariant : RED_L }]}>
            <Ionicons name={getIcon(theme.name)} size={22} color={locked ? Colors.textTertiary : RED} />
          </View>
          {locked
            ? <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
            : pct > 0 && (
              <View style={s.pctBadge}>
                <Text style={[Typo.labelMd, { color: GREEN }]}>{pct}%</Text>
              </View>
            )
          }
        </View>

        <Text style={[Typo.titleSm, { marginTop: Space.md, color: Colors.onSurface }]} numberOfLines={1}>
          {i18n.language.startsWith("en") && theme.name_en ? theme.name_en : theme.name}
        </Text>
        <Text style={[Typo.labelSm, { marginTop: Space.xs, color: Colors.textTertiary }]}>
          {t("lessons.lessonsCount", { count: theme.lessonsCount })}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ════════════════════════════════════════════════════════════════════
   EXERCICES DU JOUR
   ════════════════════════════════════════════════════════════════════ */

const ExerciseRow = ({ exo, onPress }) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.exoRow}>
      <View style={[s.exoIcon, { backgroundColor: exo.done ? GREEN_L : Colors.surfaceContainerLow }]}>
        <Ionicons name={exo.icon} size={18} color={exo.done ? GREEN : Colors.textTertiary} />
      </View>
      <Text style={[Typo.titleSm, { flex: 1, marginLeft: Space.lg, color: Colors.onSurface }]} numberOfLines={1}>
        {exo.label}
      </Text>
      {exo.done ? (
        <View style={s.doneBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
          <Text style={[Typo.labelMd, { color: "#fff", marginLeft: 3 }]}>{t("exercises.done")}</Text>
        </View>
      ) : (
        <View style={s.todoBadge}>
          <Text style={[Typo.labelMd, { color: Colors.textTertiary }]}>{t("exercises.todo")}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/* ════════════════════════════════════════════════════════════════════
   MAIN SCREEN
   ════════════════════════════════════════════════════════════════════ */

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading: tLoading, fetchThemes } = useThemeStore();
  const { data: dash, isLoading: dLoading, fetchDashboard } = useDashboardStore();

  const { t, i18n } = useTranslation();
  const [appLang, setAppLang] = useState(i18n.language || 'fr');

  const handleToggleLang = async (nextLang) => {
    if (nextLang === appLang) return;
    await changeLanguage(nextLang);
    setAppLang(nextLang);
  };

  const getPatrimonialId = (lang, allLangs) => {
    if (lang?.type === "patrimonial") return lang.id;
    const p = (allLangs || []).find((l) => l.type === "patrimonial");
    return p?.id ?? null;
  };

  useEffect(() => {
    const init = async () => {
      if (activeLanguage) {
        const langId = getPatrimonialId(activeLanguage, languages);
      if (langId) fetchThemes(langId);
        fetchDashboard();
        return;
      }
      const langs = await fetchLanguages().catch(() => []);
      const lang = await loadActiveLanguage();
      const langId2 = getPatrimonialId(lang, langs);
      if (langId2) fetchThemes(langId2);
      fetchDashboard();
    };
    init();
  }, []);

  /* ── Drawer ── */
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

  /* ── Swipe pour ouvrir/fermer le drawer ── */
  const panRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 50 && !drawerOpen) openDrawer();
        if (g.dx < -50 && drawerOpen) closeDrawer();
      },
    })
  ).current;

  /* ── Navigation depuis le drawer ── */
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

  /* ── Bottom Sheet ── */
  const openSheet = (theme) => {
    router.push(`/(tabs)/lessons/${theme.id}`);
  };

  /* ── Continuer ── */
  const handleContinue = () => {
    if (dash?.continueTheme) router.push(`/(tabs)/lessons/${dash.continueTheme.id}`);
    else if (themes?.length > 0) router.push(`/(tabs)/lessons/${themes[0].id}`);
    else router.push("/(tabs)/lessons");
  };

  /* ── Animations d'entrée en cascade ── */
  const anims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(90, anims.map((a) =>
      Animated.timing(a, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const fadeUp = (a, y = 18) => ({
    opacity: a,
    transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }],
  });

  const loading = tLoading || dLoading;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ══ CONTENU PRINCIPAL ══ */}
      <View style={{ flex: 1 }} {...panRef.panHandlers}>
        {/* ── Sticky Header + Lang Banner ── */}
        <View style={s.stickySection}>
          <HomeHeader
            streak={dash?.streakDays || 0}
            xp={dash?.totalPoints || 0}
            onMenuPress={openDrawer}
            currentLang={appLang}
            onToggleLang={handleToggleLang}
          />
          <View style={{ paddingHorizontal: Space["2xl"] }}>
            <LangBanner
              lang={activeLanguage}
              onPress={() => router.push("/modal/change-language")}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: 140 }]}
          showsVerticalScrollIndicator={false}
        >

          {/* Dashboard */}
          <Animated.View style={fadeUp(anims[1], 22)}>
            <DashCard
              user={user}
              percent={dash?.progressPercent || 0}
              mins={dash?.totalTimeMinutes || 0}
              onContinue={handleContinue}
            />
          </Animated.View>

          {/* Thèmes */}
          <Animated.View style={[s.section, fadeUp(anims[2], 22)]}>
            <View style={s.sectionHead}>
              <Text style={[Typo.headlineMd, { color: Colors.onSurface }]}>{t("home.themesToExplore")}</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/lessons")}
                activeOpacity={0.7}
              >
                <Text style={[Typo.titleSm, { color: RED }]}>{t("home.seeAll")}</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={RED}
                style={{ marginVertical: Space["3xl"] }}
              />
            ) : themes.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="book-outline" size={38} color={Colors.textTertiary} />
                <Text style={[Typo.bodyMd, { textAlign: "center", marginTop: Space.md }]}>
                  {t("home.noThemes")}
                </Text>
              </View>
            ) : (
              <View style={s.grid}>
                {themes.slice(0, 4).map((theme) => (
                  <ThemeCard key={theme.id} theme={theme} onPress={openSheet} />
                ))}
              </View>
            )}
          </Animated.View>

          {/* Exercices du jour */}
          <Animated.View style={[s.section, fadeUp(anims[3], 22)]}>
            <View style={s.sectionHead}>
              <Text style={[Typo.headlineMd, { color: Colors.onSurface }]}>{t("home.exercises")}</Text>
              <View style={s.exoBadgeCount}>
                <Text style={[Typo.labelMd, { color: RED }]}>
                  {getThemeExos(themes).filter((e) => e.done).length}/{getThemeExos(themes).length}
                </Text>
              </View>
            </View>

            <View style={s.exoList}>
              {getThemeExos(themes).map((exo) => (
                <ExerciseRow
                  key={exo.id}
                  exo={exo}
                  onPress={() => router.push(exo.route)}
                />
              ))}
            </View>
          </Animated.View>

          <View style={{ height: Space["4xl"] }} />

          <View style={{ height: Space["4xl"] }} />
        </ScrollView>
      </View>

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
      <Animated.View style={[dr.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <DrawerContent
          user={user}
          dashboard={dash}
          onClose={closeDrawer}
          onNav={handleDrawerNav}
          onLogout={handleLogout}
        />
      </Animated.View>

    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES — Main screen
   ══════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 58 : 40,
    paddingBottom: Space.md,
    paddingHorizontal: Space["2xl"],
  },
  stickySection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.surface,
    paddingBottom: Space.sm,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  menuBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: RED_L,
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center" },
  headerLogo: { width: 42, height: 42 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
    borderRadius: Radius.full,
  },

  /* Lang banner */
  langBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: RED_L,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    marginBottom: Space.lg,
  },
  langDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },

  /* Dashboard card */
  dashCard: {
    backgroundColor: RED,
    borderRadius: Radius.xl,
    padding: Space["4xl"],
    marginBottom: Space["2xl"],
    overflow: "hidden",
    position: "relative",
  },
  dashDeco1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  dashDeco2: {
    position: "absolute",
    bottom: -20,
    left: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Space.md,
  },
  progressTrack: {
    height: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: Radius.full,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    backgroundColor: GREEN, // Keep Green for progress metric
    borderRadius: Radius.full,
  },
  progressLabel: {
    position: "absolute",
    left: 0, right: 0,
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Space.lg,
    marginBottom: Space["2xl"],
  },
  statItem: { flexDirection: "row", alignItems: "center" },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingVertical: Space.lg,
    paddingHorizontal: Space["2xl"],
  },

  /* Section */
  section: { marginTop: Space.sm },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Space.xl,
  },

  /* Theme grid */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Space.md },
  themeCard: {
    width: CARD_W,
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: Space.lg,
    overflow: "hidden",
    position: "relative",
  },
  themeProgress: {
    position: "absolute",
    bottom: 0, left: 0,
    height: 3,
    backgroundColor: GREEN, // Keep green for progress
    borderRadius: Radius.full,
  },
  themeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  themeIcon: {
    width: 46, height: 46,
    borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  pctBadge: {
    backgroundColor: GREEN_L,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
  },
  empty: { alignItems: "center", paddingVertical: Space["4xl"] },

  /* Exercices */
  exoBadgeCount: {
    backgroundColor: RED_L,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
  },
  exoList: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadow.sm,
  },
  exoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Space.lg,
    paddingVertical: Space.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceVariant,
  },
  exoIcon: {
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN, // Done is success metric
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
  },
  todoBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
  },
});

/* ══════════════════════════════════════════════════════════════════════
   STYLES — Drawer
   ══════════════════════════════════════════════════════════════════════ */

const dr = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    zIndex: 100,
    ...Shadow.lg,
  },
  topStripe: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 4,
    backgroundColor: RED,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 64 : 48,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 42,
    right: Space.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Space.lg,
    marginTop: Space.md,
  },
  avatarRing: {
    width: 60, height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: RED,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: RED_L,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_L,
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    alignSelf: "flex-start",
    marginBottom: Space.md,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.surfaceVariant,
    marginVertical: Space.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
  },
  menuItemHL: {
    backgroundColor: RED_L,
    borderRadius: Radius.xl,
    paddingHorizontal: Space.lg,
    marginHorizontal: -Space.lg,
  },
  menuIcon: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center", justifyContent: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
  },
});

