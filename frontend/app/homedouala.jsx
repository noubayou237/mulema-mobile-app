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

// ── Design tokens ──────────────────────────────────────────────────────────
const BG        = "#F0EDE6";
const CARD_BG   = "#FFFFFF";
const RED       = "#D32F2F";
const RED_LIGHT = "#FFEBEE";
const TEXT_DARK  = "#2C2C2C";
const TEXT_MID   = "#6B6B6B";
const TEXT_LIGHT = "#AAAAAA";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
};

// ── Floating particle ──────────────────────────────────────────────────────
const Particle = ({ x, delay, size, color }) => {
  const y  = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(0); op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: -60, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.35, duration: 400, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(op, { toValue: 0,    duration: 600, useNativeDriver: true }),
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
  const bob  = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;

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

// ── Level detail modal ─────────────────────────────────────────────────────
const LevelModal = ({ visible, onClose, level, onStart }) => {
  const slideUp      = useRef(new Animated.Value(600)).current;
  const fade         = useRef(new Animated.Value(0)).current;
  const islandBounce = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,         { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp,      { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(islandBounce, { toValue: 1, tension: 50, friction: 6, delay: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 600, duration: 220, useNativeDriver: true }),
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
          <View style={m.sheetInner}>
            <View style={m.handle} />

            {/* Island preview */}
            <Animated.View style={[m.islandPreview, { transform: [{ scale: islandBounce }] }]}>
              <View style={m.islandBg}>
                <Image source={islandImage} style={m.islandImg} />
              </View>
              {level.unlocked ? (
                <View style={m.unlockedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
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
                <Text style={m.startBtnText}>Commencer</Text>
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

// ── Level node ─────────────────────────────────────────────────────────────
const LevelNode = ({ level, index, align, onPress }) => {
  const mount     = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.5)).current;
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

          {/* Glow ring — white card style, subtle */}
          {level.unlocked && (
            <Animated.View style={[s.glowRing, {
              opacity:   glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] }),
              transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
            }]} />
          )}

          {/* Island on white card */}
          <View style={[s.islandCard, !level.unlocked && s.islandCardLocked, level.unlocked && CARD_SHADOW]}>
            <Image source={islandImage} style={[s.islandImg, !level.unlocked && s.dimmed]} />
            {!level.unlocked && (
              <View style={s.lockOverlay}>
                <Image source={lockIcon} style={s.lockImg} />
              </View>
            )}
            {level.completed && (
              <View style={s.completedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>

          {/* Boat */}
          <BoatBob
            source={boatImage}
            style={[s.boat, isLeft ? s.boatLeft : s.boatRight]}
            mirrored={!isLeft}
          />

          {/* Label button — solid red or light gray */}
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            style={[s.labelBtn, level.unlocked ? s.labelBtnActive : s.labelBtnLocked]}
          >
            <Text style={[s.labelText, !level.unlocked && s.labelTextLocked]}>
              {level.unlocked
                ? (level.id === 1 ? "COMMENCER" : `NIVEAU ${level.id}`)
                : `NIVEAU ${level.id}`}
            </Text>
          </TouchableOpacity>
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

// ── Connector ─────────────────────────────────────────────────────────────
const Connector = ({ fromLeft }) => (
  <View style={[s.connector, fromLeft ? s.connectorLeft : s.connectorRight]}>
    <View style={s.connectorLine} />
    <View style={s.connectorDot} />
  </View>
);

// ── Progress widget ────────────────────────────────────────────────────────
const ProgressBar = ({ total, unlocked }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: unlocked / total, duration: 1200, delay: 400,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={s.progressCard}>
      <View style={s.progressHeader}>
        <Text style={s.progressLabel}>Progression</Text>
        <Text style={s.progressVal}>{unlocked}/{total} niveaux</Text>
      </View>
      <View style={s.progressBg}>
        <Animated.View style={[s.progressFill, {
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }]} />
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
    <Animated.View style={[s.endBanner, {
      opacity: anim,
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
    }]}>
      <Text style={s.endEmoji}>🏆</Text>
      <Text style={s.endTitle}>Maître Douala t'attend !</Text>
      <Text style={s.endSub}>Complète tous les niveaux pour débloquer le certificat Douala.</Text>
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeDouala() {
  const router = useRouter();
  const { t }  = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

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
  const handleOpenLevel = (level) => { setSelectedLevel(level); setModalVisible(true); };
  const handleStart     = (level) => router.push(level.path);

  const particles = [
    { x: 20,         delay: 0,    size: 7, color: "#FFCDD2" },
    { x: width - 40, delay: 1200, size: 5, color: "#EF9A9A" },
    { x: width * 0.4, delay: 600, size: 4, color: "#FFCDD2" },
    { x: width * 0.7, delay: 1800, size: 6, color: "#EF9A9A" },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Solid beige background — matches maquette */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Soft water path strip */}
      <View style={s.riverContainer} pointerEvents="none">
        <View style={s.river} />
      </View>

      {/* Subtle floating particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Section header — clean white card */}
        <View style={s.sectionCard}>
          <View style={s.sectionLeft}>
            <Text style={s.sectionTitle}>🌊 Langue Douala</Text>
            <Text style={s.sectionSub}>4 niveaux · Commence ton aventure !</Text>
          </View>
          <View style={s.sectionPill}>
            <Text style={s.sectionPillText}>🗺️</Text>
          </View>
        </View>

        <ProgressBar total={LEVELS_DATA.length} unlocked={LEVELS_DATA.filter(l => l.unlocked).length} />

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
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  riverContainer: {
    position: "absolute", top: 0, bottom: 0, left: "50%",
    width: 40, transform: [{ translateX: -20 }], zIndex: 0,
  },
  river: {
    flex: 1, borderRadius: 20,
    backgroundColor: "rgba(211,47,47,0.06)",
  },

  scroll: { paddingTop: 16, alignItems: "center", paddingHorizontal: 16 },

  // Section header card
  sectionCard: {
    width: "100%", backgroundColor: CARD_BG,
    borderRadius: 18, padding: 16, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    ...CARD_SHADOW,
  },
  sectionLeft: { flex: 1 },
  sectionTitle: {
    fontSize: 18, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 3,
  },
  sectionSub: {
    fontSize: 12, color: TEXT_MID,
    fontFamily: "Nunito-Regular",
  },
  sectionPill: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: RED_LIGHT,
    alignItems: "center", justifyContent: "center",
  },
  sectionPillText: { fontSize: 20 },

  // Progress card
  progressCard: {
    width: "100%", backgroundColor: CARD_BG,
    borderRadius: 18, padding: 16, marginBottom: 24,
    ...CARD_SHADOW,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: {
    fontSize: 12, color: TEXT_LIGHT,
    fontFamily: "Nunito-Bold", fontWeight: "600",
    letterSpacing: 0.8, textTransform: "uppercase",
  },
  progressVal: {
    fontSize: 12, color: RED,
    fontFamily: "Nunito-Bold", fontWeight: "700",
  },
  progressBg: { height: 10, backgroundColor: "#EEE", borderRadius: 5, overflow: "hidden" },
  progressFill: {
    height: "100%", borderRadius: 5, backgroundColor: RED,
  },

  // Node
  nodeWrap: { width: "100%", marginBottom: 6, position: "relative" },
  nodeBtn:  { padding: 4 },

  glowRing: {
    position: "absolute",
    width: 134, height: 134, borderRadius: 67,
    borderWidth: 2, borderColor: RED,
    top: -2, left: -2,
  },

  // Island sits on a white rounded card
  islandCard: {
    width: 126, height: 126, borderRadius: 22,
    backgroundColor: CARD_BG,
    alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
  },
  islandCardLocked: {
    backgroundColor: "#F5F3F0",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  islandImg:   { width: 106, height: 106, resizeMode: "contain" },
  dimmed:      { opacity: 0.25 },

  lockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(240,237,230,0.6)",
  },
  lockImg: { width: 32, height: 32, resizeMode: "contain" },

  completedBadge: {
    position: "absolute", top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: RED,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: CARD_BG,
  },

  boat: { width: 58, height: 32, resizeMode: "contain", position: "absolute" },
  boatLeft:  { bottom: -8, right: -18 },
  boatRight: { bottom: -8, left: -18 },

  // Solid label button — maquette style
  labelBtn: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 9, paddingHorizontal: 20,
    borderRadius: 22, marginTop: 8,
  },
  labelBtnActive: {
    backgroundColor: RED,
    shadowColor: RED, shadowOpacity: 0.25, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  labelBtnLocked: {
    backgroundColor: "#E8E3DE",
  },
  labelText: {
    fontSize: 12, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", letterSpacing: 0.8,
  },
  labelTextLocked: { color: TEXT_LIGHT },

  // XP badge
  xpBadge: {
    position: "absolute", top: 10,
    backgroundColor: CARD_BG,
    borderWidth: 1, borderColor: "#E8E3DE",
    borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4,
    ...CARD_SHADOW,
  },
  xpLeft:  { right: 0 },
  xpRight: { left: 0 },
  xpText: {
    fontSize: 10, color: RED,
    fontFamily: "Nunito-Bold", fontWeight: "700",
  },

  // Connector
  connector: { width: "100%", height: 44, alignItems: "center", justifyContent: "center" },
  connectorLeft:  { alignItems: "flex-end",   paddingRight: width * 0.26 },
  connectorRight: { alignItems: "flex-start",  paddingLeft:  width * 0.26 },
  connectorLine:  { width: 2, height: 30, backgroundColor: "#DDD8D2", borderRadius: 1 },
  connectorDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: "#CCC7C0", marginTop: -2 },

  // End banner
  endBanner: {
    width: "100%", marginTop: 16,
    backgroundColor: CARD_BG, borderRadius: 18,
    padding: 24, alignItems: "center",
    ...CARD_SHADOW,
  },
  endEmoji: { fontSize: 44, marginBottom: 10 },
  endTitle: {
    fontSize: 17, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 6, textAlign: "center",
  },
  endSub: {
    fontSize: 13, color: TEXT_MID,
    fontFamily: "Nunito-Regular", textAlign: "center", lineHeight: 20,
  },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  sheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetInner: {
    backgroundColor: CARD_BG,
    paddingTop: 12, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center",
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#DDD", marginBottom: 20 },

  islandPreview: { position: "relative", marginBottom: 12 },
  islandBg: {
    width: 120, height: 120, borderRadius: 24,
    backgroundColor: RED_LIGHT,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  islandImg: { width: 100, height: 100, resizeMode: "contain" },

  unlockedBadge: {
    position: "absolute", bottom: 4, right: -4,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: RED, borderRadius: 12,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  unlockedBadgeText: {
    fontSize: 11, color: "#fff",
    fontFamily: "Nunito-Bold", fontWeight: "700",
  },
  lockedBadge: {
    position: "absolute", bottom: 4, right: -4,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#EEE",
    alignItems: "center", justifyContent: "center",
  },
  lockImg: { width: 16, height: 16, resizeMode: "contain" },

  levelNum: {
    fontSize: 11, color: RED,
    fontFamily: "Nunito-Bold", fontWeight: "700",
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 4,
  },
  levelName: {
    fontSize: 20, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", textAlign: "center", marginBottom: 8,
  },
  levelDesc: {
    fontSize: 13, color: TEXT_MID,
    fontFamily: "Nunito-Regular",
    textAlign: "center", lineHeight: 20, marginBottom: 18, paddingHorizontal: 8,
  },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  skillChip: {
    backgroundColor: RED_LIGHT,
    borderWidth: 1, borderColor: "rgba(211,47,47,0.2)",
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
  },
  skillChipText: {
    fontSize: 12, color: RED,
    fontFamily: "Nunito-SemiBold", fontWeight: "600",
  },

  rewardRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  rewardItem: {
    alignItems: "center", gap: 4,
    backgroundColor: "#F7F5F2",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#EEE",
  },
  rewardEmoji: { fontSize: 22 },
  rewardVal: {
    fontSize: 12, fontWeight: "700", color: TEXT_DARK,
    fontFamily: "Nunito-Bold",
  },

  startBtn: {
    width: "100%", backgroundColor: RED,
    borderRadius: 16, paddingVertical: 16,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  startBtnText: {
    fontSize: 17, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", letterSpacing: 0.4,
  },

  lockedCta: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F7F5F2",
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1, borderColor: "#EEE",
    width: "100%", justifyContent: "center",
  },
  lockedCtaText: {
    fontSize: 13, color: TEXT_LIGHT,
    fontFamily: "Nunito-SemiBold", fontWeight: "600",
    textAlign: "center", flex: 1,
  },
});