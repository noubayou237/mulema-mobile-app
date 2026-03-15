import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Easing, Platform, Image, Dimensions, Modal, ScrollView,
  StatusBar, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

const { width, height } = Dimensions.get("window");
const STREAK_KEY   = "@mulema_streak_data";
const LANG_KEY     = "@mulema_learning_lang";

// ── Design tokens ──────────────────────────────────────────────────────────
const BG         = "#F0EDE6";
const CARD_BG    = "#FFFFFF";
const RED        = "#D32F2F";
const RED_LIGHT  = "#FFEBEE";
const TEXT_DARK  = "#2C2C2C";
const TEXT_MID   = "#6B6B6B";
const TEXT_LIGHT = "#AAAAAA";
const BORDER     = "#E5E0D8";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

// ── Learning languages available ───────────────────────────────────────────
// Route pattern: /home?lang=bassa  |  /home?lang=duala  |  /home?lang=ghomala
const LEARNING_LANGS = [
  { code: "bassa",   label: "Le Bassa",   emoji: "🏜️", region: "Centre · Littoral",     color: "#D32F2F" },
  { code: "duala",   label: "Le Duala",   emoji: "🌊", region: "Littoral · Côtes",       color: "#1565C0" },
  { code: "ghomala", label: "Le Ghomala", emoji: "🏔️", region: "Hauts Plateaux Ouest",  color: "#6A1B9A" },
];

// ─────────────────────────────────────────────
// STREAK MODAL
// ─────────────────────────────────────────────
const StreakModal = ({ visible, onClose, days }) => {
  const slideUp     = useRef(new Animated.Value(300)).current;
  const fade        = useRef(new Animated.Value(0)).current;
  const flameBounce = useRef(new Animated.Value(0.5)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,        { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp,     { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.spring(flameBounce, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
      ]).start();
      Animated.loop(Animated.sequence([
        Animated.timing(flameRotate, { toValue: 1,  duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flameRotate, { toValue: -1, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flameRotate, { toValue: 0,  duration: 300, useNativeDriver: true }),
      ])).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
      flameBounce.setValue(0.5);
    }
  }, [visible]);

  const weekDays      = ["L","M","M","J","V","S","D"];
  const today         = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={sm.sheetInner}>
            <View style={sm.handle} />
            <Animated.Text style={[sm.bigFlame, {
              transform: [
                { scale: flameBounce },
                { rotate: flameRotate.interpolate({ inputRange: [-1,0,1], outputRange: ["-12deg","0deg","12deg"] }) },
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
                const isPast  = days > 0 && i < adjustedToday && i >= adjustedToday - (days - 1);
                return (
                  <View key={i} style={sm.dayCol}>
                    <View style={[sm.dayCircle, isToday && sm.dayCircleToday, isPast && sm.dayCirclePast]}>
                      <Text style={sm.dayEmoji}>{isPast || isToday ? "🔥" : "·"}</Text>
                    </View>
                    <Text style={[sm.dayLabel, isToday && { color: RED }]}>{d}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity onPress={onClose} style={[sm.closeBtn, { backgroundColor: RED }]}>
              <Text style={sm.closeBtnText}>Continuer à apprendre</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// CORIS MODAL
// ─────────────────────────────────────────────
const CorisModal = ({ visible, onClose, coris }) => {
  const slideUp  = useRef(new Animated.Value(300)).current;
  const fade     = useRef(new Animated.Value(0)).current;
  const coinSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
      Animated.loop(Animated.sequence([
        Animated.timing(coinSpin, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(coinSpin, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const tips = [
    { icon: "book-outline",   text: "Complète une leçon", reward: "+10 Coris" },
    { icon: "trophy-outline", text: "Gagne un défi",      reward: "+25 Coris" },
    { icon: "flame-outline",  text: "Streak 7 jours",     reward: "+50 Coris" },
    { icon: "star-outline",   text: "Score parfait",      reward: "+15 Coris" },
  ];

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={sm.sheetInner}>
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
                    <Ionicons name={tip.icon} size={20} color={RED} />
                  </View>
                  <Text style={sm.tipText}>{tip.text}</Text>
                  <Text style={sm.tipReward}>{tip.reward}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={onClose} style={[sm.closeBtn, { backgroundColor: RED }]}>
              <Text style={sm.closeBtnText}>Gagner plus de Coris</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
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
  const fade    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const notifs = [
    { icon: "🔥", title: "Streak en danger !", body: "Tu n'as pas encore fait ta leçon aujourd'hui.", time: "il y a 2h", type: "warning" },
    { icon: "🏆", title: "Nouveau record !",   body: "Tu viens d'atteindre 7 jours consécutifs.",  time: "Hier",      type: "success" },
    { icon: "🎯", title: "Défi disponible",    body: "Un nouveau défi Ewondo t'attend.",            time: "Il y a 1j", type: "info"    },
    { icon: "💬", title: "Conseil du jour",    body: "Répète 10 min chaque matin pour mémoriser vite.", time: "Il y a 2j", type: "tip" },
  ];
  const typeColors = { warning: "#EF5350", success: RED, info: "#C62828", tip: "#B71C1C" };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, sm.sheetTall, { transform: [{ translateY: slideUp }] }]}>
          <View style={[sm.sheetInner, { paddingBottom: 30 }]}>
            <View style={sm.handle} />
            <View style={sm.notifHeader}>
              <Text style={sm.notifHeaderTitle}>Notifications</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[sm.notifMarkAll, { color: RED }]}>Tout lire</Text>
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
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// LEARNING LANGUAGE SWITCHER MODAL
// ─────────────────────────────────────────────
const LangSwitcherModal = ({ visible, onClose, currentLang, onSelect }) => {
  const slideUp = useRef(new Animated.Value(500)).current;
  const fade    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 500, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[sm.overlay, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[sm.sheet, { transform: [{ translateY: slideUp }] }]}>
          <View style={ls.sheetInner}>
            <View style={sm.handle} />

            {/* Title */}
            <View style={ls.titleRow}>
              <Text style={ls.title}>Langue d'apprentissage</Text>
              <TouchableOpacity onPress={onClose} style={ls.closeBtn}>
                <Ionicons name="close" size={18} color={TEXT_MID} />
              </TouchableOpacity>
            </View>
            <Text style={ls.subtitle}>Choisis la langue camerounaise que tu veux apprendre</Text>

            {/* Language list */}
            <View style={ls.grid}>
              {LEARNING_LANGS.map((lang) => {
                const selected = currentLang?.code === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => { onSelect(lang); onClose(); }}
                    activeOpacity={0.8}
                    style={[ls.langCard, selected && { borderColor: lang.color, borderWidth: 2 }]}
                  >
                    {/* Left accent bar */}
                    <View style={[ls.langAccentBar, { backgroundColor: lang.color }]} />

                    <View style={ls.langCardBody}>
                      <Text style={ls.langEmoji}>{lang.emoji}</Text>
                      <View style={ls.langTextGroup}>
                        <Text style={[ls.langName, selected && { color: lang.color }]}>{lang.label}</Text>
                        <Text style={ls.langRegion}>{lang.region}</Text>
                      </View>
                    </View>

                    {/* Selected checkmark */}
                    {selected ? (
                      <View style={[ls.checkBadge, { backgroundColor: lang.color }]}>
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={15} color={TEXT_LIGHT} style={{ marginRight: 14 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Coming soon note */}
            <View style={ls.comingSoonRow}>
              <Ionicons name="sparkles-outline" size={13} color={TEXT_LIGHT} />
              <Text style={ls.comingSoonText}>Plus de langues bientôt disponibles !</Text>
            </View>
          </View>
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
  const mount   = useRef(new Animated.Value(0)).current;
  const press   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 70, friction: 6, delay: 100, useNativeDriver: true }).start();
    if (days > 0) {
      Animated.loop(Animated.sequence([
        Animated.timing(flicker, { toValue: 1.18, duration: 340, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.88, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1.08, duration: 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1,    duration: 340, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();
    }
  }, [days]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(press, { toValue: 0.82, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  const numColor = days === 0 ? TEXT_LIGHT : days < 3 ? "#EF5350" : days < 7 ? "#E53935" : RED;

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[s.chip, { transform: [{ scale: press }] }]}>
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
  const mount  = useRef(new Animated.Value(0)).current;
  const press  = useRef(new Animated.Value(1)).current;
  const prev   = useRef(coris);

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 70, friction: 6, delay: 200, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (coris !== prev.current) {
      Animated.sequence([
        Animated.spring(bounce, { toValue: 1.4, tension: 300, friction: 4, useNativeDriver: true }),
        Animated.spring(bounce, { toValue: 1,   tension: 120, friction: 6, useNativeDriver: true }),
      ]).start();
      prev.current = coris;
    }
  }, [coris]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(press, { toValue: 0.82, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <Animated.View style={[s.chip, { transform: [{ scale: press }] }]}>
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
  const ring  = useRef(new Animated.Value(0)).current;
  const mount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mount, { toValue: 1, tension: 70, friction: 6, delay: 300, useNativeDriver: true }).start();
    if (count > 0) {
      Animated.loop(Animated.sequence([
        Animated.delay(3500),
        Animated.timing(ring, { toValue: 1,    duration: 65, useNativeDriver: true }),
        Animated.timing(ring, { toValue: -1,   duration: 65, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0.6,  duration: 65, useNativeDriver: true }),
        Animated.timing(ring, { toValue: -0.6, duration: 65, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0,    duration: 65, useNativeDriver: true }),
      ])).start();
    }
  }, [count]);

  return (
    <Animated.View style={{ transform: [{ scale: mount }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={s.notifBtn}>
        <Animated.View style={{ transform: [{ rotate: ring.interpolate({ inputRange: [-1,0,1], outputRange: ["-22deg","0deg","22deg"] }) }] }}>
          <Ionicons
            name={count > 0 ? "notifications" : "notifications-outline"}
            size={22}
            color={count > 0 ? TEXT_DARK : TEXT_LIGHT}
          />
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
      Animated.spring(press, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
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

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return { text: "Bonne nuit",    emoji: "🌙" };
  if (h < 12) return { text: "Bonjour",        emoji: "☀️" };
  if (h < 18) return { text: "Bon après-midi", emoji: "🌤️" };
  return       { text: "Bonsoir",             emoji: "🌆" };
};

// ─────────────────────────────────────────────
// MAIN HEADER
// ─────────────────────────────────────────────
export default function Header({
  pageName,
  username     = "Apprenant",
  avatarSource = null,
  initialCoris = 5,
  isHome       = false,
  style,
  onLangChange,
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useTranslation();

  const [coris,          setCoris]          = useState(initialCoris);
  const [notifCount,     setNotifCount]     = useState(3);
  const [streakDays,     setStreakDays]      = useState(0);
  const [showStreak,     setShowStreak]     = useState(false);
  const [showCoris,      setShowCoris]      = useState(false);
  const [showNotif,      setShowNotif]      = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Detect current lang from URL params or fallback to saved/default
  const [learningLang, setLearningLang] = useState(LEARNING_LANGS[0]);

  const slideDown = useRef(new Animated.Value(-90)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const greetAnim = useRef(new Animated.Value(0)).current;
  const nameAnim  = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideDown, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeIn,    { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    Animated.stagger(130, [
      Animated.spring(greetAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.spring(nameAnim,  { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
    loadStreak();
    loadSavedLang();
    global.decreaseCoris = (n = 1) => setCoris((c) => Math.max(0, c - n));
    global.addCoris      = (n = 1) => setCoris((c) => c + n);
    return () => { try { delete global.decreaseCoris; delete global.addCoris; } catch (_) {} };
  }, []);

  // Sync pill when URL changes (e.g. back navigation)
  useEffect(() => {
    const match = pathname?.match(/[?&]lang=([^&]+)/);
    if (match) {
      const found = LEARNING_LANGS.find(l => l.code === match[1]);
      if (found) setLearningLang(found);
    }
  }, [pathname]);

  const loadStreak = async () => {
    try {
      const raw = await AsyncStorage.getItem(STREAK_KEY);
      if (raw) {
        const { days, lastDate } = JSON.parse(raw);
        const today     = new Date().toDateString();
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

  const loadSavedLang = async () => {
    try {
      // URL takes priority
      const match = pathname?.match(/[?&]lang=([^&]+)/);
      if (match) {
        const found = LEARNING_LANGS.find(l => l.code === match[1]);
        if (found) { setLearningLang(found); return; }
      }
      // Then AsyncStorage
      const saved = await AsyncStorage.getItem(LANG_KEY);
      if (saved) {
        const lang = LEARNING_LANGS.find(l => l.code === saved);
        if (lang) setLearningLang(lang);
      }
    } catch (_) {}
  };

  const handleSelectLang = async (lang) => {
    // Bounce animation on pill
    Animated.sequence([
      Animated.spring(pillScale, { toValue: 0.82, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(pillScale, { toValue: 1,    tension: 150, friction: 6, useNativeDriver: true }),
    ]).start();

    setLearningLang(lang);

    // Persist
    try { await AsyncStorage.setItem(LANG_KEY, lang.code); } catch (_) {}

    // Navigate to home with lang query param: /home?lang=bassa
    router.replace(`/home?lang=${lang.code}`);

    // Optional parent callback
    onLangChange?.(lang);
  };

  const { text: greetText, emoji: greetEmoji } = getGreeting();
  const displayName = username.split(" ")[0];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <StreakModal     visible={showStreak}    onClose={() => setShowStreak(false)}    days={streakDays} />
      <CorisModal      visible={showCoris}     onClose={() => setShowCoris(false)}     coris={coris} />
      <NotifModal      visible={showNotif}     onClose={() => setShowNotif(false)} />
      <LangSwitcherModal
        visible={showLangPicker}
        onClose={() => setShowLangPicker(false)}
        currentLang={learningLang}
        onSelect={handleSelectLang}
      />

      <Animated.View style={[s.wrapper, style, { transform: [{ translateY: slideDown }], opacity: fadeIn }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />
        <View style={s.bottomBorder} />

        <View style={s.row}>
          {/* LEFT */}
          <View style={s.left}>

            {/* ── Language pill — tap to open switcher ── */}
            <Animated.View style={[{ opacity: greetAnim, transform: [{ translateX: greetAnim.interpolate({ inputRange: [0,1], outputRange: [-14,0] }) }, { scale: pillScale }] }]}>
              <TouchableOpacity onPress={() => setShowLangPicker(true)} activeOpacity={0.85}>
                <View style={[s.langPill, { backgroundColor: learningLang.color }]}>
                  <Text style={s.langPillEmoji}>{learningLang.emoji}</Text>
                  <Text style={s.langPillText}>{learningLang.label}</Text>
                  <Ionicons name="chevron-down" size={11} color="rgba(255,255,255,0.8)" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Greeting */}
            <Animated.View style={[s.greetRow, {
              opacity: nameAnim,
              transform: [{ translateX: nameAnim.interpolate({ inputRange: [0,1], outputRange: [-14,0] }) }],
            }]}>
              <Text style={s.greetEmoji}>{greetEmoji}</Text>
              <Text style={s.greetText}>
                {greetText}, <Text style={s.nameInline}>{displayName}</Text>
              </Text>
            </Animated.View>
          </View>

          {/* RIGHT */}
          <View style={s.right}>
            <FlameChip days={streakDays}  onPress={() => setShowStreak(true)} />
            <CorisChip coris={coris}      onPress={() => setShowCoris(true)} />
            <NotifBtn  count={notifCount} onPress={() => setShowNotif(true)} />
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
    paddingTop:    Platform.OS === "ios" ? 54 : 38,
    paddingBottom: 12,
    zIndex: 100,
    elevation: 4,
    ...CARD_SHADOW,
  },
  bottomBorder: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 1, backgroundColor: BORDER,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 16,
  },
  left: { flex: 1, marginRight: 8, gap: 4 },

  // Language pill
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  langPillEmoji: { fontSize: 14 },
  langPillText: {
    fontSize: 14, fontWeight: "800", color: "#fff",
    fontFamily: "Nunito-ExtraBold",
  },

  greetRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  greetEmoji: { fontSize: 13 },
  greetText: { fontSize: 12, color: TEXT_MID, fontFamily: "Nunito-Regular" },
  nameInline: { fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold" },

  right: { flexDirection: "row", alignItems: "center", gap: 6 },

  // Chips
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: CARD_BG,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 8, paddingVertical: 6,
    ...CARD_SHADOW,
  },
  chipEmoji: { fontSize: 17, lineHeight: 21 },
  chipNum:   { fontSize: 14, fontWeight: "800", lineHeight: 16, fontFamily: "Nunito-ExtraBold" },
  chipSub:   { fontSize: 8, color: TEXT_LIGHT, fontWeight: "600", letterSpacing: 0.3, lineHeight: 10 },
  coinImg:   { width: 18, height: 18, resizeMode: "contain" },
  corisNum:  { fontSize: 14, fontWeight: "800", color: "#E8A000", lineHeight: 16, fontFamily: "Nunito-ExtraBold" },

  // Notif
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center", position: "relative",
    ...CARD_SHADOW,
  },
  badge: {
    position: "absolute", top: 2, right: 2,
    minWidth: 15, height: 15, borderRadius: 8,
    backgroundColor: RED,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: BG, paddingHorizontal: 2,
  },
  badgeText: { fontSize: 7, color: "#fff", fontWeight: "800" },

  // Avatar
  avatarWrap: { position: "relative" },
  avatarGrad: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  avatarImg:     { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: "#fff" },
  avatarInitial: { fontSize: 16, fontWeight: "800", color: "#fff" },
  onlineDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 2, borderColor: BG,
  },
});

// ─────────────────────────────────────────────
// MODAL STYLES
// ─────────────────────────────────────────────
const sm = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.38)", justifyContent: "flex-end" },
  sheet:     { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetTall: { maxHeight: height * 0.72 },
  sheetInner: {
    backgroundColor: CARD_BG,
    paddingTop: 12, paddingHorizontal: 24, paddingBottom: 44, alignItems: "center",
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#DDD", marginBottom: 24 },

  bigFlame: { fontSize: 72, marginBottom: 4 },
  bigCoin:  { width: 72, height: 72, resizeMode: "contain", marginBottom: 4 },

  streakCount: { fontSize: 52, fontWeight: "900", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold", lineHeight: 60 },
  streakTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold", marginTop: 6, marginBottom: 8, textAlign: "center" },
  streakSub:   { fontSize: 14, color: TEXT_MID, fontFamily: "Nunito-Regular", textAlign: "center", lineHeight: 21, marginBottom: 24, paddingHorizontal: 8 },

  weekRow: { flexDirection: "row", gap: 8, marginBottom: 28, justifyContent: "center" },
  dayCol:  { alignItems: "center", gap: 6 },
  dayCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F5F3F0", borderWidth: 1.5, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  dayCircleToday: {
    borderColor: RED, backgroundColor: RED_LIGHT,
    shadowColor: RED, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  dayCirclePast: { borderColor: "#FFCDD2", backgroundColor: "#FFF3F3" },
  dayEmoji: { fontSize: 15 },
  dayLabel: { fontSize: 10, color: TEXT_LIGHT, fontWeight: "700", fontFamily: "Nunito-Bold" },

  tipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%", marginBottom: 24 },
  tipCard: {
    flex: 1, minWidth: "45%",
    backgroundColor: "#F7F5F2", borderRadius: 14, borderWidth: 1, borderColor: "#EEE",
    padding: 12, alignItems: "flex-start", gap: 6,
  },
  tipIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: RED_LIGHT, borderWidth: 1, borderColor: "#FFCDD2",
    alignItems: "center", justifyContent: "center",
  },
  tipText:   { fontSize: 12, color: TEXT_MID, fontFamily: "Nunito-Regular", lineHeight: 16 },
  tipReward: { fontSize: 13, color: RED, fontWeight: "800", fontFamily: "Nunito-Bold" },

  notifHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 },
  notifHeaderTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold" },
  notifMarkAll:     { fontSize: 13, fontWeight: "600", fontFamily: "Nunito-SemiBold" },
  notifItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F7F5F2", borderRadius: 14, borderWidth: 1, borderColor: "#EEE",
    borderLeftWidth: 3, padding: 12, marginBottom: 10, width: "100%", position: "relative",
  },
  notifIcon:  { fontSize: 24, marginTop: 1 },
  notifTitle: { fontSize: 14, fontWeight: "700", color: TEXT_DARK, fontFamily: "Nunito-Bold", marginBottom: 3 },
  notifBody:  { fontSize: 12, color: TEXT_MID, fontFamily: "Nunito-Regular", lineHeight: 17, marginBottom: 4 },
  notifTime:  { fontSize: 10, color: TEXT_LIGHT, fontWeight: "600", fontFamily: "Nunito-SemiBold" },
  unreadDot:  { width: 8, height: 8, borderRadius: 4, position: "absolute", top: 12, right: 12 },

  closeBtn: { width: "100%", borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  closeBtnText: { fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "Nunito-Bold", letterSpacing: 0.3 },
});

// ─────────────────────────────────────────────
// LANG SWITCHER STYLES
// ─────────────────────────────────────────────
const LANG_CARD_W = (width - 40); // full-width single column for 3 langs

const ls = StyleSheet.create({
  sheetInner: {
    backgroundColor: CARD_BG,
    paddingTop: 12, paddingHorizontal: 20,
    paddingBottom: 36,
  },
  titleRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6, paddingHorizontal: 4,
  },
  title: { fontSize: 19, fontWeight: "800", color: TEXT_DARK, fontFamily: "Nunito-ExtraBold" },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#F5F3F0", borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  subtitle: {
    fontSize: 12, color: TEXT_MID, fontFamily: "Nunito-Regular",
    marginBottom: 18, paddingHorizontal: 4,
  },

  // Single column list
  grid: { gap: 10 },

  langCard: {
    width: "100%",
    backgroundColor: CARD_BG,
    borderRadius: 16, overflow: "hidden",
    borderWidth: 1.5, borderColor: BORDER,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    position: "relative",
  },
  langAccentBar: {
    width: 5, alignSelf: "stretch",
  },
  langCardBody: {
    flex: 1, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  langEmoji: { fontSize: 28 },
  langTextGroup: { flex: 1 },
  langName: {
    fontSize: 15, fontWeight: "800", color: TEXT_DARK,
    fontFamily: "Nunito-ExtraBold", marginBottom: 2,
  },
  langRegion: {
    fontSize: 11, color: TEXT_LIGHT,
    fontFamily: "Nunito-Regular",
  },

  checkBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    marginRight: 14,
  },

  comingSoonRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 16, paddingHorizontal: 4,
  },
  comingSoonText: {
    fontSize: 11, color: TEXT_LIGHT, fontFamily: "Nunito-Regular",
  },
});