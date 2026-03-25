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
  Dimensions,
  StatusBar,
  ActivityIndicator
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";
import SocialButtons from "../../src/components/SocialButtons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

const { width, height } = Dimensions.get("window");

// ── Floating bubble component ──────────────────────────────────────────────
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
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true
            })
          ])
        ])
      ]).start(loop);
    };
    loop();
  }, [delay, duration, size, y, opacity, scale]);

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

// ── Animated wave dots ─────────────────────────────────────────────────────
const WaveDots = () => {
  const dots = [0, 1, 2, 3, 4];
  const anims = useRef(dots.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = dots.map((_, i) =>
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
      )
    );
    Animated.stagger(0, animations).start();
  }, [anims, dots]);

  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
      {dots.map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#FFFFFF",
            transform: [{ translateY: anims[i] }]
          }}
        />
      ))}
    </View>
  );
};

// ── Field component ────────────────────────────────────────────────────────────
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
  autoCapitalize
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
          size={18}
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
              size={20}
              color={focused ? "#D32F2F" : "#BDBDBD"}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
const SignInScreen = () => {
  const router = useRouter();
  const { login, setUserData } = useUser();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // Handle successful social login
  const handleSocialLoginSuccess = async (socialData) => {
    try {
      setSocialLoading(true);

      // Check if there was an error in the social login
      if (!socialData?.success) {
        Alert.alert(
          t("common.error"),
          socialData?.error || t("auth.socialLoginError")
        );
        return;
      }

      // The backend should return accessToken and refreshToken
      if (socialData?.accessToken) {
        const STORAGE_KEY = "userSession";
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            accessToken: socialData.accessToken,
            refreshToken: socialData.refreshToken
          })
        );
        // Get user data
        const me = await api.get("/auth/me");
        router.replace("/(tabs)/home");
      } else {
        // No accessToken means the backend didn't respond properly
        Alert.alert(
          t("common.error"),
          "Unable to complete login. Please make sure the backend server is running."
        );
      }
    } catch (error) {
      console.error("Social login error:", error);
      Alert.alert(t("common.error"), t("auth.socialLoginError"));
    } finally {
      setSocialLoading(false);
    }
  };

  // Mount animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 500,
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
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();
  }, [buttonPulse, formAnim, logoAnim, logoScale, subtitleAnim, titleAnim]);

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert(t("common.error"), t("errors.requiredField"));
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("signIn.signInFailed");
      Alert.alert(t("common.error"), msg);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    if (!email || !email.includes("@")) {
      Alert.alert(t("signIn.invalidEmail"), t("signIn.enterValidEmail"));
      return;
    }
    router.push({ pathname: "/(auth)/ResetPasswordScreen", params: { email } });
  };

  const bubbles = [
    {
      size: 60,
      color: "#FFCDD2",
      startX: width * 0.05,
      delay: 0,
      duration: 7000
    },
    {
      size: 40,
      color: "#EF9A9A",
      startX: width * 0.25,
      delay: 1500,
      duration: 8500
    },
    {
      size: 80,
      color: "#FFCDD2",
      startX: width * 0.55,
      delay: 800,
      duration: 9000
    },
    {
      size: 30,
      color: "#EF9A9A",
      startX: width * 0.75,
      delay: 2500,
      duration: 7500
    },
    {
      size: 50,
      color: "#FFCDD2",
      startX: width * 0.88,
      delay: 400,
      duration: 8000
    },
    {
      size: 35,
      color: "#EF9A9A",
      startX: width * 0.42,
      delay: 3000,
      duration: 6500
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

      {/* Floating bubbles */}
      {bubbles.map((b, i) => (
        <FloatingBubble key={i} {...b} />
      ))}

      <View style={s.meshOverlay} pointerEvents='none' />

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
          {/* ── Logo ── */}
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
                      outputRange: [-30, 0]
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

          {/* ── Title ── */}
          <Animated.View
            style={{
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ],
              alignItems: "center",
              marginBottom: 6
            }}
          >
            <Text style={s.brand}>Connexion</Text>
          </Animated.View>

          {/* ── Subtitle ── */}
          <Animated.View
            style={{
              opacity: subtitleAnim,
              transform: [
                {
                  translateY: subtitleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0]
                  })
                }
              ],
              alignItems: "center",
              marginBottom: 36
            }}
          >
            <View style={s.pillBadge}>
              <Text style={s.pillText}>🌍 {t("signIn.languages")}</Text>
            </View>
<<<<<<< HEAD
            <Text style={s.title}>
              Connectez-vous pour continuer votre aventure
            </Text>
=======
            <Text style={s.subtitle}>{t("signIn.subtitle")}</Text>
>>>>>>> b81adc9e1964d4ad03460f86d72c355383b87893
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View
            style={[
              s.card,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {/* Email */}
            <Field
              label={t("signIn.emailLabel")}
              icon='mail-outline'
              value={email}
              onChangeText={setEmail}
              placeholder={t("signIn.emailPlaceholder")}
              keyboardType='email-address'
              autoCapitalize='none'
            />

            {/* Password */}
            <Field
              label={t("signIn.passwordLabel")}
              icon='lock-closed-outline'
              value={password}
              onChangeText={setPassword}
              placeholder={t("signIn.passwordPlaceholder")}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
              onRightPress={() => setShowPassword(!showPassword)}
            />

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => router.push("/forgotpass")}
              activeOpacity={0.8}
              style={[s.signUpBtn, { alignSelf: "flex-end", marginBottom: 24 }]}
            >
              <Text style={s.forgot}>{t("signIn.forgotPassword")}</Text>
            </TouchableOpacity>

            {/* Sign in button */}
            <Animated.View
              style={{ transform: [{ scale: loading ? 1 : buttonPulse }] }}
            >
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={loading}
                activeOpacity={0.85}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={
                    loading ? ["#E0E0E0", "#E0E0E0"] : ["#E53935", "#B71C1C"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.btn}
                >
                  {loading ? (
                    <WaveDots />
                  ) : (
                    <>
<<<<<<< HEAD
                      <Text style={s.btnText}>Se connecter</Text>
                      {/* <Ionicons
=======
                      <Text style={s.btnText}>{t("signIn.signInButton")}</Text>
                      <Ionicons
>>>>>>> b81adc9e1964d4ad03460f86d72c355383b87893
                        name='arrow-forward'
                        size={20}
                        color='#fff'
                        style={{ marginLeft: 8 }}
                      /> */}
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Social Login Buttons */}
            <SocialButtons onSuccess={handleSocialLoginSuccess} />

            {/* Sign up */}
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              activeOpacity={0.8}
              style={s.signUpBtn}
            >
              <Text style={s.signUpText}>
                {t("signIn.noAccount")}{" "}
                <Text style={s.signUpLink}>{t("signIn.signUpFree")}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom languages strip */}
          <Animated.View style={[s.langStrip, { opacity: formAnim }]}>
            {["Ewondo", "Bassa", "Fulfulde", "Duala", "Ghomala"].map(
              (lang, i) => (
                <View key={i} style={s.langChip}>
                  <Text style={s.langChipText}>{lang}</Text>
                </View>
              )
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  const angle = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });
  return (
    <Animated.View style={[s.orbit, { transform: [{ rotate: angle }] }]}>
      <View style={s.orbitDot} />
    </Animated.View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    opacity: 0.04
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 40,
    paddingHorizontal: 24
  },

  // Logo
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative"
  },
  logoRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: "rgba(211,47,47,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(211,47,47,0.07)"
  },
  logoInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  logo: { width: 68, height: 68 },
  orbit: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -6,
    left: -6,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  orbitDot: {
    width: 10,
    height: 10,
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
    fontFamily: Platform.OS === "ios" ? "nunito" : "sans-serif",
    fontSize: 29,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0,
    marginBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: "300",
    color: "#2C2C2C",
    marginBottom: 5,
    textAlign: "center"
  },
  subtitle: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 22
  },
  pillBadge: {
    backgroundColor: "rgba(211,47,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 10
  },
  pillText: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5
  },

  // Card
  card: {
    width: "100%",
    // backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.1)",
    padding: 24,
    marginBottom: 20
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  label: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(180,60,60,0.04)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(180,60,60,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  inputFocused: {
    borderColor: "#D32F2F",
    backgroundColor: "rgba(211,47,47,0.06)",
    shadowColor: "#D32F2F",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  input: { flex: 1, color: "#1A1A1A", fontSize: 15, fontWeight: "500" },

  // Forgot
  forgot: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "600",
    paddingInline: 10
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
    marginVertical: 20
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(180,60,60,0.12)" },
  dividerText: { color: "#BDBDBD", fontSize: 13, marginHorizontal: 12 },

  // Sign up
  signUpBtn: {
    alignItems: "center",
    paddingVertical: 14,
    paddingInline: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(211,47,47,0.15)",
    backgroundColor: "rgba(211,47,47,0.04)"
  },
  signUpText: { color: "#888", fontSize: 14 },
  signUpLink: { color: "#D32F2F", fontWeight: "700" },

  // Lang strip
  langStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10
  },
  langChip: {
    backgroundColor: "rgba(211,47,47,0.06)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.12)"
  },
  langChipText: { color: "#888", fontSize: 11, fontWeight: "500" }
});

export default SignInScreen;
