import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

const { width, height } = Dimensions.get("window");

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
              toValue: 0.22,
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
  const anims = dots.map(() => useRef(new Animated.Value(0)).current);
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

// ── Pulse ring ─────────────────────────────────────────────────────────────
const PulseRing = ({ color = "#D32F2F" }) => {
  const p1 = useRef(new Animated.Value(1)).current;
  const o1 = useRef(new Animated.Value(0.4)).current;
  const p2 = useRef(new Animated.Value(1)).current;
  const o2 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const ring = (scale, opacity, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.5,
              duration: 1800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true
            }),
            Animated.timing(opacity, {
              toValue: delay === 0 ? 0.4 : 0.25,
              duration: 0,
              useNativeDriver: true
            })
          ])
        ])
      );
    ring(p1, o1, 0).start();
    ring(p2, o2, 900).start();
  }, []);

  return (
    <>
      <Animated.View
        style={[
          s.pulseRing,
          { borderColor: color, transform: [{ scale: p1 }], opacity: o1 }
        ]}
      />
      <Animated.View
        style={[
          s.pulseRing,
          { borderColor: color, transform: [{ scale: p2 }], opacity: o2 }
        ]}
      />
    </>
  );
};

// ── Success checkmark ──────────────────────────────────────────────────────
const SuccessCheck = () => {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true
        })
      ])
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.successCircle,
        {
          transform: [
            { scale },
            {
              rotate: rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ["-30deg", "0deg"]
              })
            }
          ]
        }
      ]}
    >
      <Ionicons name='checkmark' size={44} color='#fff' />
    </Animated.View>
  );
};

// ── Orbiting dot ──────────────────────────────────────────────────────────
const OrbitingDot = ({ color = "#D32F2F", radius = 60, speed = 3000 }) => {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: speed,
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
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          top: -(radius - 44),
          left: -(radius - 44),
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
      <View
        style={[s.orbitDot, { backgroundColor: color, shadowColor: color }]}
      />
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
const ForgotPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState(params?.email || "");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [sent, setSent] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const sentAnim = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 550,
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

  const handleFocus = () => {
    setEmailFocused(true);
    Animated.spring(borderAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: false
    }).start();
  };
  const handleBlur = () => {
    setEmailFocused(false);
    Animated.spring(borderAnim, {
      toValue: 0,
      tension: 80,
      friction: 8,
      useNativeDriver: false
    }).start();
  };

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert(
        "Email invalide",
        "Veuillez saisir une adresse email valide."
      );
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/request-password-reset", { email: email.trim() });
      setSent(true);
      Animated.spring(sentAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }).start();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Impossible d'envoyer le code.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: "/verify-email",
      params: { email: email.trim(), flow: "reset" }
    });
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(180,60,60,0.15)", "#D32F2F"]
  });
  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(180,60,60,0.04)", "rgba(211,47,47,0.07)"]
  });

  const bubbles = [
    {
      size: 52,
      color: "#FFCDD2",
      startX: width * 0.04,
      delay: 0,
      duration: 7200
    },
    {
      size: 36,
      color: "#EF9A9A",
      startX: width * 0.26,
      delay: 1600,
      duration: 9000
    },
    {
      size: 68,
      color: "#FFCDD2",
      startX: width * 0.62,
      delay: 800,
      duration: 8400
    },
    {
      size: 30,
      color: "#EF9A9A",
      startX: width * 0.8,
      delay: 2600,
      duration: 7800
    },
    {
      size: 44,
      color: "#FFCDD2",
      startX: width * 0.92,
      delay: 400,
      duration: 8800
    }
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle='dark-content' />
      <LinearGradient
        colors={["#FAF7F5", "#F5F0EC", "#F0E9E4"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          {/* Back button */}
          <Animated.View
            style={{
              opacity: logoAnim,
              alignSelf: "flex-start",
              marginLeft: 24,
              marginBottom: 8
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={s.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name='arrow-back' size={18} color='#BDBDBD' />
              <Text style={s.backText}>Retour</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Icon */}
          <Animated.View
            style={[
              s.iconWrap,
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoScale },
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={s.iconRing}>
              <LinearGradient
                colors={["rgba(211,47,47,0.15)", "rgba(211,47,47,0.04)"]}
                style={s.iconGrad}
              >
                <Ionicons name='lock-open-outline' size={44} color='#D32F2F' />
              </LinearGradient>
            </View>
            <OrbitingDot color='#D32F2F' radius={62} speed={3200} />
            <OrbitingDot color='#E57373' radius={62} speed={5000} />
            <PulseRing />
          </Animated.View>

          {/* Title block */}
          <Animated.View
            style={[
              s.titleBlock,
              {
                opacity: titleAnim,
                transform: [
                  {
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {/* <Text style={s.brand}>mulema</Text>/ */}
            <Text style={s.brand}>Mot de passe oublié ?</Text>
            <Text style={s.title}>
              Saisis ton email pour recevoir un code de
              récupération
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            style={[
              s.card,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {!sent ? (
              <>
                {/* Email field */}
                <Text style={s.label}>Adresse e-mail</Text>
                <Animated.View
                  style={[
                    s.inputRow,
                    { borderColor, backgroundColor: bgColor }
                  ]}
                >
                  <Ionicons
                    name='mail-outline'
                    size={18}
                    color={emailFocused ? "#D32F2F" : "#BDBDBD"}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    style={s.input}
                    placeholder='exemple@email.com'
                    placeholderTextColor='#C0B8B8'
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoCorrect={false}
                  />
                  {email.includes("@") && (
                    <Ionicons
                      name='checkmark-circle'
                      size={18}
                      color='#D32F2F'
                    />
                  )}
                </Animated.View>

                {/* Info banner */}
                <View style={s.infoBanner}>
                  <Ionicons
                    name='information-circle-outline'
                    size={16}
                    color='#D32F2F'
                    style={{ marginTop: 1 }}
                  />
                  <Text style={s.infoText}>
                    Un code à 6 chiffres sera envoyé à cette adresse. Vérifie
                    aussi tes spams.
                  </Text>
                </View>

                {/* Send button */}
                <Animated.View
                  style={{
                    transform: [{ scale: loading ? 1 : buttonPulse }],
                    marginTop: 8
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={loading || !email.includes("@")}
                    activeOpacity={0.85}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      opacity: email.includes("@") ? 1 : 0.5
                    }}
                  >
                    <LinearGradient
                      colors={
                        loading
                          ? ["#E0E0E0", "#E0E0E0"]
                          : ["#E53935", "#B71C1C"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.btn}
                    >
                      {loading ? (
                        <WaveDots />
                      ) : (
                        <>
                          <Text style={s.btnText}>Envoyer le code</Text>
                          {/* <Ionicons
                            name='send'
                            size={17}
                            color='#fff'
                            style={{ marginLeft: 8 }}
                          /> */}
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </>
            ) : (
              /* ── Sent state ── */
              <Animated.View
                style={{
                  alignItems: "center",
                  transform: [{ scale: sentAnim }],
                  opacity: sentAnim
                }}
              >
                <SuccessCheck />
                <Text style={s.sentTitle}>Code envoyé !</Text>
                <View style={s.sentEmailBadge}>
                  <Ionicons name='mail' size={14} color='#D32F2F' />
                  <Text style={s.sentEmailText} numberOfLines={1}>
                    {email}
                  </Text>
                </View>
                <Text style={s.sentHint}>
                  Ouvre ta boîte mail et copie le code reçu.{"\n"}Le code expire
                  dans{" "}
                  <Text style={{ color: "#E57373", fontWeight: "700" }}>
                    10 minutes
                  </Text>
                  .
                </Text>

                <TouchableOpacity
                  onPress={handleContinue}
                  activeOpacity={0.85}
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    overflow: "hidden",
                    marginTop: 24
                  }}
                >
                  <LinearGradient
                    colors={["#E53935", "#B71C1C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.btn}
                  >
                    <Text style={s.btnText}>Saisir le code</Text>
                    <Ionicons
                      name='arrow-forward'
                      size={18}
                      color='#fff'
                      style={{ marginLeft: 8 }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSent(false)}
                  style={s.changeEmailBtn}
                >
                  <Ionicons name='pencil-outline' size={13} color='#BDBDBD' />
                  <Text style={s.changeEmailText}>Changer d&apos;adresse email</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Divider */}
            {!sent && (
              <>
                <View style={s.dividerRow}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerText}>ou</Text>
                  <View style={s.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/sign-in")}
                  activeOpacity={0.8}
                  style={s.signInBtn}
                >
                  <Text style={s.signInText}>
                    Je me souviens !{"  "}
                    <Text style={s.signInLink}>Se connecter</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          {/* Steps hint */}
          {!sent && (
            <Animated.View style={[s.stepsHint, { opacity: cardAnim }]}>
              {[
                { icon: "mail-outline", text: "Entre ton email" },
                { icon: "keypad-outline", text: "Reçois le code" },
                {
                  icon: "lock-closed-outline",
                  text: "Crée un nouveau mot de passe"
                }
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <View style={s.stepHintItem}>
                    <View style={s.stepHintIcon}>
                      <Ionicons name={step.icon} size={14} color='#D32F2F' />
                    </View>
                    <Text style={s.stepHintText}>{step.text}</Text>
                  </View>
                  {i < 2 && (
                    <Ionicons
                      name='chevron-forward'
                      size={12}
                      color='#BDBDBD'
                    />
                  )}
                </React.Fragment>
              ))}
            </Animated.View>
          )}
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
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 48
  },

  // Back
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  backText: { color: "#BDBDBD", fontSize: 14 },

  // Icon
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative"
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(211,47,47,0.3)",
    overflow: "hidden"
  },
  iconGrad: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  pulseRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5
  },
  orbit: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5
  },

  // Text
  titleBlock: { alignItems: "center", marginBottom: 28, paddingHorizontal: 24 },
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
    marginBottom: 10,
    textAlign: "center"
  },
  subtitle: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 22
  },

  // Card
  card: {
    width: width - 48,
    // backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.1)",
    padding: 24,
    marginBottom: 20
  },

  // Field
  label: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14
  },
  input: { flex: 1, color: "#1A1A1A", fontSize: 15, fontWeight: "500" },

  // Info
  infoBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(211,47,47,0.06)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.18)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  infoText: { flex: 1, color: "#C62828", fontSize: 12, lineHeight: 18 },

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
  signInLink: { color: "#D32F2F", fontWeight: "700" },

  // Sent state
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#D32F2F",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10
  },
  sentTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 12
  },
  sentEmailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(211,47,47,0.08)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.22)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 14,
    maxWidth: "100%"
  },
  sentEmailText: { color: "#C62828", fontSize: 13, fontWeight: "600", flex: 1 },
  sentHint: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20
  },
  changeEmailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  changeEmailText: { color: "#BDBDBD", fontSize: 12 },

  // Steps hint
  stepsHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    flexWrap: "nowrap"
  },
  stepHintItem: { alignItems: "center", gap: 5 },
  stepHintIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(211,47,47,0.08)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  stepHintText: {
    color: "#AAAAAA",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 60
  }
});

export default ForgotPasswordScreen;
