import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Dimensions,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const MIN_PASSWORD = 6;

// ── Floating bubble ────────────────────────────────────────────────────────
const FloatingBubble = ({ size, color, startX, delay, duration }) => {
  const y = useRef(new Animated.Value(height + size)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(height + size);
      opacity.setValue(0);
      scale.setValue(0.4);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, {
            toValue: -size * 2,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.25,
              duration: 600,
              useNativeDriver: true
            }),
            Animated.delay(duration - 1200),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true
            })
          ]),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true
          })
        ])
      ]).start(loop);
    };
    loop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: startX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY: y }, { scale }],
        opacity
      }}
    />
  );
};

// ── Wave dots loader ───────────────────────────────────────────────────────
const WaveDots = () => {
  const dots = [0, 1, 2, 3, 4];
  const anims = useRef(dots.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    dots.forEach((_, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(anims[i], {
            toValue: -8,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(anims[i], {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.delay((dots.length - i) * 120)
        ])
      ).start();
    });
  }, []);
  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
      {dots.map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#fff",
            transform: [{ translateY: anims[i] }]
          }}
        />
      ))}
    </View>
  );
};

// ── Password strength bar ──────────────────────────────────────────────────
<<<<<<< HEAD
const StrengthBar = ({ password, t }) => {
=======
const StrengthBar = ({ password }) => {
>>>>>>> feat/settings-page
  const anim = useRef(new Animated.Value(0)).current;

  const getStrength = (p) => {
    if (!p) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
<<<<<<< HEAD
    if (score <= 1)
      return { score: 1, label: t("signUp.weak"), color: "#F44336" };
    if (score <= 3)
      return { score: 3, label: t("signUp.medium"), color: "#E57373" };
    return { score: 5, label: t("signUp.strong"), color: "#D32F2F" };
=======
    if (score <= 1) return { score: 1, label: "Faible", color: "#F44336" };
    if (score <= 3) return { score: 3, label: "Moyen", color: "#E57373" };
    return { score: 5, label: "Fort", color: "#D32F2F" };
>>>>>>> feat/settings-page
  };

  const { score, label, color } = getStrength(password);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: score / 5,
      tension: 60,
      friction: 10,
      useNativeDriver: false
    }).start();
  }, [score]);

  if (!password) return null;

  return (
    <View style={{ marginTop: 8, marginBottom: 4 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6
        }}
      >
        <Text style={{ color: "#AAAAAA", fontSize: 11 }}>
<<<<<<< HEAD
          {t ? t("signUp.passwordStrength") : "Password strength"}
=======
          Force du mot de passe
>>>>>>> feat/settings-page
        </Text>
        <Text style={{ color, fontSize: 11, fontWeight: "700" }}>{label}</Text>
      </View>
      <View
        style={{
          height: 4,
          backgroundColor: "rgba(180,60,60,0.1)",
          borderRadius: 2,
          overflow: "hidden"
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            borderRadius: 2,
            backgroundColor: color,
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"]
            })
          }}
        />
      </View>
    </View>
  );
};

// ── Orbiting dot ──────────────────────────────────────────────────────────
const OrbitingDot = () => {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        s.orbit,
        {
          transform: [
            {
              rotate: rot.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"]
              })
            }
          ]
        }
      ]}
    >
      <View style={s.orbitDot} />
    </Animated.View>
  );
};

// ── Field component ────────────────────────────────────────────────────────
const Field = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  rightIcon,
  onRightPress,
  autoCapitalize,
  children
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(borderAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: false
    }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.spring(borderAnim, {
      toValue: 0,
      tension: 80,
      friction: 8,
      useNativeDriver: false
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(180,60,60,0.15)", "#D32F2F"]
  });
  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(180,60,60,0.04)", "rgba(211,47,47,0.07)"]
  });

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <Animated.View
        style={[s.inputRow, { borderColor, backgroundColor: bgColor }]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={focused ? "#D32F2F" : "#BDBDBD"}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={[s.input, rightIcon && { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor='#C0B8B8'
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize || "none"}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon}
              size={19}
              color={focused ? "#D32F2F" : "#BDBDBD"}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {children}
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
const SignUpScreen = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [ui, setUi] = useState({
    showPassword: false,
    showConfirm: false,
    loading: false
  });

  const onChange = (key) => (val) => setForm((s) => ({ ...s, [key]: val }));

  // Mount animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.03,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const validate = () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirm
    )
<<<<<<< HEAD
      return t("signUp.validation.requiredFields");
    if (/\s/.test(form.username)) return t("signUp.validation.noSpaces");
    if (form.password.length < MIN_PASSWORD)
      return t("signUp.validation.passwordMinLength", { min: MIN_PASSWORD });
    if (form.password !== form.confirm)
      return t("signUp.validation.passwordMismatch");
=======
      return "Remplis tous les champs obligatoires.";
    if (/\s/.test(form.username))
      return "Le nom d'utilisateur ne doit pas contenir d'espaces.";

    if (form.password.length < MIN_PASSWORD)
      return `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;

    if (form.password !== form.confirm)
      return "Les mots de passe ne correspondent pas.";

>>>>>>> feat/settings-page
    return null;
  };

  const handleSignUp = useCallback(async () => {
    const error = validate();
<<<<<<< HEAD
    if (error) return Alert.alert(t("signUp.error.title"), error);
=======
    if (error) return Alert.alert("Erreur", error);
>>>>>>> feat/settings-page
    setUi((s) => ({ ...s, loading: true }));
    try {
      await api.post("/auth/register", {
        email: form.email,
        username: form.username,
        name: form.username,
        password: form.password
      });
<<<<<<< HEAD
      Alert.alert(t("signUp.success.title"), t("signUp.success.message"));
=======
      Alert.alert(
        "Inscription réussie !",
        "Un code de vérification a été envoyé à votre email."
      );

>>>>>>> feat/settings-page
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: form.email, flow: "verify" }
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
<<<<<<< HEAD
        t("signUp.error.creationFailed");
      Alert.alert(t("signUp.error.title"), message);
=======
        "Erreur lors de la création du compte.";
      Alert.alert("Erreur", message);
>>>>>>> feat/settings-page
    } finally {
      setUi((s) => ({ ...s, loading: false }));
    }
  }, [form, router]);

  const bubbles = [
    {
      size: 55,
      color: "#FFCDD2",
      startX: width * 0.05,
      delay: 0,
      duration: 7200
    },
    {
      size: 38,
      color: "#EF9A9A",
      startX: width * 0.28,
      delay: 1800,
      duration: 8800
    },
    {
      size: 70,
      color: "#FFCDD2",
      startX: width * 0.58,
      delay: 600,
      duration: 9200
    },
    {
      size: 28,
      color: "#EF9A9A",
      startX: width * 0.78,
      delay: 2800,
      duration: 7800
    },
    {
      size: 45,
      color: "#FFCDD2",
      startX: width * 0.9,
      delay: 300,
      duration: 8200
    }
  ];

  const steps = [
<<<<<<< HEAD
    {
      label: t("signUp.steps.profile"),
      icon: "person",
      done: form.username.length > 0
    },
    {
      label: t("signUp.steps.email"),
      icon: "mail",
      done: form.email.includes("@")
    },
    {
      label: t("signUp.steps.security"),
=======
    { label: "Profil", icon: "person", done: form.username.length > 0 },
    { label: "Email", icon: "mail", done: form.email.includes("@") },
    {
      label: "Sécurité",
>>>>>>> feat/settings-page
      icon: "shield-checkmark",
      done: form.password.length >= 6 && form.password === form.confirm
    }
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle='dark-content' />
      {/* Off-white warm background */}
      <LinearGradient
        colors={["#FAF7F5", "#F5F0EC", "#F0E9E4"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents='none'
      />
      {bubbles.map((b, i) => (
        <FloatingBubble key={i} {...b} />
      ))}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* Logo */}
          <Animated.View
            style={[
              s.logoWrap,
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoScale },
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-24, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={s.logoRing}>
              <View style={s.logoInner}>
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={s.logo}
                  contentFit='contain'
                />
              </View>
            </View>
            <OrbitingDot />
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0]
                  })
                }
              ],
              alignItems: "center",
              marginBottom: 20
            }}
          >
            <Text style={s.brand}>mulema</Text>
            <View style={s.pillBadge}>
<<<<<<< HEAD
              <Text style={s.pillText}>✨ {t("signUp.subtitle")}</Text>
=======
              <Text style={s.pillText}>✨ Rejoins la communauté</Text>
>>>>>>> feat/settings-page
            </View>
          </Animated.View>

          {/* Step progress */}
          <Animated.View
            style={[
              s.stepsRow,
              {
                opacity: stepAnim,
                transform: [
                  {
                    translateY: stepAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <View style={s.stepItem}>
                  <View style={[s.stepIcon, step.done && s.stepIconDone]}>
                    <Ionicons
                      name={step.done ? "checkmark" : step.icon}
                      size={14}
                      color={step.done ? "#fff" : "#BDBDBD"}
                    />
                  </View>
                  <Text
                    style={[s.stepLabel, step.done && { color: "#D32F2F" }]}
                  >
                    {step.label}
                  </Text>
                </View>
                {i < steps.length - 1 && (
                  <View
                    style={[s.stepLine, steps[i + 1].done && s.stepLineDone]}
                  />
                )}
              </React.Fragment>
            ))}
          </Animated.View>

          {/* Form card */}
          <Animated.View
            style={[
              s.card,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Field
<<<<<<< HEAD
              label={t("signUp.usernameLabel")}
              icon='person-outline'
              placeholder={t("signUp.usernamePlaceholder")}
=======
              label="Nom d'utilisateur"
              icon='person-outline'
              placeholder='ex: ambe_bassa'
>>>>>>> feat/settings-page
              value={form.username}
              onChangeText={onChange("username")}
            />

            <Field
<<<<<<< HEAD
              label={t("signUp.emailLabel")}
              icon='mail-outline'
              placeholder={t("signUp.emailPlaceholder")}
=======
              label='Adresse e-mail'
              icon='mail-outline'
              placeholder='exemple@email.com'
>>>>>>> feat/settings-page
              value={form.email}
              onChangeText={onChange("email")}
              keyboardType='email-address'
            />

            <Field
<<<<<<< HEAD
              label={t("signUp.passwordLabel")}
              icon='lock-closed-outline'
              placeholder={t("signUp.passwordPlaceholder")}
=======
              label='Mot de passe'
              icon='lock-closed-outline'
              placeholder='••••••••'
>>>>>>> feat/settings-page
              value={form.password}
              onChangeText={onChange("password")}
              secureTextEntry={!ui.showPassword}
              rightIcon={ui.showPassword ? "eye-outline" : "eye-off-outline"}
              onRightPress={() =>
                setUi((s) => ({ ...s, showPassword: !s.showPassword }))
              }
            >
<<<<<<< HEAD
              <StrengthBar password={form.password} t={t} />
            </Field>

            <Field
              label={t("signUp.confirmPasswordLabel")}
              icon='shield-checkmark-outline'
              placeholder={t("signUp.confirmPasswordPlaceholder")}
=======
              <StrengthBar password={form.password} />
            </Field>

            <Field
              label='Confirmer le mot de passe'
              icon='shield-checkmark-outline'
              placeholder='••••••••'
>>>>>>> feat/settings-page
              value={form.confirm}
              onChangeText={onChange("confirm")}
              secureTextEntry={!ui.showConfirm}
              rightIcon={ui.showConfirm ? "eye-outline" : "eye-off-outline"}
              onRightPress={() =>
                setUi((s) => ({ ...s, showConfirm: !s.showConfirm }))
              }
            />

            {/* Match indicator */}
            {form.confirm.length > 0 && (
              <View
                style={[
                  s.matchRow,
                  {
                    borderColor:
                      form.password === form.confirm
                        ? "rgba(211,47,47,0.25)"
                        : "rgba(244,67,54,0.25)"
                  }
                ]}
              >
                <Ionicons
                  name={
                    form.password === form.confirm
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={14}
                  color={form.password === form.confirm ? "#D32F2F" : "#F44336"}
                />
                <Text
                  style={{
                    color:
                      form.password === form.confirm ? "#D32F2F" : "#F44336",
                    fontSize: 12,
                    marginLeft: 6
                  }}
                >
                  {form.password === form.confirm
<<<<<<< HEAD
                    ? t("signUp.validation.passwordsMatch")
                    : t("signUp.validation.passwordsDoNotMatch")}
=======
                    ? "Les mots de passe correspondent"
                    : "Les mots de passe ne correspondent pas"}
>>>>>>> feat/settings-page
                </Text>
              </View>
            )}

            {/* CTA */}
            <Animated.View
              style={{
                transform: [{ scale: ui.loading ? 1 : buttonPulse }],
                marginTop: 8
              }}
            >
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={ui.loading}
                activeOpacity={0.85}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={
                    ui.loading ? ["#E0E0E0", "#E0E0E0"] : ["#E53935", "#B71C1C"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.btn}
                >
                  {ui.loading ? (
                    <WaveDots />
                  ) : (
                    <>
<<<<<<< HEAD
                      <Text style={s.btnText}>{t("signUp.signUpButton")}</Text>
=======
                      <Text style={s.btnText}>Créer mon compte</Text>
>>>>>>> feat/settings-page
                      <Ionicons
                        name='sparkles'
                        size={18}
                        color='#fff'
                        style={{ marginLeft: 8 }}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
<<<<<<< HEAD
              <Text style={s.dividerText}>{t("signUp.or")}</Text>
=======
              <Text style={s.dividerText}>ou</Text>
>>>>>>> feat/settings-page
              <View style={s.dividerLine} />
            </View>

            {/* Sign in */}
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/sign-in")}
              activeOpacity={0.8}
              style={s.signInBtn}
            >
              <Text style={s.signInText}>
<<<<<<< HEAD
                {t("signUp.alreadyAccount")}
                {"  "}
                <Text style={s.signInLink}>{t("signUp.signInLink")}</Text>
=======
                Déjà un compte ?{"  "}
                <Text style={s.signInLink}>Se connecter</Text>
>>>>>>> feat/settings-page
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Terms note */}
          <Animated.View
            style={{
              opacity: formAnim,
              alignItems: "center",
              paddingHorizontal: 20,
              marginTop: 8
            }}
          >
            <Text
              style={{
                color: "#AAAAAA",
                fontSize: 11,
                textAlign: "center",
                lineHeight: 17
              }}
            >
              En créant un compte, tu acceptes nos{" "}
              <Text style={{ color: "#D32F2F" }}>
                Conditions d&apos;utilisation
              </Text>{" "}
<<<<<<< HEAD
              <Text style={{ color: "#D32F2F" }}>
                Conditions d&apos;utilisation
              </Text>{" "}
=======
>>>>>>> feat/settings-page
              et notre{" "}
              <Text style={{ color: "#D32F2F" }}>
                Politique de confidentialité
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 40,
    paddingHorizontal: 24
  },

  // Logo
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative"
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(211,47,47,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(211,47,47,0.07)"
  },
  logoInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  logo: { width: 60, height: 60 },
  orbit: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    top: -6,
    left: -6,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  orbitDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#D32F2F",
    marginTop: 2,
    shadowColor: "#D32F2F",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6
  },

  // Text
  brand: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 36,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 3,
    marginBottom: 10
  },
  pillBadge: {
    backgroundColor: "rgba(211,47,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5
  },
  pillText: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5
  },

  // Steps
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 10
  },
  stepItem: { alignItems: "center", gap: 5 },
  stepIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(180,60,60,0.07)",
    borderWidth: 1.5,
    borderColor: "rgba(180,60,60,0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  stepIconDone: {
    backgroundColor: "#D32F2F",
    borderColor: "#D32F2F",
    shadowColor: "#D32F2F",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4
  },
  stepLabel: { color: "#BDBDBD", fontSize: 10, fontWeight: "600" },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(180,60,60,0.1)",
    marginHorizontal: 6,
    marginBottom: 14,
    borderRadius: 1
  },
  stepLineDone: { backgroundColor: "#D32F2F" },

  // Card
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.1)",
    padding: 24,
    marginBottom: 16
  },

  // Fields
  label: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 7,
    textTransform: "uppercase"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  input: { flex: 1, color: "#1A1A1A", fontSize: 15, fontWeight: "500" },

  // Match
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(211,47,47,0.04)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: -6,
    marginBottom: 10
  },

  // Button
  btn: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D32F2F",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(180,60,60,0.12)" },
  dividerText: { color: "#BDBDBD", fontSize: 13, marginHorizontal: 12 },

  // Sign in
  signInBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(211,47,47,0.15)",
    backgroundColor: "rgba(211,47,47,0.04)"
  },
  signInText: { color: "#888", fontSize: 14 },
  signInLink: { color: "#D32F2F", fontWeight: "700" }
});

export default SignUpScreen;
