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

const mountainLarge = require("../assets/images/mountain-large.png");
const mountainSmall = require("../assets/images/mountain-small.png");
const lockIcon      = require("../assets/images/lock.png");

// ── Mist particle drifting up ──────────────────────────────────────────────
const MistParticle = ({ startX, delay, size }) => {
  const y  = useRef(new Animated.Value(0)).current;
  const x  = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(0); x.setValue(0); op.setValue(0); sc.setValue(0.5);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,  { toValue: -120, duration: 6000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(x,  { toValue: (Math.random() > 0.5 ? 1 : -1) * 30, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(sc, { toValue: 1.8,  duration: 6000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.25, duration: 1200, useNativeDriver: true }),
            Animated.delay(3200),
            Animated.timing(op, { toValue: 0, duration: 1600, useNativeDriver: true }),
          ]),
        ]),
      ]).start(loop);
    };
    loop();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute", left: startX, bottom: "20%",
      width: size, height: size * 0.55, borderRadius: size * 0.28,
      backgroundColor: "rgba(200,230,210,0.5)",
      opacity: op,
      transform: [{ translateY: y }, { translateX: x }, { scale: sc }],
    }} />
  );
};

// ── Floating leaf ──────────────────────────────────────────────────────────
const FloatingLeaf = ({ startX, delay }) => {
  const y    = useRef(new Animated.Value(-20)).current;
  const xDrift = useRef(new Animated.Value(0)).current;
  const rot  = useRef(new Animated.Value(0)).current;
  const op   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(-20); xDrift.setValue(0); rot.setValue(0); op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: 500, duration: 8000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(xDrift, { toValue: 40,  duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(xDrift, { toValue: -20, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(xDrift, { toValue: 30,  duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(xDrift, { toValue: 0,   duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.timing(rot, { toValue: 3, duration: 8000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.8, duration: 600, useNativeDriver: true }),
            Animated.delay(6800),
            Animated.timing(op, { toValue: 0,   duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ]).start(loop);
    };
    loop();
  }, []);

  const leaves = ["🍃", "🌿", "🍀"];
  const leaf = leaves[Math.floor(delay / 1000) % 3];

  return (
    <Animated.Text style={{
      position: "absolute", left: startX, top: 0,
      fontSize: 14, opacity: op,
      transform: [
        { translateY: y }, { translateX: xDrift },
        { rotate: rot.interpolate({ inputRange: [0, 3], outputRange: ["0deg", "1080deg"] }) },
      ],
    }}>
      {leaf}
    </Animated.Text>
  );
};

// ── Mountain breathe ───────────────────────────────────────────────────────
const MountainAnim = ({ source, style, delay = 0 }) => {
  const breath = useRef(new Animated.Value(1)).current;
  const glow   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(breath, { toValue: 1.04, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(breath, { toValue: 1,    duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 2500, useNativeDriver: false }),
            Animated.timing(glow, { toValue: 0, duration: 2500, useNativeDriver: false }),
          ]),
        ]),
      ])
    ).start();
  }, []);

  return <Animated.Image source={source} style={[style, { transform: [{ scale: breath }] }]} />;
};

// ── Level detail modal ─────────────────────────────────────────────────────
const LevelModal = ({ visible, onClose, level, onStart }) => {
  const slideUp  = useRef(new Animated.Value(600)).current;
  const fade     = useRef(new Animated.Value(0)).current;
  const mtBounce = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(mtBounce,{ toValue: 1, tension: 50, friction: 6, delay: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start();
      mtBounce.setValue(0.65);
    }
  }, [visible]);

  if (!level) return null;
  const skills = level.skills || ["Salutations", "Nombres", "Forêt", "Famille"];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[m.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[m.sheet, { transform: [{ translateY: slideUp }] }]}>
          <LinearGradient colors={["#0D1F12", "#1A2E1A"]} style={m.sheetInner}>
            <View style={m.handle} />

            {/* Mountain preview */}
            <Animated.View style={[m.mountainPreview, { transform: [{ scale: mtBounce }] }]}>
              <LinearGradient colors={["rgba(74,222,128,0.08)", "transparent"]} style={m.mountainGlow} />
              <Image source={level.id === 1 ? mountainLarge : mountainSmall} style={m.previewMountain} />
              {/* Mist puffs */}
              <View style={m.mistRow}>
                {[0,1,2].map(i => (
                  <View key={i} style={[m.mistPuff, { opacity: 0.15 + i * 0.08 }]} />
                ))}
              </View>
              {level.unlocked ? (
                <View style={m.unlockedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={m.unlockedText}>Débloqué</Text>
                </View>
              ) : (
                <View style={m.lockedBadge}>
                  <Image source={lockIcon} style={m.lockImg} />
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
              <TouchableOpacity onPress={() => { onClose(); onStart(level); }} style={{ width: "100%", borderRadius: 18, overflow: "hidden" }}>
                <LinearGradient colors={["#16A34A", "#14532D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={m.startBtn}>
                  <Ionicons name="play-circle" size={20} color="#fff" />
                  <Text style={m.startBtnText}>Gravir la montagne</Text>
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
  const scale    = useRef(new Animated.Value(0.82)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount, { toValue: 1, duration: 600, delay: index * 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, tension: 55, friction: 7, delay: index * 200, useNativeDriver: true }),
    ]).start();

    if (level.unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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

  return (
    <Animated.View style={[s.cardWrap, { opacity: mount, transform: [{ scale }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <View style={[s.card, level.unlocked && s.cardUnlocked]}>
            <LinearGradient
              colors={level.unlocked
                ? ["rgba(22,163,74,0.2)", "rgba(20,83,45,0.15)", "rgba(13,31,18,0.98)"]
                : ["rgba(20,30,20,0.95)", "rgba(13,20,13,0.98)"]}
              style={s.cardGrad}
            >
              {/* Altitude banner for level 1 */}
              {isFirst && (
                <View style={s.altitudeBanner}>
                  <LinearGradient colors={["#16A34A", "#14532D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.altitudeGrad}>
                    <Text style={s.altitudeEmoji}>🏔️</Text>
                    <Text style={s.altitudeText}>POINT DE DÉPART · NIVEAU 1</Text>
                    <Text style={s.altitudeEmoji}>🏔️</Text>
                  </LinearGradient>
                </View>
              )}

              {/* Mountain scene */}
              <View style={s.scene}>
                {/* Forest floor gradient */}
                <LinearGradient
                  colors={level.unlocked
                    ? ["transparent", "rgba(22,163,74,0.15)", "rgba(22,163,74,0.25)"]
                    : ["transparent", "rgba(20,30,20,0.3)"]}
                  style={s.forestFloor}
                />

                {/* Tree silhouettes */}
                <View style={[s.treeRow, !level.unlocked && s.dimmed]}>
                  {[14, 22, 18, 26, 16, 20].map((h, i) => (
                    <View key={i} style={[s.treeSil, { height: h, marginHorizontal: i % 2 === 0 ? 6 : 4, opacity: 0.25 + (i % 3) * 0.12 }]} />
                  ))}
                </View>

                {/* Mountain */}
                {level.unlocked ? (
                  <MountainAnim
                    source={isFirst ? mountainLarge : mountainSmall}
                    style={[s.mountainImg, isFirst ? s.mountainLg : s.mountainSm]}
                    delay={index * 400}
                  />
                ) : (
                  <Image source={isFirst ? mountainLarge : mountainSmall} style={[s.mountainImg, isFirst ? s.mountainLg : s.mountainSm, s.dimmed]} />
                )}

                {/* Snow cap shimmer for unlocked */}
                {level.unlocked && (
                  <Animated.View style={[s.snowCap, {
                    opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }),
                  }]} />
                )}

                {/* Lock */}
                {!level.unlocked && (
                  <View style={s.lockOverlay}>
                    <View style={s.lockCircle}>
                      <Image source={lockIcon} style={s.lockImg} />
                    </View>
                    <Text style={s.lockLabel}>Verrouillé</Text>
                  </View>
                )}

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
                  <LinearGradient colors={["#16A34A", "#14532D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cardBtn}>
                    <Text style={s.cardBtnText}>{isFirst ? "GRIMPER" : "JOUER"}</Text>
                    <Ionicons name="chevron-up" size={13} color="#fff" style={{ marginLeft: 2 }} />
                  </LinearGradient>
                ) : (
                  <View style={s.cardBtnLocked}>
                    <Ionicons name="lock-closed" size={14} color="#4A5568" />
                  </View>
                )}
              </View>

              {level.unlocked && (
                <View style={s.xpBadge}>
                  <Text style={s.xpText}>+50 XP</Text>
                </View>
              )}
            </LinearGradient>
          </View>
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
      <LinearGradient colors={["rgba(22,163,74,0.12)", "rgba(22,163,74,0.04)"]} style={s.endGrad}>
        <Text style={s.endEmoji}>🦅</Text>
        <Text style={s.endTitle}>Maître Ghomala t'attend !</Text>
        <Text style={s.endSub}>Atteins le sommet et décroche ton certificat Ghomala.</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeGhomalah() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 10000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 10000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const LEVELS_DATA = [
    {
      id: 1, title: "Langue Ghomala", unlocked: true, completed: false,
      path: "/exercices/exos1",
      description: "Découvre les bases du Ghomala, langue des hauts plateaux de l'Ouest Cameroun.",
      skills: ["Salutations", "Nombres", "Forêt", "Famille"],
    },
    {
      id: 2, title: "Vocabulaire", unlocked: false, completed: false,
      path: "/levels/ghomala/level2",
      description: "Apprends les mots du quotidien dans les villages des hauts plateaux.",
      skills: ["Nourriture", "Marché", "Nature", "Corps"],
    },
    {
      id: 3, title: "Expressions", unlocked: false, completed: false,
      path: "/levels/ghomala/level3",
      description: "Construis tes premières phrases et dialogue avec les locaux.",
      skills: ["Verbes", "Phrases", "Questions", "Temps"],
    },
    {
      id: 4, title: "Maîtrise", unlocked: false, completed: false,
      path: "/levels/ghomala/level4",
      description: "Sommet de la maîtrise : culture, proverbes et conversations avancées.",
      skills: ["Proverbes", "Culture", "Histoire", "Chants"],
    },
  ];

  const mistParticles = [
    { startX: 20,       delay: 0,    size: 90 },
    { startX: width*0.4, delay: 2000, size: 70 },
    { startX: width-100, delay: 1000, size: 80 },
    { startX: width*0.6, delay: 3000, size: 60 },
  ];

  const leafParticles = [
    { startX: 30,        delay: 0    },
    { startX: width*0.3, delay: 2500 },
    { startX: width*0.6, delay: 1200 },
    { startX: width-60,  delay: 3800 },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated mountain sky */}
      <Animated.View style={[StyleSheet.absoluteFill, {
        backgroundColor: bgAnim.interpolate({ inputRange: [0, 1], outputRange: ["#061208", "#0D2110"] })
      }]} />

      {/* Stars/fireflies */}
      {[...Array(22)].map((_, i) => (
        <View key={i} style={[s.star, {
          top: (i * 53) % 400,
          left: (i * 67 + 10) % (width - 8),
          opacity: 0.1 + (i % 5) * 0.06,
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          backgroundColor: i % 4 === 0 ? "#A7F3D0" : "#FFFFFF",
        }]} />
      ))}

      {/* Mist */}
      {mistParticles.map((p, i) => <MistParticle key={i} {...p} />)}

      {/* Floating leaves */}
      {leafParticles.map((p, i) => <FloatingLeaf key={i} {...p} />)}

      {/* Dense forest gradient at bottom */}
      <View style={s.forestBg} pointerEvents="none">
        <LinearGradient colors={["transparent", "rgba(22,163,74,0.08)", "rgba(14,60,25,0.2)"]} style={{ flex: 1 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Section header */}
        <View style={s.sectionHeader}>
          <LinearGradient colors={["rgba(22,163,74,0.18)", "rgba(22,163,74,0.04)"]} style={s.sectionGrad}>
            <Text style={s.sectionTitle}>🏔️ Langue Ghomala</Text>
            <Text style={s.sectionSub}>4 niveaux · Escalade les sommets du savoir</Text>
          </LinearGradient>
        </View>

        <ProgressBar total={LEVELS_DATA.length} unlocked={LEVELS_DATA.filter(l => l.unlocked).length} />

        {LEVELS_DATA.map((level, index) => (
          <LevelCard key={level.id} level={level} index={index} onPress={(lv) => { setSelectedLevel(lv); setModalVisible(true); }} />
        ))}

        <EndBanner />
        <View style={{ height: 120 }} />
      </ScrollView>

      <LevelModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        level={selectedLevel}
        onStart={(lv) => router.push(lv.path)}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 20, alignItems: "center" },

  star: { position: "absolute", borderRadius: 2 },
  forestBg: { position: "absolute", bottom: 0, left: 0, right: 0, height: 260 },

  // Header
  sectionHeader: { width: "100%", marginBottom: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(22,163,74,0.25)" },
  sectionGrad: { paddingVertical: 18, paddingHorizontal: 20, alignItems: "center" },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#DCFCE7", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", letterSpacing: 0.5, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: "#4ADE80", fontWeight: "600" },

  // Progress
  progressWrap: { width: "100%", marginBottom: 20 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 11, color: "#4ADE80", fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  progressVal: { fontSize: 12, color: "#86EFAC", fontWeight: "700" },
  progressBg: { height: 7, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: "#16A34A", shadowColor: "#16A34A", shadowOpacity: 0.5, shadowRadius: 6 },

  // Card
  cardWrap: { width: "100%", marginBottom: 14 },
  card: { borderRadius: 22, overflow: "hidden", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.06)", shadowColor: "#16A34A", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  cardUnlocked: { borderColor: "rgba(22,163,74,0.35)", shadowOpacity: 0.35 },
  cardGrad: {},

  // Banner
  altitudeBanner: { overflow: "hidden" },
  altitudeGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10 },
  altitudeEmoji: { fontSize: 14 },
  altitudeText: { fontSize: 11, fontWeight: "800", color: "#DCFCE7", letterSpacing: 1.5 },

  // Scene
  scene: { height: 170, position: "relative", alignItems: "center", justifyContent: "flex-end", overflow: "hidden" },
  forestFloor: { position: "absolute", bottom: 0, left: 0, right: 0, height: 50 },

  treeRow: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", paddingHorizontal: 10 },
  treeSil: { width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: "#166534" },

  dimmed: { opacity: 0.2 },
  mountainImg: { position: "absolute", resizeMode: "contain" },
  mountainLg: { width: 220, height: 160, bottom: 10 },
  mountainSm: { width: 170, height: 120, bottom: 10 },

  snowCap: { position: "absolute", top: 10, width: 60, height: 24, borderRadius: 12, backgroundColor: "#E0F2FE" },

  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  lockCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", marginBottom: 6, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)" },
  lockImg: { width: 26, height: 26, resizeMode: "contain" },
  lockLabel: { fontSize: 11, color: "#4A5568", fontWeight: "700", letterSpacing: 1 },

  completedBadge: { position: "absolute", top: 10, right: 10, flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "#16A34A", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  completedText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  // Footer
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 12 },
  cardInfo: { flex: 1 },
  cardLevelNum: { fontSize: 10, color: "#4ADE80", fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 },
  cardLevelName: { fontSize: 17, fontWeight: "800", color: "#DCFCE7" },
  cardBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16, shadowColor: "#16A34A", shadowOpacity: 0.4, shadowRadius: 8 },
  cardBtnText: { fontSize: 13, fontWeight: "800", color: "#fff", letterSpacing: 0.8 },
  cardBtnLocked: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },

  xpBadge: { position: "absolute", top: 12, left: 16, backgroundColor: "rgba(74,222,128,0.12)", borderWidth: 1, borderColor: "rgba(74,222,128,0.35)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  xpText: { fontSize: 10, color: "#4ADE80", fontWeight: "700" },

  // End
  endBanner: { width: "100%", marginTop: 8, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(22,163,74,0.2)" },
  endGrad: { padding: 24, alignItems: "center" },
  endEmoji: { fontSize: 44, marginBottom: 10 },
  endTitle: { fontSize: 18, fontWeight: "800", color: "#DCFCE7", marginBottom: 6, textAlign: "center" },
  endSub: { fontSize: 13, color: "#4ADE80", textAlign: "center", lineHeight: 20 },
});

// ── Modal styles ───────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: "hidden" },
  sheetInner: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.18)", marginBottom: 22 },

  mountainPreview: { width: "100%", height: 140, position: "relative", alignItems: "center", justifyContent: "flex-end", marginBottom: 10 },
  mountainGlow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  previewMountain: { width: 200, height: 130, resizeMode: "contain", position: "absolute", bottom: 0 },
  mistRow: { position: "absolute", bottom: 10, flexDirection: "row", gap: 12 },
  mistPuff: { width: 50, height: 18, borderRadius: 9, backgroundColor: "#A7F3D0" },

  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 16 },
  lockImg: { width: 36, height: 36, resizeMode: "contain" },
  unlockedBadge: { position: "absolute", bottom: 6, right: 16, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#16A34A", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  unlockedText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  lockedBadge: { position: "absolute", bottom: 8, right: 16, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },

  levelNum: { fontSize: 11, color: "#4ADE80", fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  levelName: { fontSize: 22, fontWeight: "800", color: "#DCFCE7", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", textAlign: "center", marginBottom: 8 },
  levelDesc: { fontSize: 13, color: "#8892B0", textAlign: "center", lineHeight: 20, marginBottom: 18 },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  skillChip: { backgroundColor: "rgba(22,163,74,0.1)", borderWidth: 1, borderColor: "rgba(22,163,74,0.35)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  skillChipText: { fontSize: 12, color: "#4ADE80", fontWeight: "600" },

  rewardRow: { flexDirection: "row", gap: 14, marginBottom: 24 },
  rewardItem: { alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  rewardEmoji: { fontSize: 22 },
  rewardVal: { fontSize: 12, fontWeight: "700", color: "#E2E8F0" },

  startBtn: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 18 },
  startBtnText: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.4 },

  lockedCta: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", width: "100%", justifyContent: "center" },
  lockedCtaText: { fontSize: 13, color: "#4A5568", fontWeight: "600", textAlign: "center", flex: 1 },
});