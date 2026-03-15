import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Modal, Pressable, Platform, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import "../src/i18n";

const { width } = Dimensions.get("window");

const smallPyramid = require("../assets/images/pyramid-small.png");
const largePyramid = require("../assets/images/pyramid-large.png");
const sphinx        = require("../assets/images/sphinx.png");
const camel         = require("../assets/images/camel.png");
const lockIcon      = require("../assets/images/lock.png");

// ── Design tokens (maquette-aligned) ──────────────────────────────────────
const BG         = "#F0EDE6";   // warm beige background
const CARD_BG    = "#FFFFFF";   // pure white cards
const RED        = "#D32F2F";   // primary red accent
const RED_LIGHT  = "#FFEBEE";   // very light red tint
const TEXT_DARK  = "#2C2C2C";
const TEXT_MID   = "#6B6B6B";
const TEXT_LIGHT = "#AAAAAA";
const SHADOW     = { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4 };

// ── Camel walk ─────────────────────────────────────────────────────────────
const CamelWalk = ({ source, style }) => {
  const bob  = useRef(new Animated.Value(0)).current;
  const step = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(bob,  { toValue: -4, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob,  { toValue:  0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(step, { toValue:  1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(step, { toValue: -1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return (
    <Animated.Image source={source} style={[style, {
      transform: [{ translateY: bob }, { rotate: step.interpolate({ inputRange: [-1,0,1], outputRange: ["-3deg","0deg","3deg"] }) }],
    }]} />
  );
};

const SphinxIdle = ({ source, style }) => {
  const breath = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1.02, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breath, { toValue: 1,    duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.Image source={source} style={[style, { transform: [{ scale: breath }] }]} />;
};

// ── Level detail modal ─────────────────────────────────────────────────────
const LevelModal = ({ visible, onClose, level, onStart }) => {
  const slideUp  = useRef(new Animated.Value(600)).current;
  const fade     = useRef(new Animated.Value(0)).current;
  const pyramidB = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(pyramidB,{ toValue: 1, tension: 50, friction: 6, delay: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start();
      pyramidB.setValue(0.6);
    }
  }, [visible]);

  if (!level) return null;
  const skills = level.skills || ["Salutations", "Nombres", "Nature", "Famille"];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[m.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[m.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={m.sheetInner}>
            <View style={m.handle} />

            <Animated.View style={[m.sceneWrap, { transform: [{ scale: pyramidB }] }]}>
              <Image source={smallPyramid} style={m.previewSmallPyramid} />
              <Image source={largePyramid} style={m.previewLargePyramid} />
              {level.id === 1 && <Image source={sphinx} style={m.previewSphinx} />}
              {!level.unlocked && (
                <View style={m.lockOverlay}>
                  <Image source={lockIcon} style={m.lockImg} />
                </View>
              )}
              {level.unlocked && (
                <View style={m.unlockedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={m.unlockedText}>Débloqué</Text>
                </View>
              )}
            </Animated.View>

            <Text style={m.levelNum}>NIVEAU {level.id}</Text>
            <Text style={m.levelName}>{level.title}</Text>
            <Text style={m.levelDesc}>{level.description}</Text>

            <View style={m.skillsRow}>
              {skills.map((sk, i) => (
                <View key={i} style={[m.skillChip, !level.unlocked && { opacity: 0.4 }]}>
                  <Text style={m.skillChipText}>{sk}</Text>
                </View>
              ))}
            </View>

            <View style={m.rewardRow}>
              {[["⭐", "+50 XP"], ["💰", "+10 Coris"], ["🔥", "+1 jour"]].map(([emoji, val], i) => (
                <View key={i} style={m.rewardItem}>
                  <Text style={m.rewardEmoji}>{emoji}</Text>
                  <Text style={m.rewardVal}>{val}</Text>
                </View>
              ))}
            </View>

            {level.unlocked ? (
              <TouchableOpacity
                onPress={() => { onClose(); onStart(level); }}
                style={m.startBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={m.startBtnText}>Commencer l'aventure</Text>
              </TouchableOpacity>
            ) : (
              <View style={m.lockedCta}>
                <Ionicons name="lock-closed" size={18} color={TEXT_LIGHT} />
                <Text style={m.lockedCtaText}>Termine le niveau précédent pour débloquer</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Level card — maquette style ────────────────────────────────────────────
// Each card: colored header band (like "Débutant" green), white body, rounded "Start" button
const LEVEL_COLORS = ["#D32F2F", "#C62828", "#B71C1C", "#8B0000"];

const LevelCard = ({ level, index, onPress }) => {
  const mount     = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount,      { toValue: 1, duration: 500, delay: index * 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: index * 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.97, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(level);
  };

  const isFirst  = index === 0;
  const accentColor = LEVEL_COLORS[index] || RED;

  const levelLabels = ["Débutant", "Intermédiaire", "Avancé", "Maître"];
  const levelLabel  = levelLabels[index] || `Niveau ${level.id}`;

  return (
    <Animated.View style={[s.cardWrap, { opacity: mount, transform: [{ translateY }, { scale: pressAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.card}>

        {/* Colored header band */}
        <View style={[s.cardHeader, { backgroundColor: accentColor }]}>
          <Text style={s.cardHeaderLabel}>{levelLabel}</Text>
          {level.unlocked ? (
            <View style={s.headerBadgeUnlocked}>
              <Ionicons name="bookmark" size={12} color="#fff" />
            </View>
          ) : (
            <View style={s.headerBadgeLocked}>
              <Ionicons name="lock-closed" size={11} color={accentColor} />
            </View>
          )}
        </View>

        {/* White body */}
        <View style={s.cardBody}>
          {/* Mini scene */}
          <View style={[s.miniScene, { backgroundColor: level.unlocked ? `${accentColor}10` : "#F5F3F0" }]}>
            <Image source={smallPyramid} style={[s.miniPyramidSm, !level.unlocked && s.dimmed]} />
            <Image source={largePyramid} style={[s.miniPyramidLg, !level.unlocked && s.dimmed]} />
            {isFirst && <SphinxIdle source={sphinx} style={[s.miniSphinx, !level.unlocked && s.dimmed]} />}
            {isFirst && <CamelWalk  source={camel}  style={[s.miniCamel,  !level.unlocked && s.dimmed]} />}
            {!level.unlocked && (
              <View style={s.miniLockOverlay}>
                <Image source={lockIcon} style={s.miniLockImg} />
              </View>
            )}
          </View>

          {/* Title + desc */}
          <Text style={s.cardTitle}>{level.title}</Text>
          <Text style={s.cardDesc} numberOfLines={2}>{level.description}</Text>

          {/* XP badge row */}
          {level.unlocked && (
            <View style={s.xpRow}>
              <View style={[s.xpPill, { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }]}>
                <Text style={[s.xpPillText, { color: accentColor }]}>+50 XP</Text>
              </View>
              <View style={[s.xpPill, { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }]}>
                <Text style={[s.xpPillText, { color: accentColor }]}>+10 Coris</Text>
              </View>
            </View>
          )}

          {/* Start button — solid color, maquette style */}
          {level.unlocked ? (
            <TouchableOpacity style={[s.startBtn, { backgroundColor: accentColor }]} onPress={handlePress} activeOpacity={0.85}>
              <Text style={s.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.lockedBtn}>
              <Ionicons name="lock-closed" size={14} color={TEXT_LIGHT} />
              <Text style={s.lockedBtnText}>Verrouillé</Text>
            </View>
          )}
        </View>

        {level.completed && (
          <View style={[s.completedBadge, { backgroundColor: accentColor }]}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={s.completedText}>Terminé</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressWidget = ({ total, unlocked }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: unlocked / total, duration: 1200, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, []);

  return (
    <View style={s.progressCard}>
      <View style={s.progressHeader}>
        <Text style={s.progressTitle}>Progression</Text>
        <Text style={s.progressVal}>{unlocked}/{total} niveaux</Text>
      </View>
      <View style={s.progressBg}>
        <Animated.View style={[s.progressFill, {
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          backgroundColor: RED,
        }]} />
      </View>
    </View>
  );
};

// ── Section label ─────────────────────────────────────────────────────────
const SectionLabel = ({ title }) => (
  <Text style={s.sectionLabel}>{title}</Text>
);

// ── End banner ─────────────────────────────────────────────────────────────
const EndBanner = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[s.endBanner, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [0.9,1] }) }] }]}>
      <Text style={s.endEmoji}>🏺</Text>
      <Text style={s.endTitle}>Maître Bassa t'attend !</Text>
      <Text style={s.endSub}>Complète tous les niveaux pour décrocher le certificat Bassa.</Text>
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeBassa() {
  const router = useRouter();
  const { t }  = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

  const LEVELS_DATA = [
    {
      id: 1, title: "Langue Bassa", unlocked: true, completed: false,
      path: "/exercices/exos1",
      description: "Découvre les bases du Bassa, langue parlée au centre et au littoral du Cameroun.",
      skills: ["Salutations", "Nombres", "Famille", "Nature"],
    },
    {
      id: 2, title: "Vocabulaire", unlocked: false, completed: false,
      path: "/levels/bassa/level2",
      description: "Enrichis ton vocabulaire avec les objets et lieux du quotidien.",
      skills: ["Nourriture", "Animaux", "Village", "Corps"],
    },
    {
      id: 3, title: "Expressions", unlocked: false, completed: false,
      path: "/levels/bassa/level3",
      description: "Maîtrise les expressions courantes et les verbes essentiels.",
      skills: ["Verbes", "Temps", "Questions", "Émotions"],
    },
    {
      id: 4, title: "Maîtrise", unlocked: false, completed: false,
      path: "/levels/bassa/level4",
      description: "Atteins la maîtrise avec des dialogues complets et culturels.",
      skills: ["Dialogue", "Proverbes", "Culture", "Histoire"],
    },
  ];

  const handleOpenLevel = (level) => { setSelectedLevel(level); setModalVisible(true); };
  const handleStart     = (level) => router.push(level.path);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        style={{ backgroundColor: BG }}
      >
        {/* Section header pill */}
        <View style={s.pageHeader}>
          <View style={s.langPill}>
            <Text style={s.langPillText}>🏜️ Bassa</Text>
            <Ionicons name="chevron-down" size={13} color={RED} />
          </View>
          <Text style={s.pageSubtitle}>4 niveaux · Explore le désert des mots</Text>
        </View>

        <ProgressWidget total={LEVELS_DATA.length} unlocked={LEVELS_DATA.filter(l => l.unlocked).length} />

        <SectionLabel title="Toutes les Leçons" />

        {/* Cards grid — 2 columns */}
        <View style={s.cardsGrid}>
          {LEVELS_DATA.map((level, index) => (
            <LevelCard key={level.id} level={level} index={index} onPress={handleOpenLevel} />
          ))}
        </View>

        <EndBanner />
        <View style={{ height: 120 }} />
      </ScrollView>

      <LevelModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        level={selectedLevel}
        onStart={handleStart}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CARD_W = (width - 48) / 2; // 2-column grid with 16px gaps

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 16, paddingHorizontal: 16 },

  // Page header
  pageHeader: { marginBottom: 16, marginTop: 8 },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    backgroundColor: CARD_BG,
    borderRadius: 20, borderWidth: 1.5, borderColor: `${RED}30`,
    paddingHorizontal: 14, paddingVertical: 8,
    marginBottom: 6,
    ...SHADOW,
  },
  langPillText: { fontSize: 15, fontWeight: "800", color: RED, fontFamily: "Nunito-ExtraBold" },
  pageSubtitle: { fontSize: 13, color: TEXT_MID, fontFamily: "Nunito-Regular", marginLeft: 2 },

  // Progress card
  progressCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    ...SHADOW,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  progressTitle: { fontSize: 15, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },
  progressVal: { fontSize: 13, color: RED, fontWeight: "700", fontFamily: "Nunito-Bold" },
  progressBg: { height: 10, backgroundColor: "#EEE", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },

  // Section label
  sectionLabel: {
    fontSize: 18, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold",
    marginBottom: 14, marginLeft: 2,
  },

  // Cards grid
  cardsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 14, marginBottom: 20,
  },

  // Card
  cardWrap: { width: CARD_W },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    overflow: "hidden",
    ...SHADOW,
    position: "relative",
  },

  cardHeader: {
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  cardHeaderLabel: {
    fontSize: 13, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold",
  },
  headerBadgeUnlocked: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  headerBadgeLocked: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },

  cardBody: { padding: 12 },

  miniScene: {
    height: 90, borderRadius: 10,
    position: "relative", overflow: "hidden",
    alignItems: "center", justifyContent: "flex-end",
    marginBottom: 10,
  },
  miniPyramidSm: { position: "absolute", left: 4, bottom: 4, width: 44, height: 44, resizeMode: "contain" },
  miniPyramidLg: { position: "absolute", right: 2, bottom: 2, width: 60, height: 60, resizeMode: "contain" },
  miniSphinx:    { position: "absolute", left: "28%", bottom: 6, width: 48, height: 30, resizeMode: "contain" },
  miniCamel:     { position: "absolute", right: "25%", top: 8, width: 40, height: 26, resizeMode: "contain" },
  dimmed: { opacity: 0.2 },
  miniLockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(240,235,230,0.65)",
  },
  miniLockImg: { width: 24, height: 24, resizeMode: "contain" },

  cardTitle: {
    fontSize: 13, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11, color: TEXT_MID, lineHeight: 16,
    fontFamily: "Nunito-Regular", marginBottom: 10,
  },

  xpRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  xpPill: {
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  xpPillText: { fontSize: 10, fontWeight: "700", fontFamily: "Nunito-Bold" },

  // Maquette-style solid button
  startBtn: {
    borderRadius: 12, paddingVertical: 10,
    alignItems: "center", justifyContent: "center",
  },
  startBtnText: {
    fontSize: 13, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", letterSpacing: 0.3,
  },

  lockedBtn: {
    borderRadius: 12, paddingVertical: 10,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 6,
    backgroundColor: "#F0EDE6",
  },
  lockedBtnText: { fontSize: 12, color: TEXT_LIGHT, fontFamily: "Nunito-SemiBold" },

  completedBadge: {
    position: "absolute", top: 8, right: 8,
    flexDirection: "row", gap: 3, alignItems: "center",
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  completedText: { fontSize: 10, color: "#fff", fontFamily: "Nunito-Bold", fontWeight: "700" },

  // End banner
  endBanner: {
    backgroundColor: CARD_BG, borderRadius: 18,
    padding: 24, alignItems: "center",
    ...SHADOW,
  },
  endEmoji: { fontSize: 44, marginBottom: 10 },
  endTitle: { fontSize: 17, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold", marginBottom: 6, textAlign: "center" },
  endSub: { fontSize: 13, color: TEXT_MID, fontFamily: "Nunito-Regular", textAlign: "center", lineHeight: 20 },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", backgroundColor: CARD_BG },
  sheetInner: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center", backgroundColor: CARD_BG },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#DDD", marginBottom: 20 },

  sceneWrap: { width: "100%", height: 130, position: "relative", alignItems: "center", justifyContent: "flex-end", marginBottom: 12, backgroundColor: RED_LIGHT, borderRadius: 16, overflow: "hidden" },
  previewSmallPyramid: { position: "absolute", left: 30, bottom: 0, width: 80, height: 80, resizeMode: "contain" },
  previewLargePyramid: { position: "absolute", right: 20, bottom: 0, width: 100, height: 100, resizeMode: "contain" },
  previewSphinx: { position: "absolute", left: "35%", bottom: 4, width: 80, height: 48, resizeMode: "contain" },

  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(240,235,230,0.6)" },
  lockImg: { width: 36, height: 36, resizeMode: "contain" },
  unlockedBadge: { position: "absolute", bottom: 8, right: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: RED, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  unlockedText: { fontSize: 11, color: "#fff", fontFamily: "Nunito-Bold", fontWeight: "700" },

  levelNum: { fontSize: 11, color: RED, fontFamily: "Nunito-Bold", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  levelName: { fontSize: 20, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold", textAlign: "center", marginBottom: 8 },
  levelDesc: { fontSize: 13, color: TEXT_MID, fontFamily: "Nunito-Regular", textAlign: "center", lineHeight: 20, marginBottom: 18 },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  skillChip: { backgroundColor: RED_LIGHT, borderWidth: 1, borderColor: `${RED}25`, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  skillChipText: { fontSize: 12, color: RED, fontFamily: "Nunito-SemiBold", fontWeight: "600" },

  rewardRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  rewardItem: { alignItems: "center", gap: 4, backgroundColor: "#F7F5F2", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#EEE" },
  rewardEmoji: { fontSize: 22 },
  rewardVal: { fontSize: 12, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },

  startBtn: { width: "100%", backgroundColor: RED, borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  startBtnText: { fontSize: 17, fontWeight: "800", color: "#fff", fontFamily: "Nunito-ExtraBold", letterSpacing: 0.4 },

  lockedCta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F7F5F2", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: "#EEE", width: "100%", justifyContent: "center" },
  lockedCtaText: { fontSize: 13, color: TEXT_LIGHT, fontFamily: "Nunito-SemiBold", fontWeight: "600", textAlign: "center", flex: 1 },
});