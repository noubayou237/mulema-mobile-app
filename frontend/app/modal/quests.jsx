/**
 * MULEMA — Quests Screen
 * Route: app/modal/quests.jsx
 */

import React, { useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Animated, Easing,
  StyleSheet, Platform, StatusBar, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { useDashboardStore } from "../../src/stores/useDashboardStore";

/* ── Animated progress bar card ── */
const QuestCard = ({ icon, iconBg, title, subtitle, xp, current, total }) => {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  const barAnim = useRef(new Animated.Value(0)).current;
  const done = current >= total && total > 0;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={[s.questCard, Shadow.sm, done && s.questCardDone]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={[s.questIcon, { backgroundColor: done ? Colors.success + "18" : (iconBg || Colors.primary + "12") }]}>
          <Ionicons name={done ? "checkmark-circle" : icon} size={22} color={done ? Colors.success : Colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: Space.lg }}>
          <Text style={[Typo.titleMd, done && { color: Colors.textTertiary }]}>{title}</Text>
          <Text style={[Typo.bodySm, { marginTop: Space.xs }]}>{subtitle}</Text>
        </View>
        <View style={s.xpBadge}>
          <Ionicons name="star" size={12} color={done ? Colors.success : Colors.primary} />
          <Text style={[Typo.labelLg, { color: done ? Colors.success : Colors.primary, fontSize: 16 }]}>{xp}</Text>
          <Text style={[Typo.labelSm, { color: done ? Colors.success : Colors.primary, marginTop: -2 }]}>XP</Text>
        </View>
      </View>
      <View style={{ marginTop: Space.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Space.sm }}>
          <Text style={[Typo.labelSm, { color: done ? Colors.success : Colors.primary }]}>
            {done ? t("exercises.allDone") : t("common.progress")}
          </Text>
          <Text style={[Typo.labelLg, { color: Colors.onSurface }]}>{Math.min(current, total)} / {total}</Text>
        </View>
        <View style={s.progressTrack}>
          <Animated.View
            style={[
              s.progressFill,
              {
                width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                backgroundColor: done ? Colors.success : Colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════ */

export default function QuestsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: dash, isLoading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const streakDays      = dash?.streakDays       ?? 0;
  const lessonsCompleted = dash?.lessonsCompleted ?? 0;
  const exercisesCompleted = dash?.exercisesCompleted ?? 0;
  const totalMinutes    = dash?.totalTimeMinutes  ?? 0;

  const quests = [
    {
      icon: "book",
      iconBg: Colors.primary + "12",
      title: t("quests.learnWords"),
      subtitle: t("quests.learnWordsSub"),
      xp: 10,
      current: Math.min(lessonsCompleted, 5),
      total: 5,
    },
    {
      icon: "school",
      iconBg: Colors.primary + "12",
      title: t("quests.finishLessons"),
      subtitle: t("quests.finishLessonsSub"),
      xp: 20,
      current: Math.min(exercisesCompleted, 3),
      total: 3,
    },
    {
      icon: "time",
      iconBg: Colors.primary + "12",
      title: t("quests.practiceTime"),
      subtitle: t("quests.practiceTimeSub"),
      xp: 15,
      current: Math.min(totalMinutes, 30),
      total: 30,
    },
  ];

  const totalDone  = quests.filter((q) => q.current >= q.total).length;
  const dailyPct   = Math.round((totalDone / quests.length) * 100);
  const remaining  = quests.length - totalDone;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ── Header ── */}
      <View style={[s.header, { paddingHorizontal: Space["2xl"] }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={[Typo.titleLg, { marginLeft: Space.md, flex: 1 }]}>{t("quests.title")}</Text>
        <View style={s.streakBadge}>
          <Ionicons name="flame" size={16} color={Colors.success} />
          <Text style={[Typo.labelLg, { marginLeft: 4, color: Colors.success }]}>{streakDays}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {isLoading && !dash ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ── Daily Progress Banner ── */}
            <LinearGradient
              colors={[Colors.primaryContainer, Colors.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.dailyBanner}
            >
              <View style={{ flex: 1 }}>
                <Text style={[Typo.labelSm, { color: Colors.onPrimary }]}>{t("quests.dailyProgress")}</Text>
                <Text style={s.dailyPct}>{dailyPct}%</Text>
                <View style={s.dailyHint}>
                  <Text style={[Typo.bodySm, { color: Colors.onPrimary }]}>
                    {remaining === 0
                      ? t("exercises.allDone")
                      : t("quests.remainingDefis", { count: remaining, plural: remaining > 1 ? "s" : "" })}
                  </Text>
                </View>
              </View>
              <View style={s.circleIndicator}>
                <View style={[s.circleInner, totalDone === quests.length && { borderColor: Colors.onPrimary }]}>
                  <Ionicons
                    name={totalDone === quests.length ? "trophy" : "checkmark"}
                    size={24}
                    color={Colors.onPrimary + "80"}
                  />
                </View>
              </View>
            </LinearGradient>

            {/* ── Quest Cards ── */}
            <View style={s.sectionHead}>
              <Text style={Typo.headlineMd}>{t("quests.challenges")}</Text>
            </View>

            {quests.map((q, i) => (
              <QuestCard key={i} {...q} />
            ))}
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
  streakBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.success + "15",
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg, paddingVertical: Space.sm,
  },

  dailyBanner: {
    borderRadius: Radius.xl, padding: Space["2xl"],
    flexDirection: "row", alignItems: "center",
    marginBottom: Space["2xl"], overflow: "hidden",
  },
  dailyPct: { ...Typo.displayLg, fontSize: 52, color: Colors.onPrimary, marginTop: Space.sm },
  dailyHint: {
    backgroundColor: Colors.onPrimary + "20",
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg, paddingVertical: Space.sm,
    alignSelf: "flex-start", marginTop: Space.md,
  },
  circleIndicator: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 4, borderColor: Colors.onPrimary + "40",
    alignItems: "center", justifyContent: "center",
  },
  circleInner: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3, borderColor: Colors.onPrimary + "60",
    alignItems: "center", justifyContent: "center",
  },

  sectionHead: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: Space.xl,
  },

  questCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl, padding: Space["2xl"],
    marginBottom: Space.lg,
  },
  questCardDone: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  questIcon: {
    width: 44, height: 44, borderRadius: Radius.lg,
    alignItems: "center", justifyContent: "center",
  },
  xpBadge:      { alignItems: "center" },
  progressTrack:{ height: 8, backgroundColor: Colors.surfaceVariant, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
});
