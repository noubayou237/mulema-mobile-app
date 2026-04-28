/**
 * MULEMA — Détail Thème · Style "Score Hero"
 * Header scrollable · Fond immersif par langue · Chemin pointillé
 * Nœuds : cercle (leçon) · hexagone (défi) · étoile (bonus final)
 */

import { useEffect, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, StyleSheet, Platform, StatusBar,
  ActivityIndicator, Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Polygon } from "react-native-svg";

import { Shadow } from "../../../../src/theme/tokens";
import { useThemeStore }    from "../../../../src/stores/useThemeStore";
import { useDashboardStore } from "../../../../src/stores/useDashboardStore";
import { useLanguageStore }  from "../../../../src/stores/useLanguageStore";
import { useTranslation } from "react-i18next";

const { width: SW } = Dimensions.get("window");

/* ═══════════════════════════════════════════════════════════════
   THÈME IMMERSIF PAR LANGUE
   ═══════════════════════════════════════════════════════════════ */
const RED_THEME = {
  bg: "#0A0000", // Very dark red/black background
  headerGrad: ["#7F0000", "#B71C1C", "#D32F2F"],
  nodeActive: "#E53935",
  nodeDone: "#7F0000",
  accent: "#FF5252",
  accentGlow: "#FF525250",
  pathColor: "#B71C1C80",
  label: "Mulema",
  unitLabel: "MULEMA",
};

const LANG_THEMES = {
  duala: { ...RED_THEME, unitLabel: "UNIVERS DUALA" },
  ghomala: { ...RED_THEME, unitLabel: "UNIVERS GHOMÁLÁ" },
  bassa: { ...RED_THEME, unitLabel: "UNIVERS BASSA" },
  default: RED_THEME,
};

const getLangTheme = (langName = "") => {
  const n = langName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("duala") || n.includes("douala")) return LANG_THEMES.duala;
  if (n.includes("ghomala") || n.includes("ghomal") || n.includes("bamilek"))
    return LANG_THEMES.ghomala;
  if (n.includes("bassa") || n.includes("basaa")) return LANG_THEMES.bassa;
  return LANG_THEMES.default;
};

/* ── Emojis par thème ────────────────────────────────────────── */
const THEME_EMOJIS = {
  salutation: "👋", famille: "👨‍👩‍👧", voyage: "✈️",
  nourriture: "🍽️", animaux: "🐾", vetement: "👗",
  nature: "🌿", cuisine: "🍲", corps: "💪",
  maison: "🏠", travail: "💼", savane: "🦁",
  mode: "👔",
};
const getEmoji = (code = "") => {
  const k = code.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [key, val] of Object.entries(THEME_EMOJIS)) {
    if (k.includes(key)) return val;
  }
  return "📚";
};

/* ── Fond étoilé (particules statiques) ─────────────────────── */
const StarField = ({ accent }) => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 137.508) % SW,
    y: (i * 97.3) % 900,
    r: i % 3 === 0 ? 1.5 : i % 5 === 0 ? 2 : 1,
    opacity: 0.15 + (i % 5) * 0.1,
  }));
  return (
    <Svg width={SW} height={900} style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i % 8 === 0 ? accent : "#FFF"} opacity={s.opacity} />
      ))}
      {/* Quelques étoiles brillantes */}
      {[0, 15, 30, 45].map((i) => (
        <Polygon
          key={`star-${i}`}
          points={`${stars[i].x},${stars[i].y - 5} ${stars[i].x + 2},${stars[i].y - 1} ${stars[i].x + 5},${stars[i].y - 1} ${stars[i].x + 2},${stars[i].y + 2} ${stars[i].x + 3},${stars[i].y + 6} ${stars[i].x},${stars[i].y + 3} ${stars[i].x - 3},${stars[i].y + 6} ${stars[i].x - 2},${stars[i].y + 2} ${stars[i].x - 5},${stars[i].y - 1} ${stars[i].x - 2},${stars[i].y - 1}`}
          fill={accent}
          opacity={0.6}
        />
      ))}
    </Svg>
  );
};

/* ── Chemin pointillé entre nœuds ────────────────────────────── */
const DashedPath = ({ fromX, fromY, toX, toY, color }) => (
  <Svg width={SW} height={Math.abs(toY - fromY) + 20} style={{ marginVertical: -4 }}>
    <Path
      d={`M${fromX} 10 Q${(fromX + toX) / 2} ${Math.abs(toY - fromY) / 2} ${toX} ${Math.abs(toY - fromY)}`}
      stroke={color}
      strokeWidth={2}
      strokeDasharray="6,5"
      fill="none"
      opacity={0.7}
    />
  </Svg>
);

/* ═══════════════════════════════════════════════════════════════
   NŒUD LEÇON (cercle)
   ═══════════════════════════════════════════════════════════════ */
const LessonNode = ({ lesson, index, onPress, lt, isLocked }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  const prog      = lesson.userProgress?.[0];
  const completed = prog?.isCompleted ?? false;
  const stars     = prog?.stars ?? 0;
  const isCurrent = !completed && !isLocked && (prog?.isUnlocked || index < 2);

  // Zigzag positions
  const POSITIONS = [SW * 0.5, SW * 0.65, SW * 0.75, SW * 0.65, SW * 0.5, SW * 0.35, SW * 0.25, SW * 0.35];
  const nodeX = POSITIONS[index % POSITIONS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: index * 80,
      tension: 120, friction: 8, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!isCurrent) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    glowLoop.start();
    return () => { loop.stop(); glowLoop.stop(); };
  }, [isCurrent]);

  const prevX = POSITIONS[(index - 1 + POSITIONS.length) % POSITIONS.length];

  return (
    <View style={{ alignItems: "center" }}>
      {/* Chemin pointillé vers le nœud précédent */}
      {index > 0 && (
        <View style={{ width: SW, alignItems: "center", marginBottom: -16 }}>
          <DashedPath fromX={prevX} fromY={0} toX={nodeX} toY={60} color={lt.pathColor} />
        </View>
      )}

      {/* Halo glow (current node) */}
      {isCurrent && (
        <Animated.View style={[
          nd.glow,
          { left: nodeX - 50, backgroundColor: lt.accentGlow, opacity: glowAnim },
        ]} />
      )}

      {/* Nœud principal */}
      <Animated.View style={[
        nd.wrap,
        { left: nodeX - 44, transform: [{ scale: scaleAnim }, { scale: pulseAnim }] },
      ]}>
        <TouchableOpacity onPress={() => onPress(lesson)} activeOpacity={0.8}>
          <LinearGradient
            colors={isLocked ? ["#333", "#111"] : completed ? [lt.nodeDone, lt.nodeDone] : [lt.nodeActive, lt.nodeDone]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[nd.circle, completed && nd.circleDone, isLocked && { opacity: 0.5 }]}
          >
            {isLocked ? (
              <Ionicons name="lock-closed" size={24} color="rgba(255,255,255,0.4)" />
            ) : completed
              ? <Ionicons name="checkmark" size={28} color="#FFF" />
              : isCurrent
              ? <Text style={nd.num}>{index + 1}</Text>
              : <Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.6)" />
            }
          </LinearGradient>

          {/* Couronne étoiles */}
          {completed && stars > 0 && (
            <View style={nd.stars}>
              {[1, 2, 3].map((i) => (
                <Ionicons key={i} name={stars >= i ? "star" : "star-outline"} size={9}
                  color={stars >= i ? "#FFD700" : "rgba(255,255,255,0.3)"} />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Label */}
        <Text style={nd.label} numberOfLines={2}>{lesson.title}</Text>
      </Animated.View>

      <View style={{ height: 72 }} />
    </View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NŒUD EXERCICE FINAL (étoile brillante style score-hero)
   ═══════════════════════════════════════════════════════════════ */
const ExerciseNode = ({ onPress, lt, isLocked }) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, delay: 400, tension: 80, friction: 6, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(rotAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const glowOpacity = glowAnim;

  return (
    <View style={{ alignItems: "center", marginTop: 24, marginBottom: 40 }}>
      {/* Séparateur */}
      <View style={[ex.divider, { borderColor: lt.accent + "50" }]}>
        <View style={[ex.divLine, { backgroundColor: lt.accent + "30" }]} />
        <Text style={[ex.divTxt, { color: lt.accent }]}>{t("lessons.finalChallenge")}</Text>
        <View style={[ex.divLine, { backgroundColor: lt.accent + "30" }]} />
      </View>

      {/* Halo rotatif */}
      <Animated.View style={[ex.glowRing, { borderColor: lt.accent + "40", opacity: glowOpacity }]} />
      <Animated.View style={[ex.glowRing2, { borderColor: lt.accentGlow, transform: [{ rotate: spin }] }]} />

      {/* Bouton étoile */}
      <Animated.View style={[ex.btnWrap, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity onPress={onPress} activeOpacity={isLocked ? 1 : 0.85}>
          <LinearGradient
            colors={isLocked ? ["#333", "#222"] : [lt.nodeActive, lt.nodeDone]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[ex.btn, isLocked && { opacity: 0.6 }]}
          >
            <Text style={[ex.emoji, isLocked && { opacity: 0.3 }]}>{isLocked ? "🔒" : "🎯"}</Text>
            <Text style={[ex.title, { color: isLocked ? "rgba(255,255,255,0.4)" : "#FFF" }]}>{isLocked ? t("common.locked") : t("nav.exercises")}</Text>
            <Text style={[ex.sub, isLocked && { color: "rgba(255,255,255,0.2)" }]}>{t("lessons.exerciseCount", { count: 15, types: 3 })}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Badge XP potentiel */}
      <View style={[ex.xpBadge, { backgroundColor: lt.accent + "20", borderColor: lt.accent + "50" }]}>
        <Text style={[ex.xpTxt, { color: lt.accent }]}>{t("lessons.xpPotential", { points: 100 })}</Text>
      </View>
    </View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ÉCRAN PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function ThemeDetailScreen() {
  const router      = useRouter();
  const { themeId } = useLocalSearchParams();
  const { t }       = useTranslation();

  const { fetchLessons, getThemeById, lessons, lessonsLoading, clearTheme, isLessonLocked, getExerciseAccess } = useThemeStore();
  const { data: dash } = useDashboardStore();
  const { activeLanguage } = useLanguageStore();

  const lt = getLangTheme(activeLanguage?.name ?? "");

  // Refetch every time this screen gains focus so that newly-unlocked lessons
  // appear after returning from an exercise without needing a full remount.
  useFocusEffect(
    useCallback(() => {
      if (themeId) fetchLessons(themeId);
      return () => clearTheme();
    }, [themeId])
  );

  const theme     = getThemeById(themeId);
  const themeName = theme?.name_fr ?? theme?.name ?? t("common.theme");
  const themeCode = (theme?.code ?? "").toLowerCase();
  const emoji     = getEmoji(themeCode);

  const completed = lessons.filter((l) => l.userProgress?.[0]?.isCompleted).length;
  const totalL    = lessons.length || 0;
  const pct       = totalL > 0 ? Math.round((completed / totalL) * 100) : 0;

  return (
    <View style={[s.root, { backgroundColor: lt.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Fond étoilé ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <StarField accent={lt.accent} />
      </View>

      {/* ── Tout scrolle, y compris le header ── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Bouton retour flottant ── */}
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/home");
          }}
          style={[s.backBtn, { backgroundColor: lt.nodeActive + "30", borderColor: lt.accent + "40" }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* ── Badges streaks ── */}
        <View style={s.topBadges}>
          <View style={[s.badge, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
            <Ionicons name="flame" size={13} color="#FFD700" />
            <Text style={s.badgeNum}>{dash?.streakDays ?? 0}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
            <Ionicons name="heart" size={13} color="#FF6B6B" />
            <Text style={s.badgeNum}>{dash?.hearts ?? 5}</Text>
          </View>
        </View>

        {/* ── Header (scrollable) ── */}
        <LinearGradient
          colors={[...lt.headerGrad, lt.bg]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={s.header}
        >
          {/* Blob déco */}
          <View style={[s.blob, { backgroundColor: lt.accent + "12", top: -30, right: -40 }]} />

          {/* Label unité */}
          <Text style={[s.unitLabel, { color: lt.accent }]}>
            {activeLanguage?.name?.toLowerCase().includes("duala") ? t("home.universDuala") :
             activeLanguage?.name?.toLowerCase().includes("ghomala") ? t("home.universGhomala") :
             activeLanguage?.name?.toLowerCase().includes("bassa") ? t("home.universBassa") :
             t("home.levels.level")}
          </Text>

          {/* Emoji + titre */}
          <Text style={s.headerEmoji}>{emoji}</Text>
          <Text style={s.headerTitle}>{themeName}</Text>
          <Text style={s.headerSub}>
            {t("home.masteryStats", { count: totalL, percent: pct })}
          </Text>

          {/* Barre de progression */}
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressFill, { width: `${pct}%`, backgroundColor: lt.accent }]} />
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={[s.statNum, { color: lt.accent }]}>{completed}</Text>
              <Text style={s.statLbl}>{t("home.completed")}</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: lt.accent + "30" }]} />
            <View style={s.statItem}>
              <Text style={[s.statNum, { color: lt.accent }]}>{totalL - completed}</Text>
              <Text style={s.statLbl}>{t("home.remainingNodes")}</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: lt.accent + "30" }]} />
            <View style={s.statItem}>
              <Text style={[s.statNum, { color: lt.accent }]}>{pct}%</Text>
              <Text style={s.statLbl}>{t("home.mastery")}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Chemin de leçons ── */}
        {lessonsLoading && lessons.length === 0 ? (
          <ActivityIndicator size="large" color={lt.accent} style={{ marginVertical: 60 }} />
        ) : lessons.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={[s.emptyTxt, { color: lt.accent + "80" }]}>{t("lessons.noLessons")}</Text>
          </View>
        ) : (
          <View style={s.path}>
            {lessons.map((lesson, idx) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                index={idx}
                totalLessons={totalL}
                lt={lt}
                onPress={(l) => {
                  if (isLessonLocked(l.id, idx)) return;
                  router.push(`/(tabs)/lessons/${themeId}/lesson/${l.id}`);
                }}
                isLocked={isLessonLocked(lesson.id, idx)}
              />
            ))}
            <ExerciseNode
              lt={lt}
              isLocked={!getExerciseAccess(themeId).e1}
              onPress={() => {
                const access = getExerciseAccess(themeId);
                if (!access.e1) return;

                // Find the last lesson that is accessible: indices 0-1 are
                // auto-unlocked; indices 2+ need an explicit isUnlocked from DB.
                // This is the "frontier" — the lesson whose exercise should fire
                // next to advance the curriculum by one step.
                let lastAccessibleIdx = Math.min(1, lessons.length - 1);
                for (let i = 2; i < lessons.length; i++) {
                  if (lessons[i]?.userProgress?.[0]?.isUnlocked) lastAccessibleIdx = i;
                  else break;
                }
                const lessonIdx = lastAccessibleIdx;
                const wordCount = lessonIdx + 1;

                router.push(`/(tabs)/lessons/${themeId}/exercise/session?lessonIdx=${lessonIdx}&wordCount=${wordCount}`);
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingBottom: 40, minHeight: "100%" },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 16,
    zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  topBadges: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 42,
    right: 16,
    zIndex: 10,
    flexDirection: "row", gap: 8,
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeNum: { fontSize: 13, fontFamily: "Fredoka_700Bold", color: "#FFF" },

  /* Header scrollable */
  header: {
    paddingTop: Platform.OS === "ios" ? 100 : 84,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
  },
  blob: {
    position: "absolute",
    width: 200, height: 200, borderRadius: 100,
  },
  unitLabel: {
    fontFamily: "Fredoka_600SemiBold",
    fontSize: 11, letterSpacing: 2,
    marginBottom: 4,
  },
  headerEmoji: { fontSize: 56, marginBottom: 8 },
  headerTitle: {
    fontFamily: "Fredoka_700Bold", fontSize: 32,
    color: "#FFF", textAlign: "center", marginBottom: 4,
  },
  headerSub: {
    fontFamily: "Nunito-Regular", fontSize: 14,
    color: "rgba(255,255,255,0.7)", marginBottom: 20,
  },
  progressTrack: {
    width: "80%", height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3, overflow: "hidden", marginBottom: 20,
  },
  progressFill: { height: "100%", borderRadius: 3 },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 24,
    gap: 16,
  },
  statItem:    { alignItems: "center" },
  statNum:     { fontFamily: "Fredoka_700Bold", fontSize: 20 },
  statLbl:     { fontFamily: "Nunito-Regular", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  statDivider: { width: 1, height: 28 },

  /* Path */
  path:  { paddingTop: 8, paddingBottom: 8, position: "relative" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTxt: { fontFamily: "Nunito-Regular", fontSize: 15, textAlign: "center", marginTop: 12 },
});

/* Nœuds */
const nd = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    width: 88,
  },
  circle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    ...Shadow.md,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.15)",
  },
  circleDone: {
    borderColor: "rgba(255,215,0,0.4)",
  },
  num: {
    fontFamily: "Fredoka_700Bold", fontSize: 26, color: "#FFF",
  },
  glow: {
    position: "absolute",
    width: 100, height: 100, borderRadius: 50,
    top: -14,
  },
  stars: {
    flexDirection: "row", gap: 2, justifyContent: "center",
    marginTop: 3,
  },
  label: {
    fontFamily: "Fredoka_500Medium", fontSize: 13,
    color: "rgba(255,255,255,0.75)", textAlign: "center",
    marginTop: 6, lineHeight: 17,
  },
});

/* Nœud exercice final */
const ex = StyleSheet.create({
  divider: {
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 24,
    marginBottom: 24,
    borderTopWidth: 0,
  },
  divLine: { flex: 1, height: 1 },
  divTxt: {
    fontFamily: "Fredoka_600SemiBold", fontSize: 12, letterSpacing: 1,
  },
  glowRing: {
    position: "absolute",
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 2,
    top: 36,
  },
  glowRing2: {
    position: "absolute",
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 1.5,
    borderStyle: "dashed",
    top: 46,
  },
  btnWrap: { zIndex: 1 },
  btn: {
    width: 180, paddingVertical: 22,
    borderRadius: 90,
    alignItems: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
    ...Shadow.lg,
  },
  emoji: { fontSize: 36, marginBottom: 4 },
  title: { fontFamily: "Fredoka_700Bold", fontSize: 20 },
  sub:   { fontFamily: "Nunito-Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  xpBadge: {
    marginTop: 16,
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  xpTxt: { fontFamily: "Fredoka_600SemiBold", fontSize: 13 },
});
