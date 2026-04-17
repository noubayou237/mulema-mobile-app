/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — PageVideo (Intro Video Screen)                      ║
 * ║  Matches the video_de_presentation.png maquette.              ║
 * ║  Fullscreen video with overlay, play button, skip, continue.  ║
 * ║  All business logic preserved (lang resolve, persist, nav).   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  NOTE: Place a fallback image at assets/images/video_placeholder.jpg
 *  (a photo of an African market scene, sunset, or cultural scene).
 *  If missing, a dark gradient is shown until the video loads.
 */

import React, { useRef, useState, useEffect } from "react";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ── Design system ──
import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { MButton } from "../../src/components/ui/MComponents";

const HAS_SEEN_INTRO = "hasSeenIntro";
const HAS_SELECTED_LANGUAGE = "selectedLanguage";

const VIDEO_BY_LANG = {
  bassa: require("../../assets/BassaVideos/video_2026-04-15_13-47-01.mp4"),
  duala: require("../../assets/DualaVideos/IMG_5666.MOV"),
  ghomala: require("../../assets/GhomalaVidoes/IMG_5927.MOV"),
  default: require("../../assets/DualaVideos/IMG_5666.MOV"),
};

const { width, height } = Dimensions.get("window");

/* ══════════════════════════════════════════════════════════════
   Play Button — frosted glass circle
   ══════════════════════════════════════════════════════════════ */

const PlayButton = ({ onPress, loading }) => {
  if (loading) {
    return (
      <View style={s.playCircle}>
        <ActivityIndicator size="large" color={Colors.onPrimary} />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={s.playCircle}>
      <View style={s.playTriangle} />
    </TouchableOpacity>
  );
};

/* ══════════════════════════════════════════════════════════════
   Progress Dots — 3 dots, first one active
   ══════════════════════════════════════════════════════════════ */

const ProgressDots = ({ active = 0, total = 3 }) => (
  <View style={s.dotsRow}>
    {Array(total).fill(0).map((_, i) => (
      <View
        key={i}
        style={[
          s.dot,
          i === active
            ? { backgroundColor: Colors.primaryContainer, width: 32 }
            : { backgroundColor: Colors.onPrimary + "40", width: 12 },
        ]}
      />
    ))}
  </View>
);

/* ══════════════════════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════════════════════ */

export default function PageVideo() {
  const router = useRouter();
  const params = useLocalSearchParams?.() ?? {};
  const paramLang = params?.lang ?? null;

  const videoRef = useRef(null);

  const [langResolved, setLangResolved] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Resolve language — ORIGINAL LOGIC ──
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        let chosen = paramLang ?? null;

        if (!chosen) {
          const stored = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);
          if (stored) chosen = stored;
        }

        if (!chosen) {
          router.replace("/ChoiceLanguage");
          return;
        }

        chosen = String(chosen).toLowerCase();

        if (mounted) {
          setLangResolved(chosen);
          setResolving(false);
        }
      } catch {
        router.replace("/ChoiceLanguage");
      }
    })();

    return () => { mounted = false; };
  }, [paramLang]);

  const videoUri = VIDEO_BY_LANG[langResolved] ?? VIDEO_BY_LANG.default;

  // ── Persist & navigate — ORIGINAL LOGIC ──
// ✅ NOUVEAU — utilise le store pour que le root layout détecte la langue
const persistAndGoHome = async () => {
  // Trouver l'objet langue complet dans le store
  const { languages, setActiveLanguage } = useLanguageStore.getState();
  const lang = languages.find(
    (l) => l.code === langResolved || l.name.toLowerCase() === langResolved
  );
  
  if (lang) {
    await setActiveLanguage(lang);
  } else {
    // Fallback si la langue n'est pas trouvée dans le store
    await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, langResolved);
  }
  
  await AsyncStorage.setItem(HAS_SEEN_INTRO, "true");
  router.replace("/(tabs)/home");
};

  // ── Play handler ──
  const handlePlay = async () => {
    try {
      if (isPlaying) {
        await videoRef.current?.pauseAsync?.();
        setIsPlaying(false);
      } else {
        await videoRef.current?.replayAsync?.();
        setIsPlaying(true);
      }
    } catch {}
  };

  // ── Get description — ORIGINAL LOGIC ──
  const getDescription = (lang) => {
    const l = (lang || "").toLowerCase();
    switch (l) {
      case "bassa": return t("onboarding.videoDesc", { lang: "Bassa" });
      case "duala": return t("onboarding.videoDesc", { lang: "Duala" });
      case "ghomala": return t("onboarding.videoDesc", { lang: "Ghomala" });
      default: return t("onboarding.videoDescDefault", "Découvrez Mulema en action");
    }
  };

  // ── Loading state ──
  if (resolving) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center" }]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Typo.bodyMd, { color: Colors.textSecondary, marginTop: Space.md }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  // ── Fallback background ──
  // If you have a placeholder image, uncomment ImageBackground below.
  // Otherwise the gradient acts as the fallback.
  let placeholderImage = null;
  try {
    placeholderImage = require("../../assets/images/video_placeholder.jpg");
  } catch {
    placeholderImage = null;
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Fullscreen Video ── */}
      <View style={s.videoFill}>
        {/* Fallback image or dark bg */}
        {placeholderImage ? (
          <ImageBackground
            source={placeholderImage}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={["#1a1a2e", "#16213e", "#0f3460"]}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Video layer */}
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          resizeMode="cover"
          shouldPlay={false}
          isLooping={false}
          style={StyleSheet.absoluteFill}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) setVideoLoading(false);
            if (status?.didJustFinish) persistAndGoHome();
            if (status?.isPlaying !== undefined) setIsPlaying(status.isPlaying);
          }}
        />

        {/* Dark gradient overlay — bottom heavy */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.05)",
            "rgba(0,0,0,0.1)",
            "rgba(0,0,0,0.5)",
            "rgba(0,0,0,0.85)",
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* ── Skip button (top right) ── */}
        <TouchableOpacity
          onPress={persistAndGoHome}
          activeOpacity={0.7}
          style={s.skipBtn}
        >
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* ── Center play button ── */}
        {!isPlaying && (
          <View style={s.playCenterWrap}>
            <PlayButton onPress={handlePlay} loading={videoLoading} />
          </View>
        )}

        {/* ── Bottom content (over video) ── */}
        <View style={s.bottomOverlay}>
          {/* Progress dots */}
          <ProgressDots active={0} total={3} />

          {/* Description */}
          <Text style={s.description}>
            {getDescription(langResolved)}
          </Text>

          {/* Continue button */}
          <MButton
            title={t("common.continue")}
            onPress={persistAndGoHome}
            // icon="arrow-forward"
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────────
   Styles
   ────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  // Fullscreen video container
  videoFill: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },

  // Skip
  skipBtn: {
    position: "absolute",
    right: Space["2xl"],
    top: Platform.OS === "ios" ? 58 : 40,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    zIndex: 10,
  },
  skipText: {
    color: Colors.onPrimary,
    ...Typo.titleSm,
  },

  // Play button center
  playCenterWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 5,
    borderLeftWidth: 20,
    borderLeftColor: Colors.onPrimary,
    borderTopWidth: 13,
    borderTopColor: "transparent",
    borderBottomWidth: 13,
    borderBottomColor: "transparent",
  },

  // Progress dots
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space.sm,
    marginBottom: Space.xl,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },

  // Bottom overlay
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Space["2xl"],
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    paddingTop: Space["2xl"],
    zIndex: 10,
  },

  // Description
  description: {
    ...Typo.titleLg,
    color: Colors.onPrimary,
    textAlign: "center",
    marginBottom: Space["2xl"],
  },
});