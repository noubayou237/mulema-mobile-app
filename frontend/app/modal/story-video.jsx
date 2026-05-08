import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Space } from "../../src/theme/tokens";
import { useThemeStore } from "../../src/stores/useThemeStore";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { VIDEOS_MAP } from "../../src/utils/AssetsMap";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../src/hooks/useBackgroundMusic";

const { width: SW, height: SH } = Dimensions.get("window");

// Story videos shown after a user completes a theme.
// Keyed by "langCode_themeOrder". Missing keys auto-skip the video and
// still unlock the next theme.
//
// Duala has 2 reward videos:
//   • duala_t0.mp4 → plays after the FIRST  theme (order 0 — La Famille)
//   • duala_t2.mp4 → plays after the LAST   theme (order 3 — Les Vêtements)
// Themes 1 and 2 have no video; the flow auto-skips and still unlocks.
const THEME_VIDEOS = {
  bassa_0:   VIDEOS_MAP.bassa_t0,
  bassa_1:   VIDEOS_MAP.bassa_t1,
  bassa_2:   VIDEOS_MAP.bassa_t2,
  bassa_3:   VIDEOS_MAP.bassa_t3,
  duala_0:   VIDEOS_MAP.duala_t0,   // first theme reward
  duala_3:   VIDEOS_MAP.duala_t2,   // last theme reward (asset name ≠ theme order)
  ghomala_0: VIDEOS_MAP.ghomala_t0,
  ghomala_1: VIDEOS_MAP.ghomala_t1,
  ghomala_2: VIDEOS_MAP.ghomala_t2,
  ghomala_3: VIDEOS_MAP.ghomala_t3,
};

export default function OnboardingVideoScreen() {
  const router = useRouter();
  const { langCode, themeId } = useLocalSearchParams();
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const watchVideo = useThemeStore((s) => s.watchVideo);
  const fetchThemes = useThemeStore((s) => s.fetchThemes);
  const getThemeById = useThemeStore((s) => s.getThemeById);
  const { activeLanguage, languages } = useLanguageStore();

  const getPatrimonialId = (lang, allLangs) => {
    if (!lang) return null;
    if (lang.type === "patrimonial") return lang.id;
    const n = (lang.name ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const match = (allLangs || []).find((l) => {
      if (l.type !== "patrimonial") return false;
      const ln = l.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      return ln.includes(n) || n.includes(ln);
    });
    return match?.id ?? null;
  };

  const theme = themeId ? getThemeById(themeId) : null;
  const themeOrder = theme?.order ?? null;
  const lang = langCode?.toLowerCase() ?? "duala";
  const source = themeOrder !== null ? (THEME_VIDEOS[`${lang}_${themeOrder}`] ?? null) : null;

  const handleFinished = async () => {
    if (themeId) {
      await watchVideo(themeId);
      // Force-refresh themes so the newly-unlocked lesson card appears
      // immediately when the lesson list comes into view.
      const langId = getPatrimonialId(activeLanguage, languages);
      if (langId) await fetchThemes(langId, true);
      // Go to the lesson list so the user sees the next card unlocked.
      router.replace("/(tabs)/lessons");
    } else {
      router.replace("/(tabs)/home");
    }
  };

  useEffect(() => {
    pauseBackgroundMusic();
    return () => { resumeBackgroundMusic(); };
  }, []);

  // No video available for this theme — mark watched and move on immediately.
  useEffect(() => {
    if (source === null) {
      handleFinished();
    }
  }, [source]);

  if (source === null) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {loading && (
        <View style={s.loader}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={s.loaderTxt}>Chargement de l'histoire...</Text>
        </View>
      )}

      <Video
        ref={videoRef}
        source={source}
        style={s.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onLoad={() => setLoading(false)}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            handleFinished();
          }
        }}
      />

      <TouchableOpacity onPress={handleFinished} style={s.skipBtn} activeOpacity={0.7}>
        <Text style={s.skipTxt}>Passer</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SW,
    height: SH,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "#000",
  },
  loaderTxt: {
    color: "#FFF",
    marginTop: Space.md,
    fontFamily: "Nunito-Regular",
  },
  skipBtn: {
    position: "absolute",
    bottom: 50,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skipTxt: {
    color: "#FFF",
    fontFamily: "Fredoka_600SemiBold",
    marginRight: 4,
  },
});
