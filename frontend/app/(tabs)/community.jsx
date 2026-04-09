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
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";

// ── Stores ──
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
// import { useCommunityStore } from "../../src/stores/useCommunityStore";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Ligue tiers (inspiré Duolingo) ──
const LEAGUE_TIERS = [
  { id: "crevette", name: "Ligue des Crevettes", icon: "🦐", color: "#FF9800", minXP: 0 },
  { id: "bronze", name: "Ligue Bronze", icon: "🥉", color: "#CD7F32", minXP: 500 },
  { id: "argent", name: "Ligue Argent", icon: "🥈", color: "#9E9E9E", minXP: 1000 },
  { id: "or", name: "Ligue Or", icon: "🥇", color: "#FFC107", minXP: 2000 },
  { id: "diamant", name: "Ligue Diamant", icon: "💎", color: "#00BCD4", minXP: 5000 },
];

const getLeagueTier = (xp = 0) => {
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEAGUE_TIERS[i].minXP) return LEAGUE_TIERS[i];
  }
  return LEAGUE_TIERS[0];
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
  const tabs = [
    { key: "week", label: "Semaine actuelle" },
    { key: "month", label: "Ce mois" },
    { key: "all", label: "Total" },
  ];
  return (
    <View style={ft.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onChange(tab.key)}
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

const RANK_TAGS = {
  rising: { label: "Vient de monter", color: Colors.primary },
  top10: { label: "Top 10% cette semaine", color: "#FF9800" },
  streak: (days) => ({ label: `Série de ${days} jours`, color: "#E53935" }),
  newcomer: { label: "Nouveau", color: "#9C27B0" },
};

const RankRow = ({ item, isCurrentUser = false }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
            {isCurrentUser ? "C'est vous !" : item.name}
          </Text>
          {isCurrentUser ? (
            <Text style={rr.currentSubtitle}>
              Plus que {item.xpToNextRank || 50} XP pour monter
            </Text>
          ) : tag ? (
            <Text style={[rr.tag, { color: tag.color }]}>{tag.label}</Text>
          ) : null}
        </View>

        {/* XP */}
        <View style={rr.xpCol}>
          <Text style={[rr.xp, isCurrentUser && { color: "#FFF" }]}>{item.totalXP}</Text>
          <Text style={[rr.xpLabel, isCurrentUser && { color: "rgba(255,255,255,0.7)" }]}>
            {isCurrentUser ? "VOTRESCORE" : "XP"}
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
        <Text style={lh.pageTitle}>Classement</Text>
        <View style={lh.navBadges}>
          <View style={lh.badge}>
            <Ionicons name="flame" size={16} color={Colors.secondary} />
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
      <Text style={lh.leagueName}>{league?.name || "Ligue des Crevettes"}</Text>

      {/* Timer */}
      {timeLeft && (
        <View style={lh.timerRow}>
          <Text style={lh.timerLabel}>Se termine dans </Text>
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

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeLanguage } = useLanguageStore();

  // Fallback to mock if store not wired
  const [ranking, setRanking] = useState(MOCK_RANKING);
  const [currentUserRank, setCurrentUserRank] = useState({
    id: "me",
    rank: 42,
    name: user?.name || "Vous",
    totalXP: 310,
    avatar: user?.avatar,
    streakDays: 0,
    xpToNextRank: 50,
    tag: null,
  });
  const [filter, setFilter] = useState("week");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState("2j 14h");

  // Try to use community store if available
  let storeRanking = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const store = require("../../src/stores/useCommunityStore");
    if (store?.useCommunityStore) {
      // Would use store here
    }
  } catch (_) {}

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const league = getLeagueTier(currentUserRank.totalXP);

  return (
    <View style={s.root}>
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
          timeLeft={timeLeft}
          streak={3}
          hearts={5}
          onMenuPress={() => router.push("/modal/menu")}
        />

        {/* ── Podium ── */}
        <Podium top3={top3} leagueColor={league.color} />

        {/* ── Filter + Section label ── */}
        <View style={s.filterRow}>
          <Text style={s.sectionLabel}>LE RESTE DE LA MEUTE</Text>
          <FilterTabs active={filter} onChange={setFilter} />
        </View>

        {/* ── List rang 4+ ── */}
        {loading ? (
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
            <Text style={cu.name}>C'est vous !</Text>
            <Text style={cu.hint}>
              Plus que {currentUserRank.xpToNextRank} XP pour monter
            </Text>
          </View>
          <View style={cu.xpCol}>
            <Text style={cu.xp}>{currentUserRank.totalXP}</Text>
            <Text style={cu.xpLabel}>VOTRESCORE</Text>
          </View>
        </View>
      </View>
    </View>
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