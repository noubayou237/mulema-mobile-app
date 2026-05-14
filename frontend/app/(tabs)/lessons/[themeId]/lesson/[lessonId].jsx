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
  ActivityIndicator,
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
import { playAudioUrl, setAudioMode } from "../../../../../src/utils/audioUtils";
import Logger from "../../../../../src/utils/logger";
import { getBassaEnrichment } from "../../../../data/bassaLessonsData";
import { getDualaEnrichment } from "../../../../data/dualaLessonsData";
import { getGhomalaEnrichment } from "../../../../data/ghomalaLessonsData";
import { getWordDisplay } from "../../../../data/wordTranslations";

const playAudio = async (audioKey) => {
  if (!audioKey) {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch { }
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

/* ── Données Spéciales Bassa ───────────────────────────────────── */
const BASSA_SPECIAL_DATA = {
  days: [
    { fr: "Lundi", en: "Monday", bassa: "ŋgwà njaŋgumba", audio: "lundi_1" },
    { fr: "Mardi", en: "Tuesday", bassa: "ŋgwà ûm", audio: "mardi_1" },
    { fr: "Mercredi", en: "Wednesday", bassa: "ŋgwà ŋgê", audio: "mercredi_1" },
    { fr: "Jeudi", en: "Thursday", bassa: "ŋgwà mbɔk", audio: "jeudi_1" },
    { fr: "Vendredi", en: "Friday", bassa: "ŋgwà kɔɔ", audio: "vendredi_1" },
    { fr: "Samedi", en: "Saturday", bassa: "ŋgwà jôn", audio: "samedi_1" },
    { fr: "Dimanche", en: "Sunday", bassa: "ŋgwà nɔŷ", audio: "dimanche_1" },
  ],
  avoir: [
    { fr: "J'ai", en: "I have", bassa: "mè gwě", audio: "j_aiwav" },
    { fr: "Tu as", en: "You have", bassa: "Ù gwě", audio: "tu_as_1" },
    { fr: "Il ou elle a", en: "He / She has", bassa: "A gwě", audio: "il_ou_elle_a" },
    { fr: "Nous avons", en: "We have", bassa: "Di gwě", audio: "nous_avons_1" },
    { fr: "Vous avez", en: "You have (plural)", bassa: "Ni gwě", audio: "vous_avez_1" },
    { fr: "Ils ou elles ont", en: "They have", bassa: "Ba gwě", audio: "ils_ou_elles_ont" },
  ],
  etre: [
    { fr: "Je suis", en: "I am", bassa: "mè yè", audio: "je_suis_1" },
    { fr: "Tu es", en: "You are", bassa: "Ù yè", audio: "tu_es_2" },
    { fr: "Il ou elle est", en: "He / She is", bassa: "A yè", audio: "il_elle_on_est_1" },
    { fr: "Nous sommes", en: "We are", bassa: "Di yè", audio: "nous_sommes_1" },
    { fr: "Vous êtes", en: "You are (plural)", bassa: "Ni yè", audio: "vous_etes_1" },
    { fr: "Ils ou elles sont", en: "They are", bassa: "Ba yè", audio: "ils_elles_sont_1" },
  ],
  manger: [
    { fr: "Je mange", en: "I eat", bassa: "mè ŋjé", audio: "je_mange" },
    { fr: "Tu manges", en: "You eat", bassa: "U ŋjé", audio: "tu_manges" },
    { fr: "Il ou elle mange", en: "He / She eats", bassa: "A ŋjé", audio: "il_ou_elle_mange" },
    { fr: "Nous mangeons", en: "We eat", bassa: "Di ŋjé", audio: "nous_mangeons" },
    { fr: "Vous mangez", en: "You eat (plural)", bassa: "Ni ŋjé", audio: "vous_mangez" },
    { fr: "Ils ou elles mangent", en: "They eat", bassa: "Ba ŋjé", audio: "ils_ou_elle_mangent" },
  ],
  marcher: [
    { fr: "Je marche", en: "I walk", bassa: "mè Níòm", audio: "je_marche" },
    { fr: "Tu marches", en: "You walk", bassa: "Ù Níòm", audio: "tu_marches" },
    { fr: "Il ou elle marche", en: "He / She walks", bassa: "A Níòm", audio: "il_ou_elle_marche" },
    { fr: "Nous marchons", en: "We walk", bassa: "Di Níòm", audio: "nous_marchons" },
    { fr: "Vous marchez", en: "You walk (plural)", bassa: "Ni Níòm", audio: "vous_marchez" },
    { fr: "Ils ou elles marchent", en: "They walk", bassa: "Ba Níòm", audio: "ils_ou_elles_marchent" },
  ],
  prendre: [
    { fr: "Je prends", en: "I take", bassa: "Mè ŋýòŋ", audio: "je_prends" },
    { fr: "Tu prends", en: "You take", bassa: "Ù ŋýòŋ", audio: "tu_prends" },
    { fr: "Il ou elle prend", en: "He / She takes", bassa: "A ŋýòŋ", audio: "il_ou_elle_prend" },
    { fr: "Nous prenons", en: "We take", bassa: "Di ŋýòŋ", audio: "nous_prenons" },
    { fr: "Vous prenez", en: "You take (plural)", bassa: "Ni ŋýòŋ", audio: "vous_prenez" },
    { fr: "Ils ou elles prennent", en: "They take", bassa: "Ba ŋýòŋ", audio: "ils_ou_elles_prennent" },
  ],
  acheter: [
    { fr: "J'achète", en: "I buy", bassa: "Mè Ńsɔmb", audio: "j_achete" },
    { fr: "Tu achètes", en: "You buy", bassa: "U Ńsɔmb", audio: "tu_achetes" },
    { fr: "Il ou elle achète", en: "He / She buys", bassa: "A Ńsɔmb", audio: "il_ou_elle_achete" },
    { fr: "Nous achetons", en: "We buy", bassa: "Di Ńsɔmb", audio: "nous_achetons" },
    { fr: "Vous achetez", en: "You buy (plural)", bassa: "Ni Ńsɔmb", audio: "vous_achetez" },
    { fr: "Ils ou elles achètent", en: "They buy", bassa: "Ba Ńsɔmb", audio: "ils_ou_elles_achetent" },
  ],
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
    const state = useThemeStore.getState();
    if (themeId && (state.currentThemeId !== themeId || state.lessons.length === 0)) {
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
  const lesson = displayLessons[lessonIdx] ?? null;
  const total = displayLessons.length || 10;
  const isFirst = lessonIdx >= 0 && lessonIdx === 0;
  const isLast = lessonIdx >= 0 && lessonIdx === total - 1;

  /* Thème courant */
  const theme = themes.find((t) => t.id === themeId);
  const themeCode = theme?.code ?? "famille";

  const langName = activeLanguage?.name ?? "Duala";

  /* Language enrichment — local audio + authoritative text */
  const langCode = (activeLanguage?.name ?? activeLanguage?.code ?? "duala")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "")
    .trim();

  // Flag to identify if we just unlocked the final challenge gate
  const isGateUnlock = lessonIdx != null && lessons && lessonIdx === lessons.length - 1;

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
  const cardAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [lessonId]);

  useEffect(() => {
    pauseBackgroundMusic();
    setAudioMode();
    return () => {
      resumeBackgroundMusic();
    };
  }, []);

  const [showGatePrompt, setShowGatePrompt] = useState(false);
  const gateSlideAnim = useRef(new Animated.Value(500)).current;
  const overlayFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showGatePrompt) {
      Animated.parallel([
        Animated.timing(overlayFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(gateSlideAnim, {
          toValue: 0,
          tension: 30,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showGatePrompt]);

  const goNext = () => {
    // Bassa progression gate: after Lesson 2 (index 1) and each subsequent lesson
    // (including the LAST one), show a prompt to do a mixed exercise to unlock next.
    if (isBassa && lessonIdx >= 1) {
      setShowGatePrompt(true);
      return;
    }

    if (isLast) {
      // Non-Bassa last lesson — return to the lessons overview tab
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

  const startMixedExercise = () => {
    router.replace({
      pathname: `/(tabs)/lessons/${themeId}/exercise/session`,
      params: {
        isBassaMixed: "true",
        lessonIdx: lessonIdx,
        themeId: themeId,
        category: category || "",
        isFinal: isLast ? "true" : "false"
      }
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
      toValue: progressPct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressPct]);

  if (!lesson) {
    // Skeleton — keeps the layout stable while data arrives
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <View style={s.topBar}>
          <View style={[s.closeBtn, { backgroundColor: Colors.surfaceVariant }]} />
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: "0%" }]} />
          </View>
          <View style={[s.heartBadge, { opacity: 0.3 }]}>
            <Text style={s.heartNum}>5</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
          {isBassa && (
            lesson.title?.toLowerCase().includes("jour") ||
            lesson.title?.toLowerCase().includes("avoir") ||
            lesson.title?.toLowerCase().includes("etre") ||
            lesson.title?.toLowerCase().includes("être") ||
            lesson.title?.toLowerCase().includes("manger") ||
            lesson.title?.toLowerCase().includes("marcher") ||
            lesson.title?.toLowerCase().includes("prendre") ||
            lesson.title?.toLowerCase().includes("acheter")
          ) ? (
            <BassaSpecialView
              lessonTitle={lesson.title}
              uiLang={uiLang}
              t={t}
            />
          ) : (
            <>
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
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
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
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
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
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { }
                  playAudio(effectiveAudioKey);
                }}
              >
                <Ionicons name="volume-medium-outline" size={18} color={Colors.primary} />
                <Text style={s.listenText}>
                  {effectiveAudioKey ? t("lessons.listenPronunciation") : t("lessons.noAudioAvailable")}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 160 }} />
        </Animated.View>
      </ScrollView>

      {/* ── BOUTON BAS (Caché si prompt actif) ── */}
      {!showGatePrompt && (
        <View style={s.footer}>
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.65}
            delayPressIn={0}
            style={s.continueBtn}
          >
            <Text style={s.continueTxt}>
              {isLast
                ? (isBassa
                  ? t("lessons.takeExercise", "Passer l'exercice")
                  : t("lessons.finishLessons"))
                : t("common.continue")
              }
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.onPrimary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── BASSA PROGRESSION GATE PROMPT ── */}
      {showGatePrompt && (
        <>
          {/* Overlay flou/focus (Fades in) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(255,255,255,0.85)", opacity: overlayFadeAnim, zIndex: 99 }
            ]}
            pointerEvents="auto"
          />

          {/* CTA Bottom Sheet (Slides up) */}
          <Animated.View style={[cta.wrap, { transform: [{ translateY: gateSlideAnim }], zIndex: 100 }]}>
            <View style={cta.accentBar} />
            <View style={cta.body}>
              <Text style={cta.heading}>
                {isLast
                  ? (uiLang.startsWith("en")
                    ? "Take an exercise to unlock the Final Challenge!"
                    : "Faites un exercice pour débloquer le Défi Final !")
                  : (uiLang.startsWith("en")
                    ? `Take an exercise to unlock Lesson ${lessonIdx + 2}`
                    : `Faites un exercice pour débloquer la leçon ${lessonIdx + 2}`)
                }
              </Text>
              <Text style={cta.sub}>
                {isLast
                  ? (uiLang.startsWith("en")
                    ? "Pass this exercise to unlock the final challenge and complete the theme!"
                    : "Réussissez cet exercice pour débloquer le défi final et terminer le thème !")
                  : (uiLang.startsWith("en")
                    ? "Click the button to start your exercise and continue your learning journey."
                    : "Cliquez sur le bouton pour commencer votre exercice et continuer votre apprentissage.")
                }
              </Text>
            </View>
            <TouchableOpacity
              style={cta.btn}
              activeOpacity={0.8}
              onPress={startMixedExercise}
            >
              <Text style={cta.btnTxt}>
                {uiLang.startsWith("en") ? "Start Exercise" : "Commencer l'exercice"}
              </Text>
              <Ionicons name="school" size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
}

/* ──────────────────────────────────────────────────────────────
   STYLES
   ────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
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

const BassaSpecialView = ({ lessonTitle, uiLang, t }) => {
  const lowTitle = lessonTitle.toLowerCase();

  let data = [];
  let topicText = "";

  if (lowTitle.includes("jour")) {
    data = BASSA_SPECIAL_DATA.days;
    topicText = uiLang.startsWith("en")
      ? "Learn the 7 days of the Week in Bassa"
      : "Apprenez les 7 jours de la semaine en Bassa";
  } else if (lowTitle.includes("avoir")) {
    data = BASSA_SPECIAL_DATA.avoir;
    topicText = uiLang.startsWith("en")
      ? "Conjugation of the verb Avoir (to have)"
      : "Conjugaison du verbe AVOIR";
  } else if (lowTitle.includes("etre") || lowTitle.includes("être")) {
    data = BASSA_SPECIAL_DATA.etre;
    topicText = uiLang.startsWith("en")
      ? "Conjugation of the verb Être (to be)"
      : "Conjugaison du verbe ÊTRE";
  } else if (lowTitle.includes("manger")) {
    data = BASSA_SPECIAL_DATA.manger;
    topicText = uiLang.startsWith("en")
      ? "Conjugation of the verb Manger (to eat)"
      : "Conjugaison du verbe MANGER";
  } else if (lowTitle.includes("marcher")) {
    data = BASSA_SPECIAL_DATA.marcher;
    topicText = uiLang.startsWith("en")
      ? "Conjugation of the verb Marcher (to walk)"
      : "Conjugaison du verbe MARCHER";
  } else if (lowTitle.includes("prendre")) {
    data = BASSA_SPECIAL_DATA.prendre;
    topicText = uiLang.startsWith("en")
      ? "Conjugation of the verb Prendre (to take)"
      : "Conjugaison du verbe PRENDRE";
  } else if (lowTitle.includes("acheter")) {
    data = BASSA_SPECIAL_DATA.acheter;
    topicText = uiLang.startsWith("en")
      ? "Conjugation of the verb Acheter (to buy)"
      : "Conjugaison du verbe ACHETER";
  }

  if (data.length === 0) return null;

  return (
    <View style={special.container}>
      <Text style={special.topic}>{topicText}</Text>

      {data.map((item, idx) => (
        <View key={idx} style={[special.card, Shadow.sm]}>
          <View style={special.row}>
            <View style={special.wordPairInner}>
              <View style={special.col}>
                <Text style={special.sourceWord}>
                  {uiLang.startsWith("en") ? (item.en || item.fr) : item.fr}
                </Text>
                <Text style={special.langLabel}>{uiLang.startsWith("en") ? "ENGLISH" : "FRANÇAIS"}</Text>
              </View>

              <Text style={special.dash}>-</Text>

              <View style={special.col}>
                <Text style={special.bassaWord}>{item.bassa}</Text>
                <Text style={special.langLabel}>BASSA</Text>
              </View>
            </View>

            <TouchableOpacity
              style={special.audioBtn}
              activeOpacity={0.6}
              onPress={() => playAudio(item.audio)}
            >
              <Ionicons name="volume-high" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const special = StyleSheet.create({
  container: { marginTop: Space.sm },
  topic: {
    fontSize: 24, fontWeight: "800", color: Colors.onSurface,
    marginBottom: Space["2xl"], lineHeight: 32,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginBottom: Space.md,
    borderWidth: 1.5,
    borderColor: Colors.surfaceVariant,
  },
  row: { flexDirection: "row", alignItems: "center", gap: Space.md },
  wordPairInner: { flex: 1, flexDirection: "row", alignItems: "center", gap: Space.sm },
  col: { alignItems: "center", minWidth: 80 },
  sourceWord: { fontSize: 16, fontWeight: "700", color: Colors.onSurface, marginBottom: 2, textAlign: "center" },
  bassaWord: { fontSize: 18, fontWeight: "800", color: Colors.primary, marginBottom: 2, textAlign: "center" },
  langLabel: { fontSize: 9, fontWeight: "700", color: Colors.onSurfaceVariant, letterSpacing: 0.8, textTransform: "uppercase" },
  dash: { fontSize: 22, color: Colors.surfaceVariant, fontWeight: "300", marginHorizontal: 4 },
  audioBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + "10",
    alignItems: "center", justifyContent: "center",
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
