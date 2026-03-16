import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";

const { width, height } = Dimensions.get("window");
const RESEND_COOLDOWN = 60;
const STORAGE_KEY = "userSession";

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

// ── OTP digit box ──────────────────────────────────────────────────────────
const DigitBox = ({ digit, focused, index }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.08,
          tension: 80,
          friction: 6,
          useNativeDriver: true
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: digit ? 1.02 : 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [focused, digit]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [
      digit ? "rgba(211,47,47,0.5)" : "rgba(180,60,60,0.15)",
      "#D32F2F"
    ]
  });
  const bgColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [
      digit ? "rgba(211,47,47,0.07)" : "rgba(180,60,60,0.04)",
      "rgba(211,47,47,0.1)"
    ]
  });

  return (
    <Animated.View
      style={[
        s.digitBox,
        { transform: [{ scale }], borderColor, backgroundColor: bgColor }
      ]}
    >
      <Text style={[s.digitText, !digit && { opacity: 0.25 }]}>
        {digit || "•"}
      </Text>
      {focused && <View style={s.cursor} />}
    </Animated.View>
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

// ── Countdown ring ─────────────────────────────────────────────────────────
const CountdownRing = ({ seconds, total }) => {
  const anim = useRef(new Animated.Value(seconds / total)).current;
  const prevSeconds = useRef(seconds);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: seconds / total,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
    prevSeconds.current = seconds;
  }, [seconds]);

  const color = seconds > 30 ? "#D32F2F" : seconds > 10 ? "#E57373" : "#B71C1C";

  return (
    <View style={s.ringWrap}>
      <View style={[s.ringBg, { borderColor: "rgba(211,47,47,0.12)" }]} />
      <View style={s.ringInner}>
        <Text style={[s.ringSeconds, { color }]}>{seconds}</Text>
        <Text style={s.ringSec}>sec</Text>
      </View>
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const email = params?.email || "";
  const flow = params?.flow || "reset";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);
  const countdownRef = useRef(null);

  // Mount animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const otpAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 55,
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
      Animated.timing(otpAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(bottomAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();

    startCountdown();
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

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

  const autoLogin = async (responseData) => {
    const { accessToken, refreshToken } = responseData;
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken, refreshToken })
    );
    router.replace("/ChoiceLanguage");
  };

  const handleVerification = async () => {
    if (!code.trim())
      return Alert.alert(t("errors.codeRequired"), t("errors.enterCode"));
    setLoading(true);
    try {
      if (flow === "reset") {
        router.push({
          pathname: "/(auth)/ResetPasswordScreen",
          params: { email, otpCode: code.trim() }
        });
      } else {
        const response = await api.post("/auth/verify-email-and-login", {
          email,
          otpCode: code.trim()
        });
        Alert.alert("Succès", "Email vérifié ! Connexion en cours...");
        await autoLogin(response.data);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Échec de la vérification.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await api.post("/auth/request-otp", { email });
      Alert.alert("Envoyé", `Nouveau code envoyé à ${email}`);
      startCountdown();
    } catch (err) {
      Alert.alert(
        "Erreur",
        err?.response?.data?.message || "Impossible de renvoyer le code."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const digits = Array(6)
    .fill("")
    .map((_, i) => code[i] || "");
  const isReady = code.length >= 4;

  const bubbles = [
    {
      size: 50,
      color: "#FFCDD2",
      startX: width * 0.06,
      delay: 0,
      duration: 7400
    },
    {
      size: 35,
      color: "#EF9A9A",
      startX: width * 0.3,
      delay: 2000,
      duration: 9000
    },
    {
      size: 65,
      color: "#FFCDD2",
      startX: width * 0.6,
      delay: 700,
      duration: 8200
    },
    {
      size: 28,
      color: "#EF9A9A",
      startX: width * 0.8,
      delay: 3000,
      duration: 7600
    },
    {
      size: 42,
      color: "#FFCDD2",
      startX: width * 0.91,
      delay: 500,
      duration: 8600
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

      {/* Hidden real input */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(val) => setCode(val.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType='number-pad'
        maxLength={6}
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
          keyboardShouldPersistTaps='handled'
        >
          {/* Logo / image */}
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
            <View style={s.imageBadge}>
              <Image
                source={require("../../assets/images/otp.png")}
                style={s.otpImage}
                contentFit='contain'
              />
            </View>
            {/* Pulse ring */}
            <PulseRing />
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
              marginBottom: 24
            }}
          >
            <Text style={s.brand}>mulema</Text>
            <Text style={s.title}>
              {flow === "verify" ? t("auth.verifyEmail") : t("auth.verifyCode")}
            </Text>
            <View style={s.emailBadge}>
              <Ionicons name='mail' size={13} color='#D32F2F' />
              <Text style={s.emailText} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <Text style={s.hint}>Code envoyé · Vérifie ta boîte mail</Text>
          </Animated.View>

          {/* OTP boxes */}
          <Animated.View
            style={{
              opacity: otpAnim,
              transform: [
                {
                  translateY: otpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ],
              width: "100%",
              alignItems: "center",
              marginBottom: 28
            }}
          >
            <TouchableOpacity
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
              style={s.otpRow}
            >
              {digits.map((d, i) => (
                <DigitBox
                  key={i}
                  digit={d}
                  index={i}
                  focused={inputFocused && code.length === i}
                />
              ))}
            </TouchableOpacity>

            {code.length > 0 && (
              <TouchableOpacity onPress={() => setCode("")} style={s.clearBtn}>
                <Ionicons name='close-circle' size={14} color='#BDBDBD' />
                <Text style={s.clearText}>Effacer</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Verify button */}
          <Animated.View
            style={{
              opacity: otpAnim,
              width: "100%",
              paddingHorizontal: 24,
              marginBottom: 24
            }}
          >
            <TouchableOpacity
              onPress={handleVerification}
              disabled={loading || !isReady}
              activeOpacity={0.85}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                opacity: isReady ? 1 : 0.5
              }}
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
                    <Text style={s.btnText}>Vérifier mon code</Text>
                    <Ionicons
                      name='checkmark-circle'
                      size={20}
                      color='#fff'
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Resend section */}
          <Animated.View
            style={[
              s.resendCard,
              {
                opacity: bottomAnim,
                transform: [
                  {
                    translateY: bottomAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={s.resendRow}>
              {resendCooldown > 0 ? (
                <>
                  <CountdownRing
                    seconds={resendCooldown}
                    total={RESEND_COOLDOWN}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.resendTitle}>Code valide</Text>
                    <Text style={s.resendSub}>
                      Vous pourrez renvoyer dans {resendCooldown}s
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={s.resendIconWrap}>
                    <Ionicons name='refresh' size={20} color='#D32F2F' />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.resendTitle}>Pas reçu le code ?</Text>
                    <TouchableOpacity
                      onPress={handleResend}
                      disabled={resendLoading}
                    >
                      <Text style={s.resendLink}>
                        {resendLoading
                          ? "Envoi en cours..."
                          : "Renvoyer le code →"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Animated.View>

          {/* Back */}
          <Animated.View style={{ opacity: bottomAnim, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              style={s.backBtn}
            >
              <Ionicons name='arrow-back' size={15} color='#BDBDBD' />
              <Text style={s.backText}>Retour à l&apos;inscription</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Pulse ring animation ───────────────────────────────────────────────────
const PulseRing = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.25,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true
          })
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 1200,
            useNativeDriver: true
          })
        ])
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        s.pulseRing,
        { transform: [{ scale: pulse }], opacity: pulseOpacity }
      ]}
    />
  );
};

// ── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 64 : 48,
    paddingBottom: 40
  },

  // Logo / image
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative"
  },
  imageBadge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(211,47,47,0.07)",
    borderWidth: 2,
    borderColor: "rgba(211,47,47,0.25)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  otpImage: { width: 80, height: 80 },
  pulseRing: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#D32F2F"
  },

  // Text
  brand: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 3,
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 12,
    textAlign: "center"
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(211,47,47,0.08)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 8,
    maxWidth: width * 0.75
  },
  emailText: { color: "#C62828", fontSize: 13, fontWeight: "600", flex: 1 },
  hint: { color: "#AAAAAA", fontSize: 12 },

  // OTP
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 20
  },
  digitBox: {
    width: 46,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  digitText: { fontSize: 24, fontWeight: "700", color: "#1A1A1A" },
  cursor: {
    position: "absolute",
    bottom: 10,
    width: 2,
    height: 20,
    backgroundColor: "#D32F2F",
    borderRadius: 1
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  clearText: { color: "#BDBDBD", fontSize: 12 },

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

  // Resend card
  resendCard: {
    marginHorizontal: 24,
    width: width - 48,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.12)",
    padding: 18
  },
  resendRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  ringWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(211,47,47,0.06)",
    borderWidth: 2,
    borderColor: "rgba(211,47,47,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  ringBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 26,
    borderWidth: 2
  },
  ringInner: { alignItems: "center" },
  ringSeconds: { fontSize: 15, fontWeight: "700" },
  ringSec: { fontSize: 9, color: "#BDBDBD", marginTop: -2 },
  resendIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(211,47,47,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(211,47,47,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  resendTitle: {
    color: "#2C2C2C",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3
  },
  resendSub: { color: "#AAAAAA", fontSize: 12 },
  resendLink: { color: "#D32F2F", fontSize: 13, fontWeight: "700" },

  // Back
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  backText: { color: "#BDBDBD", fontSize: 13 }
});

export default VerifyEmail;
