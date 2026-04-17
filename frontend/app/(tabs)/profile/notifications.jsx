/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Notifications Screen                                ║
 * ║  Matches Notifications.png maquette                           ║
 * ║  Place at: app/(tabs)/profile/notifications.jsx               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Typo, Space, Radius, Shadow } from "../../../src/theme/tokens";
import { MButton } from "../../../src/components/ui/MComponents";
import { useAuthStore } from "../../../src/stores/useAuthStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

const SectionLabel = ({ title }) => (
  <Text style={[Typo.labelSm, { color: Colors.primary, marginTop: Space["3xl"], marginBottom: Space.lg }]}>{title}</Text>
);

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dash } = useDashboardStore();

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      {/* ── Header ── */}
      <View style={[s.header, { paddingHorizontal: Space["2xl"] }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        {/* <Text style={[Typo.titleLg, { marginLeft: Space.md, flex: 1 }]}>Notifications</Text> */}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Title + Clear all ── */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: Space.xs }}>
          <View>
            <Text style={Typo.displayMd}>Notifications</Text>
            <Text style={[Typo.bodyMd, { marginTop: Space.xs }]}>Stay on track with your journey.</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[Typo.titleSm, { color: Colors.primary }]}>Clear all</Text>
          </TouchableOpacity>
        </View>

        {/* ── SÉRIES & CAURIS ── */}
        <SectionLabel title="SÉRIES & CAURIS" />
        <View style={[s.card, Shadow.sm]}>
          <View style={{ flexDirection: "row" }}>
            <View style={[s.notifIcon, { backgroundColor: Colors.secondaryContainer + "30" }]}>
              <Ionicons name="flame" size={24} color={Colors.secondaryContainer} />
            </View>
            <View style={{ flex: 1, marginLeft: Space.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Space.sm }}>
                <Text style={Typo.titleMd}>Streak at risk!</Text>
                <View style={s.urgentBadge}>
                  <Text style={[Typo.labelSm, { color: Colors.error, textTransform: "uppercase", letterSpacing: 0 }]}>URGENT</Text>
                </View>
              </View>
              <Text style={Typo.bodyMd}>
                Your <Text style={{ fontWeight: "700" }}>{dash?.streakDays || 5}-day streak</Text> is about to expire. Complete a quick lesson now to keep the fire burning!
              </Text>
              <View style={{ flexDirection: "row", gap: Space.md, marginTop: Space.xl }}>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/lessons")}
                  activeOpacity={0.8}
                  style={s.actionBtn}
                >
                  <Text style={[Typo.labelLg, { color: Colors.onPrimary }]}>Save{"\n"}Streak</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={s.actionBtnGhost}>
                  <Text style={[Typo.labelLg, { color: Colors.onSurface }]}>Maybe{"\n"}later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── DÉFIS DE LA LIGUE ── */}
        <SectionLabel title="DÉFIS DE LA LIGUE" />
        <View style={[s.card, Shadow.sm]}>
          <View style={{ flexDirection: "row" }}>
            <View style={[s.notifIcon, { backgroundColor: Colors.primary + "15" }]}>
              <Ionicons name="trophy" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Space.lg }}>
              <Text style={Typo.titleMd}>New League Quest</Text>
              <Text style={[Typo.bodyMd, { marginTop: Space.sm }]}>
                The <Text style={{ fontWeight: "700", color: Colors.primary }}>Shrimp League</Text> just started a 24h sprint. Join now to earn 2x XP and climb the leaderboard!
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: Space.xl }}>
                <View style={s.avatarStack}>
                  <View style={[s.miniAvatar, { backgroundColor: Colors.primary + "30", left: 0 }]} />
                  <View style={[s.miniAvatar, { backgroundColor: Colors.secondaryContainer + "50", left: 18 }]} />
                  <View style={[s.miniAvatar, { backgroundColor: Colors.surfaceContainerHigh, left: 36 }]}>
                    <Text style={[Typo.labelSm, { fontSize: 8 }]}>+12</Text>
                  </View>
                </View>
                <Text style={[Typo.bodySm, { marginLeft: Space["4xl"] }]}>Others are already{"\n"}competing</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── NOUVEAUTÉS ── */}
        <SectionLabel title="NOUVEAUTÉS" />
        <View style={[s.newContentCard, Shadow.md]}>
          {/* Green banner */}
          <LinearGradient
            colors={[Colors.primaryContainer, Colors.primary]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.newBanner}
          >
            <Ionicons name="sparkles" size={40} color={Colors.onPrimary + "50"} />
            <View style={s.newBadge}>
              <Text style={[Typo.labelSm, { color: Colors.onPrimary, letterSpacing: 0 }]}>NEW CONTENT</Text>
            </View>
          </LinearGradient>
          {/* Content */}
          <View style={{ padding: Space["2xl"] }}>
            <Text style={Typo.headlineMd}>Folklore Unlocked</Text>
            <Text style={[Typo.bodyMd, { marginTop: Space.md, lineHeight: 22 }]}>
              Discover the hidden stories and proverbs of the region in our latest themed module. Perfect for advanced cultural immersion.
            </Text>
            <MButton
              title="Explore 'Folklore'"
              onPress={() => router.push("/(tabs)/lessons")}
              style={{ marginTop: Space.xl }}
            />
          </View>
        </View>

        <View style={{ height: Space["4xl"] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },
  header: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? 60 : 44, paddingBottom: Space.xl },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.primary },

  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Space["2xl"] },
  notifIcon: { width: 48, height: 48, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center" },
  urgentBadge: { backgroundColor: Colors.error + "15", borderRadius: Radius.full, paddingHorizontal: Space.md, paddingVertical: 2, marginLeft: Space.sm },

  actionBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Space.xl, paddingVertical: Space.md, alignItems: "center" },
  actionBtnGhost: { backgroundColor: Colors.surfaceContainerLow, borderRadius: Radius.full, paddingHorizontal: Space.xl, paddingVertical: Space.md, alignItems: "center" },

  avatarStack: { position: "relative", width: 60, height: 28 },
  miniAvatar: { position: "absolute", width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.surfaceContainerLowest, alignItems: "center", justifyContent: "center" },

  newContentCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, overflow: "hidden" },
  newBanner: { height: 120, alignItems: "center", justifyContent: "center", position: "relative" },
  newBadge: { position: "absolute", bottom: Space.lg, left: Space.lg, backgroundColor: Colors.primary + "80", borderRadius: Radius.full, paddingHorizontal: Space.md, paddingVertical: Space.xs },
});