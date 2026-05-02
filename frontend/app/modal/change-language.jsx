/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Change Language Screen                              ║
 * ║  Matches changer_de_langue.png maquette                       ║
 * ║  Place at: app/modal/change-language.jsx                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { useLanguageStore } from "../../src/stores/useLanguageStore";

/* ── 3 heritage languages are available ── */
const ALLOWED_LANGUAGES = ["bassa", "duala", "ghomala"];
const isAllowedLanguage = (lang) => {
  const name = (lang?.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ALLOWED_LANGUAGES.some(allowed => name.includes(allowed));
};
import { useAuthStore } from "../../src/stores/useAuthStore";

/* ── Language Row ── */
const LanguageRow = ({ language, isActive, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(language)}
      activeOpacity={0.7}
      style={[s.langRow, Shadow.sm]}
    >
      <View style={s.flagCircle}>
        <Text style={{ fontSize: 24 }}>{getFlag(language.code)}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: Space.lg }}>
        <Text style={Typo.titleMd}>{language.name}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} style={{ marginLeft: Space.md }} />
    </TouchableOpacity>
  );
};

/* ── Flag emoji helper ── */
const getFlag = (code) => {
  const flags = {
    dua: "🇨🇲", ewo: "🇨🇲", bas: "🇨🇲", bam: "🇨🇲", ful: "🇨🇲",
    gho: "🇨🇲", wol: "🇸🇳", swa: "🇰🇪", yor: "🇳🇬", zul: "🇿🇦",
    hau: "🇳🇬", ibo: "🇳🇬", amh: "🇪🇹", lin: "🇨🇩",
  };
  return flags[code] || "🌍";
};

/* ══════════════════════════════════════════════════════════════ */

export default function ChangeLanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { activeLanguage, languages, isLoading, fetchLanguages, setActiveLanguage } = useLanguageStore();

  useEffect(() => {
    if (languages.length === 0) fetchLanguages();
  }, []);

  const handleSelectLanguage = async (language) => {
    if (language.id === activeLanguage?.id) return;
    
    // 1. Set the new language FIRST — before anything that triggers layout guards
    await setActiveLanguage(language);
    
    // 2. Clear the theme store cache for the previous language
    const { useThemeStore } = await import("../../src/stores/useThemeStore");
    useThemeStore.getState().clearAll();
    
    // 3. Navigate explicitly BEFORE resetting hasSeenIntro.
    //    If we reset hasSeenIntro first, the layout guard fires with the old language.
    router.replace({
      pathname: "/(onboarding)/PageVideo",
      params: { lang: language.name }
    });

    // 4. Reset intro flag AFTER navigation — layout guard won't override our route
    const { setHasSeenIntro } = useLanguageStore.getState();
    await setHasSeenIntro(false);
  };

  const otherLanguages = React.useMemo(() => {
    const activeName = (activeLanguage?.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const seen = new Set([activeName]);
    
    return languages.filter((l) => {
      const name = (l?.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (seen.has(name) || !isAllowedLanguage(l)) return false;
      seen.add(name);
      return true;
    });
  }, [languages, activeLanguage]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      {/* ── Header ── */}
      <View style={[s.header, { paddingHorizontal: Space["2xl"] }]}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/home");
          }} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        {/* <Text style={[Typo.titleLg, { marginLeft: Space.md, flex: 1 }]}>Mes Langues</Text> */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Title ── */}
        <Text style={Typo.displayMd}>{t("settingsModal.myLanguages")}</Text>
        <Text style={[Typo.bodyLg, { marginTop: Space.sm, marginBottom: Space["2xl"] }]}>
          {t("settingsModal.manageLearning")}
        </Text>

        {/* ── Active Session Card ── */}
        {activeLanguage && (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.activeCard}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Space.lg }}>
              <View style={s.activeDot} />
              <Text style={[Typo.labelSm, { color: Colors.onPrimary, marginLeft: Space.sm }]}>{t("settingsModal.activeSession")}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Space.lg }}>
              <View style={s.activeFlagCircle}>
                <Text style={{ fontSize: 28 }}>{getFlag(activeLanguage.code)}</Text>
              </View>
              <View style={{ marginLeft: Space.lg, flex: 1 }}>
                <Text style={[Typo.headlineMd, { color: Colors.onPrimary }]}>{activeLanguage.name}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/home")}
              activeOpacity={0.8}
              style={s.continueBtn}
            >
              <Text style={[Typo.titleSm, { color: Colors.primary }]}>{t("common.continue")}</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* ── Autres Langues ── */}
        <Text style={[Typo.labelSm, { marginTop: Space["3xl"], marginBottom: Space.lg }]}>{t("settingsModal.otherLanguages")}</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: Space["3xl"] }} />
        ) : (
          otherLanguages.map((lang) => (
            <LanguageRow
              key={lang.id}
              language={lang}
              isActive={false}
              onPress={handleSelectLanguage}
            />
          ))
        )}

        {/* ── Explorer de nouvelles langues ── */}
        <TouchableOpacity activeOpacity={0.7} style={s.exploreBtn}>
          <View style={s.exploreIcon}>
            <Ionicons name="add" size={28} color={Colors.primary} />
          </View>
          <Text style={[Typo.titleSm, { color: Colors.primary, marginTop: Space.md }]}>
            {t("settingsModal.exploreLanguages")}
          </Text>
        </TouchableOpacity>


        <View style={{ height: Space["4xl"] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: Space["2xl"], paddingBottom: Space["2xl"] },
  header: { flexDirection: "row", alignItems: "center", paddingTop: Platform.OS === "ios" ? 60 : 44, paddingBottom: Space.xl },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.primary },

  // Active session card
  activeCard: { borderRadius: Radius.xl, padding: Space["2xl"], marginBottom: Space.sm },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.secondaryContainer },
  activeFlagCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.onPrimary + "20", alignItems: "center", justifyContent: "center" },
  activeProgressTrack: { flex: 1, height: 6, backgroundColor: Colors.onPrimary + "30", borderRadius: 3, maxWidth: 100 },
  activeProgressFill: { height: "100%", backgroundColor: Colors.onPrimary, borderRadius: 3 },
  continueBtn: { backgroundColor: Colors.onPrimary, borderRadius: Radius.full, paddingVertical: Space.md, alignItems: "center" },

  // Language row
  langRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surfaceContainerLowest, borderRadius: Radius.xl, padding: Space.xl, marginBottom: Space.md },
  flagCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceContainerLow, alignItems: "center", justifyContent: "center" },
  miniProgress: { width: 6, height: 40, backgroundColor: Colors.surfaceVariant, borderRadius: 3, overflow: "hidden", justifyContent: "flex-end" },
  miniProgressFill: { width: "100%", backgroundColor: Colors.primary, borderRadius: 3 },

  // Explore button
  exploreBtn: { alignItems: "center", paddingVertical: Space["2xl"], borderWidth: 2, borderColor: Colors.surfaceVariant, borderStyle: "dashed", borderRadius: Radius.xl, marginTop: Space.md },
  exploreIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + "10", alignItems: "center", justifyContent: "center" },
});