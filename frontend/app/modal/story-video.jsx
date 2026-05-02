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
import { VIDEOS_MAP } from "../../src/utils/AssetsMap";

const { width: SW, height: SH } = Dimensions.get("window");

// Story videos shown after a user completes a theme.
// Keyed by "langCode_themeOrder". Missing keys (duala_1 = corrupted source,
// duala_3 = no recording) auto-skip the video and still unlock the next theme.
const THEME_VIDEOS = {
  bassa_0:   VIDEOS_MAP.bassa_t0,
  bassa_1:   VIDEOS_MAP.bassa_t1,
  bassa_2:   VIDEOS_MAP.bassa_t2,
  bassa_3:   VIDEOS_MAP.bassa_t3,
  duala_0:   VIDEOS_MAP.duala_t0,
  duala_2:   VIDEOS_MAP.duala_t2,
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
  const getThemeById = useThemeStore((s) => s.getThemeById);

  const theme = themeId ? getThemeById(themeId) : null;
  const themeOrder = theme?.order ?? null;
  const lang = langCode?.toLowerCase() ?? "duala";
  const source = themeOrder !== null ? (THEME_VIDEOS[`${lang}_${themeOrder}`] ?? null) : null;

  const handleFinished = async () => {
    if (themeId) {
      await watchVideo(themeId);
      router.replace(`/(tabs)/lessons/${themeId}`);
    } else {
      router.replace("/(tabs)/home");
    }
  };

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
