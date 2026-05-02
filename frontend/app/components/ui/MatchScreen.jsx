/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Word Matching Exercise (Redesigned)                ║
 * ║  Stagger entrance · Progress dots · Column labels            ║
 * ║  Numbered indicators · Celebration card · Polished states    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef, useState } from "react";
import {
  Animated, Platform, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { IMAGES_MAP } from "../../../src/utils/AssetsMap";

/* ── Palette (mirrors session.jsx) ──────────────────────────── */
const C = {
  bg: "#FFFFFF",
  primary: "#B71C1C",
  primaryDark: "#7F0000",
  primaryLight: "#FFEBEE",
  correct: "#2ECC71",
  correctDark: "#1A8A4A",
  correctLight: "#EDFAF3",
  orange: "#F59E0B",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSub: "#6B7280",
  textFaint: "#9CA3AF",
  track: "#F5D0D0",
  border: "#EED5D5",
};

const SHADOW = {
  shadowColor: "#B71C1C",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.10,
  shadowRadius: 10,
  elevation: 3,
};

/* ── Vibration feedback (shared with session.jsx) ─────────── */
const triggerFeedback = (correct) => {
  try {
    Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  } catch {
    // silent
  }
};

/* ── Audio button (inline mini version) ───────────────────── */
const MiniAudioBtn = ({ url, onPlay, size = 14, color }) => {
  const [active, setActive] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const col = color ?? C.primary;

  const play = () => {
    if (active || !url) return;
    setActive(true);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
    if (onPlay) onPlay(url);
    setTimeout(() => setActive(false), 1500);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={play}
        activeOpacity={0.75}
        style={[ab.btn, { borderColor: col + "40", backgroundColor: col + "12" }]}
      >
        <Ionicons
          name={active ? "volume-high" : "volume-medium"}
          size={size}
          color={col}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ════════════════════════════════════════════════════════════════
   MATCH SCREEN — Redesigned
   ════════════════════════════════════════════════════════════════ */
const MatchScreen = ({ q, onCorrect, onWrong, onNext, langName, playAudio }) => {
  const { t } = useTranslation();
  const [leftSel, setLeftSel] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrongFlash, setWrong] = useState(null);
  const [done, setDone] = useState(false);

  /* ── Entrance stagger ── */
  const entranceL = useRef(q.pairs.map(() => new Animated.Value(0))).current;
  const entranceR = useRef(q.right.map(() => new Animated.Value(0))).current;
  const headerOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOp, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    Animated.stagger(
      70,
      entranceL.map((a) =>
        Animated.spring(a, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true })
      )
    ).start();
    setTimeout(() => {
      Animated.stagger(
        70,
        entranceR.map((a) =>
          Animated.spring(a, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true })
        )
      ).start();
    }, 120);
  }, []);

  /* ── Scale animations ── */
  const scaleL = useRef(q.pairs.map(() => new Animated.Value(1))).current;
  const scaleR = useRef(q.right.map(() => new Animated.Value(1))).current;

  const bounceScale = (anim, big) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: big ? 1.12 : 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, tension: 250, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const shakeScale = (anim) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.06, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.94, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.04, duration: 50, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  /* ── Celebration bounce ── */
  const celebAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (done) {
      Animated.spring(celebAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    }
  }, [done]);

  /* ── Handlers ── */
  const isRightMatched = (w) => Object.values(matched).includes(w.id);

  const pickLeft = (w, idx) => {
    if (matched[w.id] || done) return;
    bounceScale(scaleL[idx], false);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
    setLeftSel((l) => (l === w.id ? null : w.id));
  };

  const pickRight = (w, idx) => {
    if (!leftSel || done || isRightMatched(w)) return;
    const leftIdx = q.pairs.findIndex((p) => p.id === leftSel);

    if (leftSel === w.id) {
      /* ✅ Correct match */
      const next = { ...matched, [leftSel]: w.id };
      setMatched(next);
      setLeftSel(null);
      onCorrect();
      triggerFeedback(true);
      bounceScale(scaleL[leftIdx], true);
      bounceScale(scaleR[idx], true);
      if (Object.keys(next).length === q.pairs.length) {
        setTimeout(() => setDone(true), 350);
      }
    } else {
      /* ❌ Wrong match */
      setWrong({ l: leftSel, r: w.id });
      onWrong();
      triggerFeedback(false);
      if (leftIdx >= 0) shakeScale(scaleL[leftIdx]);
      shakeScale(scaleR[idx]);
      setTimeout(() => { setWrong(null); setLeftSel(null); }, 700);
    }
  };

  const matchCount = Object.keys(matched).length;
  const totalPairs = q.pairs.length;

  /* ── Render ── */
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={mx.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── Header with logo ─── */}
        <Animated.View style={[mx.headerWrap, { opacity: headerOp }]}>
          <View style={mx.logoCircle}>
            <Image
              source={IMAGES_MAP.logo}
              style={mx.logo}
              contentFit="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={mx.title}>{t("exercises.matchingPairs")}</Text>
            <Text style={mx.sub}>{t("exercises.matchFrToLang", { lang: langName })}</Text>
          </View>
        </Animated.View>

        {/* ─── Progress dots ─── */}
        <View style={mx.progressRow}>
          {Array.from({ length: totalPairs }).map((_, i) => (
            <View
              key={i}
              style={[mx.progressDot, i < matchCount && mx.progressDotDone]}
            >
              {i < matchCount && <Ionicons name="checkmark" size={10} color="#FFF" />}
            </View>
          ))}
          <Text style={mx.progressLabel}>{matchCount}/{totalPairs}</Text>
        </View>

        {/* ─── Column labels ─── */}
        <View style={mx.colLabels}>
          <View style={[mx.colLabelPill, { backgroundColor: C.primaryLight }]}>
            <Ionicons name="language" size={13} color={C.primary} />
            <Text style={[mx.colLabelTxt, { color: C.primary }]}>Français</Text>
          </View>
          <View style={[mx.colLabelPill, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="globe" size={13} color={C.orange} />
            <Text style={[mx.colLabelTxt, { color: "#E65100" }]}>{langName}</Text>
          </View>
        </View>

        {/* ─── Matching columns ─── */}
        <View style={mx.columns}>
          {/* Left — FR */}
          <View style={mx.col}>
            {q.pairs.map((w, i) => {
              const isM = !!matched[w.id];
              const isSel = leftSel === w.id;
              const isErr = wrongFlash?.l === w.id;
              return (
                <Animated.View
                  key={w.id}
                  style={{
                    opacity: entranceL[i],
                    transform: [
                      { scale: scaleL[i] },
                      {
                        translateY: entranceL[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [24, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => pickLeft(w, i)}
                    activeOpacity={isM ? 1 : 0.8}
                    style={[
                      mx.cell,
                      isSel && mx.cellSel,
                      isM && mx.cellMatchedL,
                      isErr && mx.cellErr,
                    ]}
                  >
                    {/* Number / status badge */}
                    <View
                      style={[
                        mx.indicator,
                        isSel && { backgroundColor: C.primary },
                        isM && { backgroundColor: C.correct },
                        isErr && { backgroundColor: "#EF5350" },
                      ]}
                    >
                      {isM ? (
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      ) : (
                        <Text
                          style={[
                            mx.indicatorTxt,
                            (isSel || isErr) && { color: "#FFF" },
                          ]}
                        >
                          {i + 1}
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        mx.cellTxt,
                        isSel && { color: C.primary, fontFamily: "Fredoka_600SemiBold" },
                        isM && { color: C.correctDark },
                        isErr && { color: "#D32F2F" },
                      ]}
                      numberOfLines={2}
                    >
                      {w.title}
                    </Text>

                    {isM && <Ionicons name="checkmark-circle" size={18} color={C.correct} />}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Right — Duala / target language */}
          <View style={mx.col}>
            {q.right.map((w, i) => {
              const isMatchedR = isRightMatched(w);
              const isErr = wrongFlash?.r === w.id;
              return (
                <Animated.View
                  key={w.id}
                  style={{
                    opacity: entranceR[i],
                    transform: [
                      { scale: scaleR[i] },
                      {
                        translateY: entranceR[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [24, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => pickRight(w, i)}
                    activeOpacity={isMatchedR ? 1 : 0.8}
                    style={[
                      mx.cell,
                      mx.cellRight,
                      isMatchedR && mx.cellMatchedR,
                      isErr && mx.cellErr,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          mx.cellTxt,
                          mx.cellTxtR,
                          isMatchedR && { color: "#FFF", fontFamily: "Fredoka_600SemiBold" },
                          isErr && { color: "#D32F2F" },
                        ]}
                        numberOfLines={2}
                      >
                        {w.subtitle}
                      </Text>
                      {!isMatchedR && (
                        <Text style={[mx.cellLang, isErr && { color: "#EF535080" }]}>
                          {langName.toUpperCase()}
                        </Text>
                      )}
                    </View>

                    {!isMatchedR && w.audioUrl && (
                      <MiniAudioBtn
                        url={w.audioUrl}
                        onPlay={playAudio}
                        size={14}
                        color={C.primary}
                      />
                    )}
                    {isMatchedR && (
                      <View style={mx.matchStar}>
                        <Ionicons name="star" size={14} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ─── Celebration card ─── */}
        {done && (
          <Animated.View
            style={[
              mx.celebration,
              {
                opacity: celebAnim,
                transform: [
                  {
                    translateY: celebAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    scale: celebAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.05, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={mx.celebrationIcon}>
              <Ionicons name="trophy" size={24} color="#FFF" />
            </View>
            <Text style={mx.celebrationTxt}>
              {t("exercises.allMatched", "Parfait ! Toutes les paires trouvées 🎉")}
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={ft.wrap}>
        <TouchableOpacity
          onPress={done ? onNext : undefined}
          style={[
            ft.btn,
            !done && { opacity: 0.35 },
            done && { backgroundColor: C.correct },
          ]}
          disabled={!done}
          activeOpacity={0.85}
        >
          <Text style={ft.btnTxt}>{t("common.continue")}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MatchScreen;

/* ════════════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════════════ */

const ab = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
});

const ft = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    borderRadius: 50,
    paddingVertical: 16,
    gap: 8,
  },
  btnTxt: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
});

const mx = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 140 },

  /* ── Header ── */
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
    paddingVertical: 8,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.primary + "20",
  },
  logo: { width: 36, height: 36 },
  title: {
    fontSize: 22,
    fontFamily: "Fredoka_700Bold",
    color: C.text,
    marginBottom: 2,
  },
  sub: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    color: C.textSub,
    lineHeight: 18,
  },

  /* ── Progress ── */
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.track,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.border,
  },
  progressDotDone: {
    backgroundColor: C.correct,
    borderColor: C.correct,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Fredoka_600SemiBold",
    color: C.textSub,
    marginLeft: 6,
  },

  /* ── Column labels ── */
  colLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  colLabelPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 7,
    borderRadius: 20,
  },
  colLabelTxt: {
    fontSize: 12,
    fontFamily: "Fredoka_600SemiBold",
    letterSpacing: 0.5,
  },

  /* ── Columns ── */
  columns: { flexDirection: "row", gap: 10 },
  col: { flex: 1, gap: 10 },

  /* ── Cell base ── */
  cell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 12,
    minHeight: 58,
    borderWidth: 2.5,
    borderColor: C.border,
    gap: 8,
    ...SHADOW,
  },

  /* ── Number indicator ── */
  indicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorTxt: {
    fontSize: 11,
    fontFamily: "Fredoka_600SemiBold",
    color: C.primary,
  },

  /* ── Cell states ── */
  cellSel: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
    shadowColor: C.primary,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  cellErr: {
    borderColor: "#EF5350",
    backgroundColor: "#FFF5F5",
  },
  cellMatchedL: {
    borderColor: C.correct,
    backgroundColor: C.correctLight,
    borderLeftWidth: 5,
  },

  /* ── Right cell variant ── */
  cellRight: {
    borderColor: "#F0E0C0",
    backgroundColor: "#FFFBF5",
  },
  cellMatchedR: {
    borderColor: C.correct,
    backgroundColor: C.correct,
  },

  /* ── Text ── */
  cellTxt: {
    fontSize: 13,
    fontFamily: "Nunito-SemiBold",
    color: C.text,
    flex: 1,
  },
  cellTxtR: {
    color: "#7F5700",
  },
  cellLang: {
    fontSize: 8,
    fontFamily: "Fredoka_600SemiBold",
    color: C.textFaint,
    letterSpacing: 0.8,
    marginTop: 2,
  },

  /* ── Match star badge ── */
  matchStar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Celebration card ── */
  celebration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.correctLight,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: C.correct + "40",
  },
  celebrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.correct,
    alignItems: "center",
    justifyContent: "center",
  },
  celebrationTxt: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Fredoka_600SemiBold",
    color: C.correctDark,
    lineHeight: 21,
  },
});
