/**
 * MULEMA — Session Exercices
 * Thème ROUGE • Audio expo-av • Clavier natif + chars spéciaux
 * Vibration haptic • Feedback sur VÉRIFIER • Auto-scroll
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated, Dimensions, Keyboard, KeyboardAvoidingView,
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

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 40 - 12) / 2;

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

const buildSession = (words) => {
  if (!words || words.length < 1) return [];
  const sw = shuffle(words);
  const PER = 4; // 4 questions per type

  const wordsWithImg = sw.filter(hasValidImage);
  const canDoImageQCM = wordsWithImg.length >= 2;
  const maxOpts = Math.min(4, sw.length);

  const qcm = Array.from({ length: PER }, (_, i) => {
    const target = sw[i % sw.length];
    if (canDoImageQCM && hasValidImage(target)) {
      // Build image_qcm using only words that have images as options
      const imgPool = wordsWithImg.filter((w) => w.id !== target.id);
      const optsCount = Math.min(maxOpts - 1, imgPool.length);
      const opts = shuffle([target, ...shuffle(imgPool).slice(0, optsCount)]);
      return { type: "image_qcm", target, options: opts };
    }
    const others = sw.filter((w) => w.id !== target.id);
    const opts = shuffle([target, ...shuffle(others).slice(0, maxOpts - 1)]);
    return { type: "text_qcm", target, options: opts };
  });

  // Match — requires at least 2 words; use however many pairs are available (up to 3)
  const matchPairCount = Math.min(3, sw.length);
  const match = sw.length >= 2
    ? Array.from({ length: PER }, (_, i) => {
      const pairs = Array.from({ length: matchPairCount }, (_, k) =>
        sw[(i * matchPairCount + k) % sw.length]
      );
      return { type: "match", pairs, right: shuffle([...pairs]) };
    })
    : [];

  const write = Array.from({ length: PER }, (_, i) => ({
    type: "write",
    target: sw[i % sw.length],
  }));

  const complete = Array.from({ length: PER }, (_, i) => ({
    type: "write",
    target: sw[(i + Math.floor(sw.length / 2)) % sw.length],
    isComplete: true,
  }));


  return shuffle([...qcm, ...match, ...write, ...complete]);
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
        activeOpacity={0.88}
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
const ImageQCMScreen = ({ q, onCorrect, onWrong, onNext }) => {
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

  const cardBorder = (opt) => {
    if (!feedback) {
      return sel === opt.id ? { borderColor: C.primary, borderWidth: 3 } : {};
    }
    if (opt.id === q.target.id) return { borderColor: C.correct, borderWidth: 3 };
    if (opt.id === sel && sel !== q.target.id) return { borderColor: C.primary, borderWidth: 3 };
    return { opacity: 0.4 };
  };


  const a1 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a1, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (q.target.audioUrl) playWordAudio(q.target.audioUrl);
  }, [q.target.id]);

  return (
    <Animated.View style={[{ flex: 1, opacity: a1 }, { transform: [{ translateX: shakeX }] }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={iq.scroll} showsVerticalScrollIndicator={false}>

        <Text style={iq.title}>{t("exercises.pickImageFor")}</Text>

        {/* Mot Duala + bouton audio */}
        <View style={iq.wordRow}>
          <Text style={iq.word}>{q.target.subtitle}</Text>
          <AudioBtn url={q.target.audioUrl} size={24} />
        </View>

        {/* Grille 2×2 */}
        <View style={iq.grid}>
          {q.options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => !feedback && setSel(opt.id)}
              activeOpacity={feedback ? 1 : 0.8}
              style={[iq.card, cardBorder(opt)]}
            >
              <View style={iq.imgWrap}>
                {opt.imageUrl && typeof opt.imageUrl === 'string' && opt.imageUrl.trim() !== "" ? (
                  <Image source={IMAGES_MAP[opt.imageUrl] ? IMAGES_MAP[opt.imageUrl] : { uri: opt.imageUrl }} style={iq.img} contentFit="cover" />
                ) : (
                  <View style={[iq.img, iq.imgPlaceholder]}>
                    <Ionicons name="image-outline" size={32} color={C.textFaint} />
                  </View>
                )}
                {feedback && opt.id === q.target.id && (
                  <View style={[iq.overlay, { backgroundColor: "rgba(46,204,113,0.38)" }]}>
                    <View style={[iq.overlayCircle, { backgroundColor: C.correct }]}>
                      <Ionicons name="checkmark" size={22} color="#FFF" />
                    </View>
                  </View>
                )}
                {feedback && opt.id === sel && sel !== q.target.id && (
                  <View style={[iq.overlay, { backgroundColor: "rgba(183,28,28,0.38)" }]}>
                    <View style={[iq.overlayCircle, { backgroundColor: C.primary }]}>
                      <Ionicons name="close" size={22} color="#FFF" />
                    </View>
                  </View>
                )}
              </View>

              {/* Audio par image */}
              <View style={iq.labelRow}>
                <Text
                  style={[
                    iq.label,
                    feedback && opt.id === q.target.id && { color: C.correct, fontWeight: "700" },
                    feedback && opt.id === sel && sel !== q.target.id && { color: C.primary },
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
            activeOpacity={0.85}
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
const TextQCMScreen = ({ q, onCorrect, onWrong, onNext, langName }) => {
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

  useEffect(() => {
    if (q.target.audioUrl) playWordAudio(q.target.audioUrl);
  }, [q.target.id]);

  return (
    <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeX }] }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={qx.scroll} showsVerticalScrollIndicator={false}>

        <Text style={qx.title}>{t("exercises.howToSayIn", { lang: langName })}</Text>

        {/* Mot FR + audio */}
        <View style={qx.wordRow}>
          <View style={qx.wordPill}>
            <Text style={qx.keyword}>"{q.target.title}"</Text>
          </View>
          <AudioBtn url={q.target.audioUrl} size={22} />
        </View>

        {/* Grille 2×2 */}
        <View style={qx.grid}>
          {q.options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => !feedback && setSel(opt.id)}
              activeOpacity={0.8}
              style={cardStyle(opt)}
            >
              {opt.imageUrl && typeof opt.imageUrl === 'string' && opt.imageUrl.trim() !== "" ? (
                <Image source={IMAGES_MAP[opt.imageUrl] ? IMAGES_MAP[opt.imageUrl] : { uri: opt.imageUrl }} style={qx.optImg} contentFit="cover" />
              ) : (
                <View style={qx.optImgPlaceholder}>
                  <Ionicons name="language" size={26} color={sel === opt.id ? C.primary : C.textFaint} />
                </View>
              )}

              {sel === opt.id && !feedback && (
                <View style={qx.badge}>
                  <Ionicons name="checkmark-circle" size={20} color={C.primary} />
                </View>
              )}
              {feedback && opt.id === q.target.id && (
                <View style={qx.badge}>
                  <Ionicons name="checkmark-circle" size={20} color={C.correct} />
                </View>
              )}

              <View style={qx.optBottom}>
                <Text style={labelStyle(opt)} numberOfLines={2}>{opt.subtitle}</Text>
                {opt.audioUrl && (
                  <AudioBtn url={opt.audioUrl} size={15} color={C.textSub} style={{ marginTop: 4 }} />
                )}
              </View>
            </TouchableOpacity>
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
            activeOpacity={0.85}
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
const WriteScreen = ({ q, onCorrect, onWrong, onNext, langName }) => {
  const { t } = useTranslation();
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();

  // Insérer un caractère spécial à la fin
  const insertChar = (ch) => {
    if (feedback) return;
    setTyped((t) => t + ch);
    inputRef.current?.focus();
  };

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={wx.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={wx.title}>{t("exercises.translateTo", { lang: langName })}</Text>

        {/* Carte mot + audio */}
        <View style={[wx.hintCard, SHADOW]}>
          <View style={wx.hintIcon}>
            <Ionicons name="chatbubble-ellipses" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={wx.hintLabel}>{t("exercises.howToSay")}</Text>
            <Text style={wx.hintWord}>"{q.target.title}"</Text>
          </View>
          <AudioBtn url={q.target.audioUrl} size={22} />
          <View style={wx.blob} />
        </View>

        {/* Zone de saisie */}
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
            onChangeText={(t) => !feedback && setTyped(t)}
            style={[wx.input, typed.length > 0 && { color: C.primary }]}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            placeholder={t("exercises.typeTranslation")}
            placeholderTextColor={C.textFaint}
            editable={!feedback}
            returnKeyType="done"
            onSubmitEditing={verify}
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

        {/* Astuce */}
        <View style={tipS.card}>
          <View style={tipS.row}>
            <Ionicons name="information-circle" size={16} color={C.orange} />
            <Text style={tipS.title}>{t("common.tip")}</Text>
          </View>
          <Text style={tipS.body}>
            {t("exercises.keyboardInstruction", { lang: langName, chars: "ɓ, ɛ, ŋ" })}
          </Text>
        </View>

        <View style={{ height: 220 }} />
      </ScrollView>

      {/* ── Barre de caractères spéciaux Duala ── */}
      {!feedback && (
        <View style={wx.specialBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={wx.specialRowContent}
          >
            {SPECIAL_CHARS.map((ch) => (
              <TouchableOpacity
                key={ch}
                onPress={() => insertChar(ch)}
                style={wx.specialKey}
                activeOpacity={0.65}
              >
                <Text style={wx.specialKeyTxt}>{ch}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Footer VÉRIFIER ou Feedback */}
      {!feedback ? (
        <View style={footer.wrap}>
          <TouchableOpacity
            onPress={verify}
            style={[footer.verifyBtn, !typed.trim() && { opacity: 0.35 }]}
            disabled={!typed.trim()}
            activeOpacity={0.85}
          >
            <Text style={footer.verifyTxt}>{t("common.verify")}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <FeedbackBanner
          correct={feedback === "ok"}
          correctAnswer={feedback === "ko" ? q.target.subtitle : null}
          onNext={() => { setTyped(""); setFeedback(null); onNext(); }}
        />
      )}
    </KeyboardAvoidingView>
  );
};


/* ════════════════════════════════════════════════════════════════
   ÉCRAN PRINCIPAL — Session
   ════════════════════════════════════════════════════════════════ */


export default function ExerciseSession() {
  const router = useRouter();
  const { themeId, wordCount: wordCountStr, lessonIdx: lessonIdxStr } = useLocalSearchParams();

  // wordCount: how many words to include (cumulative lessons so far)
  // lessonIdx: 0-based index of the lesson just completed (for unlock)
  const wordCount = wordCountStr ? parseInt(wordCountStr, 10) : null;
  const lessonIdxParam = lessonIdxStr != null ? parseInt(lessonIdxStr, 10) : null;

  const { lessons, fetchLessons } = useThemeStore();
  const { data: dash, fetchDashboard } = useDashboardStore();
  const { activeLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const langName = activeLanguage?.name ?? "Duala";


  useEffect(() => {
    pauseBackgroundMusic();
    return () => { resumeBackgroundMusic(); };
  }, []);

  useEffect(() => {
    if (themeId) fetchLessons(themeId);
    fetchDashboard();
  }, [themeId]);

  // Slice lessons to cumulative word count (or all if no wordCount param)
  const lessonsKey = lessons.map((l) => l.id).join(",");
  const wordsForSession = useMemo(
    () => (wordCount ? lessons.slice(0, wordCount) : lessons),
    [lessonsKey, wordCount]
  );
  const questions = useMemo(() => buildSession(wordsForSession), [wordsForSession]);


  const [idx, setIdx] = useState(0);
  const [retryQ, setRetryQ] = useState([]);
  const [isRetry, setIsRetry] = useState(false);
  const [retryIdx, setRetryIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (dash?.hearts != null) setHearts(dash.hearts);
  }, [dash?.hearts]);

  const totalQ = questions.length || 1;
  const curQ = isRetry ? retryQ[retryIdx] : questions[idx];
  const dispIdx = isRetry ? totalQ + retryIdx + 1 : idx + 1;
  const dispTot = isRetry ? totalQ + retryQ.length : totalQ;


  const handleCorrect = useCallback(() => {
    setCorrect((c) => c + 1);
    setAnswered((a) => a + 1);
  }, []);

  const handleWrong = useCallback((toRetry) => {
    setHearts((h) => Math.max(0, h - 1));
    setAnswered((a) => a + 1);
    useDashboardStore.getState().deductHeart();
    if (toRetry) setRetryQ((q) => [...q, toRetry]);
  }, []);

  const goResults = useCallback(() => {
    const score = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const extra = lessonIdxParam != null ? `&lessonIdx=${lessonIdxParam}` : "";
    router.replace(
      `/(tabs)/lessons/${themeId}/exercise/results?score=${score}&correct=${correct}&total=${answered}${extra}`
    );
  }, [correct, answered, themeId, lessonIdxParam]);


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
    if (hearts <= 0) setTimeout(() => goResults(), 500);
  }, [hearts, goResults]);

  if (!curQ) {
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
            onCorrect={handleCorrect}
            onWrong={() => handleWrong(curQ)}
            onNext={advance}
          />
        )}
      </Animated.View>
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
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  word: { fontSize: 28, fontWeight: "800", color: C.primary, flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: CARD_W,
    backgroundColor: C.card,
    borderRadius: 20, overflow: "hidden",
    borderWidth: 3, borderColor: "transparent",
    ...SHADOW,
  },
  imgWrap: { position: "relative" },
  img: { width: "100%", height: CARD_W },
  imgPlaceholder: {
    width: "100%", height: CARD_W,
    backgroundColor: "#F8EDED",
    alignItems: "center", justifyContent: "center",
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
  },
  overlayCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  labelRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 8, gap: 4,
  },
  label: { flex: 1, fontSize: 13, fontWeight: "600", color: C.text, textAlign: "center" },
});

/* Text QCM */
const qx = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: "600", color: C.textSub, marginBottom: 12 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  wordPill: {
    flex: 1, backgroundColor: C.primaryLight,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
  },
  keyword: { fontSize: 22, fontWeight: "800", color: C.primary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  card: {
    width: CARD_W, backgroundColor: C.card,
    borderRadius: 20, overflow: "hidden",
    borderWidth: 2.5, borderColor: C.border,
    alignItems: "center", paddingBottom: 12,
    ...SHADOW,
  },
  cardSel: { borderColor: C.primary, backgroundColor: C.primaryLight },
  cardCorrect: { borderColor: C.correct, backgroundColor: C.correctLight },
  cardWrong: { borderColor: C.primary, backgroundColor: C.primaryLight },
  optImg: { width: "100%", height: CARD_W * 0.72 },
  optImgPlaceholder: {
    width: "100%", height: CARD_W * 0.72,
    backgroundColor: "#F8EDED",
    alignItems: "center", justifyContent: "center",
  },
  optTxt: {
    fontSize: 15, fontWeight: "700", color: C.text,
    textAlign: "center", marginTop: 8, paddingHorizontal: 8,
  },
  optBottom: { alignItems: "center", paddingHorizontal: 8 },
  badge: { position: "absolute", top: 8, right: 8 },
});

/* Paires → styles moved to app/components/ui/MatchScreen.jsx */

/* Écriture */
const wx = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: "800", color: C.text, lineHeight: 30, marginBottom: 20 },
  hintCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.primaryLight,
    borderRadius: 20, padding: 20,
    marginBottom: 20, overflow: "hidden",
  },
  hintIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.primary + "25",
    alignItems: "center", justifyContent: "center",
  },
  hintLabel: { fontSize: 12, fontWeight: "600", color: C.textSub, marginBottom: 4 },
  hintWord: { fontSize: 20, fontWeight: "800", color: C.primary },
  blob: {
    position: "absolute", width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(183,28,28,0.07)", right: -20, top: -20,
  },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 2, borderColor: C.border,
    ...SHADOW,
  },
  inputOk: { borderColor: C.correct, backgroundColor: C.correctLight },
  inputKo: { borderColor: C.primary, backgroundColor: C.primaryLight },
  input: {
    flex: 1, fontSize: 20, fontWeight: "700",
    color: C.text, paddingVertical: 14,
  },
  /* Barre chars spéciaux */
  specialBar: {
    backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingVertical: 8,
  },
  specialRowContent: {
    paddingHorizontal: 16, gap: 8,
  },
  specialKey: {
    minWidth: 44, height: 44,
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1.5, borderColor: C.primary + "35",
  },
  specialKeyTxt: { fontSize: 18, fontWeight: "700", color: C.primary },
});
