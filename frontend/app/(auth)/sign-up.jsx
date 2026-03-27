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
  MDivider,
  MSocialButton,
  MCulturalCard,
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
          {t("signUp.passwordStrength") || "Force du mot de passe"}
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
    ? (t("signUp.validation.passwordsMatch") || "Les mots de passe correspondent")
    : (t("signUp.validation.passwordsDoNotMatch") || "Les mots de passe ne correspondent pas");

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
    email: "",
    password: "",
    confirm: "",
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
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm)
      return t("signUp.validation.requiredFields");
    if (form.password.length < MIN_PASSWORD)
      return t("signUp.validation.passwordMinLength", { min: MIN_PASSWORD });
    if (form.password !== form.confirm)
      return t("signUp.validation.passwordMismatch");
    return null;
  };

  // ── Submit — ORIGINAL API CALL PRESERVED ──
  const handleSignUp = useCallback(async () => {
    const error = validate();
    if (error) return Alert.alert(t("signUp.error.title"), error);
    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: form.email,
        username: form.name,
        name: form.name,
        password: form.password,
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

  // ── Social ──
  const handleSocialLogin = (provider) => {
    Alert.alert("Info", `${provider} login sera intégré ici.`);
  };

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
            <Text style={[Typo.titleMd, { flex: 1, textAlign: "center" }]}>Create Account</Text>
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
            <Text style={Typo.displayMd}>Rejoignez Mulema</Text>
            <Text style={[Typo.bodyLg, { textAlign: "center", marginTop: Space.sm }]}>
              Commencez votre voyage culturel{"\n"}aujourd'hui.
            </Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View style={[s.formCard, Shadow.md, animStyle(formAnim, 30)]}>

            {/* Nom Complet */}
            <MInput
              label={t("Name") || "Nom Complet"}
              value={form.name}
              onChangeText={onChange("name")}
              placeholder="John Doe"
              autoCapitalize="words"
            />

            {/* Adresse Email */}
            <MInput
              label={t("signUp.emailLabel") || "Adresse Email"}
              value={form.email}
              onChangeText={onChange("email")}
              placeholder={t("signUp.emailPlaceholder") || "nom@exemple.com"}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Mot de passe */}
            <MInput
              label={t("signUp.passwordLabel") || "Mot de passe"}
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
              label={t("signUp.confirmPasswordLabel") || "Confirmer le mot de passe"}
              value={form.confirm}
              onChangeText={onChange("confirm")}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowConfirm(!showConfirm)}
            />
            <MatchIndicator password={form.password} confirm={form.confirm} t={t} />

            {/* CTA Button */}
            <MButton
              title={t("signUp.signUpButton") || "Créer mon compte"}
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={{ marginTop: Space.xl }}
            />

            {/* Divider */}
            <MDivider text={t("signUp.or") || "OU CONTINUER AVEC"} />

            {/* Social buttons */}
            <View style={s.socialRow}>
              <MSocialButton provider="google" onPress={() => handleSocialLogin("Google")} disabled={loading} />
              <View style={{ width: Space.md }} />
              <MSocialButton provider="apple" onPress={() => handleSocialLogin("Apple")} disabled={loading} />
            </View>
          </Animated.View>

          {/* ── Sign in link ── */}
          <Animated.View style={animStyle(footerAnim, 10)}>
            <MLinkText
              text={t("signUp.alreadyAccount") || "Vous avez déjà un compte ?"}
              linkText={t("signUp.signInLink") || "Se connecter"}
              onPress={() => router.replace("/(auth)/sign-in")}
            />
          </Animated.View>

          {/* ── Cultural card ── */}
          <Animated.View style={[{ width: "100%", marginTop: Space.md }, animStyle(footerAnim, 10)]}>
            <MCulturalCard
              title="Le saviez-vous ?"
              body={'"Mulema" signifie "Cœur" dans plusieurs langues bantoues. C\'est l\'essence même de notre communauté apprenante.'}
            />
          </Animated.View>

          {/* ── Terms ── */}
          <Animated.View style={[{ marginTop: Space.xl, paddingHorizontal: Space.lg }, animStyle(footerAnim, 5)]}>
            <Text style={[Typo.bodySm, { textAlign: "center", lineHeight: 18 }]}>
              En créant un compte, tu acceptes nos{" "}
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>Conditions d'utilisation</Text>
              {" "}et notre{" "}
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>Politique de confidentialité</Text>
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

  // Social row
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
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
});

export default SignUpScreen;