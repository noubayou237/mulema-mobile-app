/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Page de Leçon (apprentissage d'un mot)             ║
 * ║  Route : (tabs)/lessons/[themeId]/lesson/[lessonId]          ║
 * ║  Séquentielle : Leçon 1/10 → 2/10 → … → 10/10              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef, useState } from "react";
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

/* ═══════════════════════════════════════════════════════════════
   EXERCISE CTA — slides up after lessons 2+
   ═══════════════════════════════════════════════════════════════ */
const ExerciseCTA = ({ slideAnim, nextLessonNum, onStart }) => {
  const { t } = useTranslation();
  return (
    <Animated.View style={[cta.wrap, { transform: [{ translateY: slideAnim }] }]}>
      <View style={cta.header}>
        <View style={cta.iconCircle}>
          <Text style={cta.iconEmoji}>🎯</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cta.title}>{t("lessons.exerciseCTATitle")}</Text>
          <Text style={cta.unlock}>{t("lessons.exerciseCTAUnlock", { num: nextLessonNum })}</Text>
        </View>
      </View>
      <Text style={cta.sub}>{t("lessons.exerciseCTASub")}</Text>
      <TouchableOpacity onPress={onStart} activeOpacity={0.88} style={cta.btn}>
        <Text style={cta.btnTxt}>{t("lessons.startExercise")}</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ══════════════════════════════════════════════════════════════ */
export default function LessonScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const uiLang = i18n.language ?? "fr";
  const { themeId, lessonId } = useLocalSearchParams();

  const { lessons, fetchLessons, themes, isLessonLocked, currentThemeId } = useThemeStore();
  const { data: dash } = useDashboardStore();
  const { activeLanguage } = useLanguageStore();

  /* Charger les leçons si besoin */
  useEffect(() => {
    if (themeId && (lessons.length === 0 || currentThemeId !== themeId)) {
      fetchLessons(themeId);
    }
  }, [themeId]);

  /* Trouver la leçon courante */
  const lessonIdx = lessons.findIndex((l) => l.id === lessonId);
  const lesson    = lessons[lessonIdx] ?? null;
  const total     = lessons.length || 10;
  const isFirst   = lessonIdx >= 0 && lessonIdx === 0;
  const isLast    = lessonIdx >= 0 && lessonIdx === total - 1;

  /* Thème courant */
  const theme    = themes.find((t) => t.id === themeId);
  const themeCode = theme?.code ?? "famille";

  const langName = activeLanguage?.name ?? "Duala";

  /* Bassa enrichment — local audio + authoritative text */
  const isBassa = (activeLanguage?.name ?? "").toLowerCase().includes("bassa");
  const enrichment = isBassa ? getBassaEnrichment(lesson?.title ?? "") : null;
  // audioKey takes enrichment first, then fall back to whatever backend provided
  const effectiveAudioKey = enrichment?.audioKey ?? lesson?.audioUrl ?? null;
  // Displayed Bassa text: use enrichment if available, else the backend subtitle
  const bassaDisplay = enrichment?.bassaText || lesson?.subtitle || "";

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

  /* Exercise CTA state (appears after lesson 2+) */
  const [showExerciseCTA, setShowExerciseCTA] = useState(false);
  const ctaSlideAnim = useRef(new Animated.Value(260)).current;

  useEffect(() => {
    if (showExerciseCTA) {
      Animated.spring(ctaSlideAnim, {
        toValue: 0, tension: 85, friction: 11, useNativeDriver: true,
      }).start();
    }
  }, [showExerciseCTA]);

  /* Reset CTA when lesson changes */
  useEffect(() => {
    setShowExerciseCTA(false);
    ctaSlideAnim.setValue(260);
  }, [lessonId]);

  /* Navigation */
  const goNext = () => {
    if (isLast) {
      // Last lesson → final exercise with all words
      router.replace(
        `/(tabs)/lessons/${themeId}/exercise/session?lessonIdx=${lessonIdx}`
      );
      return;
    }

    const nextLesson = lessons[lessonIdx + 1];

    // First lesson (index 0) → go directly to lesson 2 (no exercise gate yet)
    if (lessonIdx === 0) {
      cardAnim.setValue(0);
      slideAnim.setValue(30);
      router.replace(`/(tabs)/lessons/${themeId}/lesson/${nextLesson.id}`);
      return;
    }

    // Lesson 2+ → show exercise CTA to unlock the next lesson
    setShowExerciseCTA(true);
  };

  const goToExercise = () => {
    router.replace(
      `/(tabs)/lessons/${themeId}/exercise/session?wordCount=${lessonIdx + 1}&lessonIdx=${lessonIdx}`
    );
  };

  const goPrev = () => {
    if (isFirst) {
      router.replace("/(tabs)/lessons");
      return;
    }
    cardAnim.setValue(0);
    slideAnim.setValue(-30);
    router.replace(`/(tabs)/lessons/${themeId}/lesson/${lessons[lessonIdx - 1].id}`);
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
        <TouchableOpacity onPress={goPrev} activeOpacity={0.7} style={s.closeBtn}>
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
              activeOpacity={0.7}
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
                <Text style={s.transWord}>{bassaDisplay}</Text>
              </View>
              {/* Bouton audio langue cible */}
              <TouchableOpacity
                style={s.audioBtn}
                activeOpacity={0.7}
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
            activeOpacity={0.8}
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

      {/* ── EXERCISE CTA (slides up after lesson 2+) ── */}
      {showExerciseCTA && (
        <ExerciseCTA
          slideAnim={ctaSlideAnim}
          nextLessonNum={lessonIdx + 2}
          onStart={goToExercise}
        />
      )}

      {/* ── BOUTON BAS ── */}
      {!showExerciseCTA && (
        <View style={s.footer}>
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.88}
            style={s.continueBtn}
          >
            <Text style={s.continueTxt}>
              {isLast ? t("lessons.finishLessons") : t("common.continue")}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.onPrimary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    gap: 14, marginBottom: 10,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#FFEBEE",
    alignItems: "center", justifyContent: "center",
  },
  iconEmoji: { fontSize: 26 },
  title: {
    fontSize: 18, fontWeight: "800",
    color: "#1A1A2E", marginBottom: 2,
  },
  unlock: {
    fontSize: 13, fontWeight: "600",
    color: "#B71C1C",
  },
  sub: {
    fontSize: 14, color: "#6B7280",
    marginBottom: 18, lineHeight: 20,
  },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#B71C1C",
    borderRadius: 50, paddingVertical: 16,
    gap: 4,
  },
  btnTxt: { fontSize: 16, fontWeight: "800", color: "#FFF" },
});
