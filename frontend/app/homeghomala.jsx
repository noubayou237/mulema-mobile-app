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

// Level color palette — shades of red, one per level
const LEVEL_COLORS = ["#D32F2F", "#C62828", "#B71C1C", "#8B0000"];
const LEVEL_LABELS = ["Débutant", "Intermédiaire", "Avancé", "Maître"];

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
          Animated.timing(sc, { toValue: 1.8, duration: 6000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.14, duration: 1200, useNativeDriver: true }),
            Animated.delay(3200),
            Animated.timing(op, { toValue: 0,    duration: 1600, useNativeDriver: true }),
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
      backgroundColor: "rgba(211,47,47,0.1)",
      opacity: op,
      transform: [{ translateY: y }, { translateX: x }, { scale: sc }],
    }} />
  );
};

// ── Floating leaf ──────────────────────────────────────────────────────────
const FloatingLeaf = ({ startX, delay }) => {
  const y      = useRef(new Animated.Value(-20)).current;
  const xDrift = useRef(new Animated.Value(0)).current;
  const rot    = useRef(new Animated.Value(0)).current;
  const op     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(-20); xDrift.setValue(0); rot.setValue(0); op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y,      { toValue: 500, duration: 8000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(xDrift, { toValue: 40,  duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(xDrift, { toValue: -20, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(xDrift, { toValue: 30,  duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(xDrift, { toValue: 0,   duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.timing(rot, { toValue: 3, duration: 8000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.65, duration: 600, useNativeDriver: true }),
            Animated.delay(6800),
            Animated.timing(op, { toValue: 0,    duration: 600, useNativeDriver: true }),
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
      fontSize: 13, opacity: op,
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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.sequence([
          Animated.timing(breath, { toValue: 1.04, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breath, { toValue: 1,    duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
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
          <View style={m.sheetInner}>
            <View style={m.handle} />

            {/* Mountain preview on beige bg */}
            <Animated.View style={[m.mountainPreview, { transform: [{ scale: mtBounce }] }]}>
              <Image
                source={level.id === 1 ? mountainLarge : mountainSmall}
                style={m.previewMountain}
              />
              <View style={m.mistRow}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={[m.mistPuff, { opacity: 0.1 + i * 0.05 }]} />
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
              <TouchableOpacity
                onPress={() => { onClose(); onStart(level); }}
                style={m.startBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={m.startBtnText}>Gravir la montagne</Text>
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
const LevelCard = ({ level, index, onPress }) => {
  const mount      = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const pressAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount,      { toValue: 1, duration: 500, delay: index * 130, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: index * 130, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
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
      Animated.spring(pressAnim, { toValue: 0.97, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(level);
  };

  const isFirst     = index === 0;
  const accentColor = LEVEL_COLORS[index] || RED;
  const levelLabel  = LEVEL_LABELS[index] || `Niveau ${level.id}`;

  return (
    <Animated.View style={[s.cardWrap, { opacity: mount, transform: [{ translateY }, { scale: pressAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={s.card}>

        {/* Colored header band */}
        <View style={[s.cardHeader, { backgroundColor: accentColor }]}>
          <Text style={s.cardHeaderLabel}>{levelLabel}</Text>
          {level.unlocked ? (
            <View style={s.headerBadgeUnlocked}>
              <Text style={s.headerBadgeEmoji}>🏔️</Text>
            </View>
          ) : (
            <View style={s.headerBadgeLocked}>
              <Ionicons name="lock-closed" size={11} color={accentColor} />
            </View>
          )}
        </View>

        {/* White body */}
        <View style={s.cardBody}>
          {/* Mountain scene */}
          <View style={[s.scene, { backgroundColor: level.unlocked ? `${accentColor}0D` : "#F5F3F0" }]}>
            {/* Tree silhouettes */}
            <View style={[s.treeRow, !level.unlocked && s.dimmed]}>
              {[10, 16, 13, 19, 12, 15].map((h, i) => (
                <View key={i} style={[s.treeSil, {
                  height: h,
                  marginHorizontal: i % 2 === 0 ? 4 : 3,
                  opacity: 0.15 + (i % 3) * 0.08,
                  backgroundColor: accentColor,
                }]} />
              ))}
            </View>

            {level.unlocked ? (
              <MountainAnim
                source={isFirst ? mountainLarge : mountainSmall}
                style={[s.mountainImg, isFirst ? s.mountainLg : s.mountainSm]}
                delay={index * 400}
              />
            ) : (
              <Image
                source={isFirst ? mountainLarge : mountainSmall}
                style={[s.mountainImg, isFirst ? s.mountainLg : s.mountainSm, s.dimmed]}
              />
            )}

            {/* Snow cap shimmer */}
            {level.unlocked && (
              <Animated.View style={[s.snowCap, {
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }),
                backgroundColor: `${accentColor}30`,
              }]} />
            )}

            {!level.unlocked && (
              <View style={s.lockOverlay}>
                <View style={s.lockCircle}>
                  <Image source={lockIcon} style={s.lockImg} />
                </View>
              </View>
            )}

            {level.completed && (
              <View style={[s.completedBadge, { backgroundColor: accentColor }]}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={s.completedText}>Terminé</Text>
              </View>
            )}
          </View>

          {/* Title + desc */}
          <Text style={s.cardTitle}>{level.title}</Text>
          <Text style={s.cardDesc} numberOfLines={2}>{level.description}</Text>

          {/* XP pills */}
          {level.unlocked && (
            <View style={s.xpRow}>
              <View style={[s.xpPill, { backgroundColor: `${accentColor}12`, borderColor: `${accentColor}35` }]}>
                <Text style={[s.xpPillText, { color: accentColor }]}>+50 XP</Text>
              </View>
              <View style={[s.xpPill, { backgroundColor: `${accentColor}12`, borderColor: `${accentColor}35` }]}>
                <Text style={[s.xpPillText, { color: accentColor }]}>+10 Coris</Text>
              </View>
            </View>
          )}

          {/* CTA button — solid, no gradient, no arrow */}
          {level.unlocked ? (
            <TouchableOpacity
              style={[s.startBtn, { backgroundColor: accentColor }]}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Text style={s.startBtnText}>{isFirst ? "GRIMPER" : "JOUER"}</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.lockedBtn}>
              <Ionicons name="lock-closed" size={13} color={TEXT_LIGHT} />
              <Text style={s.lockedBtnText}>Verrouillé</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
        <Text style={s.progressTitle}>Progression</Text>
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
    Animated.timing(anim, { toValue: 1, duration: 500, delay: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[s.endBanner, {
      opacity: anim,
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
    }]}>
      <Text style={s.endEmoji}>🦅</Text>
      <Text style={s.endTitle}>Maître Ghomala t'attend !</Text>
      <Text style={s.endSub}>Atteins le sommet et décroche ton certificat Ghomala.</Text>
    </Animated.View>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────
export default function HomeGhomalah() {
  const router = useRouter();
  const { t }  = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

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
    { startX: 20,        delay: 0,    size: 80 },
    { startX: width*0.4, delay: 2000, size: 65 },
    { startX: width-100, delay: 1000, size: 70 },
    { startX: width*0.6, delay: 3000, size: 55 },
  ];

  const leafParticles = [
    { startX: 30,        delay: 0    },
    { startX: width*0.3, delay: 2500 },
    { startX: width*0.6, delay: 1200 },
    { startX: width-60,  delay: 3800 },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Solid beige background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Subtle mist particles */}
      {mistParticles.map((p, i) => <MistParticle key={i} {...p} />)}

      {/* Floating leaves */}
      {leafParticles.map((p, i) => <FloatingLeaf key={i} {...p} />)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Section header — white card with emoji pill */}
        <View style={s.sectionCard}>
          <View style={s.sectionLeft}>
            <Text style={s.sectionTitle}>🏔️ Langue Ghomala</Text>
            <Text style={s.sectionSub}>4 niveaux · Escalade les sommets du savoir</Text>
          </View>
          <View style={s.sectionPill}>
            <Text style={s.sectionPillEmoji}>🦅</Text>
          </View>
        </View>

        <ProgressBar total={LEVELS_DATA.length} unlocked={LEVELS_DATA.filter(l => l.unlocked).length} />

        <Text style={s.sectionLabel}>Toutes les Leçons</Text>

        {/* 2-column grid */}
        <View style={s.cardsGrid}>
          {LEVELS_DATA.map((level, index) => (
            <LevelCard
              key={level.id}
              level={level}
              index={index}
              onPress={(lv) => { setSelectedLevel(lv); setModalVisible(true); }}
            />
          ))}
        </View>

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
const CARD_W = (width - 48) / 2;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 16, paddingHorizontal: 16 },

  // Section header card
  sectionCard: {
    backgroundColor: CARD_BG, borderRadius: 18,
    padding: 16, marginBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    ...CARD_SHADOW,
  },
  sectionLeft: { flex: 1 },
  sectionTitle: {
    fontSize: 18, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 3,
  },
  sectionSub: { fontSize: 12, color: TEXT_MID, fontFamily: "Nunito-Regular" },
  sectionPill: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: RED_LIGHT,
    alignItems: "center", justifyContent: "center",
  },
  sectionPillEmoji: { fontSize: 20 },

  // Progress card
  progressCard: {
    backgroundColor: CARD_BG, borderRadius: 18,
    padding: 16, marginBottom: 20,
    ...CARD_SHADOW,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressTitle: { fontSize: 15, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },
  progressVal:   { fontSize: 13, color: RED, fontWeight: "700", fontFamily: "Nunito-Bold" },
  progressBg:    { height: 10, backgroundColor: "#EEE", borderRadius: 5, overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 5, backgroundColor: RED },

  // Section label
  sectionLabel: {
    fontSize: 18, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold",
    marginBottom: 14, marginLeft: 2,
  },

  // Cards 2-column grid
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 20 },

  // Card
  cardWrap: { width: CARD_W },
  card: {
    backgroundColor: CARD_BG, borderRadius: 18,
    overflow: "hidden",
    ...CARD_SHADOW,
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
  headerBadgeEmoji: { fontSize: 12 },
  headerBadgeLocked: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },

  cardBody: { padding: 12 },

  // Mountain mini scene
  scene: {
    height: 90, borderRadius: 10,
    position: "relative", overflow: "hidden",
    alignItems: "center", justifyContent: "flex-end",
    marginBottom: 10,
  },
  treeRow: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "center", paddingHorizontal: 6,
  },
  treeSil: { width: 6, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  dimmed: { opacity: 0.2 },
  mountainImg: { position: "absolute", resizeMode: "contain" },
  mountainLg:  { width: 110, height: 80, bottom: 6 },
  mountainSm:  { width: 85,  height: 60, bottom: 6 },
  snowCap: {
    position: "absolute", top: 6,
    width: 32, height: 14, borderRadius: 7,
  },
  lockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(240,237,230,0.6)",
  },
  lockCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#EEE",
    alignItems: "center", justifyContent: "center",
  },
  lockImg: { width: 20, height: 20, resizeMode: "contain" },
  completedBadge: {
    position: "absolute", top: 6, right: 6,
    flexDirection: "row", gap: 3, alignItems: "center",
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3,
  },
  completedText: { fontSize: 10, color: "#fff", fontFamily: "Nunito-Bold", fontWeight: "700" },

  cardTitle: {
    fontSize: 13, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11, color: TEXT_MID, lineHeight: 16,
    fontFamily: "Nunito-Regular", marginBottom: 10,
  },

  xpRow: { flexDirection: "row", gap: 5, marginBottom: 10 },
  xpPill: {
    borderRadius: 7, borderWidth: 1,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  xpPillText: { fontSize: 10, fontWeight: "700", fontFamily: "Nunito-Bold" },

  // Solid button, no gradient, no arrow
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
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    backgroundColor: "#F0EDE6",
  },
  lockedBtnText: { fontSize: 12, color: TEXT_LIGHT, fontFamily: "Nunito-SemiBold" },

  // End banner
  endBanner: {
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
  overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  sheet:     { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetInner: {
    backgroundColor: CARD_BG,
    paddingTop: 12, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center",
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#DDD", marginBottom: 20 },

  mountainPreview: {
    width: "100%", height: 140,
    backgroundColor: RED_LIGHT, borderRadius: 16,
    position: "relative", alignItems: "center", justifyContent: "flex-end",
    marginBottom: 12, overflow: "hidden",
  },
  previewMountain: { width: 200, height: 128, resizeMode: "contain", position: "absolute", bottom: 0 },
  mistRow: { position: "absolute", bottom: 8, flexDirection: "row", gap: 10 },
  mistPuff: { width: 44, height: 16, borderRadius: 8, backgroundColor: "#FFCDD2" },

  lockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(240,235,230,0.55)", borderRadius: 16,
  },
  lockImg: { width: 36, height: 36, resizeMode: "contain" },
  unlockedBadge: {
    position: "absolute", bottom: 8, right: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: RED, borderRadius: 12,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  unlockedText: { fontSize: 11, color: "#fff", fontFamily: "Nunito-Bold", fontWeight: "700" },
  lockedBadge: {
    position: "absolute", bottom: 8, right: 12,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#EEE",
    alignItems: "center", justifyContent: "center",
  },

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
    fontSize: 13, color: TEXT_MID, fontFamily: "Nunito-Regular",
    textAlign: "center", lineHeight: 20, marginBottom: 18,
  },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 },
  skillChip: {
    backgroundColor: RED_LIGHT, borderWidth: 1, borderColor: "rgba(211,47,47,0.2)",
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
  },
  skillChipText: { fontSize: 12, color: RED, fontFamily: "Nunito-SemiBold", fontWeight: "600" },

  rewardRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  rewardItem: {
    alignItems: "center", gap: 4,
    backgroundColor: "#F7F5F2",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#EEE",
  },
  rewardEmoji: { fontSize: 22 },
  rewardVal: { fontSize: 12, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },

  startBtn: {
    width: "100%", backgroundColor: RED,
    borderRadius: 16, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
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