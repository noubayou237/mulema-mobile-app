import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Modal, Pressable, Platform, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import "../src/i18n";

const { width } = Dimensions.get("window");

const boatImage   = require("../assets/images/boat.png");
const islandImage = require("../assets/images/island.png");
const lockIcon    = require("../assets/images/lock.png");

// ── Design tokens ──────────────────────────────────────────────────────────
const BG         = "#F0EDE6";   // warm beige — exact maquette bg
const CARD_BG    = "#FFFFFF";
const RED        = "#D32F2F";
const RED_LIGHT  = "#FFEBEE";
const TEXT_DARK  = "#2C2C2C";
const TEXT_MID   = "#6B6B6B";
const TEXT_LIGHT = "#AAAAAA";
const BORDER     = "#EDE8E0";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

// Maquette-style level colors (3 tiers visible in maquette)
const LEVEL_COLORS  = ["#D32F2F", "#C62828", "#B71C1C", "#8B0000"];
const LEVEL_LABELS  = ["Débutant", "Intermédiaire", "Avancé", "Maître"];

// ── Boat bob (kept for modal preview) ─────────────────────────────────────
const BoatBob = ({ style, source, mirrored }) => {
  const bob  = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(bob,  { toValue: -5, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob,  { toValue:  0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(tilt, { toValue:  1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(tilt, { toValue: -1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return (
    <Animated.Image source={source} style={[style, {
      transform: [
        { translateY: bob },
        { rotate: tilt.interpolate({ inputRange: [-1,0,1], outputRange: ["-4deg","0deg","4deg"] }) },
        ...(mirrored ? [{ scaleX: -1 }] : []),
      ],
    }]} />
  );
};

// ── Level detail modal ─────────────────────────────────────────────────────
const LevelModal = ({ visible, onClose, level, onStart }) => {
  const slideUp      = useRef(new Animated.Value(600)).current;
  const fade         = useRef(new Animated.Value(0)).current;
  const islandBounce = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,         { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideUp,      { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.spring(islandBounce, { toValue: 1, tension: 55, friction: 6, delay: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 180, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 600, duration: 200, useNativeDriver: true }),
      ]).start();
      islandBounce.setValue(0.7);
    }
  }, [visible]);

  if (!level) return null;
  const skills       = level.skills || ["Salutations", "Nombres", "Couleurs", "Famille"];
  const accentColor  = LEVEL_COLORS[level.id - 1] || RED;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[m.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[m.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={m.sheetInner}>
            <View style={m.handle} />

            {/* Preview */}
            <Animated.View style={[m.previewWrap, { transform: [{ scale: islandBounce }], backgroundColor: `${accentColor}12` }]}>
              <Image source={islandImage} style={m.previewIsland} />
              <BoatBob source={boatImage} style={m.previewBoat} mirrored={false} />
              {level.unlocked ? (
                <View style={[m.unlockedBadge, { backgroundColor: accentColor }]}>
                  <Ionicons name="checkmark-circle" size={13} color="#fff" />
                  <Text style={m.unlockedBadgeText}>Débloqué</Text>
                </View>
              ) : (
                <View style={m.lockedBadge}>
                  <Image source={lockIcon} style={m.lockImgSm} />
                </View>
              )}
            </Animated.View>

            {/* Header band */}
            <View style={[m.levelBand, { backgroundColor: accentColor }]}>
              <Text style={m.levelBandText}>{LEVEL_LABELS[level.id - 1] || `Niveau ${level.id}`}</Text>
            </View>

            <Text style={m.levelName}>{level.title}</Text>
            <Text style={m.levelDesc}>{level.description || "Maîtrise les bases de cette langue fascinante du Cameroun."}</Text>

            {/* Skills */}
            <View style={m.skillsRow}>
              {skills.map((sk, i) => (
                <View key={i} style={[m.skillChip, !level.unlocked && { opacity: 0.4 }, { borderColor: `${accentColor}30`, backgroundColor: `${accentColor}0D` }]}>
                  <Text style={[m.skillChipText, { color: accentColor }]}>{sk}</Text>
                </View>
              ))}
            </View>

            {/* Rewards */}
            <View style={m.rewardRow}>
              {[["⭐", "+50 XP"], ["💰", "+10 Coris"], ["🔥", "+1 jour"]].map(([emoji, val], i) => (
                <View key={i} style={m.rewardItem}>
                  <Text style={m.rewardEmoji}>{emoji}</Text>
                  <Text style={m.rewardVal}>{val}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            {level.unlocked ? (
              <TouchableOpacity
                onPress={() => { onClose(); onStart(level); }}
                style={[m.startBtn, { backgroundColor: accentColor }]}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle" size={19} color="#fff" />
                <Text style={m.startBtnText}>Commencer</Text>
              </TouchableOpacity>
            ) : (
              <View style={m.lockedCta}>
                <Ionicons name="lock-closed" size={17} color={TEXT_LIGHT} />
                <Text style={m.lockedCtaText}>Termine le niveau précédent pour débloquer</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Level card — exact maquette style ─────────────────────────────────────
// Maquette: colored top header + white body + text lines + Start button
const CARD_W = (width - 16 * 2 - 10 * 2) / 3; // 3-column grid

const LevelCard = ({ level, index, onPress }) => {
  const mount     = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount,       { toValue: 1, duration: 450, delay: index * 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY,  { toValue: 0, duration: 450, delay: index * 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.95, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(level);
  };

  const accentColor = LEVEL_COLORS[index] || RED;
  const levelLabel  = LEVEL_LABELS[index] || `N.${level.id}`;

  return (
    <Animated.View style={[s.cardWrap, { opacity: mount, transform: [{ translateY }, { scale: pressAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={s.card}>

        {/* Colored header — exactly like maquette */}
        <View style={[s.cardHeader, { backgroundColor: accentColor }]}>
          <Text style={s.cardHeaderLabel} numberOfLines={1}>{levelLabel}</Text>
          {/* Bookmark badge — maquette has a little colored tag top-right */}
          <View style={s.cardBookmark}>
            {level.unlocked
              ? <Ionicons name="bookmark" size={10} color="#fff" />
              : <Ionicons name="lock-closed" size={9} color={accentColor} />
            }
          </View>
        </View>

        {/* White body */}
        <View style={s.cardBody}>
          {/* Maquette shows text lines inside card — island image as mini scene */}
          <View style={[s.cardScene, { backgroundColor: `${accentColor}0C` }]}>
            <Image source={islandImage} style={[s.cardIsland, !level.unlocked && s.dimmed]} />
            {!level.unlocked && (
              <View style={s.cardLockOverlay}>
                <Image source={lockIcon} style={s.cardLockImg} />
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={s.cardTitle} numberOfLines={1}>{level.title}</Text>

          {/* Description lines — maquette shows gray lines */}
          <Text style={s.cardDesc} numberOfLines={2}>{level.description}</Text>

          {/* Start button — solid, full-width, maquette style */}
          {level.unlocked ? (
            <TouchableOpacity
              style={[s.cardBtn, { backgroundColor: accentColor }]}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Text style={s.cardBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <View style={[s.cardBtn, s.cardBtnLocked]}>
              <Ionicons name="lock-closed" size={11} color={TEXT_LIGHT} />
            </View>
          )}
        </View>

        {/* Lock badge bottom-right for locked levels — maquette shows padlock */}
        {!level.unlocked && (
          <View style={[s.cardLockBadge, { borderColor: accentColor }]}>
            <Image source={lockIcon} style={s.cardLockBadgeImg} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Weekly progress widget ─────────────────────────────────────────────────
// Maquette: "Progression" card with day circles + checkmarks + progress bar
const WeeklyProgress = ({ completedDays = 3 }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: completedDays / DAYS.length,
      duration: 1000, delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={s.progressCard}>
      <Text style={s.progressCardTitle}>Progression</Text>
      <View style={s.daysRow}>
        {DAYS.map((day, i) => {
          const done = i < completedDays;
          return (
            <View key={i} style={s.dayItem}>
              <View style={[s.dayCircle, done && s.dayCircleDone]}>
                {done && <Ionicons name="checkmark" size={14} color="#fff" strokeWidth={3} />}
              </View>
              <Text style={[s.dayLabel, done && { color: TEXT_DARK, fontWeight: "700" }]}>{day}</Text>
            </View>
          );
        })}
      </View>
      <View style={s.progressBarBg}>
        <Animated.View style={[s.progressBarFill, {
          width: barAnim.interpolate({ inputRange: [0,1], outputRange: ["0%","100%"] }),
        }]} />
      </View>
    </View>
  );
};

// ── Tips section ───────────────────────────────────────────────────────────
// Maquette: "Astuces" section with landscape image card + title + description
const TipCard = ({ tip, index }) => {
  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 400, delay: 600 + index * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.tipCard, { opacity: mount }]}>
      {/* Landscape scene — beige placeholder with icon */}
      <View style={[s.tipScene, { backgroundColor: tip.locked ? "#EEE" : `${RED}10` }]}>
        <Text style={s.tipSceneEmoji}>{tip.emoji}</Text>
        {tip.locked && (
          <View style={s.tipLockOverlay}>
            <View style={s.tipLockCircle}>
              <Image source={lockIcon} style={s.tipLockImg} />
            </View>
          </View>
        )}
      </View>
      <View style={s.tipBody}>
        <Text style={s.tipTitle}>{tip.title}</Text>
        <Text style={s.tipDesc} numberOfLines={2}>{tip.desc}</Text>
        {/* Maquette shows gray skeleton lines */}
        {tip.locked && (
          <>
            <View style={s.skeletonLine} />
            <View style={[s.skeletonLine, { width: "60%" }]} />
          </>
        )}
      </View>
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeDouala() {
  const router = useRouter();
  const { t }  = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  const LEVELS_DATA = [
    {
      id: 1, title: t("home.levelI"), unlocked: true, completed: false,
      path: "/exercices/exos1",
      description: "Apprends les premières bases de la langue Douala, parlée sur les côtes du Cameroun.",
      skills: ["Salutations", "Nombres", "Couleurs", "Famille"],
    },
    {
      id: 2, title: t("home.levelII"), unlocked: false, completed: false,
      path: "/levels/douala/level2",
      description: "Enrichis ton vocabulaire avec les objets du quotidien.",
      skills: ["Nourriture", "Animaux", "Maison", "Corps"],
    },
    {
      id: 3, title: t("home.levelIII"), unlocked: false, completed: false,
      path: "/levels/douala/level3",
      description: "Construis tes premières phrases et expressions courantes.",
      skills: ["Verbes", "Phrases", "Questions", "Temps"],
    },
    {
      id: 4, title: t("home.levelIV"), unlocked: false, completed: false,
      path: "/levels/douala/level4",
      description: "Maîtrise des dialogues complets et des situations du quotidien.",
      skills: ["Dialogue", "Commerce", "Voyage", "Culture"],
    },
  ];

  const TIPS = [
    {
      title: "Astuce du jour",
      desc: "Les salutations en Douala varient selon l'heure de la journée et le contexte social.",
      emoji: "🌊",
      locked: false,
    },
    {
      title: "Culture Douala",
      desc: "Complète le niveau 2 pour débloquer les astuces culturelles.",
      emoji: "🏝️",
      locked: true,
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
        {/* ── Section label — maquette top zone ── */}
        <Animated.View style={[s.topSection, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-10,0] }) }],
        }]}>
          <View style={s.topLeft}>
            <Text style={s.topTitle}>🌊 Langue Douala</Text>
            <Text style={s.topSub}>4 niveaux · Commence ton aventure !</Text>
          </View>
          <View style={s.topBadge}>
            <Text style={s.topBadgeEmoji}>🗺️</Text>
          </View>
        </Animated.View>

        {/* ── Weekly progress — maquette "Progression" widget ── */}
        <WeeklyProgress completedDays={3} />

        {/* ── "Toutes les Leçons" — maquette section ── */}
        <Text style={s.sectionLabel}>Toutes les Leçons</Text>

        {/* 3-column level grid — matches maquette exactly */}
        <View style={s.levelsGrid}>
          {LEVELS_DATA.map((level, index) => (
            <LevelCard key={level.id} level={level} index={index} onPress={handleOpenLevel} />
          ))}
        </View>

        {/* ── "Astuces" — maquette tip section ── */}
        <Text style={s.sectionLabel}>Astuces</Text>
        {TIPS.map((tip, i) => <TipCard key={i} tip={tip} index={i} />)}

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
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 16, paddingHorizontal: 16 },

  // Top section
  topSection: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14,
  },
  topLeft:  { flex: 1 },
  topTitle: {
    fontSize: 20, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 2,
  },
  topSub: { fontSize: 12, color: TEXT_MID, fontFamily: "Nunito-Regular" },
  topBadge: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
    ...CARD_SHADOW,
  },
  topBadgeEmoji: { fontSize: 20 },

  // Weekly progress card — maquette style
  progressCard: {
    backgroundColor: CARD_BG, borderRadius: 18,
    padding: 16, marginBottom: 20,
    ...CARD_SHADOW,
  },
  progressCardTitle: {
    fontSize: 15, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 14,
  },
  daysRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginBottom: 14,
  },
  dayItem: { alignItems: "center", gap: 5, flex: 1 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F0EDE6",
    borderWidth: 1.5, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  dayCircleDone: {
    backgroundColor: RED,
    borderColor: RED,
    shadowColor: RED, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width:0, height:2 }, elevation: 3,
  },
  dayLabel: {
    fontSize: 10, color: TEXT_LIGHT,
    fontFamily: "Nunito-SemiBold", fontWeight: "600",
  },
  progressBarBg: { height: 8, backgroundColor: "#EEE", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: RED, borderRadius: 4 },

  // Section label — maquette large bold text
  sectionLabel: {
    fontSize: 17, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold",
    marginBottom: 12, marginTop: 4,
  },

  // 3-column grid
  levelsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  // Level card — maquette proportions
  cardWrap: { flex: 1 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16, overflow: "hidden",
    position: "relative",
    ...CARD_SHADOW,
  },

  // Colored header band
  cardHeader: {
    paddingHorizontal: 8, paddingVertical: 8,
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
  },
  cardHeaderLabel: {
    fontSize: 11, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", flex: 1,
    lineHeight: 14,
  },
  cardBookmark: {
    width: 16, height: 18, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
    marginLeft: 4, marginTop: -2,
  },

  // White body
  cardBody: { padding: 8 },
  cardScene: {
    height: 70, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8, position: "relative", overflow: "hidden",
  },
  cardIsland: { width: 60, height: 60, resizeMode: "contain" },
  dimmed:     { opacity: 0.2 },
  cardLockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(240,237,230,0.55)",
  },
  cardLockImg: { width: 20, height: 20, resizeMode: "contain" },

  cardTitle: {
    fontSize: 11, fontWeight: "700", color: TEXT_DARK,
    fontFamily: "Nunito-Bold", marginBottom: 3,
  },
  cardDesc: {
    fontSize: 9.5, color: TEXT_MID, lineHeight: 13,
    fontFamily: "Nunito-Regular", marginBottom: 8,
  },

  // Start button — full-width solid, maquette style
  cardBtn: {
    borderRadius: 10, paddingVertical: 8,
    alignItems: "center", justifyContent: "center",
  },
  cardBtnText: {
    fontSize: 12, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold",
  },
  cardBtnLocked: {
    backgroundColor: "#EDE8E0",
  },

  // Lock badge bottom-right — maquette padlock
  cardLockBadge: {
    position: "absolute", bottom: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  cardLockBadgeImg: { width: 12, height: 12, resizeMode: "contain" },

  // Tips
  tipCard: {
    backgroundColor: CARD_BG, borderRadius: 16,
    marginBottom: 12, overflow: "hidden",
    ...CARD_SHADOW,
  },
  tipScene: {
    height: 140, alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  tipSceneEmoji: { fontSize: 52 },
  tipLockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "flex-end", justifyContent: "flex-end",
    padding: 12,
  },
  tipLockCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(232,195,80,0.9)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  tipLockImg: { width: 20, height: 20, resizeMode: "contain" },
  tipBody: { padding: 14 },
  tipTitle: {
    fontSize: 15, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 5,
  },
  tipDesc: {
    fontSize: 13, color: TEXT_MID, lineHeight: 19,
    fontFamily: "Nunito-Regular", marginBottom: 6,
  },
  skeletonLine: {
    height: 8, backgroundColor: BORDER, borderRadius: 4,
    width: "85%", marginBottom: 6,
  },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  sheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetInner: {
    backgroundColor: CARD_BG,
    paddingTop: 12, paddingHorizontal: 24, paddingBottom: 44, alignItems: "center",
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#DDD", marginBottom: 18 },

  // Preview with boat
  previewWrap: {
    width: "100%", height: 130, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    marginBottom: 0, overflow: "hidden", position: "relative",
  },
  previewIsland: { width: 90, height: 90, resizeMode: "contain" },
  previewBoat: { width: 50, height: 28, resizeMode: "contain", position: "absolute", bottom: 10, right: 24 },
  unlockedBadge: {
    position: "absolute", bottom: 8, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4,
  },
  unlockedBadgeText: { fontSize: 10, color: "#fff", fontFamily: "Nunito-Bold", fontWeight: "700" },
  lockedBadge: {
    position: "absolute", bottom: 8, right: 12,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(240,237,230,0.9)",
    alignItems: "center", justifyContent: "center",
  },
  lockImgSm: { width: 15, height: 15, resizeMode: "contain" },

  // Level band
  levelBand: {
    width: "100%", paddingVertical: 8,
    alignItems: "center", marginBottom: 12,
  },
  levelBandText: {
    fontSize: 11, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", letterSpacing: 1.5, textTransform: "uppercase",
  },

  levelName: {
    fontSize: 20, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", textAlign: "center", marginBottom: 8,
  },
  levelDesc: {
    fontSize: 13, color: TEXT_MID, fontFamily: "Nunito-Regular",
    textAlign: "center", lineHeight: 20, marginBottom: 16, paddingHorizontal: 4,
  },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 18 },
  skillChip: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 11, paddingVertical: 5,
  },
  skillChipText: { fontSize: 11, fontWeight: "600", fontFamily: "Nunito-SemiBold" },

  rewardRow: { flexDirection: "row", gap: 10, marginBottom: 22, width: "100%", justifyContent: "center" },
  rewardItem: {
    flex: 1, maxWidth: 90, alignItems: "center", gap: 4,
    backgroundColor: "#F7F5F2", borderRadius: 14,
    paddingVertical: 10, borderWidth: 1, borderColor: BORDER,
  },
  rewardEmoji: { fontSize: 20 },
  rewardVal: { fontSize: 11, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },

  startBtn: {
    width: "100%", borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
  },
  startBtnText: { fontSize: 16, fontWeight: "800", color: "#fff", fontFamily: "Nunito-ExtraBold", letterSpacing: 0.3 },

  lockedCta: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F7F5F2", borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 18,
    borderWidth: 1, borderColor: BORDER,
    width: "100%", justifyContent: "center",
  },
  lockedCtaText: { fontSize: 12, color: TEXT_LIGHT, fontFamily: "Nunito-SemiBold", textAlign: "center", flex: 1 },
});