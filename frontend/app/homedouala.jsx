import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Modal, Pressable, Platform, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import "../src/i18n";

const { width } = Dimensions.get("window");

const boatImage   = require("../assets/images/boat.png");
const islandImage = require("../assets/images/island.png");
const lockIcon    = require("../assets/images/lock.png");

// ── Floating particle ──────────────────────────────────────────────────────
const Particle = ({ x, delay, size, color }) => {
  const y   = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(0); op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: -60, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.6, duration: 400, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(op, { toValue: 0,   duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ]).start(loop);
    };
    loop();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute", left: x, bottom: 0,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: op,
      transform: [{ translateY: y }],
    }} />
  );
};

// ── Boat bob animation ─────────────────────────────────────────────────────
const BoatBob = ({ style, source, mirrored }) => {
  const bob   = useRef(new Animated.Value(0)).current;
  const tilt  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bob,  { toValue: -6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bob,  { toValue:  0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(tilt, { toValue:  1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tilt, { toValue: -1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.Image
      source={source}
      style={[style, {
        transform: [
          { translateY: bob },
          { rotate: tilt.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-5deg", "0deg", "5deg"] }) },
          ...(mirrored ? [{ scaleX: -1 }] : []),
        ],
      }]}
    />
  );
};

// ── Wave divider ───────────────────────────────────────────────────────────
const WaveRow = () => (
  <View style={s.waveRow}>
    {[...Array(6)].map((_, i) => (
      <View key={i} style={[s.waveDot, { opacity: 0.08 + i * 0.04 }]} />
    ))}
  </View>
);

// ── Level detail modal ─────────────────────────────────────────────────────
const LevelModal = ({ visible, onClose, level, onStart }) => {
  const slideUp = useRef(new Animated.Value(600)).current;
  const fade    = useRef(new Animated.Value(0)).current;
  const islandBounce = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,   { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp,{ toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(islandBounce, { toValue: 1, tension: 50, friction: 6, delay: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,   { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp,{ toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start();
      islandBounce.setValue(0.7);
    }
  }, [visible]);

  if (!level) return null;

  const skills = level.skills || ["Salutations", "Nombres", "Couleurs", "Famille"];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[m.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[m.sheet, { transform: [{ translateY: slideUp }] }]}>
          <LinearGradient colors={["#1A1A2E", "#16213E"]} style={m.sheetInner}>
            <View style={m.handle} />

            {/* Island preview */}
            <Animated.View style={[m.islandPreview, { transform: [{ scale: islandBounce }] }]}>
              <Image source={islandImage} style={m.islandImg} />
              {level.unlocked ? (
                <View style={m.unlockedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={m.unlockedBadgeText}>Débloqué</Text>
                </View>
              ) : (
                <View style={m.lockedBadge}>
                  <Image source={lockIcon} style={m.lockImg} />
                </View>
              )}
            </Animated.View>

            <Text style={m.levelNum}>Niveau {level.id}</Text>
            <Text style={m.levelName}>{level.title}</Text>
            <Text style={m.levelDesc}>{level.description || "Maîtrise les bases de cette langue fascinante du Cameroun."}</Text>

            {/* Skills chips */}
            <View style={m.skillsRow}>
              {skills.map((sk, i) => (
                <View key={i} style={[m.skillChip, !level.unlocked && { opacity: 0.4 }]}>
                  <Text style={m.skillChipText}>{sk}</Text>
                </View>
              ))}
            </View>

            {/* XP reward */}
            <View style={m.rewardRow}>
              <View style={m.rewardItem}>
                <Text style={m.rewardEmoji}>⭐</Text>
                <Text style={m.rewardVal}>+50 XP</Text>
              </View>
              <View style={m.rewardItem}>
                <Text style={m.rewardEmoji}>💰</Text>
                <Text style={m.rewardVal}>+10 Coris</Text>
              </View>
              <View style={m.rewardItem}>
                <Text style={m.rewardEmoji}>🔥</Text>
                <Text style={m.rewardVal}>+1 jour</Text>
              </View>
            </View>

            {/* CTA */}
            {level.unlocked ? (
              <TouchableOpacity onPress={() => { onClose(); onStart(level); }} style={{ width: "100%", borderRadius: 18, overflow: "hidden" }}>
                <LinearGradient colors={["#4CAF50", "#2E7D32"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={m.startBtn}>
                  <Ionicons name="play-circle" size={20} color="#fff" />
                  <Text style={m.startBtnText}>Commencer</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={m.lockedCta}>
                <Ionicons name="lock-closed" size={18} color="#4A5568" />
                <Text style={m.lockedCtaText}>Termine le niveau précédent pour débloquer</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ── Level node ─────────────────────────────────────────────────────────────
const LevelNode = ({ level, index, align, onPress }) => {
  const mount   = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.5)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount, { toValue: 1, duration: 600, delay: index * 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 55, friction: 7, delay: index * 180, useNativeDriver: true }),
    ]).start();

    if (level.unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.88, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(level);
  };

  const isLeft = align === "flex-start";

  return (
    <Animated.View style={[s.nodeWrap, { alignItems: align, opacity: mount, transform: [{ scale }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.nodeBtn}>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>

          {/* Glow ring for unlocked */}
          {level.unlocked && (
            <Animated.View style={[s.glowRing, { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }), transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }]} />
          )}

          {/* Island */}
          <View style={[s.islandWrap, !level.unlocked && s.islandLocked]}>
            <Image source={islandImage} style={s.islandImg} />

            {/* Lock overlay */}
            {!level.unlocked && (
              <View style={s.lockOverlay}>
                <Image source={lockIcon} style={s.lockImg} />
              </View>
            )}

            {/* Completed badge */}
            {level.completed && (
              <View style={s.completedBadge}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </View>

          {/* Boat */}
          <BoatBob
            source={boatImage}
            style={[s.boat, isLeft ? s.boatLeft : s.boatRight]}
            mirrored={!isLeft}
          />

          {/* Label button */}
          <LinearGradient
            colors={level.unlocked ? ["#4CAF50", "#2E7D32"] : ["#2D3748", "#1A202C"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.labelBtn}
          >
            <Text style={[s.labelText, !level.unlocked && { color: "#4A5568" }]}>
              {level.unlocked ? (level.id === 1 ? "COMMENCER" : `NIVEAU ${level.id}`) : `NIVEAU ${level.id}`}
            </Text>
            {level.unlocked && <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 4 }} />}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* XP badge */}
      {level.unlocked && !level.completed && (
        <View style={[s.xpBadge, isLeft ? s.xpLeft : s.xpRight]}>
          <Text style={s.xpText}>+50 XP</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ── Section header ─────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, index }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay: index * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.sectionHeader, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      <LinearGradient colors={["rgba(76,175,80,0.15)", "rgba(76,175,80,0.04)"]} style={s.sectionGrad}>
        <Text style={s.sectionTitle}>{title}</Text>
        <Text style={s.sectionSub}>{subtitle}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ── River path connector ───────────────────────────────────────────────────
const Connector = ({ fromLeft }) => (
  <View style={[s.connector, fromLeft ? s.connectorLeft : s.connectorRight]}>
    <View style={s.connectorLine} />
    <View style={s.connectorDot} />
  </View>
);

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeDouala() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const LEVELS_DATA = [
    {
      id: 1, title: t("home.levelI"), unlocked: true,  completed: false,
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

  const ALIGNS = ["flex-start", "flex-end", "flex-start", "flex-end"];

  const handleOpenLevel = (level) => {
    setSelectedLevel(level);
    setModalVisible(true);
  };

  const handleStart = (level) => {
    router.push(level.path);
  };

  const particles = [
    { x: 20,        delay: 0,    size: 8,  color: "#4CAF50" },
    { x: width-40,  delay: 1200, size: 6,  color: "#2196F3" },
    { x: width*0.4, delay: 600,  size: 5,  color: "#FFC107" },
    { x: width*0.7, delay: 1800, size: 7,  color: "#9C27B0" },
    { x: 60,        delay: 2400, size: 5,  color: "#FF6B35" },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated background gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, {
        backgroundColor: bgAnim.interpolate({ inputRange: [0, 1], outputRange: ["#1A1A2E", "#0F3460"] })
      }]} />

      {/* Subtle grid overlay */}
      <View style={s.gridOverlay} pointerEvents="none" />

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* River path */}
      <View style={s.riverContainer} pointerEvents="none">
        <LinearGradient
          colors={["rgba(33,150,243,0.12)", "rgba(33,150,243,0.25)", "rgba(33,150,243,0.12)"]}
          style={s.river}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Section title */}
        <SectionHeader
          title="🌊 Langue Douala"
          subtitle="4 niveaux · Commence ton aventure !"
          index={0}
        />

        {/* Progress bar */}
        <ProgressBar total={LEVELS_DATA.length} unlocked={LEVELS_DATA.filter(l => l.unlocked).length} />

        {/* Level nodes */}
        {LEVELS_DATA.map((level, index) => (
          <View key={level.id}>
            <LevelNode
              level={level}
              index={index}
              align={ALIGNS[index]}
              onPress={handleOpenLevel}
            />
            {index < LEVELS_DATA.length - 1 && (
              <Connector fromLeft={ALIGNS[index] === "flex-start"} />
            )}
          </View>
        ))}

        {/* End banner */}
        <EndBanner />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Level modal */}
      <LevelModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        level={selectedLevel}
        onStart={handleStart}
      />
    </View>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ total, unlocked }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: unlocked / total, duration: 1200, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, []);

  return (
    <View style={s.progressWrap}>
      <View style={s.progressHeader}>
        <Text style={s.progressLabel}>Progression</Text>
        <Text style={s.progressVal}>{unlocked}/{total} niveaux</Text>
      </View>
      <View style={s.progressBg}>
        <Animated.View style={[s.progressFill, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
      </View>
    </View>
  );
};

// ── End banner ─────────────────────────────────────────────────────────────
const EndBanner = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.endBanner, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
      <LinearGradient colors={["rgba(76,175,80,0.1)", "rgba(76,175,80,0.04)"]} style={s.endGrad}>
        <Text style={s.endEmoji}>🏆</Text>
        <Text style={s.endTitle}>Maître Douala t'attend !</Text>
        <Text style={s.endSub}>Complète tous les niveaux pour débloquer le certificat Douala.</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: "transparent",
  },

  riverContainer: {
    position: "absolute",
    top: 0, bottom: 0,
    left: "50%",
    width: 48,
    transform: [{ translateX: -24 }],
    zIndex: 0,
  },
  river: {
    flex: 1,
    borderRadius: 24,
  },

  scroll: {
    paddingTop: 16,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Section header
  sectionHeader: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.2)",
  },
  sectionGrad: { paddingVertical: 18, paddingHorizontal: 20, alignItems: "center" },
  sectionTitle: {
    fontSize: 22, fontWeight: "800", color: "#E2E8F0",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: 0.5, marginBottom: 4,
  },
  sectionSub: { fontSize: 13, color: "#8892B0", fontWeight: "500" },

  // Progress
  progressWrap: { width: "100%", marginBottom: 28 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, color: "#8892B0", fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  progressVal: { fontSize: 12, color: "#4CAF50", fontWeight: "700" },
  progressBg: { height: 8, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: "#4CAF50", shadowColor: "#4CAF50", shadowOpacity: 0.5, shadowRadius: 6 },

  // Node
  nodeWrap: { width: "100%", marginBottom: 8, position: "relative" },
  nodeBtn: { padding: 4 },

  glowRing: {
    position: "absolute",
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2.5, borderColor: "#4CAF50",
    top: -4, left: -4,
    shadowColor: "#4CAF50", shadowOpacity: 0.6, shadowRadius: 12,
  },

  islandWrap: {
    width: 130, height: 130,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  islandLocked: { opacity: 0.35 },
  islandImg: { width: 120, height: 120, resizeMode: "contain" },

  lockOverlay: {
    position: "absolute",
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 60,
  },
  lockImg: { width: 36, height: 36, resizeMode: "contain" },

  completedBadge: {
    position: "absolute", top: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#1A1A2E",
  },

  boat: { width: 65, height: 35, resizeMode: "contain", position: "absolute" },
  boatLeft:  { bottom: -8, right: -20 },
  boatRight: { bottom: -8, left: -20 },

  labelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9, paddingHorizontal: 18,
    borderRadius: 22,
    marginTop: 8,
    shadowColor: "#4CAF50", shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  labelText: { fontSize: 13, fontWeight: "800", color: "#fff", letterSpacing: 0.8 },

  xpBadge: {
    position: "absolute", top: 10,
    backgroundColor: "rgba(255,193,7,0.15)",
    borderWidth: 1, borderColor: "rgba(255,193,7,0.4)",
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  xpLeft:  { right: 0 },
  xpRight: { left: 0 },
  xpText: { fontSize: 11, color: "#FFC107", fontWeight: "700" },

  // Connector
  connector: {
    width: "100%", height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  connectorLeft: { alignItems: "flex-end", paddingRight: width * 0.28 },
  connectorRight: { alignItems: "flex-start", paddingLeft: width * 0.28 },
  connectorLine: { width: 2, height: 36, backgroundColor: "rgba(76,175,80,0.25)", borderRadius: 1 },
  connectorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(76,175,80,0.4)", marginTop: -2 },

  // Wave
  waveRow: { flexDirection: "row", gap: 6, marginVertical: 8 },
  waveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2196F3" },

  // End banner
  endBanner: { width: "100%", marginTop: 24, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(76,175,80,0.2)" },
  endGrad: { padding: 24, alignItems: "center" },
  endEmoji: { fontSize: 48, marginBottom: 10 },
  endTitle: { fontSize: 18, fontWeight: "800", color: "#E2E8F0", marginBottom: 6, textAlign: "center" },
  endSub: { fontSize: 13, color: "#8892B0", textAlign: "center", lineHeight: 20 },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: "hidden" },
  sheetInner: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.18)", marginBottom: 22 },

  islandPreview: { position: "relative", marginBottom: 8 },
  islandImg: { width: 110, height: 110, resizeMode: "contain" },
  unlockedBadge: {
    position: "absolute", bottom: 6, right: 0,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#4CAF50", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    shadowColor: "#4CAF50", shadowOpacity: 0.5, shadowRadius: 6,
  },
  unlockedBadgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  lockedBadge: {
    position: "absolute", bottom: 6, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  lockImg: { width: 18, height: 18, resizeMode: "contain" },

  levelNum: { fontSize: 12, color: "#4CAF50", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  levelName: { fontSize: 22, fontWeight: "800", color: "#E2E8F0", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", textAlign: "center", marginBottom: 8 },
  levelDesc: { fontSize: 13, color: "#8892B0", textAlign: "center", lineHeight: 20, marginBottom: 18, paddingHorizontal: 8 },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  skillChip: {
    backgroundColor: "rgba(76,175,80,0.1)", borderWidth: 1, borderColor: "rgba(76,175,80,0.3)",
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
  },
  skillChipText: { fontSize: 12, color: "#81C784", fontWeight: "600" },

  rewardRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
  rewardItem: { alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  rewardEmoji: { fontSize: 22 },
  rewardVal: { fontSize: 12, fontWeight: "700", color: "#E2E8F0" },

  startBtn: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 18 },
  startBtnText: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.4 },

  lockedCta: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", width: "100%",
    justifyContent: "center",
  },
  lockedCtaText: { fontSize: 13, color: "#4A5568", fontWeight: "600", textAlign: "center", flex: 1 },
});