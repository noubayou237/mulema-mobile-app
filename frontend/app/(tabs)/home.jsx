/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Home Screen + Side Drawer                           ║
 * ║  Swipe left → Quick Access Menu (overlay drawer)              ║
 * ║  Dashboard + Themes grid + Cultural card                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Place at: app/(tabs)/home.jsx
 */

import React, { useEffect, useRef, useState } from "react";
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

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { MButton, MCulturalCard } from "../../src/components/ui/MComponents";

// ── Stores ──
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { useThemeStore } from "../../src/stores/useThemeStore";
import { useDashboardStore } from "../../src/stores/useDashboardStore";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_W * 0.78;
const CARD_W = (SCREEN_W - Space["2xl"] * 2 - Space.md) / 2;

// ── Theme icons ──
const THEME_ICONS = {
  salutation: "hand-left", famille: "people", voyage: "airplane",
  nourriture: "restaurant", animaux: "paw", vetement: "shirt",
};
const getIcon = (name) => {
  const n = (name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [k, v] of Object.entries(THEME_ICONS)) { if (n.includes(k)) return v; }
  return "book";
};

/* ══════════════════════════════════════════════════════════════
   DRAWER — Quick Access Menu
   ══════════════════════════════════════════════════════════════ */

const DrawerContent = ({ user, dashboard, onClose, onNav, onLogout }) => (
  <View style={d.container}>
    {/* Close button */}
    <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={d.closeBtn}>
      <Ionicons name="close" size={24} color={Colors.onSurface} />
    </TouchableOpacity>

    {/* Avatar + Name + Level */}
    <View style={d.profileRow}>
      <View style={d.avatarRing}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={d.avatar} contentFit="cover" />
        ) : (
          <View style={[d.avatar, { backgroundColor: Colors.primary + "20", alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
        )}
      </View>
      <View style={{ marginLeft: Space.lg, flex: 1 }}>
        <Text style={Typo.titleLg} numberOfLines={1}>{user?.name || "Utilisateur"}</Text>
        <Text style={[Typo.labelSm, { color: Colors.primary }]}>
          SCHOLAR LEVEL {Math.floor((dashboard?.totalPoints || 0) / 100)}
        </Text>
      </View>
    </View>

    {/* Streak badge */}
    <View style={d.streakBadge}>
      <Ionicons name="flame" size={16} color={Colors.secondary} />
      <Text style={[Typo.labelLg, { color: Colors.onSurface, marginLeft: Space.sm }]}>
        {dashboard?.streakDays || 0} Day Streak
      </Text>
    </View>

    {/* Quick access menu */}
    <Text style={[Typo.labelSm, { marginTop: Space["3xl"], marginBottom: Space.xl }]}>
      QUICK ACCESS MENU
    </Text>

    <DrawerItem icon="ribbon" label="Quêtes du jour" onPress={() => onNav("quests")} />
    <DrawerItem icon="notifications" label="Notifications" onPress={() => onNav("notifications")} />
    <DrawerItem icon="language" label="Changer de langue" onPress={() => onNav("change-language")} />
    <DrawerItem icon="settings" label="Paramètres" onPress={() => onNav("settings")} highlighted />

    {/* Spacer */}
    <View style={{ flex: 1 }} />

    {/* Logout */}
    <TouchableOpacity onPress={onLogout} activeOpacity={0.7} style={d.logoutBtn}>
      <Ionicons name="log-out-outline" size={20} color={Colors.primary} />
      <Text style={[Typo.titleSm, { color: Colors.primary, marginLeft: Space.md }]}>
        Déconnexion
      </Text>
    </TouchableOpacity>
  </View>
);

const DrawerItem = ({ icon, label, onPress, highlighted }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[d.menuItem, highlighted && d.menuItemHighlighted]}
  >
    <View style={[d.menuIcon, highlighted && { backgroundColor: Colors.primary + "20" }]}>
      <Ionicons name={icon} size={22} color={highlighted ? Colors.primary : Colors.textTertiary} />
    </View>
    <Text style={[Typo.titleSm, { marginLeft: Space.lg, color: highlighted ? Colors.onPrimary : Colors.onSurface }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ══════════════════════════════════════════════════════════════
   HOME HEADER
   ══════════════════════════════════════════════════════════════ */

const HomeHeader = ({ streak = 0, xp = 0 }) => (
  <View style={s.header}>
    <View style={s.headerLeft}>
      <Image source={require("../../assets/images/logo.png")} style={s.headerLogo} contentFit="contain" />
      <Text style={[Typo.titleLg, { color: Colors.primary, marginLeft: Space.sm }]}>Mulema</Text>
    </View>
    <View style={s.headerRight}>
      <View style={s.headerBadge}>
        <Ionicons name="heart" size={16} color={Colors.primaryContainer} />
        <Text style={[Typo.labelLg, { marginLeft: 4 }]}>{streak}</Text>
      </View>
      <View style={[s.headerBadge, s.xpBadge]}>
        <Ionicons name="flash" size={14} color={Colors.secondaryContainer} />
        <Text style={[Typo.labelLg, { color: Colors.primary, marginLeft: 4 }]}>{xp} XP</Text>
      </View>
    </View>
  </View>
);

/* ══════════════════════════════════════════════════════════════
   DASHBOARD CARD
   ══════════════════════════════════════════════════════════════ */

const DashCard = ({ percent = 0, mins = 0, goal = 40, onContinue }) => {
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, { toValue: percent / 100, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [percent]);

  return (
    <View style={[s.dashCard, Shadow.md]}>
      <Text style={[Typo.labelSm, { color: Colors.primary, marginBottom: Space.sm }]}>TABLEAU DE BORD</Text>
      <Text style={[Typo.headlineLg, { marginBottom: Space.xl }]}>Ta progression{"\n"}aujourd'hui</Text>
      <View style={s.goalRow}>
        <Text style={Typo.labelLg}>OBJECTIF QUOTIDIEN</Text>
        <Text style={Typo.bodyMd}>{mins}/{goal} min</Text>
      </View>
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, { width: bar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
        <View style={s.progressLabel}><Text style={[Typo.labelMd, { color: Colors.onPrimary }]}>{percent}%</Text></View>
      </View>
      <MButton title="Continuer l'apprentissage" onPress={onContinue} icon="play" style={{ marginTop: Space["2xl"] }} />
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   THEME CARD
   ══════════════════════════════════════════════════════════════ */

const ThemeCard = ({ theme, onPress }) => {
  const pct = theme.lessonsCount > 0 ? Math.round((theme.lessonsCompleted / theme.lessonsCount) * 100) : 0;
  const locked = theme.locked;
  return (
    <TouchableOpacity onPress={() => !locked && onPress(theme)} activeOpacity={locked ? 1 : 0.7} style={[s.themeCard, Shadow.sm, locked && { opacity: 0.45 }]}>
      <View style={s.themeTop}>
        <View style={s.themeIcon}><Ionicons name={getIcon(theme.name)} size={24} color={locked ? Colors.textTertiary : Colors.primary} /></View>
        <View style={[s.pctBadge, pct > 0 && { backgroundColor: Colors.primary + "18" }]}>
          <Text style={[Typo.labelMd, { color: pct > 0 ? Colors.primary : Colors.textTertiary }]}>{pct}%</Text>
        </View>
      </View>
      <Text style={[Typo.titleSm, { marginTop: Space.md }]} numberOfLines={1}>{theme.name}</Text>
      <Text style={[Typo.labelSm, { marginTop: Space.xs }]}>{String(theme.lessonsCount).padStart(2, "0")} LEÇONS</Text>
      {locked && <View style={s.lockIcon}><Ionicons name="lock-closed" size={16} color={Colors.textTertiary} /></View>}
    </TouchableOpacity>
  );
};

/* ══════════════════════════════════════════════════════════════
   LANGUAGE BANNER
   ══════════════════════════════════════════════════════════════ */

const LangBanner = ({ lang, onPress }) => {
  if (!lang) return null;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.langBanner}>
      <Ionicons name="globe-outline" size={16} color={Colors.primary} />
      <Text style={[Typo.labelLg, { color: Colors.primary, marginLeft: Space.sm, flex: 1 }]}>{lang.name}</Text>
      <Text style={[Typo.bodySm, { color: Colors.textTertiary }]}>Changer</Text>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN SCREEN
   ══════════════════════════════════════════════════════════════ */

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading: tLoading, fetchThemes } = useThemeStore();
  const { data: dash, isLoading: dLoading, fetchDashboard } = useDashboardStore();

  // Les thèmes sont liés aux langues PATRIMONIALES — toujours utiliser cet ID
  const getPatrimonialId = (lang, allLangs) => {
    if (lang?.type === "patrimonial") return lang.id;
    const p = (allLangs || []).find((l) => l.type === "patrimonial");
    return p?.id ?? "c81daa9d-7be2-4896-91c8-7531c994aec5";
  };

  // Charger langue + thèmes au montage
  useEffect(() => {
    const init = async () => {
      if (activeLanguage) {
        fetchThemes(getPatrimonialId(activeLanguage, languages));
        fetchDashboard();
        return;
      }
      const langs = await fetchLanguages().catch(() => []);
      const lang  = await loadActiveLanguage();
      fetchThemes(getPatrimonialId(lang, langs));
      fetchDashboard();
    };
    init();
  }, []);

  // ── Drawer state ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(SCREEN_W)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: SCREEN_W - DRAWER_WIDTH, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: SCREEN_W, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  // ── Swipe gesture (on the main content) ──
  const panRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 50 && !drawerOpen) openDrawer();     // swipe right → open
        if (g.dx < -50 && drawerOpen) closeDrawer();     // swipe left → close
      },
    })
  ).current;

  // ── Navigation from drawer ──
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
      Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", style: "destructive", onPress: () => logout() },
      ]);
    }, 300);
  };

  const handleContinue = () => {
    if (dash?.continueTheme) router.push(`/(tabs)/lessons/${dash.continueTheme.id}`);
    else if (themes.length > 0) router.push(`/(tabs)/lessons/${themes[0].id}`);
    else router.push("/(tabs)/lessons");
  };

  // ── Entry animations ──
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;
  const a4 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(a1, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a2, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a3, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a4, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const fade = (a, y = 15) => ({ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }] });
  const loading = tLoading || dLoading;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ══ MAIN CONTENT ══ */}
      <View style={{ flex: 1 }} {...panRef.panHandlers}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <Animated.View style={fade(a1, 10)}>
            <HomeHeader streak={dash?.streakDays || 0} xp={dash?.totalPoints || 0} />
          </Animated.View>

          <Animated.View style={fade(a1, 10)}>
            <LangBanner lang={activeLanguage} onPress={() => router.push("/modal/change-language")} />
          </Animated.View>

          <Animated.View style={fade(a2, 20)}>
            <DashCard percent={dash?.progressPercent || 0} mins={dash?.totalTimeMinutes || 0} onContinue={handleContinue} />
          </Animated.View>

          {/* Themes */}
          <Animated.View style={[s.themesSection, fade(a3, 20)]}>
            <View style={s.sectionHead}>
              <Text style={Typo.headlineMd}>Thèmes à explorer</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/lessons")} activeOpacity={0.7}>
                <Text style={[Typo.titleSm, { color: Colors.primary }]}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: Space["3xl"] }} />
            ) : themes.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="book-outline" size={40} color={Colors.textTertiary} />
                <Text style={[Typo.bodyMd, { textAlign: "center", marginTop: Space.md }]}>Aucun thème disponible.</Text>
              </View>
            ) : (
              <View style={s.grid}>
                {themes.slice(0, 4).map((t) => (
                  <ThemeCard key={t.id} theme={t} onPress={(th) => router.push(`/(tabs)/lessons/${th.id}`)} />
                ))}
              </View>
            )}
          </Animated.View>

          <Animated.View style={[{ marginTop: Space["2xl"] }, fade(a4, 15)]}>
            <MCulturalCard body={'Le mot "Mulema" signifie "Cœur" dans plusieurs langues bantoues d\'Afrique centrale. Apprendre une langue, c\'est toucher le cœur d\'une culture.'} />
          </Animated.View>

          <View style={{ height: Space["4xl"] }} />
        </ScrollView>
      </View>

      {/* ══ DRAWER OVERLAY ══ */}
      {drawerOpen && (
        <Animated.View style={[d.overlay, { opacity: overlayAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* ══ DRAWER PANEL ══ */}
      <Animated.View style={[d.drawer, { transform: [{ translateX: drawerAnim }] }]}>
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

/* ──────────────────────────────────────────────────────────────
   STYLES — Main screen
   ────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 60 : 44, paddingBottom: Space.lg },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerLogo: { width: 28, height: 28 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  headerBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: Space.md, paddingVertical: Space.sm },
  xpBadge: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.full, ...Shadow.sm },

  langBanner: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary + "0A", borderRadius: Radius.lg, paddingHorizontal: Space.lg, paddingVertical: Space.md, marginBottom: Space.lg },

  dashCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Space["2xl"], marginBottom: Space["2xl"] },
  goalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Space.md },
  progressTrack: { height: 28, backgroundColor: Colors.surfaceVariant, borderRadius: Radius.full, overflow: "hidden", position: "relative", justifyContent: "center" },
  progressFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: Colors.primary, borderRadius: Radius.full },
  progressLabel: { position: "absolute", left: 0, right: 0, alignItems: "center" },

  themesSection: { marginTop: Space.sm },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Space.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Space.md },

  themeCard: { width: CARD_W, backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Space.lg, position: "relative" },
  themeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  themeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + "12", alignItems: "center", justifyContent: "center" },
  pctBadge: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.full, paddingHorizontal: Space.md, paddingVertical: Space.xs },
  lockIcon: { position: "absolute", top: Space.lg, right: Space.lg },
  empty: { alignItems: "center", paddingVertical: Space["4xl"] },
});

/* ──────────────────────────────────────────────────────────────
   STYLES — Drawer
   ────────────────────────────────────────────────────────────── */

const d = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 90,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.surface,
    zIndex: 100,
    ...Shadow.lg,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 44,
    left: Space.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // Profile
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: Space.lg },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 58, height: 58, borderRadius: 29 },

  // Streak
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondaryFixed,
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    alignSelf: "flex-start",
  },

  // Menu items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
  },
  menuItemHighlighted: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: Space.lg,
    marginHorizontal: -Space.lg,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Space.lg,
  },
});