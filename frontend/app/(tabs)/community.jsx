/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Page Communauté / Classement (Leagues)              ║
 * ║  Podium top 3 + Liste des joueurs + Carte joueur connecté     ║
 * ║  Filtres : Semaine / Mois / Total                             ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Place at: app/(tabs)/community.jsx  (ou leagues.jsx)
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
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";

// ── Stores ──
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { useDashboardStore } from "../../src/stores/useDashboardStore";
import { DrawerContent } from "../../src/components/layout/DrawerContent";
import { useTranslation } from "react-i18next";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Ligue tiers (inspiré Duolingo) ──
const getLeagueTiers = (t) => [
  { id: "crevette", name: t("leagues.shrimp"), icon: "🦐", color: "#FF9800", minXP: 0 },
  { id: "bronze", name: t("leagues.bronze"), icon: "🥉", color: "#CD7F32", minXP: 500 },
  { id: "argent", name: t("leagues.silver"), icon: "🥈", color: "#9E9E9E", minXP: 1000 },
  { id: "or", name: t("leagues.gold"), icon: "🥇", color: "#FFC107", minXP: 2000 },
  { id: "diamant", name: t("leagues.diamond"), icon: "💎", color: "#00BCD4", minXP: 5000 },
];

const getLeagueTier = (xp = 0, t) => {
  const tiers = getLeagueTiers(t);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (xp >= tiers[i].minXP) return tiers[i];
  }
  return tiers[0];
};

/* ══════════════════════════════════════════════════════════════
   AVATAR COMPONENT
   ══════════════════════════════════════════════════════════════ */
const Avatar = ({ uri, size = 48, rank, borderColor = Colors.primary }) => (
  <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2.5,
        borderColor,
        overflow: "hidden",
        backgroundColor: Colors.surfaceVariant,
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.primary + "18",
          }}
        >
          <Ionicons name="person" size={size * 0.4} color={Colors.primary} />
        </View>
      )}
    </View>
    {rank && (
      <View
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: borderColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: Colors.surface,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFF" }}>{rank}</Text>
      </View>
    )}
  </View>
);

/* ══════════════════════════════════════════════════════════════
   PODIUM (Top 3)
   ══════════════════════════════════════════════════════════════ */
const Podium = ({ top3 = [], leagueColor = "#FF9800" }) => {
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const podiumAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(podiumAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const PodiumUser = ({ user, position, size = 56, elevated = false }) => {
    if (!user) return <View style={{ width: size + 20, height: elevated ? 160 : 130 }} />;
    return (
      <Animated.View
        style={[
          pod.userCol,
          { opacity: podiumAnim, transform: [{ scale: podiumAnim }] },
        ]}
      >
        <Avatar
          uri={user.avatar}
          size={elevated ? 72 : size}
          rank={position}
          borderColor={leagueColor}
        />
        <Text style={[pod.name, elevated && { fontSize: 15, fontWeight: "800" }]} numberOfLines={1}>
          {user.name}
        </Text>
        <View style={[pod.xpBadge, { backgroundColor: leagueColor + "22" }]}>
          <Text style={[pod.xpText, { color: leagueColor }]}>{user.totalXP} XP</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={pod.container}>
      {/* 2nd place */}
      <PodiumUser user={second} position={2} size={52} />
      {/* 1st place (center, elevated) */}
      <PodiumUser user={first} position={1} size={72} elevated />
      {/* 3rd place */}
      <PodiumUser user={third} position={3} size={52} />
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   FILTER TABS
   ══════════════════════════════════════════════════════════════ */
const FilterTabs = ({ active, onChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { key: "all", label: t("common.total") },
    { key: "month", label: t("common.thisMonth"), comingSoon: true },
    { key: "week", label: t("common.currentWeek"), comingSoon: true },
  ];
  return (
    <View style={ft.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => {
            if (tab.comingSoon) {
              Alert.alert(
                t("common.comingSoon", "Bientôt disponible"),
                t("community.filterComingSoon", "Le filtrage par période sera disponible dans une prochaine mise à jour.")
              );
              return;
            }
            onChange(tab.key);
          }}
          activeOpacity={0.7}
          style={[ft.tab, active === tab.key && ft.tabActive]}
        >
          <Text style={[ft.label, active === tab.key && ft.labelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   RANK ROW (joueurs 4+)
   ══════════════════════════════════════════════════════════════ */

const getRankTags = (t) => ({
  rising: { label: t("community.ranks.rising"), color: Colors.primary },
  top10: { label: t("community.ranks.top10"), color: "#FF9800" },
  streak: (days) => ({ label: t("community.ranks.streak", { count: days }), color: Colors.success }),
  newcomer: { label: t("community.ranks.newcomer"), color: "#9C27B0" },
});

const RankRow = ({ item, isCurrentUser = false }) => {
  const { t } = useTranslation();
  const RANK_TAGS = getRankTags(t);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: (item.rank - 4) * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: (item.rank - 4) * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  let tag = null;
  if (item.tag === "rising") tag = RANK_TAGS.rising;
  else if (item.tag === "top10") tag = RANK_TAGS.top10;
  else if (item.tag === "newcomer") tag = RANK_TAGS.newcomer;
  else if (item.streakDays > 0) tag = RANK_TAGS.streak(item.streakDays);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={[rr.row, isCurrentUser && rr.rowHighlighted, Shadow.sm]}>
        {/* Rank number */}
        <Text style={[rr.rankNum, isCurrentUser && { color: "#FFF" }]}>{item.rank}</Text>

        {/* Avatar */}
        <Avatar
          uri={item.avatar}
          size={44}
          borderColor={isCurrentUser ? "#FFF" : Colors.surfaceVariant}
        />

        {/* Name + tag */}
        <View style={rr.nameCol}>
          <Text style={[rr.name, isCurrentUser && { color: "#FFF" }]} numberOfLines={1}>
            {isCurrentUser ? t("community.isYou") : item.name}
          </Text>
          {isCurrentUser ? (
            <Text style={rr.currentSubtitle}>
              {t("community.xpToNextRank", { xp: item.xpToNextRank || 50 })}
            </Text>
          ) : tag ? (
            <Text style={[rr.tag, { color: tag.color }]}>{tag.label}</Text>
          ) : null}
        </View>

        {/* XP */}
        <View style={rr.xpCol}>
          <Text style={[rr.xp, isCurrentUser && { color: "#FFF" }]}>{item.totalXP}</Text>
          <Text style={[rr.xpLabel, isCurrentUser && { color: "rgba(255,255,255,0.7)" }]}>
            {isCurrentUser ? t("community.yourScore") : t("stats.xp")}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

/* ══════════════════════════════════════════════════════════════
   LEAGUE HEADER CARD
   ══════════════════════════════════════════════════════════════ */
const LeagueHeader = ({ league, timeLeft, onMenuPress, streak, hearts }) => {
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={lh.wrapper}>
      {/* Top nav */}
      <View style={lh.topNav}>
        <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={lh.menuBtn}>
          <Ionicons name="menu" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={lh.pageTitle}>{t("nav.community")}</Text>
        <View style={lh.navBadges}>
          <View style={lh.badge}>
            <Ionicons name="flame" size={16} color={Colors.success} />
            <Text style={lh.badgeNum}>{streak}</Text>
          </View>
          <View style={[lh.badge, lh.heartBadge]}>
            <Ionicons name="heart" size={16} color="#E53935" />
            <Text style={lh.badgeNum}>{hearts}</Text>
          </View>
        </View>
      </View>

      {/* League icon */}
      <Animated.Text style={[lh.leagueEmoji, { transform: [{ scale: pulseAnim }] }]}>
        {league?.icon || "🦐"}
      </Animated.Text>

      {/* League name */}
      <Text style={lh.leagueName}>{league?.name}</Text>

      {/* Timer */}
      {timeLeft && (
        <View style={lh.timerRow}>
          <Text style={lh.timerLabel}>{t("community.endsIn")}</Text>
          <Text style={[lh.timerValue, { color: league?.color || Colors.secondary }]}>
            {timeLeft}
          </Text>
        </View>
      )}
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN SCREEN
   ══════════════════════════════════════════════════════════════ */

// Mock data fallback (à remplacer par l'API réelle)
const MOCK_RANKING = [
  { id: "1", rank: 1, name: "Fatou D.", totalXP: 1850, avatar: null, streakDays: 12, tag: null },
  { id: "2", rank: 2, name: "Amadou", totalXP: 1420, avatar: null, streakDays: 8, tag: null },
  { id: "3", rank: 3, name: "Koffi", totalXP: 1280, avatar: null, streakDays: 5, tag: null },
  { id: "4", rank: 4, name: "Jean-Marc", totalXP: 940, avatar: null, streakDays: 5, tag: null },
  { id: "5", rank: 5, name: "Awa Sow", totalXP: 820, avatar: null, streakDays: 0, tag: "rising" },
  { id: "6", rank: 6, name: "Moussa", totalXP: 750, avatar: null, streakDays: 0, tag: "top10" },
  { id: "7", rank: 7, name: "Aïcha B.", totalXP: 640, avatar: null, streakDays: 3, tag: null },
  { id: "8", rank: 8, name: "Léon K.", totalXP: 590, avatar: null, streakDays: 0, tag: "newcomer" },
];

// Normalise a raw leaderboard entry from the API into the shape this UI expects
const normaliseEntry = (entry, index) => ({
  id:          entry.id ?? String(index),
  rank:        entry.rank ?? index + 1,
  name:        entry.name ?? entry.username ?? "—",
  totalXP:     entry.totalXP ?? entry.totalPoints ?? entry.xp ?? 0,
  avatar:      entry.avatarUrl ?? entry.avatar ?? null,
  streakDays:  entry.streakDays ?? 0,
  tag:         entry.tag ?? null,
  xpToNextRank: entry.xpToNextRank ?? 50,
});

export default function CommunityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { activeLanguage } = useLanguageStore();
  const {
    leaderboard: rawLeaderboard,
    leaderboardLoading,
    data: dashData,
    fetchLeaderboard,
    fetchDashboard,
  } = useDashboardStore();

  const [filter, setFilter] = useState("all");
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

  // Fetch on mount
  useEffect(() => {
    fetchLeaderboard();
    fetchDashboard();
  }, []);

  // Use real data when available, fall back to mock
  const hasRealData = rawLeaderboard.length > 0;
  const ranking = hasRealData
    ? rawLeaderboard.map(normaliseEntry)
    : MOCK_RANKING;

  const userXP   = dashData?.totalPoints ?? 310;
  const streak   = dashData?.streakDays  ?? 0;
  const hearts   = dashData?.hearts      ?? 5;

  // Find the current user's leaderboard entry to get real xpToNextRank
  const myLeaderboardEntry = hasRealData
    ? rawLeaderboard.find((e) => e.isCurrentUser)
    : null;

  const myRankInList = ranking.findIndex((r) => r.id === user?.id);

  const currentUserRank = {
    id:           "me",
    rank:         myRankInList >= 0 ? myRankInList + 1 : 42,
    name:         user?.name || t("community.isYou"),
    totalXP:      userXP,
    avatar:       user?.avatar ?? null,
    streakDays:   streak,
    xpToNextRank: myLeaderboardEntry?.xpToNextRank ?? 50,
    tag:          null,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchLeaderboard(), fetchDashboard()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLeaderboard, fetchDashboard]);

  const top3  = ranking.slice(0, 3);
  const rest  = ranking.slice(3);
  const league = getLeagueTier(currentUserRank.totalXP, t);

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header avec ligue ── */}
        <LeagueHeader
          league={league}
          timeLeft={null}
          streak={streak}
          hearts={hearts}
          onMenuPress={openDrawer}
        />

        {/* ── Podium ── */}
        <Podium top3={top3} leagueColor={league.color} />

        {/* ── Filter + Section label ── */}
        <View style={s.filterRow}>
          <Text style={s.sectionLabel}>{t("community.otherPlayers")}</Text>
          <FilterTabs active={filter} onChange={setFilter} />
        </View>

        {/* ── List rang 4+ ── */}
        {leaderboardLoading && !hasRealData ? (
          <ActivityIndicator
            color={Colors.primary}
            size="large"
            style={{ marginVertical: Space["4xl"] }}
          />
        ) : (
          <View style={s.rankList}>
            {rest.map((item) => (
              <RankRow
                key={item.id}
                item={item}
                isCurrentUser={item.id === currentUserRank.id}
              />
            ))}
          </View>
        )}

        {/* ── Carte "vous" épinglée ── */}
        <View style={{ height: Space["4xl"] }} />
      </ScrollView>

      {/* ── Carte utilisateur actuel (sticky bottom) ── */}
      <View style={cu.stickyWrapper}>
        <View style={cu.card}>
          <Text style={cu.rank}>{currentUserRank.rank}</Text>
          <Avatar
            uri={currentUserRank.avatar}
            size={40}
            borderColor="#FFF"
          />
          <View style={cu.textCol}>
            <Text style={cu.name}>{t("community.isYou")}</Text>
            <Text style={cu.hint}>
              {t("community.xpToNextRank", { xp: currentUserRank.xpToNextRank })}
            </Text>
          </View>
          <View style={cu.xpCol}>
            <Text style={cu.xp}>{currentUserRank.totalXP}</Text>
            <Text style={cu.xpLabel}>{t("community.yourScore")}</Text>
          </View>
        </View>
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
      <Animated.View style={[lh.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <DrawerContent
          user={user}
          dashboard={dashData}
          onClose={closeDrawer}
          onNav={handleDrawerNav}
          onLogout={handleLogout}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingBottom: 100, // room for sticky card
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Space["2xl"],
    marginTop: Space["2xl"],
    marginBottom: Space.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.onSurface,
    letterSpacing: 0.5,
  },
  rankList: {
    paddingHorizontal: Space["2xl"],
    gap: Space.sm,
  },
});

// League header
const lh = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingBottom: Space["2xl"],
    backgroundColor: Colors.surface,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: Space.md,
    paddingHorizontal: Space["2xl"],
    width: "100%",
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: "Fredoka_700Bold",
    color: Colors.onSurface,
  },
  navBadges: { flexDirection: "row", gap: Space.sm },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 6,
    gap: 4,
    ...Shadow.sm,
  },
  heartBadge: {},
  badgeNum: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.onSurface,
  },
  leagueEmoji: {
    fontSize: 64,
    marginTop: Space.sm,
  },
  leagueName: {
    fontSize: 22,
    fontFamily: "Fredoka_700Bold",
    color: Colors.onSurface,
    marginTop: Space.sm,
    textAlign: "center",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Space.sm,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: Colors.textTertiary,
  },
  timerValue: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
  },
  drawer: {
    position: "absolute",
    top: 0, bottom: 0, left: 0,
    width: Dimensions.get("window").width * 0.78,
    backgroundColor: "#FFF",
    zIndex: 100,
    ...Shadow.lg,
  },
});

// Podium
const pod = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: Space["2xl"],
    gap: Space.lg,
    marginTop: Space.lg,
  },
  userCol: {
    alignItems: "center",
    width: (SCREEN_W - Space["2xl"] * 2 - Space.lg * 2) / 3,
  },
  name: {
    fontSize: 13,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.onSurface,
    marginTop: Space.sm,
    textAlign: "center",
  },
  xpBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Space.md,
    paddingVertical: 3,
    marginTop: 4,
  },
  xpText: {
    fontSize: 12,
    fontFamily: "Fredoka_600SemiBold",
  },
});

// Filter tabs
const ft = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
  },
  tab: {
    paddingHorizontal: Space.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tabActive: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  label: {
    fontSize: 11,
    fontFamily: "Nunito-SemiBold",
    color: Colors.textTertiary,
  },
  labelActive: {
    color: Colors.onSurface,
  },
});

// Rank rows
const rr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.md,
    ...Shadow.sm,
  },
  rowHighlighted: {
    backgroundColor: Colors.primary,
  },
  rankNum: {
    width: 20,
    fontSize: 15,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.textTertiary,
    textAlign: "center",
  },
  nameCol: { flex: 1 },
  name: {
    fontSize: 15,
    fontFamily: "Fredoka_600SemiBold",
    color: Colors.onSurface,
  },
  tag: {
    fontSize: 12,
    fontFamily: "Nunito-SemiBold",
    marginTop: 2,
  },
  currentSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  xpCol: { alignItems: "flex-end" },
  xp: {
    fontSize: 18,
    fontFamily: "Fredoka_700Bold",
    color: Colors.primary,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: "Nunito-SemiBold",
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
});

// Current user sticky
const cu = StyleSheet.create({
  stickyWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    paddingTop: Space.sm,
    backgroundColor: Colors.surface,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.md,
    ...Shadow.lg,
  },
  rank: {
    width: 28,
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    textAlign: "center",
  },
  textCol: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  hint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  xpCol: { alignItems: "flex-end" },
  xp: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
  },
  xpLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
});