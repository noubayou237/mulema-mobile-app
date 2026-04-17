/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Page de Leçon (apprentissage d'un mot)             ║
 * ║  Route : (tabs)/lessons/[themeId]/lesson/[lessonId]          ║
 * ║  Séquentielle : Leçon 1/10 → 2/10 → … → 10/10              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef } from "react";
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
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

import { Colors, Typo, Space, Radius, Shadow } from "../../../../../src/theme/tokens";
import { useThemeStore } from "../../../../../src/stores/useThemeStore";
import { useDashboardStore } from "../../../../../src/stores/useDashboardStore";
import { useLanguageStore } from "../../../../../src/stores/useLanguageStore";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../../../../src/hooks/useBackgroundMusic";

const playAudio = async (url, t) => {
  if (!url) {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
    return;
  }
  try {
    await Audio.setAudioModeAsync({ 
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: 1.0 }
    );
    
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.warn("Audio play error", e);
  }
};

const getLangKey = (langName = "") => {
  const n = langName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("duala") || n.includes("douala")) return "duala";
  if (n.includes("ghomala") || n.includes("ghomal") || n.includes("bamilek")) return "ghomala";
  if (n.includes("bassa") || n.includes("basaa")) return "bassa";
  return "duala";
};

const DEFAULT_TIP = "Chaque mot que tu apprends est une porte ouverte sur une riche culture camerounaise.";

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
  const { t } = useTranslation();
  const { themeId, lessonId } = useLocalSearchParams();

  const { lessons, fetchLessons, themes } = useThemeStore();
  const { data: dash } = useDashboardStore();
  const { activeLanguage } = useLanguageStore();

  /* Charger les leçons si besoin */
  useEffect(() => {
    if (themeId && lessons.length === 0) {
      fetchLessons(themeId);
    }
  }, [themeId]);

  /* Trouver la leçon courante */
  const lessonIdx = lessons.findIndex((l) => l.id === lessonId);
  const lesson    = lessons[lessonIdx];
  const total     = lessons.length || 10;
  const isFirst   = lessonIdx === 0;
  const isLast    = lessonIdx === total - 1;

  /* Thème courant */
  const theme    = themes.find((t) => t.id === themeId);
  const themeCode = theme?.code ?? "famille";

  /* Conseil culturel pour cette leçon (via i18n) */
  const langKey  = getLangKey(activeLanguage?.name ?? "");
  const langName = activeLanguage?.name ?? "Duala";
  
  // Tenter de récupérer les tips depuis i18n
  const tips = t(`culturalTips.${langKey}.${themeCode}`, { returnObjects: true });
  const tip  = Array.isArray(tips) ? tips[lessonIdx % tips.length] : t("messages.mulemaMeaningLong");

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
    cardAnim.setValue(0);
    slideAnim.setValue(30);
    if (isLast) {
      router.back();
    } else {
      router.replace(`/(tabs)/lessons/${themeId}/lesson/${lessons[lessonIdx + 1].id}`);
    }
  };

  const goPrev = () => {
    if (isFirst) { router.back(); return; }
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
        {/* ── Label leçon ── */}
        <Animated.View
          style={{ opacity: cardAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={s.lessonLabel}>
            {t("lessons.lessonNum", { num: lessonIdx + 1 })} / {total}
          </Text>

          {/* ── Titre de question ── */}
          <Text style={s.questionTitle}>
            {t("lessons.whatDoesThisMean")}
          </Text>

          {/* ── Carte mot français ── */}
          <View style={[s.wordCard, Shadow.md]}>
            <View style={s.wordCardIcon}>
              <Ionicons name={themeIcon} size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.wordFrLabel}>{t("lessons.frenchLabel")}</Text>
              <Text style={s.wordFr}>{lesson.title}</Text>
            </View>
            <TouchableOpacity
              style={s.audioBtn}
              activeOpacity={0.7}
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                playAudio(lesson.audioUrl, t);
              }}
            >
              <Ionicons name="volume-high" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Traduction Duala ── */}
          <View style={[s.translationCard, Shadow.sm]}>
            <View style={s.transHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.transLabel}>
                  {t("lessons.translationIn", { lang: langName.toUpperCase() })}
                </Text>
                <Text style={s.transWord}>{lesson.subtitle}</Text>
              </View>
              {/* Bouton audio Duala */}
              <TouchableOpacity
                style={s.audioBtn}
                activeOpacity={0.7}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  playAudio(lesson.audioUrl, t);
                }}
              >
                <Ionicons name="volume-medium" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {lesson.hint ? (
              <View style={s.hintPill}>
                <Text style={s.hintText}>
                  💡 Commence par : <Text style={s.hintLetter}>{lesson.hint}</Text>
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Conseil culturel ── */}
          <View style={s.tipCard}>
            <View style={s.tipHeader}>
              <View style={s.tipIcon}>
                <Ionicons name="bulb" size={16} color={Colors.secondary} />
              </View>
              <Text style={s.tipTitle}>{t("common.didYouKnow")}</Text>
            </View>
            <Text style={s.tipBody}>{tip}</Text>
          </View>

          {/* ── Bouton audio prononciation ── */}
          <TouchableOpacity
            style={s.listenBtn}
            activeOpacity={0.8}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
              playAudio(lesson.audioUrl, t);
            }}
          >
            <Ionicons name="volume-medium-outline" size={18} color={Colors.primary} />
            <Text style={s.listenText}>
              {lesson.audioUrl ? t("lessons.listenPronunciation") : t("lessons.noAudioAvailable")}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 110 }} />
        </Animated.View>
      </ScrollView>

      {/* ── BOUTON BAS ── */}
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

  /* Tip */
  tipCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.lg,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: Space.md, gap: Space.sm },
  tipIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.secondary + "20",
    alignItems: "center", justifyContent: "center",
  },
  tipTitle: {
    fontSize: 11, fontWeight: "800",
    color: Colors.secondary, letterSpacing: 1,
  },
  tipBody: { fontSize: 14, color: Colors.onSurface, lineHeight: 21 },

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
