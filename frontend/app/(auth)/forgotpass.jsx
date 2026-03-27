/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — ForgotPasswordScreen                                ║
 * ║  Matches the mot_de_passe.png maquette.                       ║
 * ║  Two states: email form → sent confirmation.                  ║
 * ║  All business logic (API call, navigation) preserved.         ║
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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import {
  MInput,
  MButton,
  MCulturalCard,
} from "../../src/components/ui/MComponents";

/* ══════════════════════════════════════════════════════════════
   Sent State — Success animation + continue flow
   ══════════════════════════════════════════════════════════════ */

const SentState = ({ email, onContinue, onChangeEmail }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ alignItems: "center", transform: [{ scale: scaleAnim }], opacity: scaleAnim }}>
      {/* Success circle */}
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={44} color={Colors.onPrimary} />
      </View>

      <Text style={[Typo.headlineMd, { marginBottom: Space.md, textAlign: "center" }]}>
        Code envoyé !
      </Text>

      {/* Email badge */}
      <View style={styles.emailBadge}>
        <Ionicons name="mail" size={14} color={Colors.primary} />
        <Text style={[Typo.labelLg, { color: Colors.primary, marginLeft: Space.sm, flex: 1 }]} numberOfLines={1}>
          {email}
        </Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
        <Text style={[Typo.bodyMd, { textAlign: "center", marginBottom: Space["2xl"], lineHeight: 22 }]}>
          Ouvre ta boîte mail et copie le code reçu.{"\n"}Le code expire dans{" "}
          <Text style={{ color: Colors.primaryContainer, fontWeight: "700" }}>10 minutes</Text>.
        </Text>

        <MButton
          title="Saisir le code"
          onPress={onContinue}
          icon="arrow-forward"
        />

        <TouchableOpacity onPress={onChangeEmail} activeOpacity={0.7} style={styles.changeEmailBtn}>
          <Ionicons name="pencil-outline" size={14} color={Colors.textTertiary} />
          <Text style={[Typo.bodySm, { color: Colors.textTertiary, marginLeft: Space.xs }]}>
            Changer d'adresse email
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

/* ══════════════════════════════════════════════════════════════
   Security Tip Card — with shield icon
   ══════════════════════════════════════════════════════════════ */

const SecurityCard = () => (
  <View style={[styles.securityCard, Shadow.sm]}>
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <View style={styles.shieldIcon}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.onSurfaceVariant} />
      </View>
      <View style={{ flex: 1, marginLeft: Space.md }}>
        <Text style={[Typo.labelSm, { color: Colors.onSurface, marginBottom: Space.xs }]}>
          CONSEIL DE SÉCURITÉ
        </Text>
        <Text style={[Typo.bodyMd, { color: Colors.onSurfaceVariant, lineHeight: 21 }]}>
          Ne partagez jamais vos codes de récupération. L'équipe Mulema ne vous demandera jamais votre mot de passe.
        </Text>
      </View>
    </View>
    {/* Decorative blob */}
    <View style={styles.securityBlob} />
  </View>
);

/* ══════════════════════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════════════════════ */

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ── State ──
  const [email, setEmail] = useState(params?.email || "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // ── Animations ──
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const heroScale  = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(heroAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(footerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Handlers — ORIGINAL LOGIC PRESERVED ──

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Email invalide", "Veuillez saisir une adresse email valide.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/request-password-reset", { email: email.trim() });
      setSent(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Impossible d'envoyer le code.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: "/verify-email",
      params: { email: email.trim(), flow: "reset" },
    });
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
            <View style={{ width: 24 }} />
          </View>

          {/* ── Hero illustration ── */}
          <Animated.View style={[s.heroWrap, { opacity: heroAnim, transform: [{ scale: heroScale }] }]}>
            <View style={s.heroCard}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={s.heroImg}
                contentFit="contain"
              />
            </View>
            {/* Key icon badge */}
            <View style={s.keyBadge}>
              <Ionicons name="key" size={18} color={Colors.onPrimary} />
            </View>
          </Animated.View>

          {/* ── Title block ── */}
          <Animated.View style={[s.titleBlock, animStyle(titleAnim, 15)]}>
            <Text style={Typo.displayMd}>Oups, vous avez{"\n"}oublié ?</Text>
            <Text style={[Typo.bodyLg, { textAlign: "center", marginTop: Space.md, lineHeight: 24 }]}>
              Pas de souci ! Entrez l'adresse e-mail associée à votre compte Mulema et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>
          </Animated.View>

          {/* ── Form / Sent card ── */}
          <Animated.View style={[s.formCard, Shadow.md, animStyle(formAnim, 30)]}>
            {!sent ? (
              <>
                {/* Email input */}
                <MInput
                  label="E-MAIL"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nom@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Send button */}
                <MButton
                  title="Envoyer le code"
                  onPress={handleSend}
                  loading={loading}
                  disabled={loading || !email.includes("@")}
                  // icon="arrow-forward"
                  style={{ marginTop: Space.sm }}
                />
              </>
            ) : (
              <SentState
                email={email}
                onContinue={handleContinue}
                onChangeEmail={() => setSent(false)}
              />
            )}
          </Animated.View>

          {/* ── Security card ── */}
          {!sent && (
            <Animated.View style={[{ width: "100%", marginTop: Space.lg }, animStyle(footerAnim, 10)]}>
              <SecurityCard />
            </Animated.View>
          )}

          {/* ── Back to login link ── */}
          <Animated.View style={[{ marginTop: Space["2xl"] }, animStyle(footerAnim, 5)]}>
            <MButton
              title="Retour à la connexion"
              variant="tertiary"
              onPress={() => router.replace("/(auth)/sign-in")}
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

  // Hero illustration
  heroWrap: {
    alignItems: "center",
    marginTop: Space.xl,
    marginBottom: Space["3xl"],
    position: "relative",
  },
  heroCard: {
    width: 160,
    height: 160,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.lg,
  },
  heroImg: {
    width: 100,
    height: 100,
  },
  keyBadge: {
    position: "absolute",
    top: -6,
    right: -6,
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
    paddingHorizontal: Space.sm,
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
   Internal component styles
   ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  // Success circle
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Space.lg,
    ...Shadow.primaryGlow,
  },

  // Email badge
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "12",
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    marginBottom: Space.lg,
    maxWidth: "100%",
  },

  // Change email
  changeEmailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Space.md,
    marginTop: Space.sm,
  },

  // Security card
  securityCard: {
    backgroundColor: Colors.secondaryFixed,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius["2xl"],
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.md,
    padding: Space["2xl"],
    overflow: "hidden",
    position: "relative",
  },
  shieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  securityBlob: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondaryContainer + "50",
  },
});

export default ForgotPasswordScreen;