/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — SignUpScreen                                        ║
 * ║  Matches the Inscription.png maquette.                        ║
 * ║  Fields: Nom Complet, Email, Mot de passe, Confirmer          ║
 * ║  All business logic (register API, validation) preserved.     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import api from "../../src/services/api";
import { useTranslation } from "react-i18next";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import {
  MInput,
  MButton,
  MLinkText,
} from "../../src/components/ui/MComponents";

const MIN_PASSWORD = 6;

/* ══════════════════════════════════════════════════════════════
   Password Strength Bar — reusable, uses tokens
   ══════════════════════════════════════════════════════════════ */

const StrengthBar = ({ password, t }) => {
  const anim = useRef(new Animated.Value(0)).current;

  const getStrength = (p) => {
    if (!p) return { score: 0, label: "", color: Colors.transparent };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score: 1, label: t("signUp.weak"), color: Colors.error };
    if (score <= 3) return { score: 3, label: t("signUp.medium"), color: Colors.secondaryContainer };
    return { score: 5, label: t("signUp.strong"), color: Colors.primary };
  };

  const { score, label, color } = getStrength(password);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: score / 5,
      tension: 60,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [score]);

  if (!password) return null;

  return (
    <View style={{ marginTop: Space.sm, marginBottom: Space.xs }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Space.xs }}>
        <Text style={[Typo.labelSm, { color: Colors.textTertiary, textTransform: "none" }]}>
          {t("signUp.passwordStrength")}
        </Text>
        <Text style={[Typo.labelSm, { color, fontWeight: "700", textTransform: "none" }]}>
          {label}
        </Text>
      </View>
      <View style={styles.strengthTrack}>
        <Animated.View
          style={[
            styles.strengthFill,
            {
              backgroundColor: color,
              width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
      </View>
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   Password Match Indicator
   ══════════════════════════════════════════════════════════════ */

const MatchIndicator = ({ password, confirm, t }) => {
  if (!confirm || confirm.length === 0) return null;

  const isMatch = password === confirm;
  const color = isMatch ? Colors.primary : Colors.error;
  const icon = isMatch ? "checkmark-circle" : "close-circle";
  const text = isMatch
    ? t("signUp.validation.passwordsMatch")
    : t("signUp.validation.passwordsDoNotMatch");

  return (
    <View style={[styles.matchRow, { backgroundColor: color + "0A" }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[Typo.bodySm, { color, marginLeft: Space.sm }]}>{text}</Text>
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════════════════════ */

const SignUpScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  // ── State ──
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
    officialLanguage: "fr", // Default to French
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  // ── Animations ──
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Validation — ORIGINAL LOGIC PRESERVED ──
  const validate = () => {
    if (!form.name.trim() || !form.username.trim() || !form.email.trim() || !form.password || !form.confirm)
      return t("signUp.validation.requiredFields");
    if (form.password.length < MIN_PASSWORD)
      return t("signUp.validation.passwordMinLength", { min: MIN_PASSWORD });
    if (form.password !== form.confirm)
      return t("signUp.validation.passwordMismatch");
    return null;
  };

  // ── Submit — ORIGINAL API CALL PRESERVED ──
  const handleSignUp = useCallback(async () => {

    console.log("➡️ Sending request to backend...");
    
    const error = validate();
    if (error) return Alert.alert(t("signUp.error.title"), error);
    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: form.email,
        username: form.username.trim(),
        name: form.name.trim(),
        password: form.password,
        language: form.officialLanguage,
      });
      Alert.alert(t("signUp.success.title"), t("signUp.success.message"));
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: form.email, flow: "verify" },
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || t("signUp.error.creationFailed");
      Alert.alert(t("signUp.error.title"), message);
    } finally {
      setLoading(false);
    }
  }, [form, router, t]);

  // ── Social login removed — will be implemented later ──

  // ── Render helpers ──
  const animStyle = (anim, yOffset = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [yOffset, 0] }) }],
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

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
          {/* ── Header nav ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={[Typo.titleMd, { flex: 1, textAlign: "center" }]}>{t("auth.createAccount")}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* ── Logo ── */}
          <Animated.View style={[s.logoWrap, { opacity: logoAnim, transform: [{ scale: logoScale }] }]}>
            <View style={s.logoCircle}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={s.logoImg}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          {/* ── Title block ── */}
          <Animated.View style={[s.titleBlock, animStyle(titleAnim, 15)]}>
            <Text style={Typo.displayMd}>{t("signUp.joinAdventure")}</Text>
            <Text style={[Typo.bodyLg, { textAlign: "center", marginTop: Space.sm }]}>
              {t("signUp.subtitle")}
            </Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View style={[s.formCard, Shadow.md, animStyle(formAnim, 30)]}>

            {/* Nom Complet */}
            <MInput
              label={t("profile.name")}
              value={form.name}
              onChangeText={onChange("name")}
              placeholder="John Doe"
              autoCapitalize="words"
            />

            {/* Pseudo / Nom d'utilisateur */}
            <MInput
              label={t("signUp.usernameLabel")}
              value={form.username}
              onChangeText={onChange("username")}
              placeholder="@monpseudo"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Adresse Email */}
            <MInput
              label={t("signUp.emailLabel")}
              value={form.email}
              onChangeText={onChange("email")}
              placeholder={t("signUp.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Mot de passe */}
            <MInput
              label={t("signUp.passwordLabel")}
              value={form.password}
              onChangeText={onChange("password")}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowPassword(!showPassword)}
            />
            <StrengthBar password={form.password} t={t} />

            {/* Confirmer le mot de passe */}
            <MInput
              label={t("signUp.confirmPasswordLabel")}
              value={form.confirm}
              onChangeText={onChange("confirm")}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowConfirm(!showConfirm)}
            />
            <MatchIndicator password={form.password} confirm={form.confirm} t={t} />

            {/* Langue Officielle */}
            <Text style={[Typo.labelSm, { color: Colors.textTertiary, marginBottom: Space.sm, marginTop: Space.md }]}>
              {t("signUp.preferredOfficialLanguage", "Langue préférée (French/English)")}
            </Text>
            <View style={{ flexDirection: "row", gap: Space.md, marginBottom: Space.lg }}>
              <TouchableOpacity
                onPress={() => onChange("officialLanguage")("fr")}
                style={[s.langToggle, form.officialLanguage === "fr" && s.langToggleActive]}
              >
                <Text style={[s.langToggleTxt, form.officialLanguage === "fr" && s.langToggleTxtActive]}>Français</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChange("officialLanguage")("en")}
                style={[s.langToggle, form.officialLanguage === "en" && s.langToggleActive]}
              >
                <Text style={[s.langToggleTxt, form.officialLanguage === "en" && s.langToggleTxtActive]}>English</Text>
              </TouchableOpacity>
            </View>

            {/* CTA Button */}
            <MButton
              title={t("signUp.signUpButton")}
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={{ marginTop: Space.xl }}
            />
          </Animated.View>

          {/* ── Sign in link ── */}
          <Animated.View style={animStyle(footerAnim, 10)}>
            <MLinkText
              text={t("signUp.alreadyAccount")}
              linkText={t("signUp.signInLink")}
              onPress={() => router.replace("/(auth)/sign-in")}
            />
          </Animated.View>

          {/* Cultural card removed per directive */}

          {/* ── Terms ── */}
          <Animated.View style={[{ marginTop: Space.xl, paddingHorizontal: Space.lg }, animStyle(footerAnim, 5)]}>
            <Text style={[Typo.bodySm, { textAlign: "center", lineHeight: 18 }]}>
              {t("signUp.terms")}{" "}
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>{t("signUp.conditions")}</Text>
              {" "}{t("signUp.or")}{" "}{t("signUp.privacy")}
            </Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

/* ──────────────────────────────────────────────────────────────
   Styles
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

  // Logo
  logoWrap: {
    alignItems: "center",
    marginTop: Space["2xl"],
    marginBottom: Space.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.md,
  },
  logoImg: {
    width: 64,
    height: 64,
  },

  // Title
  titleBlock: {
    alignItems: "center",
    marginBottom: Space["4xl"],
  },

  // Form card
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.sm,
  },

  // Social row removed
});

/* ──────────────────────────────────────────────────────────────
   Internal component styles
   ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  // Strength bar
  strengthTrack: {
    height: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Match indicator
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    marginTop: -Space.sm,
    marginBottom: Space.md,
  },
  
  // Official Language toggle
  langToggle: {
    flex: 1,
    paddingVertical: Space.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surface,
  },
  langToggleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  langToggleTxt: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  langToggleTxtActive: {
    color: Colors.primary,
    fontFamily: "Fredoka_600SemiBold",
  },
});

export default SignUpScreen;