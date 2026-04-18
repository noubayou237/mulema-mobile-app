/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — VerifyEmailScreen                                   ║
 * ║  Matches the verification_otp.png maquette.                   ║
 * ║  All business logic preserved: OTP verify, resend,            ║
 * ║  auto-login, flow (verify / reset), countdown.                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/stores/useAuthStore";
import api from "../../src/services/api";
import { MButton, MCulturalCard } from "../../src/components/ui/MComponents";

const RESEND_COOLDOWN = 60;
const STORAGE_KEY = "userSession";
const CODE_LENGTH = 6;

/* ══════════════════════════════════════════════════════════════
   OTP Digit Box
   ══════════════════════════════════════════════════════════════ */

const DigitBox = ({ digit, focused }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : digit ? 1.02 : 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [focused, digit]);

  return (
    <Animated.View
      style={[
        styles.digitBox,
        {
          transform: [{ scale: scaleAnim }],
          backgroundColor: focused
            ? Colors.primary + "14"
            : digit
            ? Colors.primary + "0A"
            : Colors.surfaceContainerLow,
          borderColor: focused
            ? Colors.primary
            : digit
            ? Colors.primary + "40"
            : Colors.transparent,
          borderWidth: focused || digit ? 2 : 0,
        },
        focused && Shadow.sm,
      ]}
    >
      <Text style={[styles.digitText, !digit && { opacity: 0.25 }]}>
        {digit || "•"}
      </Text>
      {focused && <View style={styles.cursor} />}
    </Animated.View>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════════════════════ */

const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const email = params?.email || "";
  const flow = params?.flow || "reset";

  // ── State ──
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);
  const countdownRef = useRef(null);

  // ── Animations ──
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const heroScale  = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(heroAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    startCountdown();
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // ── Countdown — ORIGINAL LOGIC ──
  const startCountdown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Auto login — FIX: Using Auth Store ──
  const autoLogin = async (responseData) => {
    const { accessToken, refreshToken } = responseData;
    const { loginWithTokens } = useAuthStore.getState();
    await loginWithTokens({ accessToken, refreshToken });
    router.replace("/(onboarding)/ChoiceLanguage");
  };

  // ── Verify — ORIGINAL LOGIC ──
  const handleVerification = async () => {
    if (!code.trim()) return Alert.alert(t("errors.codeRequired"), t("errors.enterCode"));
    setLoading(true);
    try {
      if (flow === "reset") {
        router.push({
          pathname: "/(auth)/ResetPasswordScreen",
          params: { email, otpCode: code.trim() },
        });
      } else {
        const response = await api.post("/auth/verify-email-and-login", {
          email,
          otpCode: code.trim(),
        });
        Alert.alert(t("common.success"), t("messages.emailVerified"));
        await autoLogin(response.data);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Échec de la vérification.";
      Alert.alert(t("common.error"), msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend — ORIGINAL LOGIC ──
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await api.post("/auth/request-otp", { email });
      Alert.alert(t("common.success"), `${t("auth.codeSentTo")} ${email}`);
      startCountdown();
    } catch (err) {
      Alert.alert(t("common.error"), err?.response?.data?.message || t("errors.serverError"));
    } finally {
      setResendLoading(false);
    }
  };

  // ── Derived ──
  const digits = Array(CODE_LENGTH).fill("").map((_, i) => code[i] || "");
  const isReady = code.length >= 4;

  // ── Render helpers ──
  const animStyle = (anim, yOffset = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [yOffset, 0] }) }],
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Hidden real input for OTP */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(val) => setCode(val.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        autoFocus={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>

              <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={[Typo.titleMd, { flex: 1, textAlign: "center" }]}>{t("auth.verifyEmail")}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* ── Hero illustration ── */}
          <Animated.View style={[s.heroWrap, { opacity: heroAnim, transform: [{ scale: heroScale }] }]}>
            {/* Outer soft circle */}
            <View style={s.heroOuterRing}>
              {/* Inner green/mint circle with shield */}
              <View style={s.heroInnerCircle}>
                <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
              </View>
            </View>
            {/* Email badge floating top-right */}
            <View style={s.heroBadge}>
              <Ionicons name="mail" size={18} color={Colors.onPrimary} />
            </View>
          </Animated.View>

          {/* ── Title block ── */}
          <Animated.View style={[s.titleBlock, animStyle(titleAnim, 15)]}>
            <Text style={Typo.displayMd}>{t("auth.verifyEmail")}</Text>
            <Text style={[Typo.bodyLg, { textAlign: "center", marginTop: Space.md, lineHeight: 24 }]}>
              {t("auth.loginSubtitle")}
            </Text>
          </Animated.View>

          {/* ── OTP boxes ── */}
          <Animated.View style={[s.otpSection, animStyle(formAnim, 20)]}>
            <TouchableOpacity
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
              style={s.otpRow}
            >
              {digits.map((d, i) => (
                <DigitBox key={i} digit={d} focused={inputFocused && code.length === i} />
              ))}
            </TouchableOpacity>

            {code.length > 0 && (
              <TouchableOpacity onPress={() => setCode("")} style={s.clearBtn}>
                <Ionicons name="close-circle" size={14} color={Colors.textTertiary} />
                <Text style={[Typo.bodySm, { color: Colors.textTertiary, marginLeft: Space.xs }]}>{t("common.clear")}</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* ── Verify button ── */}
          <Animated.View style={[{ width: "100%", marginBottom: Space["2xl"] }, animStyle(formAnim, 15)]}>
            <MButton
              title={t("auth.verifyCode")}
              onPress={handleVerification}
              loading={loading}
              disabled={loading || !isReady}
            />
          </Animated.View>

          {/* ── Resend section ── */}
          <Animated.View style={[{ alignItems: "center", marginBottom: Space["3xl"] }, animStyle(footerAnim, 10)]}>
            <Text style={[Typo.bodyMd, { color: Colors.textSecondary, marginBottom: Space.sm }]}>
              Vous n'avez pas reçu de code ?
            </Text>
            {resendCooldown > 0 ? (
              <Text style={[Typo.bodyMd, { color: Colors.textTertiary }]}>
                Renvoyer dans {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resendLoading} activeOpacity={0.7}>
                <Text style={[Typo.titleSm, { color: Colors.primary }]}>
                  {resendLoading ? "Envoi en cours..." : "Renvoyer le code"}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* ── Cultural card ── */}
          <Animated.View style={[{ width: "100%" }, animStyle(footerAnim, 10)]}>
            <MCulturalCard
              title={t("common.didYouKnow")}
              body={t("messages.mulemaMeaning")}
            />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

/* ──────────────────────────────────────────────────────────────
   Screen styles
   ────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Space["4xl"],
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: Space.lg,
  },

  // Hero
  heroWrap: {
    alignItems: "center",
    marginTop: Space["2xl"],
    marginBottom: Space["3xl"],
    position: "relative",
  },
  heroOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  heroInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    position: "absolute",
    top: 4,
    right: "22%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },

  // Title
  titleBlock: {
    alignItems: "center",
    marginBottom: Space["3xl"],
  },

  // OTP
  otpSection: {
    alignItems: "center",
    marginBottom: Space["3xl"],
  },
  otpRow: {
    flexDirection: "row",
    gap: Space.md,
    justifyContent: "center",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Space.md,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
  },
});

/* ──────────────────────────────────────────────────────────────
   Component styles
   ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  digitBox: {
    width: 52,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  digitText: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.onSurface,
  },
  cursor: {
    position: "absolute",
    bottom: 12,
    width: 2,
    height: 22,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});

export default VerifyEmail;