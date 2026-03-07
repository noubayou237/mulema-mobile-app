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

// ── Sand particle drifting right ───────────────────────────────────────────
const SandParticle = ({ y: startY, delay, size }) => {
  const x   = useRef(new Animated.Value(-size)).current;
  const op  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      x.setValue(-size); op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(x,  { toValue: width + size, duration: 5000 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.35, duration: 400, useNativeDriver: true }),
            Animated.delay(3500),
            Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ]).start(loop);
    };
    loop();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute", top: startY,
      width: size, height: size * 0.4, borderRadius: size * 0.2,
      backgroundColor: "rgba(210,180,140,0.6)",
      opacity: op, transform: [{ translateX: x }],
    }} />
  );
};

// ── Camel walk ─────────────────────────────────────────────────────────────
const CamelWalk = ({ source, style }) => {
  const bob  = useRef(new Animated.Value(0)).current;
  const step = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bob,  { toValue: -4,  duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bob,  { toValue:  0,  duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(step, { toValue:  1,  duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(step, { toValue: -1,  duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.Image source={source} style={[style, {
      transform: [
        { translateY: bob },
        { rotate: step.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-3deg", "0deg", "3deg"] }) },
      ],
    }]} />
  );
};

// ── Sphinx idle breath ─────────────────────────────────────────────────────
const SphinxIdle = ({ source, style }) => {
  const breath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1.02, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 1,    duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Image source={source} style={[style, { transform: [{ scale: breath }] }]} />
  );
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
        Animated.timing(fade,    { toValue: 0, duration: 200, useNativeDriver: true }),
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
          <LinearGradient colors={["#1A1A2E", "#16213E"]} style={m.sheetInner}>
            <View style={m.handle} />

            {/* Desert scene preview */}
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

            {/* Skills */}
            <View style={m.skillsRow}>
              {skills.map((sk, i) => (
                <View key={i} style={[m.skillChip, !level.unlocked && { opacity: 0.4 }]}>
                  <Text style={m.skillChipText}>{sk}</Text>
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
              <TouchableOpacity onPress={() => { onClose(); onStart(level); }} style={{ width: "100%", borderRadius: 18, overflow: "hidden" }}>
                <LinearGradient colors={["#D97706", "#92400E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={m.startBtn}>
                  <Ionicons name="play-circle" size={20} color="#fff" />
                  <Text style={m.startBtnText}>Commencer l'aventure</Text>
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

// ── Level card ─────────────────────────────────────────────────────────────
const LevelCard = ({ level, index, onPress }) => {
  const mount    = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(0.8)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const shimmer  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount, { toValue: 1, duration: 600, delay: index * 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, tension: 55, friction: 7, delay: index * 200, useNativeDriver: true }),
    ]).start();

    if (level.unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(shimmer, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        ])
      ).start();
    }
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.96, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(level);
  };

  const isFirst = index === 0;
  const sandColor = shimmer.interpolate({ inputRange: [0, 1], outputRange: ["rgba(217,119,6,0.25)", "rgba(217,119,6,0.45)"] });

  return (
    <Animated.View style={[s.cardWrap, { opacity: mount, transform: [{ scale }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <Animated.View style={[s.card, level.unlocked && { borderColor: sandColor }]}>
            <LinearGradient
              colors={level.unlocked
                ? ["rgba(217,119,6,0.18)", "rgba(146,64,14,0.12)", "rgba(26,26,46,0.95)"]
                : ["rgba(30,30,50,0.9)", "rgba(20,20,40,0.95)"]}
              style={s.cardGrad}
            >
              {/* Header badge */}
              {isFirst && (
                <View style={s.startBanner}>
                  <LinearGradient colors={["#D97706", "#92400E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBannerGrad}>
                    <Ionicons name="star" size={14} color="#FFF8E1" />
                    <Text style={s.startBannerText}>POINT DE DÉPART</Text>
                    <Ionicons name="star" size={14} color="#FFF8E1" />
                  </LinearGradient>
                </View>
              )}

              {/* Desert scene */}
              <View style={s.scene}>
                {/* Sandy ground */}
                <LinearGradient
                  colors={level.unlocked ? ["#92400E22", "#D9770622"] : ["rgba(40,30,20,0.2)", "rgba(20,15,10,0.2)"]}
                  style={s.ground}
                />

                {/* Pyramids */}
                <Image source={smallPyramid} style={[s.smallPyramid, !level.unlocked && s.dimmed]} />
                <Image source={largePyramid} style={[s.largePyramid, !level.unlocked && s.dimmed]} />

                {/* Level-specific assets */}
                {isFirst && (
                  <>
                    <SphinxIdle source={sphinx} style={[s.sphinx, !level.unlocked && s.dimmed]} />
                    <CamelWalk  source={camel}  style={[s.camel,  !level.unlocked && s.dimmed]} />
                  </>
                )}

                {/* Lock overlay */}
                {!level.unlocked && (
                  <View style={s.lockOverlay}>
                    <View style={s.lockCircle}>
                      <Image source={lockIcon} style={s.lockImg} />
                    </View>
                    <Text style={s.lockLabel}>Verrouillé</Text>
                  </View>
                )}

                {/* Completed badge */}
                {level.completed && (
                  <View style={s.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={s.completedText}>Terminé</Text>
                  </View>
                )}
              </View>

              {/* Footer */}
              <View style={s.cardFooter}>
                <View style={s.cardInfo}>
                  <Text style={s.cardLevelNum}>Niveau {level.id}</Text>
                  <Text style={s.cardLevelName}>{level.title}</Text>
                </View>

                {level.unlocked ? (
                  <LinearGradient colors={["#D97706", "#92400E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cardBtn}>
                    <Text style={s.cardBtnText}>{isFirst ? "START" : "JOUER"}</Text>
                    <Ionicons name="play" size={12} color="#fff" />
                  </LinearGradient>
                ) : (
                  <View style={s.cardBtnLocked}>
                    <Ionicons name="lock-closed" size={14} color="#4A5568" />
                  </View>
                )}
              </View>

              {/* XP badge */}
              {level.unlocked && (
                <View style={s.xpBadge}>
                  <Text style={s.xpText}>+50 XP</Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
      <LinearGradient colors={["rgba(217,119,6,0.12)", "rgba(217,119,6,0.04)"]} style={s.endGrad}>
        <Text style={s.endEmoji}>🏺</Text>
        <Text style={s.endTitle}>Maître Bassa t'attend !</Text>
        <Text style={s.endSub}>Complète tous les niveaux pour décrocher le certificat Bassa.</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeBassa() {
  const router = useRouter();
  const { t } = useTranslation();

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

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

  const sandParticles = [
    { y: 80,  delay: 0,    size: 12 },
    { y: 180, delay: 1400, size: 8  },
    { y: 320, delay: 700,  size: 10 },
    { y: 450, delay: 2100, size: 7  },
    { y: 600, delay: 350,  size: 9  },
  ];

  const handleOpenLevel = (level) => {
    setSelectedLevel(level);
    setModalVisible(true);
  };

  const handleStart = (level) => router.push(level.path);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated desert sky */}
      <Animated.View style={[StyleSheet.absoluteFill, {
        backgroundColor: bgAnim.interpolate({ inputRange: [0, 1], outputRange: ["#1A0F00", "#2D1500"] })
      }]} />

      {/* Stars overlay */}
      <View style={s.starsLayer} pointerEvents="none">
        {[...Array(18)].map((_, i) => (
          <View key={i} style={[s.star, { top: (i * 47) % 300, left: (i * 73) % (width - 10), opacity: 0.15 + (i % 4) * 0.07 }]} />
        ))}
      </View>

      {/* Sand dune at bottom */}
      <View style={s.duneBg} pointerEvents="none">
        <LinearGradient colors={["transparent", "rgba(146,64,14,0.15)"]} style={{ flex: 1 }} />
      </View>

      {/* Drifting sand particles */}
      {sandParticles.map((p, i) => <SandParticle key={i} {...p} />)}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Section header */}
        <View style={s.sectionHeader}>
          <LinearGradient colors={["rgba(217,119,6,0.15)", "rgba(217,119,6,0.04)"]} style={s.sectionGrad}>
            <Text style={s.sectionTitle}>🏜️ Langue Bassa</Text>
            <Text style={s.sectionSub}>4 niveaux · Explore le désert des mots</Text>
          </LinearGradient>
        </View>

        <ProgressBar total={LEVELS_DATA.length} unlocked={LEVELS_DATA.filter(l => l.unlocked).length} />

        {/* Level cards */}
        {LEVELS_DATA.map((level, index) => (
          <LevelCard
            key={level.id}
            level={level}
            index={index}
            onPress={handleOpenLevel}
          />
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
  root: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 20, alignItems: "center" },

  starsLayer: { position: "absolute", top: 0, left: 0, right: 0, height: 320 },
  star: { position: "absolute", width: 2, height: 2, borderRadius: 1, backgroundColor: "#FFF8E1" },

  duneBg: { position: "absolute", bottom: 0, left: 0, right: 0, height: 200 },

  // Section header
  sectionHeader: { width: "100%", marginBottom: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(217,119,6,0.25)" },
  sectionGrad: { paddingVertical: 18, paddingHorizontal: 20, alignItems: "center" },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#FEF3C7", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", letterSpacing: 0.5, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: "#92400E", fontWeight: "600" },

  // Progress
  progressWrap: { width: "100%", marginBottom: 20 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 11, color: "#92400E", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  progressVal: { fontSize: 12, color: "#D97706", fontWeight: "700" },
  progressBg: { height: 7, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: "#D97706", shadowColor: "#D97706", shadowOpacity: 0.5, shadowRadius: 6 },

  // Card
  cardWrap: { width: "100%", marginBottom: 14 },
  card: {
    borderRadius: 22, overflow: "hidden",
    borderWidth: 1.5, borderColor: "rgba(217,119,6,0.2)",
    shadowColor: "#92400E", shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  cardGrad: { padding: 0 },

  // Start banner
  startBanner: { borderRadius: 0, overflow: "hidden", marginBottom: 0 },
  startBannerGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10 },
  startBannerText: { fontSize: 12, fontWeight: "800", color: "#FEF3C7", letterSpacing: 2 },

  // Desert scene
  scene: {
    height: 160, position: "relative",
    alignItems: "center", justifyContent: "flex-end",
    overflow: "hidden",
  },
  ground: { position: "absolute", bottom: 0, left: 0, right: 0, height: 40, borderRadius: 0 },
  dimmed: { opacity: 0.25 },
  smallPyramid: { position: "absolute", left: 24, bottom: 20, width: 80, height: 80, resizeMode: "contain" },
  largePyramid: { position: "absolute", right: 16, bottom: 14, width: 110, height: 110, resizeMode: "contain" },
  sphinx: { position: "absolute", left: width * 0.2, bottom: 18, width: 90, height: 55, resizeMode: "contain" },
  camel:  { position: "absolute", right: width * 0.22, top: 24, width: 75, height: 48, resizeMode: "contain" },

  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  lockCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", marginBottom: 6, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)" },
  lockImg: { width: 26, height: 26, resizeMode: "contain" },
  lockLabel: { fontSize: 11, color: "#4A5568", fontWeight: "700", letterSpacing: 1 },

  completedBadge: { position: "absolute", top: 10, right: 10, flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "#4CAF50", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  completedText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  // Footer
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 12 },
  cardInfo: { flex: 1 },
  cardLevelNum: { fontSize: 10, color: "#D97706", fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 },
  cardLevelName: { fontSize: 17, fontWeight: "800", color: "#FEF3C7" },
  cardBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16, shadowColor: "#D97706", shadowOpacity: 0.4, shadowRadius: 8 },
  cardBtnText: { fontSize: 13, fontWeight: "800", color: "#fff", letterSpacing: 0.8 },
  cardBtnLocked: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },

  xpBadge: { position: "absolute", top: 12, left: 16, backgroundColor: "rgba(217,119,6,0.15)", borderWidth: 1, borderColor: "rgba(217,119,6,0.4)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  xpText: { fontSize: 10, color: "#FCD34D", fontWeight: "700" },

  // End
  endBanner: { width: "100%", marginTop: 8, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(217,119,6,0.2)" },
  endGrad: { padding: 24, alignItems: "center" },
  endEmoji: { fontSize: 44, marginBottom: 10 },
  endTitle: { fontSize: 18, fontWeight: "800", color: "#FEF3C7", marginBottom: 6, textAlign: "center" },
  endSub: { fontSize: 13, color: "#92400E", textAlign: "center", lineHeight: 20 },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: "hidden" },
  sheetInner: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.18)", marginBottom: 22 },

  sceneWrap: { width: "100%", height: 130, position: "relative", alignItems: "center", justifyContent: "flex-end", marginBottom: 12 },
  previewSmallPyramid: { position: "absolute", left: 30, bottom: 0, width: 80, height: 80, resizeMode: "contain" },
  previewLargePyramid: { position: "absolute", right: 20, bottom: 0, width: 100, height: 100, resizeMode: "contain" },
  previewSphinx: { position: "absolute", left: "35%", bottom: 4, width: 80, height: 48, resizeMode: "contain" },

  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 16 },
  lockImg: { width: 36, height: 36, resizeMode: "contain" },
  unlockedBadge: { position: "absolute", bottom: 4, right: 20, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#D97706", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  unlockedText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  levelNum: { fontSize: 11, color: "#D97706", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  levelName: { fontSize: 22, fontWeight: "800", color: "#FEF3C7", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", textAlign: "center", marginBottom: 8 },
  levelDesc: { fontSize: 13, color: "#8892B0", textAlign: "center", lineHeight: 20, marginBottom: 18 },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  skillChip: { backgroundColor: "rgba(217,119,6,0.1)", borderWidth: 1, borderColor: "rgba(217,119,6,0.35)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  skillChipText: { fontSize: 12, color: "#FCD34D", fontWeight: "600" },

  rewardRow: { flexDirection: "row", gap: 14, marginBottom: 24 },
  rewardItem: { alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  rewardEmoji: { fontSize: 22 },
  rewardVal: { fontSize: 12, fontWeight: "700", color: "#E2E8F0" },

  startBtn: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 18 },
  startBtnText: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.4 },

  lockedCta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", width: "100%", justifyContent: "center" },
  lockedCtaText: { fontSize: 13, color: "#4A5568", fontWeight: "600", textAlign: "center", flex: 1 },
});