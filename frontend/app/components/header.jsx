import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Easing, Platform, Image, Dimensions, Modal, ScrollView,
  StatusBar, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

const { width, height } = Dimensions.get("window");
const STREAK_KEY = "@mulema_streak_data";

// ─────────────────────────────────────────────
// STREAK MODAL
// ─────────────────────────────────────────────
const StreakModal = ({ visible, onClose, days }) => {
  const slideUp = useRef(new Animated.Value(300)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const flameBounce = useRef(new Animated.Value(0.5)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(flameBounce, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameRotate, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(flameRotate, { toValue: -1, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(flameRotate, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
      flameBounce.setValue(0.5);
    }
  }, [visible]);

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, { transform: [{ translateY: slideUp }] }]}>
          <LinearGradient colors={["#FAF7F5", "#F5F0EC"]} style={sm.sheetGrad}>
            <View style={sm.handle} />
            <Animated.Text style={[sm.bigFlame, {
              transform: [
                { scale: flameBounce },
                { rotate: flameRotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-12deg", "0deg", "12deg"] }) }
              ]
            }]}>
              {days === 0 ? "😴" : "🔥"}
            </Animated.Text>
            <Text style={sm.streakCount}>{days}</Text>
            <Text style={sm.streakTitle}>
              {days === 0 ? "Lance ton streak !" : days === 1 ? "C'est parti !" : `${days} jours de suite !`}
            </Text>
            <Text style={sm.streakSub}>
              {days === 0
                ? "Commence aujourd'hui et construis ton streak 💪"
                : days < 7
                ? "Continue comme ça, tu es sur la bonne voie !"
                : "Incroyable ! Tu es une machine à apprendre 🚀"}
            </Text>
            <View style={sm.weekRow}>
              {weekDays.map((d, i) => {
                const isToday = i === adjustedToday;
                const isPast = days > 0 && i < adjustedToday && i >= adjustedToday - (days - 1);
                return (
                  <View key={i} style={sm.dayCol}>
                    <View style={[sm.dayCircle, isToday && sm.dayCircleToday, isPast && sm.dayCirclePast]}>
                      <Text style={sm.dayEmoji}>{isPast || isToday ? "🔥" : "·"}</Text>
                    </View>
                    <Text style={[sm.dayLabel, isToday && { color: "#D32F2F" }]}>{d}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity onPress={onClose} style={sm.closeBtn}>
              <LinearGradient colors={["#E53935", "#B71C1C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={sm.closeBtnGrad}>
                <Text style={sm.closeBtnText}>Continuer à apprendre</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// CORIS MODAL
// ─────────────────────────────────────────────
const CorisModal = ({ visible, onClose, coris }) => {
  const slideUp = useRef(new Animated.Value(300)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const coinSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(coinSpin, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(coinSpin, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const tips = [
    { icon: "book-outline", text: "Complète une leçon", reward: "+10 Coris" },
    { icon: "trophy-outline", text: "Gagne un défi", reward: "+25 Coris" },
    { icon: "flame-outline", text: "Streak 7 jours", reward: "+50 Coris" },
    { icon: "star-outline", text: "Score parfait", reward: "+15 Coris" },
  ];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, { transform: [{ translateY: slideUp }] }]}>
          <LinearGradient colors={["#FAF7F5", "#F5F0EC"]} style={sm.sheetGrad}>
            <View style={sm.handle} />
            <Animated.View style={{ transform: [{ scaleX: coinSpin.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.15, 1] }) }] }}>
              <Image source={require("../../assets/images/colla.png")} style={sm.bigCoin} />
            </Animated.View>
            <Text style={sm.streakCount}>{coris < 10 ? `0${coris}` : coris}</Text>
            <Text style={sm.streakTitle}>Tes Coris</Text>
            <Text style={sm.streakSub}>Accumule des Coris en apprenant et débloque des bonus exclusifs !</Text>
            <View style={sm.tipsGrid}>
              {tips.map((tip, i) => (
                <View key={i} style={sm.tipCard}>
                  <View style={sm.tipIconWrap}>
                    <Ionicons name={tip.icon} size={20} color="#D32F2F" />
                  </View>
                  <Text style={sm.tipText}>{tip.text}</Text>
                  <Text style={sm.tipReward}>{tip.reward}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={onClose} style={sm.closeBtn}>
              <LinearGradient colors={["#E53935", "#B71C1C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={sm.closeBtnGrad}>
                <Text style={sm.closeBtnText}>Gagner plus de Coris</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// NOTIF MODAL
// ─────────────────────────────────────────────
const NotifModal = ({ visible, onClose }) => {
  const slideUp = useRef(new Animated.Value(400)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const notifs = [
    { icon: "🔥", title: "Streak en danger !", body: "Tu n'as pas encore fait ta leçon aujourd'hui.", time: "il y a 2h", type: "warning" },
    { icon: "🏆", title: "Nouveau record !", body: "Tu viens d'atteindre 7 jours consécutifs.", time: "Hier", type: "success" },
    { icon: "🎯", title: "Défi disponible", body: "Un nouveau défi Ewondo t'attend.", time: "Il y a 1j", type: "info" },
    { icon: "💬", title: "Conseil du jour", body: "Répète 10 min chaque matin pour mémoriser vite.", time: "Il y a 2j", type: "tip" },
  ];
  const typeColors = { warning: "#E57373", success: "#D32F2F", info: "#C62828", tip: "#B71C1C" };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, sm.sheetTall, { transform: [{ translateY: slideUp }] }]}>
          <LinearGradient colors={["#FAF7F5", "#F5F0EC"]} style={[sm.sheetGrad, { paddingBottom: 30 }]}>
            <View style={sm.handle} />
            <View style={sm.notifHeader}>
              <Text style={sm.notifHeaderTitle}>Notifications</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={sm.notifMarkAll}>Tout lire</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
              {notifs.map((n, i) => (
                <TouchableOpacity key={i} activeOpacity={0.75}>
                  <View style={[sm.notifItem, { borderLeftColor: typeColors[n.type] }]}>
                    <Text style={sm.notifIcon}>{n.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={sm.notifTitle}>{n.title}</Text>
                      <Text style={sm.notifBody}>{n.body}</Text>
                      <Text style={sm.notifTime}>{n.time}</Text>
                    </View>
                    {i === 0 && <View style={[sm.unreadDot, { backgroundColor: typeColors[n.type] }]} />}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// FLAME CHIP
// ─────────────────────────────────────────────
const FlameChip = ({ days, onPress }) => {
  const flicker = useRef(new Animated.Value(1)).current;
  const mount = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 70, friction: 6, delay: 100, useNativeDriver: true }).start();
    if (days > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flicker, { toValue: 1.18, duration: 340, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(flicker, { toValue: 0.88, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(flicker, { toValue: 1.08, duration: 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(flicker, { toValue: 1, duration: 340, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [days]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(press, { toValue: 0.82, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1, tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  const numColor = days === 0 ? "#BDBDBD" : days < 3 ? "#E57373" : days < 7 ? "#EF5350" : "#D32F2F";

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[s.chip, { transform: [{ scale: press }], borderColor: days > 0 ? "rgba(211,47,47,0.35)" : "rgba(180,60,60,0.12)" }]}>
          <Animated.Text style={[s.chipEmoji, { transform: [{ scale: flicker }] }]}>
            {days === 0 ? "💤" : "🔥"}
          </Animated.Text>
          <View>
            <Text style={[s.chipNum, { color: numColor }]}>{days}</Text>
            <Text style={s.chipSub}>jours</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// CORIS CHIP
// ─────────────────────────────────────────────
const CorisChip = ({ coris, onPress }) => {
  const bounce = useRef(new Animated.Value(1)).current;
  const mount = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const prev = useRef(coris);

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 70, friction: 6, delay: 200, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (coris !== prev.current) {
      Animated.sequence([
        Animated.spring(bounce, { toValue: 1.4, tension: 300, friction: 4, useNativeDriver: true }),
        Animated.spring(bounce, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
      ]).start();
      prev.current = coris;
    }
  }, [coris]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(press, { toValue: 0.82, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1, tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[s.chip, s.corisChip, { transform: [{ scale: press }] }]}>
          <Animated.View style={{ transform: [{ scale: bounce }] }}>
            <Image source={require("../../assets/images/colla.png")} style={s.coinImg} />
          </Animated.View>
          <View>
            <Text style={s.corisNum}>{coris < 10 ? `0${coris}` : coris}</Text>
            <Text style={s.chipSub}>coris</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// NOTIF BUTTON
// ─────────────────────────────────────────────
const NotifBtn = ({ count, onPress }) => {
  const ring = useRef(new Animated.Value(0)).current;
  const mount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 70, friction: 6, delay: 300, useNativeDriver: true }).start();
    if (count > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.delay(3500),
          Animated.timing(ring, { toValue: 1, duration: 65, useNativeDriver: true }),
          Animated.timing(ring, { toValue: -1, duration: 65, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0.6, duration: 65, useNativeDriver: true }),
          Animated.timing(ring, { toValue: -0.6, duration: 65, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0, duration: 65, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [count]);

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={s.notifBtn}>
        <Animated.View style={{ transform: [{ rotate: ring.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-22deg", "0deg", "22deg"] }) }] }}>
          <Ionicons name={count > 0 ? "notifications" : "notifications-outline"} size={23} color={count > 0 ? "#2C2C2C" : "#BDBDBD"} />
        </Animated.View>
        {count > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{count > 9 ? "9+" : count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────
const AvatarBtn = ({ username, avatarSource, onPress }) => {
  const mount = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const initial = username ? username[0].toUpperCase() : "M";

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 60, friction: 7, delay: 400, useNativeDriver: true }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(press, { toValue: 0.82, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1, tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[s.avatarWrap, { transform: [{ scale: press }] }]}>
          {avatarSource ? (
            <Image source={avatarSource} style={s.avatarImg} />
          ) : (
            <LinearGradient colors={["#E53935", "#B71C1C"]} style={s.avatarGrad}>
              <Text style={s.avatarInitial}>{initial}</Text>
            </LinearGradient>
          )}
          <View style={s.onlineDot} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// GREETING HELPER
// ─────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return { text: "Bonne nuit", emoji: "🌙" };
  if (h < 12) return { text: "Bonjour", emoji: "☀️" };
  if (h < 18) return { text: "Bon après-midi", emoji: "🌤️" };
  return { text: "Bonsoir", emoji: "🌆" };
};

// ─────────────────────────────────────────────
// MAIN HEADER
// ─────────────────────────────────────────────
export default function Header({
  pageName,
  username = "Apprenant",
  avatarSource = null,
  initialCoris = 5,
  isHome = false,
  style,
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const [coris, setCoris] = useState(initialCoris);
  const [notifCount, setNotifCount] = useState(3);
  const [streakDays, setStreakDays] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [showCoris, setShowCoris] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const slideDown = useRef(new Animated.Value(-90)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const greetAnim = useRef(new Animated.Value(0)).current;
  const nameAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideDown, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.stagger(130, [
      Animated.spring(greetAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.spring(nameAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();

    loadStreak();

    global.decreaseCoris = (n = 1) => setCoris((c) => Math.max(0, c - n));
    global.addCoris = (n = 1) => setCoris((c) => c + n);
    return () => { try { delete global.decreaseCoris; delete global.addCoris; } catch (_) {} };
  }, []);

  const loadStreak = async () => {
    try {
      const raw = await AsyncStorage.getItem(STREAK_KEY);
      if (raw) {
        const { days, lastDate } = JSON.parse(raw);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastDate === today || lastDate === yesterday) {
          setStreakDays(days);
        } else {
          await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({ days: 0, lastDate: today }));
          setStreakDays(0);
        }
      } else {
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({ days: 1, lastDate: new Date().toDateString() }));
        setStreakDays(1);
      }
    } catch (e) { console.log("Streak err:", e); }
  };

  const { text: greetText, emoji: greetEmoji } = getGreeting();
  const displayName = username.split(" ")[0];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <StreakModal visible={showStreak} onClose={() => setShowStreak(false)} days={streakDays} />
      <CorisModal visible={showCoris} onClose={() => setShowCoris(false)} coris={coris} />
      <NotifModal visible={showNotif} onClose={() => setShowNotif(false)} />

      <Animated.View style={[s.wrapper, style, { transform: [{ translateY: slideDown }], opacity: fadeIn }]}>
        <LinearGradient
          colors={["#FAF7F5", "#F5F0EC"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.glowLine} />

        <View style={s.row}>
          {/* LEFT */}
          <View style={s.left}>
            <Animated.View style={[s.greetRow, {
              opacity: greetAnim,
              transform: [{ translateX: greetAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }]
            }]}>
              <Text style={s.greetEmoji}>{greetEmoji}</Text>
              <Text style={s.greetText}>{greetText}</Text>
            </Animated.View>

            <Animated.View style={[s.nameRow, {
              opacity: nameAnim,
              transform: [{ translateX: nameAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }]
            }]}>
              <Text style={s.nameText} numberOfLines={1}>{displayName}</Text>
              <View style={s.namePill}>
                <Text style={s.namePillText}>🌍 Mulema</Text>
              </View>
            </Animated.View>
          </View>

          {/* RIGHT */}
          <View style={s.right}>
            <FlameChip days={streakDays} onPress={() => setShowStreak(true)} />
            <CorisChip coris={coris} onPress={() => setShowCoris(true)} />
            <NotifBtn count={notifCount} onPress={() => setShowNotif(true)} />
            <AvatarBtn
              username={username}
              avatarSource={avatarSource}
              onPress={() => router.push("standalone/profile")}
            />
          </View>
        </View>
      </Animated.View>
    </>
  );
}

// ─────────────────────────────────────────────
// HEADER STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 54 : 38,
    paddingBottom: 14,
    zIndex: 100,
    elevation: 6,
    shadowColor: "#D32F2F",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  glowLine: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 1.5,
    backgroundColor: "rgba(211,47,47,0.3)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  // Left
  left: { flex: 1, marginRight: 8 },
  greetRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  greetEmoji: { fontSize: 13 },
  greetText: { fontSize: 11, color: "#AAAAAA", fontWeight: "500", letterSpacing: 0.6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    maxWidth: width * 0.28,
  },
  namePill: {
    backgroundColor: "rgba(211,47,47,0.1)",
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.3)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  namePillText: { fontSize: 10, color: "#C62828", fontWeight: "700" },

  // Right
  right: { flexDirection: "row", alignItems: "center", gap: 7 },

  // Chip
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(180,60,60,0.15)",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  corisChip: { borderColor: "rgba(211,47,47,0.3)" },
  chipEmoji: { fontSize: 18, lineHeight: 22 },
  chipNum: { fontSize: 15, fontWeight: "800", lineHeight: 17 },
  chipSub: { fontSize: 8, color: "#BDBDBD", fontWeight: "600", letterSpacing: 0.4, lineHeight: 10 },
  coinImg: { width: 20, height: 20, resizeMode: "contain" },
  corisNum: { fontSize: 15, fontWeight: "800", color: "#D32F2F", lineHeight: 17 },

  // Notif
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1.5, borderColor: "rgba(180,60,60,0.15)",
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute", top: 3, right: 3,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: "#D32F2F",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#FAF7F5",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 8, color: "#fff", fontWeight: "800" },

  // Avatar
  avatarWrap: { position: "relative" },
  avatarGrad: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2.5, borderColor: "rgba(211,47,47,0.5)",
  },
  avatarImg: { width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, borderColor: "rgba(211,47,47,0.5)" },
  avatarInitial: { fontSize: 17, fontWeight: "800", color: "#fff" },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: "#D32F2F",
    borderWidth: 2, borderColor: "#FAF7F5",
  },
});

// ─────────────────────────────────────────────
// MODAL STYLES
// ─────────────────────────────────────────────
const sm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  sheetTall: { maxHeight: height * 0.72 },
  sheetGrad: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 44,
    alignItems: "center",
  },
  handle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: "rgba(180,60,60,0.2)",
    marginBottom: 24,
  },
  bigFlame: { fontSize: 72, marginBottom: 4 },
  bigCoin: { width: 72, height: 72, resizeMode: "contain", marginBottom: 4 },
  streakCount: {
    fontSize: 56, fontWeight: "900", color: "#1A1A1A",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 62,
  },
  streakTitle: { fontSize: 22, fontWeight: "800", color: "#2C2C2C", marginTop: 6, marginBottom: 8, textAlign: "center" },
  streakSub: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 21, marginBottom: 24, paddingHorizontal: 8 },

  weekRow: { flexDirection: "row", gap: 8, marginBottom: 28, justifyContent: "center" },
  dayCol: { alignItems: "center", gap: 6 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(180,60,60,0.05)",
    borderWidth: 1.5, borderColor: "rgba(180,60,60,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  dayCircleToday: {
    borderColor: "#D32F2F",
    backgroundColor: "rgba(211,47,47,0.1)",
    shadowColor: "#D32F2F", shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  dayCirclePast: {
    borderColor: "rgba(239,154,154,0.5)",
    backgroundColor: "rgba(239,154,154,0.1)",
  },
  dayEmoji: { fontSize: 15 },
  dayLabel: { fontSize: 10, color: "#BDBDBD", fontWeight: "700" },

  tipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%", marginBottom: 24 },
  tipCard: {
    flex: 1, minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(211,47,47,0.1)",
    padding: 14, alignItems: "flex-start", gap: 6,
  },
  tipIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(211,47,47,0.08)",
    borderWidth: 1, borderColor: "rgba(211,47,47,0.22)",
    alignItems: "center", justifyContent: "center",
  },
  tipText: { fontSize: 12, color: "#888", fontWeight: "500", lineHeight: 16 },
  tipReward: { fontSize: 13, color: "#D32F2F", fontWeight: "800" },

  notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 },
  notifHeaderTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
  notifMarkAll: { fontSize: 13, color: "#D32F2F", fontWeight: "600" },
  notifItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(211,47,47,0.08)",
    borderLeftWidth: 3,
    padding: 14, marginBottom: 10, width: "100%",
    position: "relative",
  },
  notifIcon: { fontSize: 26, marginTop: 1 },
  notifTitle: { fontSize: 14, fontWeight: "700", color: "#2C2C2C", marginBottom: 3 },
  notifBody: { fontSize: 12, color: "#888", lineHeight: 17, marginBottom: 4 },
  notifTime: { fontSize: 10, color: "#BDBDBD", fontWeight: "600" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, position: "absolute", top: 14, right: 14 },

  closeBtn: { width: "100%", borderRadius: 16, overflow: "hidden" },
  closeBtnGrad: {
    paddingVertical: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  closeBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.3 },
});