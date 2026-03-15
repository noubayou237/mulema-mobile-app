import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Modal, Pressable, Platform, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import "../src/i18n";

const { width } = Dimensions.get("window");

const mountainLarge = require("../assets/images/mountain-large.png");
const mountainSmall = require("../assets/images/mountain-small.png");
const lockIcon      = require("../assets/images/lock.png");

// ── Design tokens ──────────────────────────────────────────────────────────
const BG         = "#F0EDE6";
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

const LEVEL_COLORS = ["#D32F2F", "#C62828", "#B71C1C", "#8B0000"];
const LEVEL_LABELS = ["Débutant", "Intermédiaire", "Avancé", "Maître"];

// ── Mountain breathe (kept for modal) ─────────────────────────────────────
const MountainAnim = ({ source, style, delay = 0 }) => {
  const breath = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.sequence([
        Animated.timing(breath, { toValue: 1.04, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 1,    duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return <Animated.Image source={source} style={[style, { transform: [{ scale: breath }] }]} />;
};

// ── Floating leaf (ambient effect) ────────────────────────────────────────
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
            Animated.timing(op, { toValue: 0.55, duration: 600, useNativeDriver: true }),
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
      fontSize: 12, opacity: op,
      transform: [
        { translateY: y }, { translateX: xDrift },
        { rotate: rot.interpolate({ inputRange: [0, 3], outputRange: ["0deg", "1080deg"] }) },
      ],
    }}>
      {leaf}
    </Animated.Text>
  );
};

// ── Level detail modal ─────────────────────────────────────────────────────
const LevelModal = ({ visible, onClose, level, onStart }) => {
  const slideUp  = useRef(new Animated.Value(600)).current;
  const fade     = useRef(new Animated.Value(0)).current;
  const mtBounce = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.spring(mtBounce,{ toValue: 1, tension: 55, friction: 6, delay: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 180, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 600, duration: 200, useNativeDriver: true }),
      ]).start();
      mtBounce.setValue(0.65);
    }
  }, [visible]);

  if (!level) return null;
  const skills      = level.skills || ["Salutations", "Nombres", "Forêt", "Famille"];
  const accentColor = LEVEL_COLORS[level.id - 1] || RED;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[m.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[m.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={m.sheetInner}>
            <View style={m.handle} />

            {/* Mountain preview */}
            <Animated.View style={[m.mountainPreview, { transform: [{ scale: mtBounce }], backgroundColor: `${accentColor}0E` }]}>
              <Image
                source={level.id === 1 ? mountainLarge : mountainSmall}
                style={m.previewMountain}
              />
              {/* Mist puffs */}
              <View style={m.mistRow}>
                {[0, 1, 2].map(i => (
                  <View key={i} style={[m.mistPuff, { opacity: 0.1 + i * 0.05, backgroundColor: `${accentColor}30` }]} />
                ))}
              </View>
              {level.unlocked ? (
                <View style={[m.unlockedBadge, { backgroundColor: accentColor }]}>
                  <Ionicons name="checkmark-circle" size={13} color="#fff" />
                  <Text style={m.unlockedText}>Débloqué</Text>
                </View>
              ) : (
                <View style={m.lockedBadge}>
                  <Image source={lockIcon} style={m.lockImgSm} />
                </View>
              )}
            </Animated.View>

            {/* Level band */}
            <View style={[m.levelBand, { backgroundColor: accentColor }]}>
              <Text style={m.levelBandText}>{LEVEL_LABELS[level.id - 1] || `Niveau ${level.id}`}</Text>
            </View>

            <Text style={m.levelName}>{level.title}</Text>
            <Text style={m.levelDesc}>{level.description}</Text>

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
                <Text style={m.startBtnText}>Gravir la montagne</Text>
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

// ── Level card — 3-column maquette style ───────────────────────────────────
const CARD_W = (width - 16 * 2 - 10 * 2) / 3;

const LevelCard = ({ level, index, onPress }) => {
  const mount      = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const pressAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mount,      { toValue: 1, duration: 430, delay: index * 85, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 430, delay: index * 85, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    if (level.unlocked) {
      Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();
    }
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressAnim, { toValue: 0.95, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(level);
  };

  const isFirst     = index === 0;
  const accentColor = LEVEL_COLORS[index] || RED;
  const levelLabel  = LEVEL_LABELS[index] || `N.${level.id}`;

  return (
    <Animated.View style={[s.cardWrap, { opacity: mount, transform: [{ translateY }, { scale: pressAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={s.card}>

        {/* Colored header — maquette */}
        <View style={[s.cardHeader, { backgroundColor: accentColor }]}>
          <Text style={s.cardHeaderLabel} numberOfLines={1}>{levelLabel}</Text>
          <View style={s.cardBookmark}>
            {level.unlocked
              ? <Ionicons name="bookmark" size={10} color="#fff" />
              : <Ionicons name="lock-closed" size={9} color={accentColor} />
            }
          </View>
        </View>

        {/* White body */}
        <View style={s.cardBody}>
          {/* Mountain mini scene */}
          <View style={[s.cardScene, { backgroundColor: level.unlocked ? `${accentColor}0C` : "#F5F3F0" }]}>
            {/* Tree silhouettes */}
            <View style={[s.treeRow, !level.unlocked && s.dimmed]}>
              {[8, 12, 10, 14, 9, 11].map((h, i) => (
                <View key={i} style={[s.treeSil, {
                  height: h, marginHorizontal: i % 2 === 0 ? 3 : 2,
                  opacity: 0.15 + (i % 3) * 0.08,
                  backgroundColor: accentColor,
                }]} />
              ))}
            </View>

            {/* Mountain image */}
            {level.unlocked ? (
              <MountainAnim
                source={isFirst ? mountainLarge : mountainSmall}
                style={[s.cardMountain, isFirst ? s.mountainLg : s.mountainSm]}
                delay={index * 400}
              />
            ) : (
              <Image
                source={isFirst ? mountainLarge : mountainSmall}
                style={[s.cardMountain, isFirst ? s.mountainLg : s.mountainSm, s.dimmed]}
              />
            )}

            {/* Snow cap glow */}
            {level.unlocked && (
              <Animated.View style={[s.snowCap, {
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.35] }),
                backgroundColor: `${accentColor}40`,
              }]} />
            )}

            {/* Lock overlay */}
            {!level.unlocked && (
              <View style={s.cardLockOverlay}>
                <Image source={lockIcon} style={s.cardLockImg} />
              </View>
            )}
          </View>

          {/* Title + desc */}
          <Text style={s.cardTitle} numberOfLines={1}>{level.title}</Text>
          <Text style={s.cardDesc} numberOfLines={2}>{level.description}</Text>

          {/* Start / Locked button */}
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

        {/* Lock badge bottom-right — maquette padlock style */}
        {!level.unlocked && (
          <View style={[s.cardLockBadge, { borderColor: accentColor }]}>
            <Image source={lockIcon} style={s.cardLockBadgeImg} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Weekly progress — maquette "Progression" widget ───────────────────────
const WeeklyProgress = ({ completedDays = 2 }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  const DAYS    = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

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
                {done && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[s.dayLabel, done && { color: TEXT_DARK, fontWeight: "700" }]}>{day}</Text>
            </View>
          );
        })}
      </View>
      <View style={s.progressBarBg}>
        <Animated.View style={[s.progressBarFill, {
          width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
        }]} />
      </View>
    </View>
  );
};

// ── Tips section ───────────────────────────────────────────────────────────
const TipCard = ({ tip, index }) => {
  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, {
      toValue: 1, duration: 400, delay: 600 + index * 100,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[s.tipCard, { opacity: mount }]}>
      <View style={[s.tipScene, { backgroundColor: tip.locked ? "#EEE" : `${RED}0E` }]}>
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
        {tip.locked && (
          <>
            <View style={s.skeletonLine} />
            <View style={[s.skeletonLine, { width: "55%" }]} />
          </>
        )}
      </View>
    </Animated.View>
  );
};

// ── End banner ─────────────────────────────────────────────────────────────
const EndBanner = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, delay: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[s.endBanner, {
      opacity: anim,
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
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

  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
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

  const TIPS = [
    {
      title: "Astuce du jour",
      desc: "Le Ghomala utilise des tons pour distinguer les mots — l'oreille s'adapte vite avec la pratique !",
      emoji: "🏔️",
      locked: false,
    },
    {
      title: "Culture des hauts plateaux",
      desc: "Complète le niveau 2 pour débloquer les astuces culturelles Ghomala.",
      emoji: "🌿",
      locked: true,
    },
  ];

  const leafParticles = [
    { startX: 30,        delay: 0    },
    { startX: width*0.5, delay: 2500 },
    { startX: width-70,  delay: 1400 },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Beige background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />

      {/* Ambient floating leaves */}
      {leafParticles.map((p, i) => <FloatingLeaf key={i} {...p} />)}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        style={{ backgroundColor: BG }}
      >
        {/* ── Top header ── */}
        <Animated.View style={[s.topSection, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-10,0] }) }],
        }]}>
          <View style={s.topLeft}>
            <Text style={s.topTitle}>🏔️ Langue Ghomala</Text>
            <Text style={s.topSub}>4 niveaux · Escalade les sommets du savoir</Text>
          </View>
          <View style={s.topBadge}>
            <Text style={s.topBadgeEmoji}>🦅</Text>
          </View>
        </Animated.View>

        {/* ── Weekly progress — maquette widget ── */}
        <WeeklyProgress completedDays={2} />

        {/* ── "Toutes les Leçons" ── */}
        <Text style={s.sectionLabel}>Toutes les Leçons</Text>

        {/* 3-column grid */}
        <View style={s.levelsGrid}>
          {LEVELS_DATA.map((level, index) => (
            <LevelCard
              key={level.id}
              level={level}
              index={index}
              onPress={(lv) => { setSelectedLevel(lv); setModalVisible(true); }}
            />
          ))}
        </View>

        {/* ── Astuces ── */}
        <Text style={s.sectionLabel}>Astuces</Text>
        {TIPS.map((tip, i) => <TipCard key={i} tip={tip} index={i} />)}

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
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingTop: 16, paddingHorizontal: 16 },

  // Top header
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

  // Weekly progress card
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
    flexDirection: "row", justifyContent: "space-between", marginBottom: 14,
  },
  dayItem:  { alignItems: "center", gap: 5, flex: 1 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F0EDE6",
    borderWidth: 1.5, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  dayCircleDone: {
    backgroundColor: RED, borderColor: RED,
    shadowColor: RED, shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  dayLabel: {
    fontSize: 10, color: TEXT_LIGHT,
    fontFamily: "Nunito-SemiBold", fontWeight: "600",
  },
  progressBarBg:   { height: 8, backgroundColor: "#EEE", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: RED, borderRadius: 4 },

  // Section label
  sectionLabel: {
    fontSize: 17, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold",
    marginBottom: 12, marginTop: 4,
  },

  // 3-column grid
  levelsGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },

  // Card
  cardWrap: { flex: 1 },
  card: {
    backgroundColor: CARD_BG, borderRadius: 16, overflow: "hidden",
    position: "relative",
    ...CARD_SHADOW,
  },

  cardHeader: {
    paddingHorizontal: 8, paddingVertical: 8,
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
  },
  cardHeaderLabel: {
    fontSize: 11, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", flex: 1, lineHeight: 14,
  },
  cardBookmark: {
    width: 16, height: 18, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
    marginLeft: 4, marginTop: -2,
  },

  cardBody: { padding: 8 },
  cardScene: {
    height: 72, borderRadius: 10,
    alignItems: "center", justifyContent: "flex-end",
    marginBottom: 8, position: "relative", overflow: "hidden",
  },
  treeRow: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "flex-end",
    justifyContent: "center", paddingHorizontal: 4,
  },
  treeSil: { width: 5, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  dimmed:  { opacity: 0.2 },

  cardMountain: { position: "absolute", resizeMode: "contain" },
  mountainLg:   { width: 62, height: 50, bottom: 4 },
  mountainSm:   { width: 48, height: 38, bottom: 4 },

  snowCap: {
    position: "absolute", top: 4,
    width: 26, height: 10, borderRadius: 5,
  },
  cardLockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(240,237,230,0.55)",
  },
  cardLockImg: { width: 18, height: 18, resizeMode: "contain" },

  cardTitle: {
    fontSize: 11, fontWeight: "700", color: TEXT_DARK,
    fontFamily: "Nunito-Bold", marginBottom: 3,
  },
  cardDesc: {
    fontSize: 9.5, color: TEXT_MID, lineHeight: 13,
    fontFamily: "Nunito-Regular", marginBottom: 8,
  },

  cardBtn: {
    borderRadius: 10, paddingVertical: 8,
    alignItems: "center", justifyContent: "center",
  },
  cardBtnText: {
    fontSize: 12, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold",
  },
  cardBtnLocked: { backgroundColor: "#EDE8E0" },

  cardLockBadge: {
    position: "absolute", bottom: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: CARD_BG, borderWidth: 1.5,
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
    alignItems: "flex-end", justifyContent: "flex-end", padding: 12,
  },
  tipLockCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(232,195,80,0.9)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 5, elevation: 4,
  },
  tipLockImg: { width: 20, height: 20, resizeMode: "contain" },
  tipBody:    { padding: 14 },
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  sheet:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetInner: {
    backgroundColor: CARD_BG,
    paddingTop: 12, paddingHorizontal: 24, paddingBottom: 44, alignItems: "center",
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#DDD", marginBottom: 18 },

  mountainPreview: {
    width: "100%", height: 130, borderRadius: 18,
    position: "relative", alignItems: "center", justifyContent: "flex-end",
    marginBottom: 0, overflow: "hidden",
  },
  previewMountain: { width: 200, height: 126, resizeMode: "contain", position: "absolute", bottom: 0 },
  mistRow: { position: "absolute", bottom: 8, flexDirection: "row", gap: 10 },
  mistPuff: { width: 42, height: 15, borderRadius: 8 },

  unlockedBadge: {
    position: "absolute", bottom: 8, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4,
  },
  unlockedText: { fontSize: 10, color: "#fff", fontFamily: "Nunito-Bold", fontWeight: "700" },
  lockedBadge: {
    position: "absolute", bottom: 8, right: 12,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(240,237,230,0.9)",
    alignItems: "center", justifyContent: "center",
  },
  lockImgSm: { width: 15, height: 15, resizeMode: "contain" },

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
  startBtnText: {
    fontSize: 16, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold", letterSpacing: 0.3,
  },

  lockedCta: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F7F5F2", borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 18,
    borderWidth: 1, borderColor: BORDER,
    width: "100%", justifyContent: "center",
  },
  lockedCtaText: {
    fontSize: 12, color: TEXT_LIGHT, fontFamily: "Nunito-SemiBold",
    textAlign: "center", flex: 1,
  },
});