/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Profile Screen                                      ║
 * ║  Matches Userprofile.png maquette                             ║
 * ║  Place at: app/(tabs)/profile/index.jsx                       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Animated, Easing,
  StyleSheet, Platform, Dimensions, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Typo, Space, Radius, Shadow } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/useAuthStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

const { width } = Dimensions.get("window");
const STAT_W = (width - Space["2xl"] * 2 - Space.md) / 2;
const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

/* ══════════════════════════════════════════════════════════════ */

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dash, fetchDashboard } = useDashboardStore();

  useEffect(() => { fetchDashboard(); }, []);

  // Animations
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(a1, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a2, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a3, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const fade = (a, y = 15) => ({ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }] });

  const level = Math.floor((dash?.totalPoints || 0) / 100);
  const streak = dash?.streakDays || 0;
  const wordsLearned = dash?.wordsLearned || 0;
  const totalHours = Math.round((dash?.totalTimeMinutes || 0) / 60);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={[Typo.titleLg, { flex: 1, marginLeft: Space.md }]}>{user?.name || "Profil"}</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile/settings")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="settings-outline" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* ── Avatar + Name ── */}
        <Animated.View style={[s.avatarSection, fade(a1, 20)]}>
          <View style={s.avatarRing}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={s.avatar} contentFit="cover" />
            ) : (
              <View style={[s.avatar, { backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center" }]}>
                <Ionicons name="person" size={48} color={Colors.primary} />
              </View>
            )}
            {/* Level badge */}
            <View style={s.levelBadge}>
              <Ionicons name="ribbon" size={14} color={Colors.secondaryContainer} />
            </View>
          </View>
          <Text style={[Typo.labelSm, { color: Colors.secondary, marginTop: Space.lg }]}>APPRENANT ÉLITE</Text>
          <Text style={[Typo.displayMd, { marginTop: Space.xs }]}>{user?.name || "Utilisateur"}</Text>

          {/* Edit button */}
          <TouchableOpacity activeOpacity={0.8} style={s.editBtn}>
            <Ionicons name="pencil" size={16} color={Colors.onPrimary} />
            <Text style={[Typo.titleSm, { color: Colors.onPrimary, marginLeft: Space.sm }]}>Modifier le profil</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stats Cards ── */}
        <Animated.View style={[s.statsRow, fade(a2, 20)]}>
          <View style={[s.statCard, Shadow.sm]}>
            <View style={[s.statIcon, { backgroundColor: Colors.primary + "12" }]}>
              <Ionicons name="book" size={20} color={Colors.primary} />
            </View>
            <Text style={s.statValue}>{wordsLearned.toLocaleString()}</Text>
            <Text style={[Typo.bodySm]}>Mots appris</Text>
          </View>
          <View style={[s.statCard, Shadow.sm]}>
            <View style={[s.statIcon, { backgroundColor: Colors.secondaryContainer + "30" }]}>
              <Ionicons name="time" size={20} color={Colors.secondary} />
            </View>
            <Text style={s.statValue}>{totalHours}h</Text>
            <Text style={[Typo.bodySm]}>Temps total</Text>
          </View>
        </Animated.View>

        {/* ── Streak Card ── */}
        <Animated.View style={fade(a2, 15)}>
          <LinearGradient
            colors={[Colors.secondaryContainer, "#E88A10"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.streakCard}
          >
            <View>
              <Text style={[Typo.labelSm, { color: Colors.onPrimary }]}>SÉRIE ACTUELLE</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: Space.sm }}>
                <Text style={s.streakNumber}>{streak}</Text>
                <Text style={[Typo.titleLg, { color: Colors.onPrimary, marginLeft: Space.sm }]}>jours</Text>
              </View>
              <Text style={[Typo.bodyMd, { color: Colors.onPrimary + "CC", marginTop: Space.sm, fontStyle: "italic" }]}>
                {streak >= 7 ? "Vous êtes en feu ! Continuez comme ça." : "Continuez votre série !"}
              </Text>
            </View>
            <Ionicons name="flame" size={56} color={Colors.onPrimary + "40"} />
          </LinearGradient>
        </Animated.View>

        {/* ── Weekly Activity ── */}
        <Animated.View style={[s.activityCard, Shadow.sm, fade(a3, 15)]}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Space.xl }}>
            <Ionicons name="bar-chart" size={20} color={Colors.primary} />
            <Text style={[Typo.titleMd, { marginLeft: Space.sm }]}>Activité hebdomadaire</Text>
          </View>
          <View style={s.barsRow}>
            {DAYS.map((day, i) => {
              const h = Math.random() * 60 + 10; // placeholder — remplacer par données réelles
              const isToday = i === new Date().getDay() - 1;
              return (
                <View key={day} style={s.barCol}>
                  <View style={[s.bar, { height: h, backgroundColor: isToday ? Colors.primary : Colors.surfaceVariant }]} />
                  <Text style={[Typo.labelSm, isToday && { color: Colors.primary, fontWeight: "700" }]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Pro Tip card removed per directive */}

        <View style={{ height: Space["4xl"] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 44, paddingBottom: Space.lg,
  },

  // Avatar
  avatarSection: { alignItems: "center", marginBottom: Space["2xl"] },
  avatarRing: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: Colors.primary,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  avatar: { width: 112, height: 112, borderRadius: 56, overflow: "hidden" },
  levelBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.secondaryContainer,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: Colors.surface,
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.secondaryContainer, borderRadius: Radius.full,
    paddingHorizontal: Space["3xl"], paddingVertical: Space.md,
    marginTop: Space.xl, width: "100%",
  },

  // Stats
  statsRow: { flexDirection: "row", gap: Space.md, marginBottom: Space.xl },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl, padding: Space.xl, alignItems: "flex-start",
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: Space.md,
  },
  statValue: { ...Typo.displayMd, fontSize: 32, marginBottom: Space.xs },

  // Streak
  streakCard: {
    borderRadius: Radius.xl, padding: Space["2xl"],
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: Space.xl, overflow: "hidden",
  },
  streakNumber: { ...Typo.displayLg, fontSize: 48, color: Colors.onPrimary },

  // Activity
  activityCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl, padding: Space["2xl"],
  },
  barsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 80 },
  barCol: { alignItems: "center", gap: Space.sm },
  bar: { width: 24, borderRadius: 12 },
});