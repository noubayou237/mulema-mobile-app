/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Page de Résultats                                  ║
 * ║  Route : (tabs)/lessons/[themeId]/exercise/results           ║
 * ║  Params : ?score=X&correct=Y&total=Z                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, StatusBar, Animated, Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Colors, Space, Radius, Shadow } from "../../../../../src/theme/tokens";
import { useThemeStore } from "../../../../../src/stores/useThemeStore";
import { useLanguageStore } from "../../../../../src/stores/useLanguageStore";
import api from "../../../../../src/services/api";
import Logger from "../../../../../src/utils/logger";


/* ── Étoiles selon le score ────────────────────────────────── */
const getStars = (score) => {
  if (score >= 90) return 3;
  if (score >= 60) return 2;
  if (score >= 30) return 1;
  return 0;
};

const getMessage = (score, t) => {
  if (score >= 90) return { title: t("exercises.excellent"), sub: t("exercises.progressingFast") };
  if (score >= 70) return { title: t("exercises.veryGood"), sub: t("exercises.veryGoodSub") };
  if (score >= 50) return { title: t("exercises.notBad"), sub: t("exercises.notBadSub") };
  if (score >= 30) return { title: t("exercises.keepGoing"), sub: t("exercises.keepGoingSub") };
  return { title: t("exercises.retry"), sub: t("exercises.keepGoingSub") };
};

/* ── Anneau de score animé ─────────────────────────────────── */
const ScoreRing = ({ score }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  return (
    <View style={r.ringWrap}>
      <View style={r.ringBg} />
      <AnimatedScore anim={anim} />
    </View>
  );
};

const AnimatedScore = ({ anim }) => {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplayed(Math.round(value)));
    return () => anim.removeListener(id);
  }, []);

  const color = displayed >= 60 ? "#2ECC71" : displayed >= 30 ? Colors.secondaryContainer : Colors.error;

  return (
    <View style={[r.ringBg, { position: "absolute" }]}>
      <Text style={[r.scoreNum, { color }]}>{displayed}%</Text>
    </View>
  );
};

/* ── Étoile animée ─────────────────────────────────────────── */
const StarIcon = ({ filled, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Ionicons
        name={filled ? "star" : "star-outline"}
        size={40}
        color={filled ? Colors.secondaryContainer : Colors.surfaceVariant}
      />
    </Animated.View>
  );
};

/* ──────────────────────────────────────────────────────────────
   ÉCRAN PRINCIPAL
   ────────────────────────────────────────────────────────────── */
export default function ExerciseResults() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    themeId,
    score: scoreStr,
    correct: correctStr,
    total: totalStr,
    lessonIdx: lessonIdxStr,
  } = useLocalSearchParams();
  const { completeTheme, lessons } = useThemeStore();
  const { activeLanguage } = useLanguageStore();

  const score          = parseInt(scoreStr   ?? "0",  10);
  const correct        = parseInt(correctStr ?? "0", 10);
  const total          = parseInt(totalStr   ?? "0",  10);
  const lessonIdxParam = lessonIdxStr != null ? parseInt(lessonIdxStr, 10) : null;
  const stars          = getStars(score);
  const msg            = getMessage(score, t);
  const success        = score >= 60;

  const isFinalLesson  = lessonIdxParam != null && lessons && lessonIdxParam === lessons.length - 1;
  const [showFinalAnim, setShowFinalAnim] = useState(false);

  const langCode = (activeLanguage?.name ?? activeLanguage?.code ?? "duala")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "")
    .trim();

  /* Persist progress to DB and update local state */
  useEffect(() => {
    if (!themeId || !success || lessonIdxParam == null) return;

    if (isFinalLesson) {
      // All lessons done + exercise passed → mark theme complete and unlock next theme
      completeTheme(themeId, score);
      setShowFinalAnim(true);
      api.post(`/progress/unlock-final/${themeId}`, {
        completedLessonOrder: lessonIdxParam,
      }).catch(err => Logger.warn("[Unlock] Final challenge:", err?.message));
    } else {
      // Progressive exercise → unlock the next lesson in the sequence
      api
        .post(`/progress/unlock-next-lesson/${themeId}`, {
          completedLessonOrder: lessonIdxParam,
        })
        .catch((err) => Logger.warn("[Unlock] Could not unlock next lesson:", err?.message));
    }
  }, []);


  /* Animations d'entrée */
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRetry = () => {
    router.replace(`/(tabs)/lessons/${themeId}/exercise/session`);
  };

  // Succès → retour au détail du thème pour voir la leçon débloquée
  // Échec → pareil, pour réessayer les leçons
  const handleContinue = () => {
    router.replace(`/(tabs)/lessons/${themeId}`);
  };


  const handleHome = () => {
    router.replace("/(tabs)/lessons");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <Animated.View
        style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* ── Bandeau coloré ── */}
        <View style={[s.banner, { backgroundColor: score >= 60 ? "#2ECC71" : Colors.primary }]}>
          <View style={s.bannerBlob1} />
          <View style={s.bannerBlob2} />
          <Ionicons
            name={showFinalAnim ? "film" : (score >= 60 ? "trophy" : "refresh")}
            size={48}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={s.bannerTitle}>{showFinalAnim ? t("exercises.finalChallengeUnlocked", "Final Challenge Unlocked!") : msg.title}</Text>
          <Text style={s.bannerSub}>{showFinalAnim ? t("exercises.storyVideoAvailable", "The story video is now available!") : msg.sub}</Text>
        </View>

        {/* ── Score + étoiles ── */}
        <View style={s.scoreSection}>
          <View style={r.ringOuter}>
            <View style={r.ringTrack} />
            <ScoreRing score={score} />
          </View>

          <View style={s.stars}>
            {[1, 2, 3].map((i) => (
              <StarIcon key={i} filled={i <= stars} delay={i * 200} />
            ))}
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, Shadow.sm]}>
            <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
            <Text style={s.statNum}>{correct}</Text>
            <Text style={s.statLabel}>{t("exercises.correct_label")}</Text>
          </View>
          <View style={[s.statCard, Shadow.sm]}>
            <Ionicons name="close-circle" size={24} color={Colors.error} />
            <Text style={s.statNum}>{total - correct}</Text>
            <Text style={s.statLabel}>{t("exercises.errors_label")}</Text>
          </View>
          <View style={[s.statCard, Shadow.sm]}>
            <Ionicons name="list" size={24} color={Colors.primary} />
            <Text style={s.statNum}>{total}</Text>
            <Text style={s.statLabel}>{t("common.total")}</Text>
          </View>
        </View>

        {/* ── Boutons ── */}
        <View style={s.buttons}>
          {/* Story video CTA — shown after passing the final challenge */}
          {showFinalAnim && success && (
            <TouchableOpacity
              onPress={() =>
                router.replace(`/modal/story-video?themeId=${themeId}&langCode=${langCode}`)
              }
              style={s.videoBtnWrap}
              activeOpacity={0.88}
            >
              <View style={s.videoBtn}>
                <Ionicons name="film" size={22} color="#FFF" />
                <Text style={s.videoBtnTxt}>{t("exercises.watchStoryVideo", "Voir la vidéo histoire")}</Text>
              </View>
              <Text style={s.videoBtnSub}>{t("exercises.videoUnlocksNext", "Débloque le thème suivant")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleContinue} style={s.primaryBtn} activeOpacity={0.85}>
            <Text style={s.primaryTxt}>
              {success ? t("exercises.continueAdventure") : t("exercises.reviewLessons")}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRetry} style={s.secondaryBtn} activeOpacity={0.8}>
            <Ionicons name="refresh" size={16} color={Colors.primary} />
            <Text style={s.secondaryTxt}>{t("exercises.retry")}</Text>
          </TouchableOpacity>

          {success && !showFinalAnim && (
            <TouchableOpacity onPress={handleHome} style={s.ghostBtn} activeOpacity={0.7}>
              <Text style={s.ghostTxt}>{t("exercises.backToThemes")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: Colors.surface,
  },
  container: {
    flex: 1,
  },

  /* Bandeau */
  banner: {
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingBottom: Space["3xl"],
    paddingHorizontal: Space["2xl"],
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  bannerBlob1: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)", top: -60, right: -40,
  },
  bannerBlob2: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -20, left: 20,
  },
  bannerTitle: {
    fontFamily: "Fredoka_700Bold",
    fontSize: 32, color: "#FFF",
    marginTop: Space.lg, textAlign: "center",
  },
  bannerSub: {
    fontFamily: "Nunito-Regular",
    fontSize: 15, color: "rgba(255,255,255,0.85)",
    textAlign: "center", marginTop: Space.sm, lineHeight: 22,
  },

  /* Score */
  scoreSection: {
    alignItems: "center",
    paddingVertical: Space["2xl"],
  },
  stars: {
    flexDirection: "row", gap: Space.lg,
    marginTop: Space.lg,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    gap: Space.md,
    paddingHorizontal: Space["2xl"],
    marginBottom: Space["2xl"],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingVertical: Space.xl,
    gap: Space.xs,
  },
  statNum: { fontFamily: "Fredoka_700Bold", fontSize: 22, color: Colors.onSurface },
  statLabel: { fontFamily: "Nunito-SemiBold", fontSize: 11, color: Colors.textTertiary, letterSpacing: 0.5 },

  /* Boutons */
  buttons: {
    paddingHorizontal: Space["2xl"],
    gap: Space.md,
  },

  /* Story video CTA */
  videoBtnWrap: { alignItems: "center", gap: 6 },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#7F0000",
    borderRadius: 9999,
    paddingVertical: 16, gap: 8,
    width: "100%",
    borderWidth: 2, borderColor: "#B71C1C",
  },
  videoBtnTxt: { fontFamily: "Fredoka_700Bold", fontSize: 16, color: "#FFF" },
  videoBtnSub: { fontFamily: "Nunito-Regular", fontSize: 12, color: Colors.textTertiary },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    paddingVertical: 16, gap: 8,
  },
  primaryTxt: { fontFamily: "Fredoka_700Bold", fontSize: 16, color: "#FFF" },

  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 9999,
    paddingVertical: 14, gap: 8,
    borderWidth: 2, borderColor: Colors.primary,
  },
  secondaryTxt: { fontFamily: "Fredoka_600SemiBold", fontSize: 15, color: Colors.primary },

  ghostBtn: {
    alignItems: "center",
    paddingVertical: 16,
  },
  ghostTxt: { fontFamily: "Nunito-Regular", fontSize: 14, color: Colors.textTertiary },
});

/* ── Anneau ── */
const r = StyleSheet.create({
  ringOuter: { alignItems: "center", justifyContent: "center" },
  ringTrack: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 10, borderColor: Colors.surfaceVariant,
  },
  ringWrap: {
    position: "absolute",
    width: 120, height: 120,
    alignItems: "center", justifyContent: "center",
  },
  ringBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: "center", justifyContent: "center",
    ...Shadow.sm,
  },
  scoreNum: {
    fontFamily: "Fredoka_700Bold",
    fontSize: 24, color: Colors.onSurface,
  },
});
