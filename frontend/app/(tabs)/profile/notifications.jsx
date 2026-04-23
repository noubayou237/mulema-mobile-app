/**
 * MULEMA — Notifications Screen
 * Route: app/(tabs)/profile/notifications.jsx
 */

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { Colors, Typo, Space, Radius, Shadow } from "../../../src/theme/tokens";
import { MButton } from "../../../src/components/ui/MComponents";
import { useAuthStore } from "../../../src/stores/useAuthStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

/* ── Section label ── */
const SectionLabel = ({ title }) => (
  <Text style={[Typo.labelSm, { color: Colors.primary, marginTop: Space["3xl"], marginBottom: Space.lg, letterSpacing: 1 }]}>
    {title}
  </Text>
);

/* ── Dismissible wrapper ── */
const Dismissible = ({ id, dismissed, onDismiss, children }) => {
  if (dismissed.has(id)) return null;
  return (
    <View style={{ position: "relative" }}>
      {children}
      <TouchableOpacity
        style={nb.closeBtn}
        onPress={() => onDismiss(id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.6}
      >
        <Ionicons name="close" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════ */

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: dash } = useDashboardStore();

  const [dismissed, setDismissed] = useState(new Set());

  const dismiss = (id) => setDismissed((prev) => new Set([...prev, id]));
  const clearAll = () => setDismissed(new Set(["streak", "league", "folklore"]));

  const streakDays = dash?.streakDays ?? 0;
  const allDismissed = dismissed.size >= 3;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ── Header ── */}
      <View style={[s.header, { paddingHorizontal: Space["2xl"] }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Title + Clear all ── */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: Space.xs }}>
          <View>
            <Text style={Typo.displayMd}>{t("nav.notifications", "Notifications")}</Text>
            <Text style={[Typo.bodyMd, { marginTop: Space.xs }]}>
              {t("notifications.subtitle", "Stay on track with your journey.")}
            </Text>
          </View>
          {!allDismissed && (
            <TouchableOpacity activeOpacity={0.7} onPress={clearAll}>
              <Text style={[Typo.titleSm, { color: Colors.primary }]}>
                {t("notifications.clearAll", "Clear all")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Push notifications coming soon banner ── */}
        <View style={s.comingSoonBanner}>
          <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
          <Text style={[Typo.bodySm, { color: Colors.primary, marginLeft: Space.sm, flex: 1 }]}>
            {t("notifications.pushComingSoon", "Push notifications are coming in a future update. These are your current reminders.")}
          </Text>
        </View>

        {/* ── Empty state ── */}
        {allDismissed && (
          <View style={s.emptyState}>
            <Ionicons name="notifications-off-outline" size={52} color={Colors.textTertiary + "60"} />
            <Text style={[Typo.titleMd, { color: Colors.textTertiary, marginTop: Space.xl, textAlign: "center" }]}>
              {t("notifications.allClear", "All caught up!")}
            </Text>
            <Text style={[Typo.bodyMd, { color: Colors.textTertiary, marginTop: Space.sm, textAlign: "center" }]}>
              {t("notifications.allClearSub", "No new notifications right now.")}
            </Text>
          </View>
        )}

        {!allDismissed && (
          <>
            {/* ── STREAK ── */}
            <SectionLabel title={t("notifications.sections.streak", "STREAK & HEARTS")} />
            <Dismissible id="streak" dismissed={dismissed} onDismiss={dismiss}>
              <View style={[s.card, Shadow.sm]}>
                <View style={{ flexDirection: "row" }}>
                  <View style={[s.notifIcon, { backgroundColor: Colors.secondaryContainer + "30" }]}>
                    <Ionicons name="flame" size={24} color={Colors.secondaryContainer} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Space.lg, paddingRight: Space["2xl"] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Space.sm }}>
                      <Text style={Typo.titleMd}>
                        {streakDays > 0
                          ? t("notifications.streakTitle", "Keep your streak alive!")
                          : t("notifications.streakStartTitle", "Start your streak today!")}
                      </Text>
                      {streakDays > 0 && (
                        <View style={s.urgentBadge}>
                          <Text style={[Typo.labelSm, { color: Colors.error, textTransform: "uppercase", letterSpacing: 0 }]}>
                            {t("notifications.urgent", "URGENT")}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={Typo.bodyMd}>
                      {streakDays > 0
                        ? t("notifications.streakBody", {
                            days: streakDays,
                            defaultValue: `Your ${streakDays}-day streak is active. Keep it going with a quick lesson!`,
                          })
                        : t("notifications.streakStartBody", "Complete your first lesson to start building your streak.")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/lessons")}
                      activeOpacity={0.8}
                      style={[s.actionBtn, { marginTop: Space.xl, alignSelf: "flex-start" }]}
                    >
                      <Text style={[Typo.labelLg, { color: Colors.onPrimary }]}>
                        {t("notifications.goLearn", "Go learn")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Dismissible>

            {/* ── COMMUNITY ── */}
            <SectionLabel title={t("notifications.sections.community", "COMMUNITY")} />
            <Dismissible id="league" dismissed={dismissed} onDismiss={dismiss}>
              <View style={[s.card, Shadow.sm]}>
                <View style={{ flexDirection: "row" }}>
                  <View style={[s.notifIcon, { backgroundColor: Colors.primary + "15" }]}>
                    <Ionicons name="trophy" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Space.lg, paddingRight: Space["2xl"] }}>
                    <Text style={Typo.titleMd}>
                      {t("notifications.leagueTitle", "Climb the leaderboard")}
                    </Text>
                    <Text style={[Typo.bodyMd, { marginTop: Space.sm }]}>
                      {t("notifications.leagueBody", "Complete exercises to earn XP and rise in the rankings.")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/community")}
                      activeOpacity={0.8}
                      style={[s.actionBtnGhost, { marginTop: Space.xl, alignSelf: "flex-start" }]}
                    >
                      <Text style={[Typo.labelLg, { color: Colors.onSurface }]}>
                        {t("notifications.viewRanking", "View ranking")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Dismissible>

            {/* ── NEW CONTENT ── */}
            <SectionLabel title={t("notifications.sections.newContent", "NEW CONTENT")} />
            <Dismissible id="folklore" dismissed={dismissed} onDismiss={dismiss}>
              <View style={[s.newContentCard, Shadow.md]}>
                <LinearGradient
                  colors={[Colors.primaryContainer, Colors.primary]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.newBanner}
                >
                  <Ionicons name="sparkles" size={40} color={Colors.onPrimary + "50"} />
                  <View style={s.newBadge}>
                    <Text style={[Typo.labelSm, { color: Colors.onPrimary, letterSpacing: 0 }]}>
                      {t("notifications.newContent", "NEW CONTENT")}
                    </Text>
                  </View>
                </LinearGradient>
                <View style={{ padding: Space["2xl"] }}>
                  <Text style={Typo.headlineMd}>
                    {t("notifications.exercisesTitle", "Exercises available")}
                  </Text>
                  <Text style={[Typo.bodyMd, { marginTop: Space.md, lineHeight: 22 }]}>
                    {t("notifications.exercisesBody", "New exercises are ready for your active themes. Practice to earn XP and unlock the next lessons.")}
                  </Text>
                  <MButton
                    title={t("notifications.goExercises", "Go to exercises")}
                    onPress={() => router.push("/(tabs)/exercises")}
                    style={{ marginTop: Space.xl }}
                  />
                </View>
              </View>
            </Dismissible>
          </>
        )}

        <View style={{ height: Space["4xl"] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: Space.xl,
  },

  comingSoonBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginBottom: Space.xl,
    marginTop: Space.md,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },

  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.sm,
  },
  notifIcon: {
    width: 48, height: 48, borderRadius: Radius.lg,
    alignItems: "center", justifyContent: "center",
  },
  urgentBadge: {
    backgroundColor: Colors.error + "15",
    borderRadius: Radius.full,
    paddingHorizontal: Space.md, paddingVertical: 2,
    marginLeft: Space.sm,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Space.xl, paddingVertical: Space.md,
    alignItems: "center",
  },
  actionBtnGhost: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.full,
    paddingHorizontal: Space.xl, paddingVertical: Space.md,
    alignItems: "center",
  },

  newContentCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: "hidden",
    marginBottom: Space.sm,
  },
  newBanner: {
    height: 120, alignItems: "center", justifyContent: "center",
  },
  newBadge: {
    position: "absolute", bottom: Space.lg, left: Space.lg,
    backgroundColor: Colors.primary + "80",
    borderRadius: Radius.full,
    paddingHorizontal: Space.md, paddingVertical: Space.xs,
  },
});

const nb = StyleSheet.create({
  closeBtn: {
    position: "absolute",
    top: Space.lg,
    right: Space.lg,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: "center", justifyContent: "center",
  },
});
