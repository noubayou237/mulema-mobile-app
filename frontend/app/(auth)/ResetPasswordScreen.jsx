/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — ResetPasswordScreen                                 ║
 * ║  Matches the renistialler_le_mot_de_passe_.png maquette.      ║
 * ║  All business logic (API, validation, navigation) preserved.  ║
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
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import api from "../../services/api";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { MInput, MButton } from "../../src/components/ui/MComponents";

/* ══════════════════════════════════════════════════════════════
   Segmented Strength Bar — 4 segments like the maquette
   ══════════════════════════════════════════════════════════════ */

const SegmentedStrengthBar = ({ password }) => {
  const getStrength = (p) => {
    if (!p) return { filled: 0, label: "", color: Colors.surfaceVariant };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { filled: 1, label: "FAIBLE", color: Colors.error };
    if (score <= 2) return { filled: 2, label: "MOYEN", color: Colors.secondaryContainer };
    if (score <= 3) return { filled: 3, label: "BON", color: Colors.primaryContainer };
    return { filled: 4, label: "EXCELLENT", color: Colors.primary };
  };

  const { filled, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <View style={{ marginBottom: Space.lg }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Space.sm }}>
        <Text style={[Typo.labelSm]}>FORCE DU MOT DE PASSE</Text>
        <Text style={[Typo.labelSm, { color, textTransform: "uppercase" }]}>{label}</Text>
      </View>
      <View style={styles.segmentRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { backgroundColor: i < filled ? color : Colors.surfaceVariant },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   Tip Card — "Astuce" with bulb icon
   ══════════════════════════════════════════════════════════════ */

const TipCard = ({ text }) => (
  <View style={[styles.tipCard, Shadow.sm]}>
    <View style={styles.tipIcon}>
      <Ionicons name="bulb" size={18} color={Colors.secondary} />
    </View>
    <Text style={[Typo.bodyMd, { flex: 1, color: Colors.onSurface, lineHeight: 21 }]}>
      {text}
    </Text>
  </View>
);

/* ══════════════════════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════════════════════ */

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const email = typeof params?.email === "string" ? params.email : "";
  const otpCode = typeof params?.otpCode === "string" ? params.otpCode : "";

  // ── State ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Animations ──
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.timing(heroAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Submit — ORIGINAL LOGIC PRESERVED ──
  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert(t("common.error"), t("auth.requiredFields"));
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert(t("common.error"), t("auth.passwordMismatch"));
    }
    if (newPassword.length < 8) {
      return Alert.alert(t("common.error"), t("auth.passwordMinLength", { min: 8 }));
    }
    if (!email || !otpCode) {
      return Alert.alert(t("common.error"), t("auth.missingInfo"));
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otpCode,
        newPassword,
      });
      Alert.alert(t("common.success"), t("auth.passwordResetSuccess"));
      router.replace("/(auth)/sign-in");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t("auth.passwordResetError");
      Alert.alert(t("common.error"), msg);
    } finally {
      setLoading(false);
    }
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
          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={[Typo.titleMd, { flex: 1, textAlign: "center" }]}>Account Recovery</Text>
            <Text style={[Typo.titleMd, { color: Colors.primary, fontWeight: "800" }]}>Mulema</Text>
          </View>

          {/* ── Hero gradient card ── */}
          <Animated.View style={[s.heroWrap, animStyle(heroAnim, 15)]}>
            <LinearGradient
              colors={[Colors.primaryContainer, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroGradient}
            >
              {/* Lock reset icon */}
              <View style={s.heroIconCircle}>
                <Ionicons name="lock-closed" size={36} color={Colors.onPrimary} />
                {/* Circular arrow overlay */}
                <View style={s.heroArrowWrap}>
                  <Ionicons name="refresh" size={52} color={Colors.onPrimary + "40"} />
                </View>
              </View>
              {/* Decorative dots */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    s.heroDot,
                    {
                      left: `${15 + i * 14}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      opacity: 0.15 + (i % 3) * 0.1,
                      width: 6 + (i % 2) * 4,
                      height: 6 + (i % 2) * 4,
                      borderRadius: 5,
                    },
                  ]}
                />
              ))}
            </LinearGradient>
          </Animated.View>

          {/* ── Title block ── */}
          <Animated.View style={[s.titleBlock, animStyle(titleAnim, 12)]}>
            <Text style={[Typo.displayMd, { textAlign: "left" }]}>Nouveau mot de passe</Text>
            <Text style={[Typo.bodyLg, { marginTop: Space.sm }]}>
              Sécurisez votre compte avec un mot de passe robuste.
            </Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View style={[s.formCard, Shadow.md, animStyle(formAnim, 25)]}>

            {/* New password */}
            <MInput
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowPassword(!showPassword)}
            />

            {/* Segmented strength bar */}
            <SegmentedStrengthBar password={newPassword} />

            {/* Confirm password */}
            <MInput
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              rightIcon={showConfirm ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowConfirm(!showConfirm)}
            />

            {/* Tip card */}
            <TipCard text="Astuce : Utilisez un mélange de lettres, de chiffres et de symboles pour une sécurité maximale." />

            {/* Step indicator */}
            <Text style={[Typo.labelSm, { textAlign: "center", marginTop: Space.lg, color: Colors.textTertiary }]}>
              ÉTAPE DE SÉCURITÉ • 2 SUR 2
            </Text>
          </Animated.View>

          {/* ── Submit button ── */}
          <Animated.View style={[{ width: "100%", marginTop: Space.xl }, animStyle(footerAnim, 10)]}>
            <MButton
              title="Réinitialiser"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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

  // Hero gradient card
  heroWrap: {
    marginTop: Space.lg,
    marginBottom: Space["3xl"],
  },
  heroGradient: {
    width: "100%",
    height: 180,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.onPrimary + "18",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroArrowWrap: {
    position: "absolute",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  heroDot: {
    position: "absolute",
    backgroundColor: Colors.onPrimary,
  },

  // Title
  titleBlock: {
    marginBottom: Space["2xl"],
  },

  // Form card
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Space["2xl"],
    marginBottom: Space.sm,
  },
});

/* ──────────────────────────────────────────────────────────────
   Component styles
   ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  // Segmented strength bar
  segmentRow: {
    flexDirection: "row",
    gap: Space.sm,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },

  // Tip card
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.secondaryFixed,
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginTop: Space.sm,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Space.md,
  },
});