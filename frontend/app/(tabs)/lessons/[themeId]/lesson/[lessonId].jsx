/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Page de Leçon (apprentissage d'un mot)             ║
 * ║  Route : (tabs)/lessons/[themeId]/lesson/[lessonId]          ║
 * ║  Séquentielle : Leçon 1/10 → 2/10 → … → 10/10              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

import { Colors, Typo, Space, Radius, Shadow } from "../../../../../src/theme/tokens";
import { useThemeStore } from "../../../../../src/stores/useThemeStore";
import { useDashboardStore } from "../../../../../src/stores/useDashboardStore";
import { useLanguageStore } from "../../../../../src/stores/useLanguageStore";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../../../../src/hooks/useBackgroundMusic";
import { playAudioUrl } from "../../../../../src/utils/audioUtils";
import Logger from "../../../../../src/utils/logger";
import { getBassaEnrichment } from "../../../../data/bassaLessonsData";
import { getDualaEnrichment } from "../../../../data/dualaLessonsData";
import { getGhomalaEnrichment } from "../../../../data/ghomalaLessonsData";
import { getWordDisplay } from "../../../../data/wordTranslations";

const playAudio = async (audioKey) => {
  if (!audioKey) {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
    return;
  }
  try {
    await playAudioUrl(audioKey);
  } catch (e) {
    Logger.warn("Audio play error", e);
  }
};

/* ── Icônes par thème ─────────────────────────────────────────── */
const THEME_ICONS = {
  famille: "people",
  animaux: "paw",
  cuisine: "restaurant",
  vetements: "shirt",
};



/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ══════════════════════════════════════════════════════════════ */
export default function LessonScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const uiLang = i18n.language ?? "fr";
  const { themeId, lessonId, category } = useLocalSearchParams();

  const { lessons, fetchLessons, themes, isLessonLocked, currentThemeId } = useThemeStore();
  const { data: dash } = useDashboardStore();
  const { activeLanguage } = useLanguageStore();

  /* Charger les leçons si besoin */
  useEffect(() => {
    if (themeId && (lessons.length === 0 || currentThemeId !== themeId)) {
      fetchLessons(themeId);
    }
  }, [themeId]);

  /* Filter lessons if category is provided */
  const displayLessons = useMemo(() => {
    if (!category) return lessons;
    return lessons.filter((l) => {
      let enrichment = null;
      if (activeLanguage?.name?.toLowerCase() === "bassa") {
        enrichment = getBassaEnrichment(l.title);
      } else if (activeLanguage?.name?.toLowerCase() === "duala") {
        enrichment = getDualaEnrichment(l.title);
      } else if (activeLanguage?.name?.toLowerCase() === "ghomala") {
        enrichment = getGhomalaEnrichment(l.title);
      }
      return enrichment?.category === category;
    });
  }, [lessons, category, activeLanguage]);

  /* Trouver la leçon courante */
  const lessonIdx = displayLessons.findIndex((l) => l.id === lessonId);
  const lesson    = displayLessons[lessonIdx] ?? null;
  const total     = displayLessons.length || 10;
  const isFirst   = lessonIdx >= 0 && lessonIdx === 0;
  const isLast    = lessonIdx >= 0 && lessonIdx === total - 1;

  /* Thème courant */
  const theme    = themes.find((t) => t.id === themeId);
  const themeCode = theme?.code ?? "famille";

  const langName = activeLanguage?.name ?? "Duala";

  /* Language enrichment — local audio + authoritative text */
  const isBassa = (activeLanguage?.name ?? "").toLowerCase().includes("bassa");
  const isDuala = (activeLanguage?.name ?? "").toLowerCase().includes("duala");
  const isGhomala = (activeLanguage?.name ?? "").toLowerCase().includes("ghomala");
  
  let enrichment = null;
  if (isBassa) enrichment = getBassaEnrichment(lesson?.title ?? "");
  if (isDuala) enrichment = getDualaEnrichment(lesson?.title ?? "");
  if (isGhomala) enrichment = getGhomalaEnrichment(lesson?.title ?? "");

  // audioKey takes enrichment first, then fall back to whatever backend provided
  const effectiveAudioKey = enrichment?.audioKey ?? lesson?.audioUrl ?? null;
  // Displayed text: use enrichment if available, else the backend subtitle
  const translatedDisplay = enrichment?.targetText || enrichment?.bassaText || enrichment?.dualaText || enrichment?.ghomalaText || lesson?.subtitle || "";

  /* Animations */
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim,  { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [lessonId]);

  useEffect(() => {
    pauseBackgroundMusic();
    return () => {
      resumeBackgroundMusic();
    };
  }, []);

  /* Navigation */
  const goNext = () => {
    if (isLast) {
      // Last lesson studied — return to the lessons overview tab
      router.replace(`/(tabs)/lessons`);
      return;
    }

    const nextLesson = displayLessons[lessonIdx + 1];

    cardAnim.setValue(0);
    slideAnim.setValue(30);
    router.replace({
      pathname: `/(tabs)/lessons/${themeId}/lesson/${nextLesson.id}`,
      params: { category }
    });
  };

  const goPrev = () => {
    if (isFirst) {
      router.replace("/(tabs)/lessons");
      return;
    }
    cardAnim.setValue(0);
    slideAnim.setValue(-30);
    router.replace({
      pathname: `/(tabs)/lessons/${themeId}/lesson/${displayLessons[lessonIdx - 1].id}`,
      params: { category }
    });
  };

  /* Pourcentage de progression */
  const progressPct = total > 0 ? ((lessonIdx + 1) / total) : 0;
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressPct]);

  if (!lesson) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={Typo.bodyMd}>{t("common.loading")}</Text>
        </View>
      </View>
    );
  }

  const themeIcon = THEME_ICONS[themeCode] ?? "book";

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ── TOP BAR ── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={goPrev} activeOpacity={0.6} delayPressIn={0} style={s.closeBtn}>
          <Ionicons name={isFirst ? "close" : "arrow-back"} size={22} color={Colors.onSurface} />
        </TouchableOpacity>

        {/* Barre de progression */}
        <View style={s.progressTrack}>
          <Animated.View
            style={[
              s.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        {/* Coeurs */}
        <View style={s.heartBadge}>
          <Ionicons name="heart" size={16} color="#E53935" />
          <Text style={s.heartNum}>{dash?.hearts ?? 5}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{ opacity: cardAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── Category context pill (Bassa only) ── */}
          {enrichment?.category ? (
            <View style={s.categoryPill}>
              <Ionicons name="book-outline" size={13} color={Colors.primary} style={{ marginRight: 5 }} />
              <Text style={s.categoryText}>{enrichment.category}</Text>
            </View>
          ) : null}

          {/* ── Label leçon ── */}
          <Text style={s.lessonLabel}>
            {t("lessons.lessonNum", { num: lessonIdx + 1 })} / {total}
          </Text>

          {/* ── Titre de question ── */}
          <Text style={s.questionTitle}>
            {t("lessons.whatDoesThisMean")}
          </Text>

          {/* ── Carte mot source (FR ou EN selon langue UI) ── */}
          <View style={[s.wordCard, Shadow.md]}>
            <View style={s.wordCardIcon}>
              <Ionicons name={themeIcon} size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.wordFrLabel}>
                {uiLang?.startsWith("en") ? "ENGLISH" : t("lessons.frenchLabel")}
              </Text>
              <Text style={s.wordFr}>{getWordDisplay(lesson.title, uiLang)}</Text>
            </View>
            <TouchableOpacity
              style={s.audioBtn}
              activeOpacity={0.55}
              delayPressIn={0}
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                playAudio(effectiveAudioKey);
              }}
            >
              <Ionicons name="volume-high" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Traduction Bassa / langue cible ── */}
          <View style={[s.translationCard, Shadow.sm]}>
            <View style={s.transHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.transLabel}>
                  {t("lessons.translationIn", { lang: langName.toUpperCase() })}
                </Text>
                <Text style={s.transWord}>{translatedDisplay}</Text>
              </View>
              {/* Bouton audio langue cible */}
              <TouchableOpacity
                style={s.audioBtn}
                activeOpacity={0.55}
                delayPressIn={0}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  playAudio(effectiveAudioKey);
                }}
              >
                <Ionicons name="volume-medium" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {lesson.hint ? (
              <View style={s.hintPill}>
                <Text style={s.hintText}>
                  {t("lessons.startWith")} <Text style={s.hintLetter}>{lesson.hint}</Text>
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Bouton écouter la prononciation ── */}
          <TouchableOpacity
            style={s.listenBtn}
            activeOpacity={0.55}
            delayPressIn={0}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
              playAudio(effectiveAudioKey);
            }}
          >
            <Ionicons name="volume-medium-outline" size={18} color={Colors.primary} />
            <Text style={s.listenText}>
              {effectiveAudioKey ? t("lessons.listenPronunciation") : t("lessons.noAudioAvailable")}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 160 }} />
        </Animated.View>
      </ScrollView>

      {/* ── BOUTON BAS ── */}
      <View style={s.footer}>
        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.65}
          delayPressIn={0}
          style={s.continueBtn}
        >
          <Text style={s.continueTxt}>
            {isLast ? t("lessons.finishLessons") : t("common.continue")}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.onPrimary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingTop: Space.lg },

  /* Top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: Space.md,
    paddingHorizontal: Space["2xl"],
    gap: Space.md,
    backgroundColor: Colors.surface,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  progressTrack: {
    flex: 1, height: 10,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.full, overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  heartBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.full,
    paddingHorizontal: Space.md, paddingVertical: 6,
    ...Shadow.sm,
  },
  heartNum: { fontSize: 14, fontWeight: "700", color: Colors.onSurface },

  /* Category pill */
  categoryPill: {
    flexDirection: "row", alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "12",
    borderRadius: Radius.full,
    paddingHorizontal: Space.md, paddingVertical: 6,
    marginBottom: Space.md,
    marginTop: Space.sm,
  },
  categoryText: {
    fontSize: 12, fontWeight: "700",
    color: Colors.primary, letterSpacing: 0.5,
  },

  /* Contenu */
  lessonLabel: {
    fontSize: 13, fontWeight: "700",
    color: Colors.primary, letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: Space.sm,
    marginTop: Space.md,
  },
  questionTitle: {
    fontSize: 28, fontWeight: "800",
    color: Colors.onSurface, lineHeight: 36,
    marginBottom: Space["2xl"],
  },

  /* Carte mot FR */
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.lg,
    gap: Space.lg,
  },
  wordCardIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary + "12",
    alignItems: "center", justifyContent: "center",
  },
  wordFrLabel: {
    fontSize: 11, fontWeight: "600",
    color: Colors.primary, letterSpacing: 1, marginBottom: 4,
  },
  wordFr: {
    fontSize: 24, fontWeight: "800", color: Colors.onSurface,
  },
  audioBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + "12",
    alignItems: "center", justifyContent: "center",
  },

  /* Traduction */
  translationCard: {
    backgroundColor: Colors.primary + "08",
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary + "20",
  },
  transHeader: {
    flexDirection: "row", alignItems: "flex-start",
    gap: Space.md, marginBottom: Space.md,
  },
  transLabel: {
    fontSize: 11, fontWeight: "700",
    color: Colors.primary, letterSpacing: 1,
    marginBottom: Space.sm,
  },
  transWord: {
    fontSize: 30, fontWeight: "800",
    color: Colors.onSurface, marginBottom: Space.md,
  },
  hintPill: {
    backgroundColor: Colors.primary + "15",
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg, paddingVertical: Space.sm,
    alignSelf: "flex-start",
  },
  hintText: { fontSize: 13, color: Colors.onSurface },
  hintLetter: { fontWeight: "800", color: Colors.primary },

  /* Listen button */
  listenBtn: {
    flexDirection: "row", alignItems: "center", gap: Space.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg, paddingVertical: Space.md,
    alignSelf: "center",
    marginBottom: Space.md,
    ...Shadow.sm,
  },
  listenText: { fontSize: 14, fontWeight: "600", color: Colors.primary },

  /* Footer */
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: Space.md,
    backgroundColor: Colors.surface,
    ...Shadow.lg,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
  },
  continueTxt: {
    fontSize: 17, fontWeight: "800", color: "#FFFFFF",
  },
});

/* Exercise CTA styles */
const cta = StyleSheet.create({
  wrap: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 10,
  },
  accentBar: {
    height: 3,
    backgroundColor: "#B71C1C",
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 11, fontWeight: "700",
    color: "#B71C1C", letterSpacing: 1.4,
    textTransform: "uppercase", marginBottom: 6,
  },
  heading: {
    fontSize: 19, fontWeight: "800",
    color: "#111827", lineHeight: 26, marginBottom: 6,
  },
  sub: {
    fontSize: 14, color: "#6B7280", lineHeight: 20,
  },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#B71C1C",
    marginHorizontal: 24,
    marginBottom: Platform.OS === "ios" ? 40 : 20,
    borderRadius: 12, paddingVertical: 15,
    gap: 8,
  },
  btnTxt: { fontSize: 16, fontWeight: "700", color: "#FFF", letterSpacing: 0.2 },
});
