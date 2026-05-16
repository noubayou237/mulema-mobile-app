/**
 * MULEMA — Session Exercices
 * Thème ROUGE • Audio expo-av • Clavier natif + chars spéciaux
 * Vibration haptic • Feedback sur VÉRIFIER • Auto-scroll
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated, Dimensions, Keyboard, KeyboardAvoidingView,
  Modal, ActivityIndicator,
  Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View, Vibration,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { IMAGES_MAP } from "../../../../../src/utils/AssetsMap";

import { useThemeStore } from "../../../../../src/stores/useThemeStore";
import { useDashboardStore } from "../../../../../src/stores/useDashboardStore";
import { useLanguageStore } from "../../../../../src/stores/useLanguageStore";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../../../../src/hooks/useBackgroundMusic";
import { setAudioMode, playAudioUrl } from "../../../../../src/utils/audioUtils";
import Logger from "../../../../../src/utils/logger";
import MatchScreen from "../../../../components/ui/MatchScreen";
import PatrimonialKeyboard from "../../../../../src/components/ui/PatrimonialKeyboard";
import { getWordDisplay } from "../../../../data/wordTranslations";
import { buildBassaSession, buildBassaMixedFoundationSession } from "../../../../data/bassaExerciseData";

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 40 - 12) / 2;
const CARD_W_V2 = (SW - 40 - 16) / 2; // Premium spacing

/* ── Palette ─────────────────────────────────────────────────── */
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
  tipBg: "#FFFBF5",
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

/* ── Caractères spéciaux Duala ──────────────────────────────── */
const SPECIAL_CHARS = ["ɓ", "ɛ", "ɔ", "ŋ", "ɲ", "ǎ", "ǔ", "á", "â", "é", "ê", "í", "ó", "ô", "ú", "ʼ"];

/* ── Helpers ────────────────────────────────────────────────── */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalize = (s = "") =>
  s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ── Audio ──────────────────────────────────────────────────── */
const playWordAudio = async (audioUrl) => {
  if (!audioUrl) return;
  try {
    await playAudioUrl(audioUrl);
  } catch (e) {
    Logger.warn("Audio play error", e);
  }
};


/* ── Vibration + Son feedback ───────────────────────────────── */
const triggerFeedback = (correct) => {
  // Haptic (iOS natif)
  try {
    Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  } catch {
    // Fallback Android : pattern différent correct/incorrect
    Vibration.vibrate(correct ? [0, 80] : [0, 100, 60, 120]);
  }
};

/* ── Génération des questions ───────────────────────────────── */
const hasValidImage = (w) =>
  w.imageUrl && typeof w.imageUrl === "string" && w.imageUrl.trim() !== "";

/**
 * Build a varied exercise session.
 *
 * Rule: the same word must not appear more than twice WITHIN any single
 * exercise type.  With only 2 questions per type (QCM, match, write) the cap
 * is automatically respected as long as the 2 questions in each type use
 * different target words — enforced below by selecting words at different
 * offsets of the shuffled array.
 *
 * Session shape (up to 7 questions):
 *   QCM ×2  |  Match ×1-2  |  Write ×2  |  Listen & Write ×1
 */
const buildSession = (words) => {
  if (!words || words.length < 1) return [];
  const sw = shuffle(words);
  const n = sw.length;

  const wordsWithImg = sw.filter(hasValidImage);
  const canDoImageQCM = wordsWithImg.length >= 2;

  const makeQCM = (target) => {
    if (canDoImageQCM && hasValidImage(target)) {
      const imgPool = wordsWithImg.filter(w => w.id !== target.id);
      const opts = shuffle([target, ...shuffle(imgPool).slice(0, Math.min(3, imgPool.length))]);
      return { type: "image_qcm", target, options: opts };
    }
    const others = sw.filter(w => w.id !== target.id);
    const opts = shuffle([target, ...shuffle(others).slice(0, Math.min(3, others.length))]);
    return { type: "text_qcm", target, options: opts };
  };

  const questions = [];
  const pairCount = Math.min(3, n);

  // ── QCM — word[0] and word[1] (two different words → each appears once in QCM)
  questions.push(makeQCM(sw[0]));
  if (n >= 2) questions.push(makeQCM(sw[1 % n]));

  // ── Match — pairs drawn from offset slices so no word exceeds 2× in match
  if (n >= 2) {
    const p1 = sw.slice(0, pairCount);
    questions.push({ type: "match", pairs: p1, right: shuffle([...p1]) });

    // Second match only when there are enough words to form a meaningfully
    // different set (n ≥ 4); words still wrap with %, so the cap holds.
    if (n >= 4) {
      const p2 = Array.from({ length: pairCount }, (_, k) => sw[(pairCount + k) % n]);
      questions.push({ type: "match", pairs: p2, right: shuffle([...p2]) });
    }
  }

  // ── Listen & Write replaces Write for higher difficulty ──────────────────
  const wt1 = sw[2 % n];
  const wt2 = sw[3 % n];
  questions.push({ type: "listen_write", target: wt1 });
  if (wt2.id !== wt1.id) questions.push({ type: "listen_write", target: wt2 });

  // ── Listen & Write — the "unknown/surprise" question ──────────────────
  // Prefer a word not yet used in QCM or Write, keeping this question fresh
  // and the session unpredictable. Falls back to the last shuffled word.
  const soloIds = new Set([sw[0].id, sw[1 % n].id, wt1.id, wt2.id]);
  const listenTarget = sw.find(w => !soloIds.has(w.id)) ?? sw[n - 1];
  questions.push({ type: "listen_write", target: listenTarget });

  return shuffle(questions);
};

/* ════════════════════════════════════════════════════════════════
   BOUTON AUDIO — icône haut-parleur animée
   ════════════════════════════════════════════════════════════════ */
const AudioBtn = ({ url, size = 22, color, style }) => {
  const [active, setActive] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const play = () => {
    if (active) return;
    setActive(true);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 90, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
    playWordAudio(url);
    setTimeout(() => setActive(false), 1800);
  };

  const col = color ?? C.primary;
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={play}
        activeOpacity={0.75}
        style={[ab.btn, { borderColor: col + "40", backgroundColor: col + "15" }, style]}
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
   TOP BAR — barre de progression, sans numéros
   ════════════════════════════════════════════════════════════════ */
const TopBar = ({ current, total, hearts, onClose }) => {
  const pct = total > 0 ? current / total : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 500, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={tb.bar}>
      <TouchableOpacity onPress={onClose} style={tb.closeBtn} activeOpacity={0.7}>
        <Ionicons name="close" size={20} color={C.textSub} />
      </TouchableOpacity>

      <View style={tb.trackWrap}>
        <Animated.View
          style={[tb.fill, {
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          }]}
        />
      </View>

      <View style={tb.badge}>
        <Ionicons name="heart" size={15} color={C.primary} />
        <Text style={tb.badgeNum}>{hearts}</Text>
      </View>
    </View>
  );
};

/* ════════════════════════════════════════════════════════════════
   FEEDBACK BANNER — glisse du bas, invisible jusqu'au VÉRIFIER
   ════════════════════════════════════════════════════════════════ */
const FeedbackBanner = ({ correct, correctAnswer, onNext }) => {
  const { t } = useTranslation();
  const slideY = useRef(new Animated.Value(240)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, tension: 85, friction: 11, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      style={[
        fb.wrap,
        correct ? fb.wrapGreen : fb.wrapRed,
        { transform: [{ translateY: slideY }] },
      ]}
    >
      {/* Icône + texte */}
      <View style={fb.row}>
        <View style={[fb.icon, correct ? fb.iconGreen : fb.iconRed]}>
          <Ionicons name={correct ? "checkmark" : "close"} size={22} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[fb.title, { color: correct ? C.correctDark : C.primaryDark }]}>
            {correct ? t("exercises.excellent") : t("common.oops")}
          </Text>
          {!correct && correctAnswer ? (
            <Text style={fb.sub}>
              {t("exercises.correctAnswerIs")}<Text style={fb.answer}>"{correctAnswer}"</Text>
            </Text>
          ) : (
            <Text style={fb.sub}>{t("exercises.progressingFast")}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={[fb.continueBtn, correct ? fb.continueBtnGreen : fb.continueBtnRed]}
        activeOpacity={0.65}
      >
        <Text style={fb.continueTxt}>{t("common.continue")}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ════════════════════════════════════════════════════════════════
   TYPE 1 — IMAGE QCM
   Sélectionne → VÉRIFIER → Feedback
   ════════════════════════════════════════════════════════════════ */
const ImageQCMScreen = ({ q, onCorrect, onWrong, onNext, langName, uiLang = "fr" }) => {
  const { t } = useTranslation();
  const [sel, setSel] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const scrollRef = useRef(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const verify = () => {
    if (!sel || feedback) return;
    const ok = sel === q.target.id;
    triggerFeedback(ok);
    setFeedback(ok ? "ok" : "ko");
    if (ok) onCorrect(); else { shake(); onWrong(); }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const cardStyle = (opt) => {
    if (!feedback) {
      if (sel === opt.id) return [iq.card, iq.cardSel];
      return iq.card;
    }
    if (opt.id === q.target.id) return [iq.card, iq.cardCorrect];
    if (opt.id === sel) return [iq.card, iq.cardWrong];
    return [iq.card, { opacity: 0.4 }];
  };

  const a1 = useRef(new Animated.Value(0)).current;
  const anims = useRef(q.options.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(a1, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.stagger(100, anims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
      ))
    ]).start();
  }, []);

  useEffect(() => {
    if (q.target.audioUrl) playWordAudio(q.target.audioUrl);
  }, [q.target.id]);

  return (
    <Animated.View style={[{ flex: 1, opacity: a1 }, { transform: [{ translateX: shakeX }] }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={iq.scroll} showsVerticalScrollIndicator={false}>

        <Text style={iq.title}>{t("exercises.pickImageFor")}</Text>

        {/* Unified Word Row: [Global] | [Local + Audio] */}
        <View style={qx.wordRowV2}>
          <View style={qx.globalCol}>
            <Text style={qx.globalWord}>"{getWordDisplay(q.target.title, uiLang)}"</Text>
            <Text style={qx.subLabel}>{uiLang?.startsWith("en") ? "ENGLISH" : "FRANÇAIS"}</Text>
          </View>

          <AudioBtn url={q.target.audioUrl} size={28} style={qx.audioFixed} />
        </View>

        {/* Grille 2×2 */}
        <View style={iq.grid}>
          {q.options.map((opt, idx) => (
            <Animated.View
              key={opt.id}
              style={{
                opacity: anims[idx] || 1,
                transform: [{ scale: anims[idx] || 1 }]
              }}
            >
              <TouchableOpacity
                onPress={() => !feedback && setSel(opt.id)}
                activeOpacity={0.8}
                style={cardStyle(opt)}
              >
                <View style={iq.imgWrap}>
                  {opt.imageUrl && typeof opt.imageUrl === 'string' && opt.imageUrl.trim() !== "" ? (
                    <Image source={IMAGES_MAP[opt.imageUrl] ? IMAGES_MAP[opt.imageUrl] : { uri: opt.imageUrl }} style={iq.img} contentFit="cover" />
                  ) : (
                    <View style={[iq.img, iq.imgPlaceholder]}>
                      <Ionicons name="image-outline" size={32} color={C.textFaint} />
                    </View>
                  )}

                  {sel === opt.id && !feedback && (
                    <View style={qx.badge}>
                      <Ionicons name="checkmark-circle" size={24} color={C.primary} />
                    </View>
                  )}

                  {feedback && opt.id === q.target.id && (
                    <View style={[iq.overlay, { backgroundColor: "rgba(46,204,113,0.25)" }]}>
                      <View style={[iq.overlayCircle, { backgroundColor: C.correct }]}>
                        <Ionicons name="checkmark" size={28} color="#FFF" />
                      </View>
                    </View>
                  )}
                  {feedback && opt.id === sel && sel !== q.target.id && (
                    <View style={[iq.overlay, { backgroundColor: "rgba(183,28,28,0.25)" }]}>
                      <View style={[iq.overlayCircle, { backgroundColor: C.primary }]}>
                        <Ionicons name="close" size={28} color="#FFF" />
                      </View>
                    </View>
                  )}
                </View>

                {/* Audio par image */}
                <View style={iq.labelRow}>
                  <Text
                    style={[
                      iq.label,
                      sel === opt.id && !feedback && { color: C.primary, fontWeight: "700" },
                      feedback && opt.id === q.target.id && { color: C.correct, fontWeight: "700" },
                      feedback && opt.id === sel && sel !== q.target.id && { color: C.primary, fontWeight: "700" },
                    ]}
                    numberOfLines={2}
                  >
                    {opt.title}
                  </Text>
                  {opt.audioUrl && (
                    <AudioBtn url={opt.audioUrl} size={16} color={C.textSub} />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {!feedback ? (
        <View style={footer.wrap}>
          <TouchableOpacity
            onPress={verify}
            style={[footer.verifyBtn, !sel && { opacity: 0.35 }]}
            disabled={!sel}
            activeOpacity={0.65}
          >
            <Text style={footer.verifyTxt}>{t("common.verify")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <FeedbackBanner
          correct={feedback === "ok"}
          correctAnswer={feedback === "ko" ? `${q.target.subtitle} — ${q.target.title}` : null}
          onNext={() => { setSel(null); setFeedback(null); onNext(); }}
        />
      )}
    </Animated.View>
  );
};

/* ════════════════════════════════════════════════════════════════
   TYPE 2 — TEXT QCM
   ════════════════════════════════════════════════════════════════ */
const TextQCMScreen = ({ q, onCorrect, onWrong, onNext, langName, uiLang = "fr" }) => {
  const { t } = useTranslation();
  const [sel, setSel] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const scrollRef = useRef(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const verify = () => {
    if (!sel) return;
    const ok = sel === q.target.id;
    triggerFeedback(ok);
    setFeedback(ok ? "ok" : "ko");
    if (ok) onCorrect(); else { shake(); onWrong(); }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const cardStyle = (opt) => {
    if (!feedback) {
      if (sel === opt.id) return [qx.card, qx.cardSel];
      return qx.card;
    }
    if (opt.id === q.target.id) return [qx.card, qx.cardCorrect];
    if (opt.id === sel) return [qx.card, qx.cardWrong];
    return [qx.card, { opacity: 0.4 }];
  };

  const labelStyle = (opt) => {
    if (!feedback) {
      if (sel === opt.id) return [qx.optTxt, { color: C.primary, fontWeight: "700" }];
      return qx.optTxt;
    }
    if (opt.id === q.target.id) return [qx.optTxt, { color: C.correct, fontWeight: "700" }];
    if (opt.id === sel) return [qx.optTxt, { color: C.primary, fontWeight: "700" }];
    return [qx.optTxt, { color: C.textFaint }];
  };

  const a1 = useRef(new Animated.Value(0)).current;
  const anims = useRef(q.options.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(a1, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.stagger(100, anims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
      ))
    ]).start();
  }, []);

  useEffect(() => {
    if (q.target.audioUrl) playWordAudio(q.target.audioUrl);
  }, [q.target.id]);

  return (
    <Animated.View style={[{ flex: 1, opacity: a1 }, { transform: [{ translateX: shakeX }] }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={qx.scroll} showsVerticalScrollIndicator={false}>

        <Text style={qx.title}>{t("exercises.howToSayIn", { lang: langName })}</Text>

        {/* Simplified Target Word Card (Image 2 style) */}
        <View style={qx.targetCard}>
          <Text style={qx.targetLabel}>{uiLang?.startsWith("en") ? "ENGLISH" : "FRANÇAIS"}</Text>
          <Text style={qx.targetWord}>{getWordDisplay(q.target.title, uiLang)}</Text>
          <View style={qx.targetAudioRow}>
            <Text style={qx.targetSubtitle}>{q.target.subtitle}</Text>
            <AudioBtn url={q.target.audioUrl} size={20} color={C.primary} />
          </View>
        </View>

        {/* Grille 2×2 (Image 2 style) */}
        <View style={qx.grid}>
          {q.options.map((opt, idx) => (
            <Animated.View
              key={opt.id}
              style={{
                width: CARD_W_V2,
                opacity: anims[idx] || 1,
                transform: [{ scale: anims[idx] || 1 }]
              }}
            >
              <TouchableOpacity
                onPress={() => !feedback && setSel(opt.id)}
                activeOpacity={0.7}
                style={cardStyle(opt)}
              >
                <View style={qx.optTop}>
                  <Ionicons
                    name={opt.imageUrl ? "image" : "language"}
                    size={28}
                    color={sel === opt.id ? C.primary : "#BDBDBD"}
                  />
                </View>

                <View style={qx.optBottomV2}>
                  <Text style={labelStyle(opt)} numberOfLines={1}>{opt.subtitle}</Text>
                  <Ionicons name="volume-medium" size={16} color={C.textSub} />
                </View>

                {(sel === opt.id || (feedback && opt.id === q.target.id)) && (
                  <View style={qx.badgeV2}>
                    <Ionicons
                      name={feedback && opt.id === q.target.id ? "checkmark-circle" : "radio-button-on"}
                      size={18}
                      color={feedback && opt.id === q.target.id ? C.correct : C.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {!feedback ? (
        <View style={footer.wrap}>
          <TouchableOpacity
            onPress={verify}
            style={[footer.verifyBtn, !sel && { opacity: 0.35 }]}
            disabled={!sel}
            activeOpacity={0.65}
          >
            <Text style={footer.verifyTxt}>{t("common.verify")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <FeedbackBanner
          correct={feedback === "ok"}
          correctAnswer={feedback === "ko" ? q.target.subtitle : null}
          onNext={() => { setSel(null); setFeedback(null); onNext(); }}
        />
      )}
    </Animated.View>
  );
};

/* TYPE 3 — PAIRES → Redesigned component in app/components/ui/MatchScreen.jsx */


/* ════════════════════════════════════════════════════════════════
   TYPE 4 — ÉCRITURE
   Clavier natif + barre de caractères spéciaux Duala
   ════════════════════════════════════════════════════════════════ */
const WriteScreen = ({ q, onCorrect, onWrong, onNext, langName, uiLang = "fr" }) => {
  const { t } = useTranslation();
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const a1 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a1, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const verify = () => {
    if (!typed.trim()) return;
    Keyboard.dismiss();
    const ok =
      normalize(typed) === normalize(q.target.subtitle) ||
      typed.trim().toLowerCase() === q.target.subtitle?.toLowerCase();
    triggerFeedback(ok);
    setFeedback(ok ? "ok" : "ko");
    if (ok) onCorrect(); else { shake(); onWrong(); }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  useEffect(() => {
    if (q.target.audioUrl) playWordAudio(q.target.audioUrl);
  }, [q.target.id]);

  // Display the source word in EN or FR based on UI language
  const displayTitle = getWordDisplay(q.target.title, uiLang);

  return (
    <Animated.View style={[{ flex: 1, opacity: a1 }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={wx.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={wx.title}>{t("exercises.translateTo", { lang: langName })}</Text>

        {/* Unified Hint Card: [Global] | [Local + Audio] */}
        <View style={[wx.hintCardV2, SHADOW]}>
          <View style={wx.globalCol}>
            <Text style={wx.hintWord}>"{displayTitle}"</Text>
            <Text style={wx.hintLabel}>{uiLang?.startsWith("en") ? "ENGLISH" : "FRANÇAIS"}</Text>
          </View>

          <View style={wx.dividerVertical} />

          <View style={wx.localCol}>
            <View style={{ flex: 1 }}>
              <Text style={wx.localWord}>{q.target.subtitle}</Text>
              <Text style={wx.langLabel}>{langName}</Text>
            </View>
            <AudioBtn url={q.target.audioUrl} size={26} />
          </View>
        </View>

        {/* Zone de saisie — showSoftInputOnFocus=false: patrimonial keyboard replaces system kb */}
        <Animated.View
          style={[
            wx.inputBox,
            feedback === "ok" && wx.inputOk,
            feedback === "ko" && wx.inputKo,
            { transform: [{ translateX: shakeX }] },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={typed}
            onChangeText={(v) => !feedback && setTyped(v)}
            style={[wx.input, typed.length > 0 && { color: C.primary }]}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            showSoftInputOnFocus={false}
            placeholder={t("exercises.typeTranslation")}
            placeholderTextColor={C.textSub}
            editable={!feedback}
          />
          {typed.length > 0 && !feedback && (
            <TouchableOpacity
              onPress={() => setTyped("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={22} color={C.textFaint} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Patrimonial keyboard (no system keyboard) or feedback banner */}
      {!feedback ? (
        <PatrimonialKeyboard
          value={typed}
          onChangeText={(v) => setTyped(v)}
          onSubmit={verify}
          langName={langName}
          disabled={false}
        />
      ) : (
        <FeedbackBanner
          correct={feedback === "ok"}
          correctAnswer={feedback === "ko" ? q.target.subtitle : null}
          onNext={() => { setTyped(""); setFeedback(null); onNext(); }}
        />
      )}
    </Animated.View>
  );
};


/* ════════════════════════════════════════════════════════════════
   TYPE 5 — ÉCOUTER ET ÉCRIRE (listen_write)
   Audio auto-plays, user writes the target-language word.
   No French hint shown — tests listening recall.
   ════════════════════════════════════════════════════════════════ */
const ListenWriteScreen = ({ q, onCorrect, onWrong, onNext, langName, uiLang = "fr" }) => {
  const { t } = useTranslation();
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [played, setPlayed] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Slight delay for auto-play to ensure audio engine is ready and user is focused
    const timer = setTimeout(() => {
      if (q.target.audioUrl) {
        Logger.info("ListenWrite: Auto-playing audio", q.target.audioUrl);
        playWordAudio(q.target.audioUrl);
        setPlayed(true);
      }
    }, 500);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [q.target.id]);

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  const verify = () => {
    if (!typed.trim()) return;
    const ok =
      normalize(typed) === normalize(q.target.subtitle) ||
      typed.trim().toLowerCase() === q.target.subtitle?.toLowerCase();
    triggerFeedback(ok);
    setFeedback(ok ? "ok" : "ko");
    if (ok) onCorrect(); else { shake(); onWrong(); }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={wx.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeIn }}
      >
        <Text style={wx.title}>{t("exercises.listenAndWrite", { lang: langName })}</Text>

        {/* Center Speaker Section (Image 1 style) */}
        <View style={lw.audioCenter}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={() => { playWordAudio(q.target.audioUrl); setPlayed(true); }}
              activeOpacity={0.62}
              style={lw.bigSpeaker}
            >
              <Ionicons name="mic" size={48} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
          <Text style={lw.tapHint}>{t("exercises.tapToListen")}</Text>
        </View>

        {/* Hint card removed to test listening recall as requested */}

        {/* Input field — showSoftInputOnFocus=false, patrimonial keyboard handles all input */}
        <Animated.View
          style={[
            wx.inputBox,
            feedback === "ok" && wx.inputOk,
            feedback === "ko" && wx.inputKo,
            { transform: [{ translateX: shakeX }] },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={typed}
            onChangeText={(v) => !feedback && setTyped(v)}
            style={[wx.input, typed.length > 0 && { color: C.primary }]}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            showSoftInputOnFocus={false}
            placeholder={t("exercises.typeTranslation")}
            placeholderTextColor={C.textFaint}
            editable={!feedback}
          />
          {typed.length > 0 && !feedback && (
            <TouchableOpacity
              onPress={() => setTyped("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={C.textFaint} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 16 }} />
      </Animated.ScrollView>

      {/* Patrimonial keyboard or feedback */}
      {!feedback ? (
        <PatrimonialKeyboard
          value={typed}
          onChangeText={(v) => setTyped(v)}
          onSubmit={verify}
          langName={langName}
          disabled={false}
        />
      ) : (
        <FeedbackBanner
          correct={feedback === "ok"}
          correctAnswer={feedback === "ko" ? q.target.subtitle : null}
          onNext={() => { setTyped(""); setFeedback(null); onNext(); }}
        />
      )}
    </View>
  );
};

/* ════════════════════════════════════════════════════════════════
   ÉCRAN PRINCIPAL — Session
   ════════════════════════════════════════════════════════════════ */


export default function ExerciseSession() {
  const router = useRouter();
  const { themeId, wordCount: wordCountStr, lessonIdx: lessonIdxStr, isFinal, isBassaMixed } = useLocalSearchParams();

  // wordCount: how many words to include (cumulative lessons so far)
  // lessonIdx: 0-based index of the lesson just completed (for unlock)
  const wordCount = wordCountStr ? parseInt(wordCountStr, 10) : null;
  const lessonIdxParam = lessonIdxStr != null ? parseInt(lessonIdxStr, 10) : null;

  const { lessons, fetchLessons, themes, error } = useThemeStore();
  const { fetchDashboard, purchaseHearts, data: dashboardData } = useDashboardStore();
  const { activeLanguage } = useLanguageStore();
  const { t, i18n } = useTranslation();
  const langName = activeLanguage?.name ?? "Duala";
  const uiLang = i18n.language ?? "fr";

  // Resolve whether the active language is Bassa and the theme's numeric order.
  const isBassa = langName.toLowerCase().includes("bassa") || langName.toLowerCase().includes("basaa");
  const isDuala = langName.toLowerCase().includes("duala") || langName.toLowerCase().includes("douala");
  const isGhomala = langName.toLowerCase().includes("ghomala") || langName.toLowerCase().includes("ghomálá");

  // Robust mapping for Bassa themes since IDs can vary between environments
  const BASSA_CAT_MAP = {
    'famille': 0, 'family': 0, 'vie de famille': 0,
    'savane': 1, 'savanna': 1, 'nature': 1,
    'cuisine': 2, 'culinaire': 2, 'culinary': 2, 'nourriture': 2,
    'mode': 3, 'fashion': 3, 'vêtement': 3, 'vetement': 3
  };

  const themeOrder = useMemo(() => {
    // 1. Try order from theme object
    const th = themes.find((t) => String(t.id) === String(themeId));
    if (th && th.order !== undefined) return th.order;

    // 2. Try mapping from category name (Bassa specific fallback)
    const catName = th?.category;
    if (isBassa && catName) {
      const catKey = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      for (const [key, val] of Object.entries(BASSA_CAT_MAP)) {
        if (catKey.includes(key)) return val;
      }
    }

    // 3. Last resort: use the themeId as index if it's small or try lesson info
    if (themeId && !isNaN(themeId) && parseInt(themeId, 10) < 10) return parseInt(themeId, 10);

    return null;
  }, [themes, themeId, isBassa]);


  useEffect(() => {
    pauseBackgroundMusic();
    setAudioMode(); // Ensure audio session is initialized for playback in silent mode
    return () => { resumeBackgroundMusic(); };
  }, []);

  useEffect(() => {
    // Only fetch if we don't already have lessons for this specific theme
    const state = useThemeStore.getState();
    if (themeId && (state.currentThemeId !== themeId || state.lessons.length === 0)) {
      fetchLessons(themeId);
    }
    // Force bypass cache so a retry session always starts with current hearts,
    // not the stale 0-hearts value left over from the previous failed attempt.
    fetchDashboard(true).then((data) => {
      if (data?.hearts != null) setHearts(data.hearts);
    });
  }, [themeId]);

  // Slice lessons to cumulative word count (or all if no wordCount param)
  const lessonsKey = lessons.map((l) => l.id).join(",");
  const wordsForSession = useMemo(() => {
    let rawItems = [];
    if (isDuala) {
      const { getDualaThemeItems } = require("../../../../data/dualaLessonsData");
      rawItems = getDualaThemeItems(themeId) || [];
    } else if (isGhomala) {
      const { getGhomalaThemeItems } = require("../../../../data/ghomalaLessonsData");
      rawItems = getGhomalaThemeItems(themeId) || [];
    }

    if (rawItems.length > 0) {
      // Map to standard exercise item shape
      return rawItems.map((item, idx) => ({
        id: `virt_${themeId}_${idx}`,
        title: item.sourceText,
        subtitle: item.targetText,
        audioUrl: item.audioKey ? item.audioKey : null,
        imageUrl: item.imageUrl || null,
        order: idx,
      }));
    }
    return wordCount ? lessons.slice(0, wordCount) : lessons;
  }, [lessonsKey, wordCount, isDuala, isGhomala, themeId]);

  // For Bassa, use the fixed docx-driven exercise questions so the content
  // matches exactly what the docx files specify (match words from Ex 1, write
  // phrases from Ex 2, image QCM from Ex 3). Other languages keep the dynamic
  // builder that draws from the database lesson words.
  const questions = useMemo(() => {
    if (isBassa) {
      if (isBassaMixed === "true") {
        return buildBassaMixedFoundationSession(uiLang);
      }
      if (themeOrder !== null) {
        const bassaQ = buildBassaSession(themeOrder, uiLang);
        if (bassaQ && bassaQ.length > 0) return bassaQ;
      }
    }
    return buildSession(wordsForSession);
  }, [wordsForSession, isBassa, themeOrder, isBassaMixed, uiLang]);


  const [idx, setIdx] = useState(0);
  const [retryQ, setRetryQ] = useState([]);
  const [isRetry, setIsRetry] = useState(false);
  const [retryIdx, setRetryIdx] = useState(0);
  // Seed from the store's current value so TopBar shows real hearts immediately;
  // the mount effect will update it via a force-refresh fetch.
  const [hearts, setHearts] = useState(
    () => useDashboardStore.getState().data?.hearts ?? 5
  );
  const [showRefill, setShowRefill] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  // Only allow the "hearts exhausted" auto-exit when the player has actually
  // lost a heart in THIS session — prevents stale 0-hearts from closing the
  // screen instantly when the user retries after a previous failure.
  const heartsDrainedInSession = useRef(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalQ = questions.length || 1;
  const curQ = isRetry ? retryQ[retryIdx] : questions[idx];
  const dispIdx = isRetry ? totalQ + retryIdx + 1 : idx + 1;
  const dispTot = isRetry ? totalQ + retryQ.length : totalQ;


  const handleCorrect = useCallback(() => {
    setCorrect((c) => c + 1);
    setAnswered((a) => a + 1);
  }, []);

  const handleWrong = useCallback((toRetry) => {
    heartsDrainedInSession.current = true;
    setHearts((h) => Math.max(0, h - 1));
    setAnswered((a) => a + 1);
    useDashboardStore.getState().deductHeart();
    if (toRetry) setRetryQ((q) => [...q, toRetry]);
  }, []);

  const goResults = useCallback(() => {
    const score = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const wcParam = wordCountStr ? `&wordCount=${wordCountStr}` : "";
    const extra = lessonIdxParam != null ? `&lessonIdx=${lessonIdxParam}` : "";
    const final = (isFinal === "true") ? "&isFinal=true" : "";
    router.replace(
      `/(tabs)/lessons/${themeId}/exercise/results?score=${score}&correct=${correct}&total=${answered}${wcParam}${extra}${final}`
    );
  }, [correct, answered, themeId, lessonIdxParam, wordCountStr, isFinal]);


  const crossFade = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const advance = useCallback(() => {
    crossFade(() => {
      if (isRetry) {
        retryIdx + 1 < retryQ.length ? setRetryIdx((r) => r + 1) : goResults();
      } else {
        if (idx + 1 < questions.length) {
          setIdx((i) => i + 1);
        } else if (retryQ.length > 0) {
          setIsRetry(true); setRetryIdx(0);
        } else {
          goResults();
        }
      }
    });
  }, [isRetry, retryIdx, retryQ.length, idx, questions.length, goResults]);

  useEffect(() => {
    if (heartsDrainedInSession.current && hearts <= 0) {
      setShowRefill(true);
      // Wait for user to decide in modal; don't auto-exit yet
    }
  }, [hearts]);

  if (!curQ) {
    if (error && questions.length === 0) {
      return (
        <View style={s.root}>
          <StatusBar barStyle="dark-content" />
          <View style={s.center}>
            <Ionicons name="alert-circle-outline" size={48} color={C.primary} style={{ marginBottom: 16 }} />
            <Text style={{ textAlign: "center", color: C.text, fontSize: 16, marginBottom: 24, paddingHorizontal: 30 }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => fetchLessons(themeId)}
              style={{ backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>{t("common.retry") || "Retry"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <View style={s.center}>
          <Text style={{ color: C.textSub, fontSize: 15 }}>
            {questions.length === 0 ? t("exercises.loading") : t("exercises.sessionComplete")}
          </Text>
          {questions.length > 0 && (
            <TouchableOpacity onPress={goResults} style={{ marginTop: 24 }}>
              <Text style={{ color: C.primary, fontWeight: "700", fontSize: 16 }}>
                {t("exercises.seeResults")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const handlePurchaseHearts = async (count = 1) => {
    if (isRefilling) return;
    setIsRefilling(true);
    try {
      const res = await purchaseHearts(count);
      if (res?.success) {
        setHearts(res.hearts); // Sync local state
        setShowRefill(false);
        Vibration.vibrate(50);
      }
    } catch (e) {
      // Handled by store
    } finally {
      setIsRefilling(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <TopBar
        current={dispIdx}
        total={dispTot}
        hearts={hearts}
        onClose={() => router.replace("/(tabs)/home")}
      />

      {isRetry && retryIdx === 0 && (
        <View style={s.reviewBanner}>
          <Ionicons name="refresh-circle" size={16} color={C.primary} />
          <Text style={s.reviewTxt}>{t("exercises.retryMistakes")}</Text>
        </View>
      )}

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        {curQ.type === "image_qcm" && (
          <ImageQCMScreen
            key={`iqcm-${dispIdx}`}
            q={curQ}
            onCorrect={handleCorrect}
            onWrong={() => handleWrong(curQ)}
            onNext={advance}
          />
        )}
        {curQ.type === "text_qcm" && (
          <TextQCMScreen
            key={`tqcm-${dispIdx}`}
            q={curQ}
            langName={langName}
            uiLang={uiLang}
            onCorrect={handleCorrect}
            onWrong={() => handleWrong(curQ)}
            onNext={advance}
          />
        )}
        {curQ.type === "match" && (
          <MatchScreen
            key={`match-${dispIdx}`}
            q={curQ}
            langName={langName}
            uiLang={uiLang}
            onCorrect={handleCorrect}
            onWrong={() => handleWrong(null)}
            onNext={advance}
            playAudio={playWordAudio}
          />
        )}
        {curQ.type === "write" && (
          <WriteScreen
            key={`write-${dispIdx}`}
            q={curQ}
            langName={langName}
            uiLang={uiLang}
            onCorrect={handleCorrect}
            onWrong={() => handleWrong(curQ)}
            onNext={advance}
          />
        )}
        {curQ.type === "listen_write" && (
          <ListenWriteScreen
            key={`lw-${dispIdx}`}
            q={curQ}
            langName={langName}
            uiLang={uiLang}
            onCorrect={handleCorrect}
            onWrong={() => handleWrong(curQ)}
            onNext={advance}
          />
        )}
      </Animated.View>

      <Modal
        visible={showRefill}
        transparent
        animationType="fade"
        onRequestClose={() => { }}
      >
        <View style={rm.overlay}>
          <View style={rm.card}>
            <View style={rm.header}>
              <View style={rm.iconCircle}>
                <Ionicons name="heart" size={40} color={C.primary} />
              </View>
              <Text style={rm.title}>{t("exercises.refillTitle", "Plus de cœurs !")}</Text>
              <Text style={rm.desc}>
                {t("exercises.refillDesc", "Tu n'as plus de vies pour continuer. Échange tes points contre des cœurs pour finir l'exercice.")}
              </Text>
            </View>

            <View style={rm.stats}>
              <View style={rm.statItem}>
                <Ionicons name="flash" size={20} color={C.orange} />
                <Text style={rm.statTxt}>{dashboardData?.totalPoints ?? 0} XP</Text>
              </View>
              <View style={rm.divider} />
              <View style={rm.statItem}>
                <Ionicons name="heart" size={20} color={C.primary} />
                <Text style={rm.statTxt}>{hearts} {t("exercises.hearts", "Cœurs")}</Text>
              </View>
            </View>

            <View style={rm.actions}>
              {(dashboardData?.totalPoints >= 30) ? (
                <>
                  <TouchableOpacity
                    style={[rm.buyBtn, isRefilling && rm.btnDisabled]}
                    onPress={() => handlePurchaseHearts(1)}
                    disabled={isRefilling}
                  >
                    {isRefilling ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Text style={rm.buyTxt}>+1 {t("common.heart", "Cœur")}</Text>
                        <Text style={rm.priceTxt}>30 XP</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {dashboardData?.totalPoints >= 90 && (
                    <TouchableOpacity
                      style={[rm.buyBtn, rm.buyBtnAlt, isRefilling && rm.btnDisabled]}
                      onPress={() => handlePurchaseHearts(3)}
                      disabled={isRefilling}
                    >
                      {isRefilling ? (
                        <ActivityIndicator color={C.primary} />
                      ) : (
                        <>
                          <Text style={[rm.buyTxt, { color: C.primary }]}>+3 {t("common.hearts", "Cœurs")}</Text>
                          <Text style={[rm.priceTxt, { color: C.primary + "90" }]}>90 XP</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={rm.noPoints}>
                  <Ionicons name="alert-circle" size={20} color={C.primary} />
                  <Text style={rm.noPointsTxt}>{t("exercises.notEnoughPoints", "Pas assez de points (30 XP requis)")}</Text>
                </View>
              )}

              <TouchableOpacity
                style={rm.quitBtn}
                onPress={() => {
                  setShowRefill(false);
                  goResults();
                }}
              >
                <Text style={rm.quitTxt}>{t("common.quit", "Quitter l'exercice")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ════════════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  reviewBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  reviewTxt: { fontSize: 13, fontWeight: "700", color: C.primaryDark },
});

/* AudioBtn */
const ab = StyleSheet.create({
  btn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
});

/* TopBar */
const tb = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: C.bg,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  trackWrap: {
    flex: 1, height: 12,
    backgroundColor: C.track,
    borderRadius: 8, overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: C.primary, borderRadius: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.card,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    ...SHADOW,
  },
  badgeNum: { fontSize: 14, fontWeight: "800", color: C.text },
  cowryIcon: { width: 18, height: 18 }, // Placeholder pour l'icône cauri
});

/* FeedbackBanner */
const fb = StyleSheet.create({
  wrap: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    gap: 12,
    ...SHADOW,
  },
  wrapGreen: { backgroundColor: C.correctLight },
  wrapRed: { backgroundColor: C.primaryLight },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  icon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  iconGreen: { backgroundColor: C.correct },
  iconRed: { backgroundColor: C.primary },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  sub: { fontSize: 14, color: C.textSub, lineHeight: 20 },
  answer: { fontWeight: "800", fontStyle: "italic", color: C.text },
  explainBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.card,
    borderRadius: 50, paddingVertical: 14,
    ...SHADOW,
  },
  explainTxt: { fontSize: 15, fontWeight: "800", color: C.primary, letterSpacing: 1 },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 50, paddingVertical: 16,
  },
  continueBtnGreen: { backgroundColor: C.correctDark },
  continueBtnRed: { backgroundColor: C.primary },
  continueTxt: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: 0.5 },
});

/* Footer partagé */
const footer = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  verifyBtn: {
    flex: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: C.primary,
    borderRadius: 50, paddingVertical: 16, gap: 8,
  },
  verifyTxt: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: 0.5 },
});

/* Tip card partagée */
const tipS = StyleSheet.create({
  card: {
    backgroundColor: C.tipBg,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.primary + "20",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: "800", color: C.orange },
  body: { fontSize: 14, color: C.text, lineHeight: 21 },
});

/* Image QCM */
const iq = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: "600", color: C.textSub, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: CARD_W,
    backgroundColor: C.card,
    borderRadius: 24, overflow: "hidden",
    borderWidth: 3, borderColor: C.border,
    paddingBottom: 4,
    ...SHADOW,
  },
  cardSel: { borderColor: C.primary, backgroundColor: C.primaryLight },
  cardCorrect: { borderColor: C.correct, backgroundColor: C.correctLight },
  cardWrong: { borderColor: C.primary, backgroundColor: C.primaryLight },
  imgWrap: { position: "relative" },
  img: { width: "100%", height: CARD_W * 0.95 },
  imgPlaceholder: {
    width: "100%", height: CARD_W * 0.95,
    backgroundColor: "#F8EDED",
    alignItems: "center", justifyContent: "center",
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
  },
  overlayCircle: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: "center", justifyContent: "center",
    ...SHADOW,
  },
  labelRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, paddingHorizontal: 8, gap: 4,
  },
  label: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text, textAlign: "center" },
});

/* Text QCM */
const qx = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: "600", color: C.textSub, marginBottom: 12 },
  targetCard: {
    backgroundColor: C.card,
    borderRadius: 24, padding: 22,
    marginBottom: 28, borderWidth: 1.5, borderColor: C.border,
    ...SHADOW,
    alignItems: "center",
  },
  targetLabel: { fontSize: 11, fontWeight: "800", color: C.textFaint, letterSpacing: 1, marginBottom: 4 },
  targetWord: { fontSize: 26, fontWeight: "900", color: C.text, marginBottom: 8 },
  targetAudioRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  targetSubtitle: { fontSize: 18, fontWeight: "700", color: C.primary },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  card: {
    backgroundColor: C.card,
    borderRadius: 20, padding: 12,
    borderWidth: 2, borderColor: C.border,
    ...SHADOW,
    minHeight: 110,
    justifyContent: "space-between",
  },
  cardSel: { borderColor: C.primary, backgroundColor: C.primaryLight },
  cardCorrect: { borderColor: C.correct, backgroundColor: C.correctLight },
  cardWrong: { borderColor: C.primary, backgroundColor: C.primaryLight },
  optTop: { alignItems: "center", paddingTop: 8 },
  optBottomV2: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  optTxt: { fontSize: 15, fontWeight: "700", color: C.text, flex: 1 },
  badgeV2: { position: "absolute", top: 8, right: 8 },

  wordRowV2: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: 20, padding: 18,
    marginBottom: 28, borderWidth: 1.5, borderColor: C.border,
    ...SHADOW,
  },
  globalCol: { flex: 1, gap: 2 },
  localCol: { flex: 1.4, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  divider: { width: 1.5, height: "60%", backgroundColor: C.border, marginHorizontal: 15 },
  globalWord: { fontSize: 17, fontWeight: "700", color: C.text },
  localWord: { fontSize: 18, fontWeight: "800", color: C.primary },
  subLabel: { fontSize: 10, fontWeight: "800", color: C.textFaint, letterSpacing: 0.5, textTransform: "uppercase" },
  langLabel: { fontSize: 10, fontWeight: "800", color: C.textFaint, letterSpacing: 0.5, textTransform: "uppercase" },
  audioFixed: { marginLeft: 4 },
  badge: { position: "absolute", top: 8, right: 8 },
});

/* Paires → styles moved to app/components/ui/MatchScreen.jsx */

/* Listen & Write */
const lw = StyleSheet.create({
  audioCenter: {
    alignItems: "center",
    marginVertical: 28,
  },
  bigSpeaker: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 3,
    borderColor: C.primaryLight,
  },
  tapHint: {
    marginTop: 14,
    fontSize: 13, fontWeight: "600",
    color: C.textSub, letterSpacing: 0.3,
  },
});

/* Écriture */
const wx = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  hintCardV2: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 24, padding: 18,
    marginBottom: 24, borderWidth: 1.5, borderColor: C.border,
    ...SHADOW,
  },
  hintCardV3: {
    backgroundColor: C.card,
    borderRadius: 24, padding: 22,
    marginBottom: 24, borderWidth: 1.5, borderColor: C.border,
    ...SHADOW,
    alignItems: "center",
    marginHorizontal: 4,
  },
  globalCol: { flex: 1, gap: 2 },
  localCol: { flex: 1.4, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  dividerVertical: { width: 1.5, height: "60%", backgroundColor: C.border, marginHorizontal: 15 },
  hintLabel: { fontSize: 10, fontWeight: "800", color: C.textFaint, letterSpacing: 0.5, textTransform: "uppercase" },
  hintWord: { fontSize: 18, fontWeight: "700", color: C.text },
  localWord: { fontSize: 19, fontWeight: "800", color: C.primary },
  langLabel: { fontSize: 10, fontWeight: "800", color: C.textFaint, letterSpacing: 0.5, textTransform: "uppercase" },
  blob: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(183,28,28,0.08)", right: -30, top: -30,
  },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 20, paddingHorizontal: 20, paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 2, borderColor: C.border,
    ...SHADOW,
  },
  inputOk: { borderColor: C.correct, backgroundColor: C.correctLight },
  inputKo: { borderColor: C.primary, backgroundColor: C.primaryLight },
  input: {
    flex: 1, fontSize: 22, fontWeight: "700",
    color: C.text, paddingVertical: 16,
  },
  /* Barre chars spéciaux */
  specialBar: {
    backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingVertical: 8,
  },
  specialRowContent: {
    paddingHorizontal: 16, gap: 10,
  },
  specialKey: {
    minWidth: 48, height: 48,
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1.5, borderColor: C.primary + "35",
  },
  specialKeyTxt: { fontSize: 18, fontWeight: "700", color: C.primary },
});

/* Refill Modal Styles */
const rm = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  card: {
    width: "100%", backgroundColor: C.bg,
    borderRadius: 32, padding: 32,
    alignItems: "center", ...SHADOW,
  },
  header: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "900", color: C.text, marginBottom: 12 },
  desc: {
    fontSize: 15, color: C.textSub, textAlign: "center",
    lineHeight: 22, paddingHorizontal: 10,
  },
  stats: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: C.card, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: C.border,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statTxt: { fontSize: 16, fontWeight: "800", color: C.text },
  divider: { width: 1, height: 20, backgroundColor: C.border },
  actions: { width: "100%", gap: 12 },
  buyBtn: {
    width: "100%", height: 60, borderRadius: 18,
    backgroundColor: C.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, ...SHADOW,
  },
  buyBtnAlt: {
    backgroundColor: C.bg, borderWidth: 2, borderColor: C.primary,
  },
  buyTxt: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  priceTxt: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.8)" },
  btnDisabled: { opacity: 0.6 },
  noPoints: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.primaryLight, padding: 16, borderRadius: 16,
    marginBottom: 8,
  },
  noPointsTxt: { flex: 1, fontSize: 14, fontWeight: "700", color: C.primaryDark },
  quitBtn: {
    width: "100%", paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  quitTxt: { fontSize: 15, fontWeight: "700", color: C.textSub },
});
