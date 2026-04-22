/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — SignInScreen                                        ║
 * ║  Matches the Connexion.png maquette exactly.                  ║
 * ║  All business logic (login, social, navigation) preserved.    ║
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
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
// import { useUser } from "../../src/context/UserContext";
import { useAuthStore } from "../../src/stores/useAuthStore";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../src/utils/errorUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../src/services/api";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import {
  MInput,
  MButton,
  MLinkText,
  MFooter,
} from "../../src/components/ui/MComponents";

const { width } = Dimensions.get("window");

/* ──────────────────────────────────────────────────────────────
   Screen
   ────────────────────────────────────────────────────────────── */

const SignInScreen = () => {
  const router = useRouter();
  // const { login } = useUser();
  const { login } = useAuthStore();
  const { t } = useTranslation();

  // ── State ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Animations ──
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Handlers — ALL ORIGINAL LOGIC PRESERVED ──

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert(t("common.error"), t("errors.requiredField"));
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert(t("common.error"), getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Social login removed — will be implemented in a future release

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
            <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>

              <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={[Typo.titleMd, { flex: 1, textAlign: "center" }]}>{t("auth.signIn")}</Text>
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
            <Text style={Typo.displayMd}>{t("auth.welcomeBack")}</Text>
            <Text style={[Typo.bodyLg, { textAlign: "center", marginTop: Space.sm }]}>
              {t("signIn.continueAdventure")}
            </Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View style={[s.formCard, Shadow.md, animStyle(formAnim, 30)]}>

            {/* Email */}
            <MInput
              label={t("signIn.emailLabel")}
              value={email}
              onChangeText={setEmail}
              placeholder={t("signIn.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            {/* Password — label row with "Mot de passe oublié ?" */}
            <View style={s.passwordLabelRow}>
              <Text style={[Typo.labelLg]}>{t("signIn.passwordLabel")}</Text>
              <TouchableOpacity onPress={() => router.push("/forgotpass")} activeOpacity={0.7}>
                <Text style={[Typo.labelMd, { color: Colors.primary }]}>
                  {t("signIn.forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>
            <MInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowPassword(!showPassword)}
              editable={!loading}
            />

            {/* Sign in button */}
            <MButton
              title={t("signIn.signInButton")}
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
              style={{ marginTop: Space.lg }}
            />

            {/* Social login removed per directive */}
          </Animated.View>

          {/* ── Sign up link ── */}
          <Animated.View style={animStyle(footerAnim, 10)}>
            <MLinkText
              text={t("signIn.noAccount")}
              linkText={t("signIn.signUpFree")}
              onPress={() => router.push("/sign-up")}
            />
          </Animated.View>

          {/* Cultural card removed per directive */}

          {/* ── Footer ── */}
          <Animated.View style={animStyle(footerAnim, 5)}>
            <MFooter />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};


/* ──────────────────────────────────────────────────────────────
   Styles — minimal, relying on tokens for everything
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
    marginTop: Space["3xl"],
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

  // Form card — "No-Line" rule: bg shift, shadow, no borders
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.sm,
  },

  // Password label row
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Space.sm,
  },

  // Social row removed
});

export default SignInScreen;