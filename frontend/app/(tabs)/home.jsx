/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Home Screen  v2.0                                      ║
 * ║  Palette camerounaise · Animations cascade · Bottom Sheet        ║
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
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { MCulturalCard } from "../../src/components/ui/MComponents";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { useThemeStore } from "../../src/stores/useThemeStore";
import { useDashboardStore } from "../../src/stores/useDashboardStore";

import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "../../src/i18n";

/* ── Palette camerounaise ── */
const CAM = {
  forest: "#2D6A4F",
  forestLight: "#40916C",
  forestPale: "#D8F3DC",
  orange: "#F4A261",
  orangeLight: "#FFDDD2",
  gold: "#F4C430",
  goldLight: "#FFF3C4",
  dark: "#1B2D2A",
  surface: "#F9FBFA",
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_W * 0.78;
const CARD_W = (SCREEN_W - Space["2xl"] * 2 - Space.md) / 2;
const SHEET_HEIGHT = SCREEN_H * 0.72;

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

/* ════════════════════════════════════════════════════════════════════
   DRAWER — Quick Access Menu
   ════════════════════════════════════════════════════════════════════ */

const DrawerItem = ({ icon, label, onPress, highlighted }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[dr.menuItem, highlighted && dr.menuItemHL]}
  >
    <View style={[dr.menuIcon, highlighted && { backgroundColor: CAM.forest + "25" }]}>
      <Ionicons
        name={icon}
        size={20}
        color={highlighted ? CAM.forest : Colors.textTertiary}
      />
    </View>
    <Text style={[Typo.titleSm, {
      marginLeft: Space.lg,
      color: highlighted ? CAM.forest : Colors.onSurface,
    }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const DrawerContent = ({ user, dashboard, onClose, onNav, onLogout }) => {
  const { t } = useTranslation();
  return (
    <View style={dr.container}>
      {/* Bande décorative verte en haut */}
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
            <View style={[dr.avatar, { backgroundColor: CAM.forestPale, alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="person" size={28} color={CAM.forest} />
            </View>
          )}
        </View>
        <View style={{ marginLeft: Space.lg, flex: 1 }}>
          <Text style={[Typo.titleLg, { color: Colors.onSurface }]} numberOfLines={1}>
            {user?.name || t("common.user", "Utilisateur")}
          </Text>
          <View style={dr.levelBadge}>
            <Ionicons name="star" size={11} color={CAM.gold} />
            <Text style={[Typo.labelSm, { color: CAM.forest, marginLeft: 4 }]}>
              {t("home.scholarLevel", { level: Math.floor((dashboard?.totalPoints || 0) / 100) })}
            </Text>
          </View>
        </View>
      </View>

      {/* Streak (Racines) */}
      <View style={dr.streakBadge}>
        <Ionicons name="leaf" size={15} color={CAM.forest} />
        <Text style={[Typo.labelLg, { color: CAM.dark, marginLeft: Space.sm }]}>
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
        <Ionicons name="log-out-outline" size={18} color={CAM.forest} />
        <Text style={[Typo.titleSm, { color: CAM.forest, marginLeft: Space.md }]}>
          {t("profile.logout")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/* ════════════════════════════════════════════════════════════════════
   BOTTOM SHEET — Leçons d'un thème
   ════════════════════════════════════════════════════════════════════ */

const BottomSheet = ({ theme, onClose, onSelectLesson, appLang }) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose);
  };

  /* Génère des leçons fictives si pas de données */
  const lessons = theme?.lessons || Array.from({ length: theme?.lessonsCount || 4 }, (_, i) => ({
    id: `lesson-${i + 1}`,
    title: t("lessons.lessonNum", { num: i + 1 }),
    subtitle: `${theme?.name || t("common.theme")} · ${t("home.levels.level")} ${i + 1}`,
    done: i < (theme?.lessonsCompleted || 0),
  }));

  return (
    <Modal transparent visible animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[bs.overlay, { opacity: overlayAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={dismiss} />
      </Animated.View>

      <Animated.View style={[bs.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={bs.handle} />

        {/* En-tête thème */}
        <View style={bs.sheetHeader}>
          <View style={[bs.sheetIcon, { backgroundColor: CAM.forestPale }]}>
            <Ionicons name={getIcon(theme?.name)} size={24} color={CAM.forest} />
          </View>
          <View style={{ flex: 1, marginLeft: Space.lg }}>
            <Text style={[Typo.headlineMd, { color: CAM.dark }]}>{theme?.name}</Text>
            <Text style={[Typo.labelSm, { color: CAM.forest }]}>
              {t("home.levels.lessonsCompleted", { completed: theme?.lessonsCompleted || 0, total: theme?.lessonsCount || lessons.length })}
            </Text>
          </View>
          <TouchableOpacity onPress={dismiss} style={bs.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Barre de progression du thème */}
        <View style={bs.progressTrack}>
          <View style={[bs.progressFill, {
            width: `${theme?.lessonsCount > 0 ? Math.round((theme.lessonsCompleted / theme.lessonsCount) * 100) : 0}%`,
          }]} />
        </View>

        {/* Liste des leçons */}
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: Space["2xl"], paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => onSelectLesson(item, index)}
              activeOpacity={0.75}
              style={bs.lessonRow}
            >
              <View style={[bs.lessonNum, item.done && { backgroundColor: CAM.forest }]}>
                {item.done
                  ? <Ionicons name="checkmark" size={14} color="#fff" />
                  : <Text style={[Typo.labelMd, { color: CAM.forest }]}>{index + 1}</Text>
                }
              </View>
              <View style={{ flex: 1, marginLeft: Space.lg }}>
                <Text style={[Typo.titleSm, { color: CAM.dark }]}>
                  {appLang === 'en' && item.title_en ? item.title_en : item.title}
                </Text>
                {item.subtitle && (
                  <Text style={[Typo.labelSm, { color: Colors.textTertiary }]}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons
                name={item.done ? "checkmark-circle" : "play-circle-outline"}
                size={22}
                color={item.done ? CAM.forest : CAM.orange}
              />
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </Modal>
  );
};

/* ════════════════════════════════════════════════════════════════════
   HOME HEADER
   ════════════════════════════════════════════════════════════════════ */

const HomeHeader = ({ streak = 0, xp = 0, onMenuPress, currentLang, onToggleLang }) => {
  const { t } = useTranslation();
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={s.menuBtn}>
          <Ionicons name="menu" size={22} color={CAM.forest} />
        </TouchableOpacity>
        <Image source={require("../../assets/images/logo.png")} style={{ width: 72, height: 72, marginLeft: Space.sm }} contentFit="contain" />
      </View>

      <View style={s.headerRight}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              t("settings.selectLanguage"),
              t("settings.selectLanguageDesc", "Choose the interface language / Choisissez la langue"),
              [
                { text: "Français", onPress: () => onToggleLang('fr') },
                { text: "English", onPress: () => onToggleLang('en') },
                { text: t("common.cancel"), style: "cancel" }
              ]
            );
          }}
          activeOpacity={0.7}
          style={[s.headerBadge, { backgroundColor: CAM.forestPale, paddingHorizontal: 8, paddingVertical: 6 }]}
        >
          <Ionicons name="globe-outline" size={18} color={CAM.forest} />
        </TouchableOpacity>
        <View style={[s.headerBadge, { backgroundColor: CAM.forestPale, marginLeft: Space.xs }]}>
          <Ionicons name="leaf" size={14} color={CAM.forest} />
          <Text style={[Typo.labelLg, { color: CAM.dark, marginLeft: 4 }]}>{streak}</Text>
        </View>
        <View style={[s.headerBadge, { backgroundColor: CAM.goldLight, marginLeft: Space.sm }]}>
          <Ionicons name="restaurant" size={13} color={CAM.gold} />
          <Text style={[Typo.labelLg, { color: CAM.dark, marginLeft: 3 }]}>{xp} {t("common.prawns", "Crevettes")}</Text>
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
      <Text style={[Typo.labelLg, { color: CAM.forest, marginLeft: Space.md, flex: 1 }]}>
        {lang.name}
      </Text>
      <Text style={[Typo.bodySm, { color: CAM.forestLight }]}>{t("common.edit")}</Text>
      <Ionicons name="chevron-forward" size={13} color={CAM.forestLight} style={{ marginLeft: 2 }} />
    </TouchableOpacity>
  );
};

/* ════════════════════════════════════════════════════════════════════
   DASHBOARD CARD — gradient vert forêt
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

      <Text style={[Typo.labelSm, { color: CAM.forestPale + "CC", marginBottom: Space.xs }]}>
        {t("home.yourProgress").toUpperCase()}
      </Text>
      <Text style={[Typo.headlineLg, { color: "#fff", marginBottom: Space["2xl"] }]}>
        {user?.name ? t("home.welcomeUser", { name: user.name, defaultValue: `Bienvenue, ${user.name} ` }) : t("home.welcome")}
      </Text>

      <View style={s.goalRow}>
        <Text style={[Typo.labelLg, { color: CAM.forestPale }]}>{t("home.dailyGoal")}</Text>
        <Text style={[Typo.bodyMd, { color: "#fff" }]}>{mins}/{goal} min</Text>
      </View>

      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, {
          width: bar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }]} />
        <View style={s.progressLabel}>
          <Text style={[Typo.labelMd, { color: CAM.dark }]}>{percent}%</Text>
        </View>
      </View>

      {/* Stats rapides */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Ionicons name="book-outline" size={16} color={CAM.forestPale} />
          <Text style={[Typo.labelSm, { color: CAM.forestPale, marginLeft: 6 }]}>
            {mins} min
          </Text>
        </View>
        <View style={s.statItem}>
          <Ionicons name="trophy-outline" size={16} color={CAM.gold} />
          <Text style={[Typo.labelSm, { color: CAM.gold, marginLeft: 6 }]}>
            {percent >= 100 ? t("home.goalReached") : t("home.remaining", { count: 100 - percent })}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onContinue} activeOpacity={0.85} style={s.continueBtn}>
        <Ionicons name="play" size={16} color={CAM.forest} />
        <Text style={[Typo.titleSm, { color: CAM.forest, marginLeft: Space.sm }]}>
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
  const { t } = useTranslation();
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
          <View style={[s.themeIcon, { backgroundColor: locked ? Colors.surfaceVariant : CAM.forestPale }]}>
            <Ionicons name={getIcon(theme.name)} size={22} color={locked ? Colors.textTertiary : CAM.forest} />
          </View>
          {locked
            ? <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
            : pct > 0 && (
              <View style={s.pctBadge}>
                <Text style={[Typo.labelMd, { color: CAM.forest }]}>{pct}%</Text>
              </View>
            )
          }
        </View>

        <Text style={[Typo.titleSm, { marginTop: Space.md, color: CAM.dark }]} numberOfLines={1}>
          {t("common.theLanguage") === "en" && theme.name_en ? theme.name_en : theme.name}
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
      <View style={[s.exoIcon, { backgroundColor: exo.done ? CAM.forestPale : CAM.orangeLight }]}>
        <Ionicons name={exo.icon} size={18} color={exo.done ? CAM.forest : CAM.orange} />
      </View>
      <Text style={[Typo.titleSm, { flex: 1, marginLeft: Space.lg, color: CAM.dark }]} numberOfLines={1}>
        {exo.label}
      </Text>
      {exo.done ? (
        <View style={s.doneBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
          <Text style={[Typo.labelMd, { color: "#fff", marginLeft: 3 }]}>{t("exercises.done")}</Text>
        </View>
      ) : (
        <View style={s.todoBadge}>
          <Text style={[Typo.labelMd, { color: CAM.orange }]}>{t("exercises.todo")}</Text>
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

  const [selectedTheme, setSelectedTheme] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

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
    return p?.id ?? "c81daa9d-7be2-4896-91c8-7531c994aec5";
  };

  useEffect(() => {
    const init = async () => {
      if (activeLanguage) {
        fetchThemes(getPatrimonialId(activeLanguage, languages));
        fetchDashboard();
        return;
      }
      const langs = await fetchLanguages().catch(() => []);
      const lang = await loadActiveLanguage();
      fetchThemes(getPatrimonialId(lang, langs));
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

  const handleSelectLesson = (lesson, index) => {
    setSheetVisible(false);
    setTimeout(() => {
      router.push(`/(tabs)/lessons/${lesson.id || index + 1}`);
    }, 320);
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
      <StatusBar barStyle="dark-content" backgroundColor={CAM.surface} />

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
              <Text style={[Typo.headlineMd, { color: CAM.dark }]}>{t("home.themesToExplore")}</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/lessons")}
                activeOpacity={0.7}
              >
                <Text style={[Typo.titleSm, { color: CAM.forest }]}>{t("home.seeAll")}</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={CAM.forest}
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
                {themes.slice(0, 4).map((t) => (
                  <ThemeCard key={t.id} theme={t} onPress={openSheet} />
                ))}
              </View>
            )}
          </Animated.View>

          {/* Exercices du jour */}
          <Animated.View style={[s.section, fadeUp(anims[3], 22)]}>
            <View style={s.sectionHead}>
              <Text style={[Typo.headlineMd, { color: CAM.dark }]}>{t("home.exercises")}</Text>
              <View style={s.exoBadgeCount}>
                <Text style={[Typo.labelMd, { color: CAM.forest }]}>
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

          <Animated.View style={[{ marginTop: Space.xl }, fadeUp(anims[4], 15)]}>
            <MCulturalCard
              title={t("common.didYouKnow")}
              body={t("messages.mulemaMeaningLong")}
            />
          </Animated.View>

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

      {/* ══ BOTTOM SHEET ══ */}
      {sheetVisible && selectedTheme && (
        <BottomSheet
          theme={selectedTheme}
          onClose={() => setSheetVisible(false)}
          onSelectLesson={handleSelectLesson}
          appLang={appLang}
        />
      )}
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES — Main screen
   ══════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CAM.surface },
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
    backgroundColor: CAM.surface,
    paddingBottom: Space.sm,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  menuBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: CAM.forestPale,
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
    backgroundColor: CAM.forestPale,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    marginBottom: Space.lg,
  },
  langDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: CAM.forest,
  },

  /* Dashboard card */
  dashCard: {
    backgroundColor: CAM.forest,
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
    backgroundColor: CAM.forestLight + "50",
  },
  dashDeco2: {
    position: "absolute",
    bottom: -20,
    left: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: CAM.gold + "22",
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
    backgroundColor: CAM.gold,
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
    backgroundColor: CAM.gold,
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
    backgroundColor: CAM.forest,
    borderRadius: Radius.full,
  },
  themeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  themeIcon: {
    width: 46, height: 46,
    borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  pctBadge: {
    backgroundColor: CAM.forestPale,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
  },
  empty: { alignItems: "center", paddingVertical: Space["4xl"] },

  /* Exercices */
  exoBadgeCount: {
    backgroundColor: CAM.forestPale,
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
    backgroundColor: CAM.forest,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
  },
  todoBadge: {
    backgroundColor: CAM.orangeLight,
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
    backgroundColor: CAM.forest,
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
    borderColor: CAM.forest,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 55, height: 55, borderRadius: 27.5 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAM.goldLight,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAM.orangeLight,
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
    backgroundColor: CAM.forestPale,
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

/* ══════════════════════════════════════════════════════════════════════
   STYLES — Bottom Sheet
   ══════════════════════════════════════════════════════════════════════ */

const bs = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    ...Shadow.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceVariant,
    marginTop: Space.lg,
    marginBottom: Space.md,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Space["2xl"],
    paddingVertical: Space.lg,
  },
  sheetIcon: {
    width: 48, height: 48,
    borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center", justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: Space["2xl"],
    marginBottom: Space.xl,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: CAM.forest,
    borderRadius: Radius.full,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceVariant,
  },
  lessonNum: {
    width: 32, height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CAM.forest,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "transparent",
  },
});