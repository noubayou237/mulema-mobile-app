/**
 * MULEMA — Page Thèmes / Leçons
 * Design fidèle à la maquette
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
  ActivityIndicator, RefreshControl, Animated, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";

import { useThemeStore }     from "../../../src/stores/useThemeStore";
import { useLanguageStore }  from "../../../src/stores/useLanguageStore";
import { useDashboardStore } from "../../../src/stores/useDashboardStore";

// ID Duala connu — fallback si AsyncStorage vide
const DUALA_ID = "c81daa9d-7be2-4896-91c8-7531c994aec5";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

/* ── Palette ────────────────────────────────────────────────── */
const RED      = "#B71C1C";
const RED_L    = "#FFEBEE";
const BG       = "#F0F2F8";
const CARD_BG  = "#FFFFFF";
const TRACK    = "#DDE3F0";
const TEXT     = "#1A1A2E";
const TEXT_SUB = "#5A6070";
const FAINT    = "#AAAABC";

/* ── Tips par langue ────────────────────────────────────────── */
const LANG_TIPS = {
  duala: [
    { title: "Le Duala 🌊", body: "Le Duala est une langue bantoue parlée par plus d'un million de personnes à Douala, la capitale économique du Cameroun. C'est la langue du commerce et de la mer !" },
    { title: "Douala, ville monde 🏙️", body: "Douala est le principal port d'Afrique centrale. Les Duala, maîtres de la navigation, ont longtemps contrôlé le commerce fluvial." },
    { title: "Salutation Duala 🤝", body: "En Duala, 'Mbolo' signifie bonjour. La salutation est fondamentale — on ne se croise jamais sans se saluer !" },
  ],
  ghomala: [
    { title: "Le Ghomálá' 🌿", body: "Le Ghomálá' est la langue des Bamiléké des Hauts-Plateaux de l'Ouest Cameroun. Ce peuple de commerçants et d'artisans est réputé pour son sens des affaires." },
    { title: "La chefferie 👑", body: "Chez les Bamiléké, la chefferie est sacrée. Le chef (Fo) est gardien des traditions, de la langue et de l'identité culturelle." },
    { title: "Les Bamiléké 🎨", body: "Les Bamiléké sont connus pour leurs masques sculptés, leurs danses traditionnelles et leurs tissus aux couleurs vives. Une culture riche et vivante !" },
  ],
  bassa: [
    { title: "Le Bassa 🦁", body: "Le Bassa (ou Basaa) est parlé dans les régions du Littoral et du Centre au Cameroun. C'est une langue à tons, chaque tonalité change le sens d'un mot !" },
    { title: "Les Bassa, peuple résistant ⚔️", body: "Les Bassa sont célèbres pour leur résistance héroïque à la colonisation. Um Nyobè, figure nationale, était Bassa." },
    { title: "La forêt sacrée 🌳", body: "Pour les Bassa, la forêt est un lieu sacré peuplé d'esprits. La nature et les ancêtres guident la vie quotidienne." },
  ],
  default: [
    { title: "Langues du Cameroun 🇨🇲", body: "Le Cameroun est l'un des pays les plus multilingues du monde avec plus de 280 langues nationales. Une richesse unique !" },
    { title: "Mulema 📚", body: "Mulema signifie 'apprendre' en langue locale. Chaque leçon te rapproche de ta culture et de tes racines." },
    { title: "Biodiversité culturelle 🌍", body: "Chaque langue camerounaise porte une vision du monde unique. Apprendre une langue c'est découvrir une façon de penser !" },
  ],
};

const getTips = (langName = "") => {
  const n = langName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (n.includes("duala") || n.includes("douala")) return LANG_TIPS.duala;
  if (n.includes("ghomala") || n.includes("ghomal") || n.includes("bamilek")) return LANG_TIPS.ghomala;
  if (n.includes("bassa") || n.includes("basaa")) return LANG_TIPS.bassa;
  return LANG_TIPS.default;
};

/* ── Icônes par code thème ──────────────────────────────────── */
const ICONS = {
  salutation: "hand-left", salutations: "hand-left",
  famille: "people",       family: "people",
  voyage: "airplane",
  nourriture: "restaurant", cuisine: "restaurant",
  animaux: "paw",
  vetement: "shirt",       vetements: "shirt",
  nature: "leaf",          corps: "body",
  maison: "home",          travail: "briefcase",
  sport: "football",       couleurs: "color-palette",
  chiffres: "calculator",  jours: "calendar",
  pronoms: "chatbubble",
};
const icon = (code) => ICONS[(code ?? "").toLowerCase()] ?? "book-outline";

/* ════════════════════════════════════════════════════════════════
   THEME CARD
   ════════════════════════════════════════════════════════════════ */
const ThemeCard = ({ theme, index, onPress }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 380, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const locked = theme.locked ?? false;
  const pct    = theme.lessonsCount > 0
    ? Math.round((theme.lessonsCompleted / theme.lessonsCount) * 100) : 0;

  const R  = 34;
  const C2 = 2 * Math.PI * R;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        onPress={() => !locked && onPress(theme)}
        activeOpacity={locked ? 1 : 0.75}
        style={[s.card, locked && s.cardLocked]}
      >
        {/* Anneau SVG + icône */}
        <View style={s.ringWrap}>
          <Svg width={80} height={80} style={StyleSheet.absoluteFill}>
            {/* Track */}
            <Circle cx={40} cy={40} r={R} stroke={locked ? "#E0E0EA" : TRACK} strokeWidth={5} fill="none" />
            {/* Arc progression */}
            {!locked && pct > 0 && (
              <Circle
                cx={40} cy={40} r={R}
                stroke={RED} strokeWidth={5} fill="none"
                strokeDasharray={`${C2} ${C2}`}
                strokeDashoffset={C2 - (pct / 100) * C2}
                strokeLinecap="round"
                rotation="-90" origin="40, 40"
              />
            )}
          </Svg>

          {/* Cercle icône */}
          <View style={[s.iconCircle, locked && s.iconCircleLocked]}>
            {locked
              ? <Ionicons name="lock-closed" size={20} color={FAINT} />
              : <Ionicons name={icon(theme.code)} size={24} color={RED} />
            }
          </View>
        </View>

        {/* Nom FR */}
        <Text style={[s.cardName, locked && { color: FAINT }]} numberOfLines={1}>
          {theme.name ?? "—"}
        </Text>
        {/* Nom local */}
        {theme.nameLocal ? (
          <Text style={[s.cardLocal, locked && { color: FAINT }]} numberOfLines={1}>
            {theme.nameLocal}
          </Text>
        ) : null}

        {/* Sous-titre */}
        {locked
          ? <Text style={s.lockMsg} numberOfLines={2}>{theme.lockHint ?? "Verrouillé"}</Text>
          : <Text style={s.cardPct}>{pct}% Complété</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ════════════════════════════════════════════════════════════════
   SCREEN
   ════════════════════════════════════════════════════════════════ */
export default function ThemesScreen() {
  const router = useRouter();
  const { activeLanguage, languages, fetchLanguages, loadActiveLanguage } = useLanguageStore();
  const { themes, isLoading, fetchThemes } = useThemeStore();
  const { data: dash, fetchDashboard }     = useDashboardStore();
  const [refreshing, setRefreshing]        = useState(false);

  const tips = getTips(activeLanguage?.name ?? "");
  const tip  = tips[Math.floor(Date.now() / 60000) % tips.length];

  // Les thèmes sont liés aux langues PATRIMONIALES — toujours utiliser cet ID
  const getPatrimonialId = (lang, allLangs) => {
    if (!lang) return DUALA_ID;
    if (lang.type === "patrimonial") return lang.id;
    // Langue officielle : chercher la patrimoniale du même nom
    const langName = (lang.name ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const match = (allLangs || []).find((l) => {
      if (l.type !== "patrimonial") return false;
      const n = l.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return n.includes(langName) || langName.includes(n);
    });
    return match?.id ?? DUALA_ID;
  };

  useEffect(() => {
    const init = async () => {
      // 1. Langue déjà dans le store
      if (activeLanguage) {
        const langId = getPatrimonialId(activeLanguage, languages);
        fetchThemes(langId);
        fetchDashboard();
        return;
      }

      // 2. Charger depuis l'API
      try {
        const langs = await fetchLanguages();
        const lang  = await loadActiveLanguage();
        const langId = getPatrimonialId(lang, langs);
        fetchThemes(langId);
        fetchDashboard();
        return;
      } catch {}

      // 3. Fallback final : ID Duala connu
      fetchThemes(DUALA_ID);
      fetchDashboard();
    };
    init();
  }, [activeLanguage?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    const langId = getPatrimonialId(activeLanguage, languages);
    await Promise.all([fetchThemes(langId), fetchDashboard()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.menuBtn}>
            <Ionicons name="menu" size={24} color={TEXT} />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>Thèmes</Text>
            <Text style={s.headerSub}>de {activeLanguage?.name ?? "Duala"}</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          <View style={s.badge}>
            <Ionicons name="flash" size={13} color="#E8A020" />
            <Text style={s.badgeXP}>{dash?.totalPoints ?? 0}</Text>
          </View>
          <View style={[s.badge, s.badgeHeart]}>
            <Ionicons name="heart" size={13} color="#E53E3E" />
            <Text style={[s.badgeXP, { color: "#E53E3E" }]}>{dash?.hearts ?? 5}</Text>
          </View>
          <View style={s.avatar} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[RED]} tintColor={RED} />
        }
      >
        {/* ── HERO CARD ── */}
        <View style={s.hero}>
          <View style={s.heroBlob} />
          <Text style={s.heroTitle}>Apprentissage{"\n"}Quotidien</Text>
          <Text style={s.heroSub}>
            Continuez votre voyage linguistique{"\n"}à travers la culture Camerounaise.
          </Text>
          <View style={s.streakPill}>
            <Text style={s.streakIcon}>✦</Text>
            <Text style={s.streakTxt}>
              SÉRIE DE {dash?.streakDays ?? 0} JOUR{(dash?.streakDays ?? 0) !== 1 ? "S" : ""}
            </Text>
          </View>
        </View>

        {/* ── GRILLE THÈMES ── */}
        {isLoading && themes.length === 0 ? (
          <ActivityIndicator size="large" color={RED} style={{ marginVertical: 48 }} />
        ) : !isLoading && themes.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="book-outline" size={44} color={FAINT} />
            <Text style={s.emptyTxt}>
              Aucun thème disponible.{"\n"}Tire vers le bas pour actualiser.
            </Text>
          </View>
        ) : (
          <View style={s.grid}>
            {themes.map((theme, idx) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                index={idx}
                onPress={(t) => router.push(`/(tabs)/lessons/${t.id}`)}
              />
            ))}
          </View>
        )}

        {/* ── LE SAVIEZ-VOUS (dynamique selon langue) ── */}
        <View style={s.tip}>
          <View style={s.tipBadge}>
            <Text style={s.tipBadgeTxt}>LE SAVIEZ-VOUS ?</Text>
          </View>
          <Text style={s.tipTitle}>{tip.title}</Text>
          <Text style={s.tipBody}>{tip.body}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: BG,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuBtn:    { padding: 4 },
  headerTitle:{ fontSize: 18, fontFamily: "Fredoka_600SemiBold", color: TEXT, lineHeight: 22 },
  headerSub:  { fontSize: 13, fontFamily: "Nunito-Regular", color: TEXT_SUB },
  headerRight:{ flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF7E6",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeHeart: { backgroundColor: "#FFF0F0" },
  badgeXP:    { fontSize: 13, fontFamily: "Fredoka_600SemiBold", color: "#E8A020" },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: RED,
  },

  /* Hero */
  hero: {
    backgroundColor: RED,
    borderRadius: 24, padding: 24,
    marginBottom: 20, overflow: "hidden",
  },
  heroBlob: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)", right: -50, top: -50,
  },
  heroTitle: { fontSize: 28, fontFamily: "Fredoka_700Bold", color: "#FFF", lineHeight: 34, marginBottom: 8 },
  heroSub:   { fontSize: 14, fontFamily: "Nunito-Regular", color: "rgba(255,255,255,0.82)", lineHeight: 20, marginBottom: 16 },
  streakPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  streakIcon: { color: "#FFD166", fontSize: 12 },
  streakTxt:  { fontSize: 12, fontFamily: "Fredoka_600SemiBold", color: "#FFF", letterSpacing: 0.8 },

  /* Grille */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 },

  /* Card */
  card: {
    width: CARD_W, backgroundColor: CARD_BG,
    borderRadius: 20, alignItems: "center",
    paddingVertical: 20, paddingHorizontal: 10,
    shadowColor: "#A0A8C0", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 3,
  },
  cardLocked: { backgroundColor: "#F5F6FA" },

  /* Anneau */
  ringWrap: {
    width: 80, height: 80,
    alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  iconCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: RED_L,
    alignItems: "center", justifyContent: "center",
  },
  iconCircleLocked: { backgroundColor: "#EDEDF2" },

  cardName:  { fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: TEXT, marginTop: 10, textAlign: "center" },
  cardLocal: { fontSize: 11, fontFamily: "Nunito-Regular", color: TEXT_SUB, textAlign: "center", marginTop: 1 },
  cardPct:  { fontSize: 12, fontFamily: "Nunito-Regular", color: TEXT_SUB, marginTop: 3 },
  lockMsg:  { fontSize: 11, fontFamily: "Nunito-Regular", color: FAINT, textAlign: "center", lineHeight: 16, marginTop: 3 },

  /* Empty */
  empty:    { alignItems: "center", paddingVertical: 48 },
  emptyTxt: { fontSize: 14, fontFamily: "Nunito-Regular", color: FAINT, textAlign: "center", marginTop: 12, lineHeight: 20 },

  /* Tip */
  tip:        { backgroundColor: "#FFF3E0", borderRadius: 20, padding: 20, marginBottom: 8 },
  tipBadge:   { backgroundColor: "#E07000", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 10 },
  tipBadgeTxt:{ fontSize: 11, fontFamily: "Fredoka_600SemiBold", color: "#FFF", letterSpacing: 0.5 },
  tipTitle:   { fontSize: 17, fontFamily: "Fredoka_700Bold", color: TEXT, marginBottom: 6 },
  tipBody:    { fontSize: 13, fontFamily: "Nunito-Regular", color: "#4A5060", lineHeight: 19, marginBottom: 8 },
  tipLink:    { fontSize: 13, fontFamily: "Nunito-SemiBold", color: "#C06000" },
});
