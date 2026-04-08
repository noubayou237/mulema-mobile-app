/**
 * MULEMA — Détail Thème (style Duolingo path)
 * Chemin de leçons en zigzag · Police Fredoka · Couleurs rouges
 * Les leçons ne sont PAS verrouillées — seuls les thèmes le sont.
 */

import { useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, StyleSheet, Platform, StatusBar,
  ActivityIndicator, Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Colors, Shadow } from "../../../../src/theme/tokens";
import { useThemeStore }    from "../../../../src/stores/useThemeStore";
import { useDashboardStore } from "../../../../src/stores/useDashboardStore";

const { width: SW } = Dimensions.get("window");

/* ── Emojis/icônes par thème ──────────────────────────────── */
const THEME_EMOJIS = {
  salutation: "👋", famille: "👨‍👩‍👧", voyage: "✈️",
  nourriture: "🍽️", animaux: "🐾", vetement: "👗",
  nature: "🌿", corps: "💪", maison: "🏠", travail: "💼",
};
const getEmoji = (code = "") => {
  const k = code.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [key, val] of Object.entries(THEME_EMOJIS)) {
    if (k.includes(key)) return val;
  }
  return "📚";
};

/* ── Positions zigzag ────────────────────────────────────── */
const ZIGZAG = [0, 55, 85, 55, 0, -55, -85, -55];
const getZigzag = (i) => ZIGZAG[i % ZIGZAG.length];

/* ── Couleurs des nœuds ──────────────────────────────────── */
const NODE_COLORS = [
  ["#B71C1C", "#E53935"], ["#880E4F", "#C2185B"],
  ["#4A148C", "#7B1FA2"], ["#1A237E", "#303F9F"],
  ["#006064", "#00838F"], ["#1B5E20", "#2E7D32"],
];
const getNodeColor = (i) => NODE_COLORS[i % NODE_COLORS.length];

/* ════════════════════════════════════════════════════════════
   NŒUD DE LEÇON
   ════════════════════════════════════════════════════════════ */
const LessonNode = ({ lesson, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const completed = lesson.userProgress?.isCompleted ?? false;
  const stars     = lesson.userProgress?.stars ?? 0;
  const [dark, light] = getNodeColor(index);
  const offset = getZigzag(index);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: index * 70,
      tension: 130, friction: 7, useNativeDriver: true,
    }).start();
  }, []);

  // Pulse sur le premier nœud non-complété
  const isCurrent = !completed && (index === 0 || lesson.userProgress?.isUnlocked);
  useEffect(() => {
    if (!isCurrent) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent]);

  return (
    <View style={{ alignItems: "center", marginBottom: 4 }}>
      {/* Connecteur vertical */}
      {index > 0 && (
        <View style={[ns.connector, { backgroundColor: dark + "40" }]} />
      )}

      {/* Nœud principal */}
      <Animated.View
        style={[
          ns.nodeWrap,
          { transform: [{ scale: scaleAnim }, { scale: pulseAnim }, { translateX: offset }] },
        ]}
      >
        <TouchableOpacity
          onPress={() => onPress(lesson)}
          activeOpacity={0.82}
          style={ns.nodeTouchable}
        >
          <LinearGradient
            colors={completed ? [dark, dark] : [light, dark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={ns.nodeCircle}
          >
            {completed ? (
              <Ionicons name="checkmark-circle" size={30} color="#FFF" />
            ) : (
              <Text style={ns.nodeNum}>{index + 1}</Text>
            )}
          </LinearGradient>

          {/* Halo blanc si complété */}
          {completed && <View style={ns.haloCompleted} />}

          {/* Étoiles */}
          {completed && stars > 0 && (
            <View style={ns.starsWrap}>
              {[1, 2, 3].map((i) => (
                <Ionicons
                  key={i}
                  name={stars >= i ? "star" : "star-outline"}
                  size={10}
                  color={stars >= i ? "#FFD700" : "#CCC"}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Label du mot */}
        <View style={[ns.label, { transform: [{ translateX: -offset * 0.4 }] }]}>
          <Text style={ns.labelWord} numberOfLines={1}>{lesson.title}</Text>
          {lesson.subtitle ? (
            <Text style={ns.labelSub} numberOfLines={1}>{lesson.subtitle}</Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
};

/* ════════════════════════════════════════════════════════════
   NŒUD EXERCICES (boss level style Duolingo)
   ════════════════════════════════════════════════════════════ */
const ExerciseNode = ({ onPress, glowAnim }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, delay: 300,
      tension: 100, friction: 7, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ alignItems: "center", marginTop: 8, marginBottom: 24 }}>
      <View style={[ns.connector, { backgroundColor: "#B71C1C40", height: 40 }]} />

      {/* Bandeau "Section de compétences" */}
      <View style={ex.banner}>
        <View style={ex.bannerLine} />
        <Text style={ex.bannerTxt}>⚡ SECTION DE COMPÉTENCES</Text>
        <View style={ex.bannerLine} />
      </View>

      {/* Bouton boss */}
      <Animated.View
        style={[
          ex.glowWrap,
          {
            transform: [{ scale: scaleAnim }],
            shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }),
            shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 28] }),
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={ex.btn}
        >
          <LinearGradient
            colors={["#E53935", "#B71C1C"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={ex.btnInner}
          >
            <Text style={ex.chestEmoji}>🎯</Text>
            <Text style={ex.btnTitle}>Exercices</Text>
            <Text style={ex.btnSub}>15 questions · 3 types</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

/* ════════════════════════════════════════════════════════════
   ÉCRAN PRINCIPAL
   ════════════════════════════════════════════════════════════ */
export default function ThemeDetailScreen() {
  const router      = useRouter();
  const { themeId } = useLocalSearchParams();

  const { fetchLessons, getThemeById, lessons, lessonsLoading, clearTheme } = useThemeStore();
  const { data: dash } = useDashboardStore();

  // Animation glow pour le nœud exercices
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (themeId) fetchLessons(themeId);
    return () => clearTheme();
  }, [themeId]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const theme    = getThemeById(themeId);
  const themeName = theme?.name_fr ?? theme?.name ?? "Thème";
  const themeCode = (theme?.code ?? "").toLowerCase();
  const emoji     = getEmoji(themeCode);

  const completed  = lessons.filter((l) => l.userProgress?.isCompleted).length;
  const totalL     = lessons.length || 0;
  const pct        = totalL > 0 ? Math.round((completed / totalL) * 100) : 0;

  const handleLessonPress = (lesson) => {
    router.push(`/(tabs)/lessons/${themeId}/lesson/${lesson.id}`);
  };

  const handleExercise = () => {
    router.push(`/(tabs)/lessons/${themeId}/exercise/session`);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header gradient ── */}
      <LinearGradient
        colors={["#B71C1C", "#7F0000"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.header}
      >
        {/* Décors blob */}
        <View style={s.blob1} />
        <View style={s.blob2} />

        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        {/* Badges streak + cœurs */}
        <View style={s.badgesRow}>
          <View style={s.badge}>
            <Ionicons name="flame" size={14} color="#FFD700" />
            <Text style={s.badgeNum}>{dash?.streakDays ?? 0}</Text>
          </View>
          <View style={s.badge}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={s.badgeNum}>{dash?.hearts ?? 5}</Text>
          </View>
        </View>

        {/* Emoji + nom du thème */}
        <Text style={s.headerEmoji}>{emoji}</Text>
        <Text style={s.headerTitle}>{themeName}</Text>
        <Text style={s.headerSub}>
          {totalL} leçons · {pct}% complété
        </Text>

        {/* Barre de progression */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` }]} />
        </View>
      </LinearGradient>

      {/* ── Contenu ── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte intro */}
        <View style={s.introCard}>
          <Text style={s.introTitle}>Commence ton aventure !</Text>
          <Text style={s.introBody}>
            Parcours les leçons dans n'importe quel ordre, puis affronte
            la section de compétences pour valider le thème.
          </Text>
        </View>

        {/* ── Chemin de leçons ── */}
        {lessonsLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 48 }} />
        ) : lessons.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={s.emptyTxt}>Aucune leçon disponible pour ce thème.</Text>
          </View>
        ) : (
          <View style={s.path}>
            {lessons.map((lesson, idx) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                index={idx}
                onPress={handleLessonPress}
                isLast={idx === lessons.length - 1}
              />
            ))}

            {/* Nœud exercices (boss) */}
            <ExerciseNode
              onPress={handleExercise}
              glowAnim={glowAnim}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#FFF5F5" },
  scroll: { paddingBottom: 60 },

  /* Header */
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 42,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  blob1: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.06)", top: -60, right: -40,
  },
  blob2: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.04)", bottom: -20, left: 10,
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 42,
    left: 16,
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  badgesRow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 44,
    right: 16,
    flexDirection: "row", gap: 8,
  },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeNum: { fontSize: 13, fontFamily: "Fredoka_700Bold", color: "#FFF" },
  headerEmoji: { fontSize: 52, marginBottom: 6 },
  headerTitle: {
    fontFamily: "Fredoka_700Bold", fontSize: 30,
    color: "#FFF", textAlign: "center", marginBottom: 4,
  },
  headerSub: {
    fontFamily: "Nunito-Regular", fontSize: 14,
    color: "rgba(255,255,255,0.8)", marginBottom: 16,
  },
  progressTrack: {
    width: "85%", height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4, overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },

  /* Intro card */
  introCard: {
    backgroundColor: "#FFF",
    borderRadius: 20, padding: 20,
    margin: 16,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    ...Shadow.sm,
  },
  introTitle: {
    fontFamily: "Fredoka_600SemiBold", fontSize: 18,
    color: Colors.primary, marginBottom: 6,
  },
  introBody: {
    fontFamily: "Nunito-Regular", fontSize: 14,
    color: "#555", lineHeight: 20,
  },

  /* Path */
  path:   { paddingVertical: 8, paddingBottom: 16 },
  empty:  { alignItems: "center", paddingVertical: 48 },
  emptyTxt: {
    fontFamily: "Nunito-Regular", fontSize: 15,
    color: "#999", textAlign: "center",
  },
});

/* Nœuds de leçon */
const ns = StyleSheet.create({
  connector: {
    width: 4, height: 28,
    borderRadius: 2,
  },
  nodeWrap: {
    alignItems: "center",
    width: SW,
  },
  nodeTouchable: { alignItems: "center" },
  nodeCircle: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: "center", justifyContent: "center",
    ...Shadow.md,
  },
  nodeNum: {
    fontFamily: "Fredoka_700Bold", fontSize: 26, color: "#FFF",
  },
  haloCompleted: {
    position: "absolute",
    width: 82, height: 82, borderRadius: 41,
    borderWidth: 3, borderColor: "#FFD70060",
    top: -6, left: -6,
  },
  starsWrap: {
    flexDirection: "row", gap: 2,
    marginTop: 4,
  },
  label: {
    marginTop: 8, alignItems: "center",
    paddingHorizontal: 40,
  },
  labelWord: {
    fontFamily: "Fredoka_600SemiBold", fontSize: 16,
    color: "#1A1A2E", textAlign: "center",
  },
  labelSub: {
    fontFamily: "Nunito-Regular", fontSize: 13,
    color: "#888", textAlign: "center",
  },
});

/* Nœud exercices */
const ex = StyleSheet.create({
  banner: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 16, paddingHorizontal: 24,
  },
  bannerLine: {
    flex: 1, height: 1.5,
    backgroundColor: Colors.primary + "40",
  },
  bannerTxt: {
    fontFamily: "Fredoka_600SemiBold", fontSize: 13,
    color: Colors.primary, letterSpacing: 0.5,
  },
  glowWrap: {
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  btn: {
    borderRadius: 24, overflow: "hidden",
  },
  btnInner: {
    width: 200, paddingVertical: 20,
    alignItems: "center", borderRadius: 24,
  },
  chestEmoji: { fontSize: 44, marginBottom: 6 },
  btnTitle: {
    fontFamily: "Fredoka_700Bold", fontSize: 22,
    color: "#FFF",
  },
  btnSub: {
    fontFamily: "Nunito-Regular", fontSize: 13,
    color: "rgba(255,255,255,0.8)", marginTop: 2,
  },
});
