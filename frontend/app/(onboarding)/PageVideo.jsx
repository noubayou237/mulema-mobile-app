/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Mulema — PageVideo (Intro Video Screen)                      ║
 * ║  Matches the video_de_presentation.png maquette.              ║
 * ║  Fullscreen video with overlay, play button, skip, continue.  ║
 * ║  All business logic preserved (lang resolve, persist, nav).   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  NOTE: Place a fallback image at assets/Avatar-images -profile-picker/video_placeholder.jpg
 *  (a photo of an African market scene, sunset, or cultural scene).
 *  If missing, a dark gradient is shown until the video loads.
 */

import React, { useRef, useState, useEffect } from "react";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import Logger from "../../src/utils/logger";
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
import { useTranslation } from "react-i18next";

import { Colors, Typo, Space, Radius, Shadow } from "../../src/theme/tokens";
import { MButton } from "../../src/components/ui/MComponents";
import { VIDEOS_MAP, IMAGES_MAP } from "../../src/utils/AssetsMap";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../src/hooks/useBackgroundMusic";

const HAS_SEEN_INTRO = "hasSeenIntro";
const HAS_SELECTED_LANGUAGE = "selectedLanguage";

const VIDEO_BY_LANG = {
  bassa: VIDEOS_MAP.bassa_intro_vid,
  duala: VIDEOS_MAP.duala_intro_vid,
  ghomala: VIDEOS_MAP.ghomala_intro_vid,
  default: VIDEOS_MAP.duala_intro_vid,
};

// Map every known form of a language identifier → canonical VIDEO_BY_LANG key.
// Handles ISO-639 codes, backend names, full names, and diacritics.
const LANG_ALIASES = {
  // Bassa
  bassa: "bassa", bas: "bassa", bassa_intro_vid: "bassa",
  // Duala
  duala: "duala", dua: "duala", duala_intro_vid: "duala",
  // Ghomala
  ghomala: "ghomala", gho: "ghomala", ghomala_intro_vid: "ghomala",
  "ghomala'": "ghomala",
};

/**
 * Normalize any language identifier to a canonical VIDEO_BY_LANG key.
 * Accepts ISO codes (bas/dua/gho), full names, names with diacritics, etc.
 */
const normalizeLangKey = (raw) => {
  if (!raw) return null;
  const cleaned = String(raw)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]/g, "")      // remove special chars
    .trim();
  return LANG_ALIASES[cleaned] ?? null;
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
  const { t } = useTranslation();
  const params = useLocalSearchParams?.() ?? {};
  const paramLang = params?.lang ?? null;

  const videoRef = useRef(null);

  const [langResolved, setLangResolved] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Pause background music while intro video plays ──
  useEffect(() => {
    pauseBackgroundMusic();
    return () => { resumeBackgroundMusic(); };
  }, []);

  // ── Resolve language — uses normalizeLangKey to handle all code formats ──
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1. Try the navigation param first
        let resolved = normalizeLangKey(paramLang);

        // 2. Try AsyncStorage
        if (!resolved) {
          const stored = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);
          resolved = normalizeLangKey(stored);
        }

        // 3. Try the Zustand store (activeLanguage name then code)
        if (!resolved) {
          const active = useLanguageStore.getState().activeLanguage;
          if (active) {
            resolved = normalizeLangKey(active.name) ?? normalizeLangKey(active.code);
          }
        }

        // 4. Nothing found → go back to language selection
        if (!resolved) {
          router.replace("/ChoiceLanguage");
          return;
        }

        Logger.info(`[PageVideo] Resolved language: "${paramLang}" → "${resolved}"`);

        if (mounted) {
          setLangResolved(resolved);
          setResolving(false);
        }
      } catch (err) {
        Logger.error("PageVideo resolution error:", err);
        router.replace("/ChoiceLanguage");
      }
    })();

    return () => { mounted = false; };
  }, [paramLang]);

  const videoUri = VIDEO_BY_LANG[langResolved] ?? VIDEO_BY_LANG.default;

  // ── Persist & navigate ──
  const persistAndGoHome = async () => {
    const { languages, setActiveLanguage, setHasSeenIntro } = useLanguageStore.getState();

    // Find the matching language in the store — use normalizeLangKey for robust matching
    const lang = languages.find(
      (l) => normalizeLangKey(l.code) === langResolved || normalizeLangKey(l.name) === langResolved
    );
    if (lang) {
      await setActiveLanguage(lang);
    } else {
      await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, langResolved);
    }

    // 2. Marquer l'intro comme vue (déclenche la redirection dans RootLayout)
    await setHasSeenIntro(true);

    // 3. Navigation explicite au cas où
    router.replace("/(tabs)/home");
  };

  // ── Play handler ──
  const handlePlay = async () => {
    try {
      const status = await videoRef.current?.getStatusAsync();
      if (status?.isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
    } catch (e) {
      Logger.warn("Video toggle error", e);
    }
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
  const placeholderImage = IMAGES_MAP.jungle_background;

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
          key={langResolved}
          ref={videoRef}
          source={videoUri}
          resizeMode="cover"
          shouldPlay={true}
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