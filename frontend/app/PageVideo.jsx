// app/PageVideo.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
// NOTE: useLocalSearchParams est le hook recommandé pour les pages dans app/
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { authStyles } from "../assets/styles/auth.styles"; // adapte le chemin si besoin

const HAS_SEEN_INTRO = "hasSeenIntro";
const HAS_SELECTED_LANGUAGE = "hasSelectedLanguage";

// Mapping langue -> local videos for theme completion and intro
const LOCAL_VIDEOS = {
  bassa: [
    require("../assets/BassaVideos/video_2026-04-15_13-47-01.mp4"),
    require("../assets/BassaVideos/video_2026-04-15_13-47-23.mp4"),
    require("../assets/BassaVideos/video_2026-04-15_13-47-35.mp4"),
    require("../assets/BassaVideos/video_2026-04-15_13-47-49.mp4"),
  ],
  duala: [
    require("../assets/DualaVideos/IMG_5666.MOV"),
    require("../assets/DualaVideos/IMG_5747.MOV"),
    require("../assets/DualaVideos/IMG_5927.MOV"),
    require("../assets/DualaVideos/IMG_5666.MOV"), // Repeated as requested since Duala has fewer videos
  ],
  ghomala: [
    require("../assets/GhomalaVidoes/IMG_5927.MOV"),
    require("../assets/GhomalaVidoes/IMG_5941.MOV"),
    require("../assets/GhomalaVidoes/IMG_5962.MOV"),
    require("../assets/GhomalaVidoes/IMG_5980.MOV"),
  ],
  default: [],
};

const REMOTE_FALLBACK = "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";


export default function PageVideo() {
  const router = useRouter();

  // useLocalSearchParams() fonctionne correctement pour les fichiers dans app/
  // Si ton expo-router est ancien et n'expose pas ce hook, mets à jour expo-router.
  const params = useLocalSearchParams?.() ?? {};
  const paramLang = params?.lang ?? null;
  const paramThemeId = params?.themeId ?? null;
  const paramThemeName = params?.themeName ?? null;

  const videoRef = useRef(null);

  // states
  const [langResolved, setLangResolved] = useState(null); // langue finale utilisée
  const [resolving, setResolving] = useState(true); // resolution initiale (lecture AsyncStorage / param)
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Resolve language on mount or when paramLang changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) if param provided, use it
        let chosen = paramLang ?? null;

        // 2) otherwise try AsyncStorage
        if (!chosen) {
          const stored = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);
          if (stored) chosen = stored;
        }

        // 3) if still not found -> redirect to ChoiceLanguage
        if (!chosen) {
          router.replace("/ChoiceLanguage");
          return;
        }

        // normalise and set
        chosen = String(chosen).toLowerCase();

        if (mounted) {
          setLangResolved(chosen);
          setResolving(false);
        }
      } catch (err) {
        console.warn("PageVideo: error resolving lang", err);
        router.replace("/ChoiceLanguage");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [paramLang, router]);

  // choose videoSource based on resolved language and theme logic
  let videoSource = { uri: REMOTE_FALLBACK };

  if (langResolved && LOCAL_VIDEOS[langResolved] && LOCAL_VIDEOS[langResolved].length > 0) {
    const videos = LOCAL_VIDEOS[langResolved];
    let index = 0;
    
    // Deterministically pick a video based on themeId if present
    if (paramThemeId) {
      let hash = 0;
      for (let i = 0; i < paramThemeId.length; i++) {
          hash = String(paramThemeId).charCodeAt(i) + ((hash << 5) - hash);
      }
      index = Math.abs(hash) % videos.length;
    }
    
    videoSource = videos[index];
  }

  useEffect(() => {
    // Reset player state when language changes (utile si l'utilisateur revient)
    setIsPlaying(false);
    setStatus({});
    setVideoLoading(true);
  }, [langResolved]);

  // Helper: ensure HAS_SELECTED_LANGUAGE stored and mark intro seen
  const persistLangAndSeen = async (langToStore) => {
    try {
      if (langToStore) {
        await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, String(langToStore));
      }
    } catch (e) {
      console.warn("PageVideo: failed to save selected language", e);
    }

    try {
      await AsyncStorage.setItem(HAS_SEEN_INTRO, "true");
    } catch (e) {
      console.warn("PageVideo: failed to save hasSeenIntro", e);
    }
  };

  // Navigation to home (or back to lessons) after video
  const navigateHomeWithLang = async (replace = true) => {
    const langToUse = langResolved ?? "default";
    await persistLangAndSeen(langToUse);
    
    // If coming from a theme completion, go back to lessons instead of home
    if (paramThemeId) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/lessons");
      }
    } else {
      const target = `/home?lang=${encodeURIComponent(langToUse)}`;
      if (replace) router.replace(target);
      else router.push(target);
    }
  };

  // Skip handler
  const handleSkip = async () => {
    await navigateHomeWithLang(true);
  };

  // Continue handler
  const handleContinue = async () => {
    await navigateHomeWithLang(true);
  };

  // Play handler
  const handlePlayPress = async () => {
    try {
      if (videoRef.current) {
        if (typeof videoRef.current.replayAsync === "function") {
          await videoRef.current.replayAsync();
        } else {
          await videoRef.current.setPositionAsync?.(0);
          await videoRef.current.playAsync?.();
        }
      }
      setIsPlaying(true);
    } catch (e) {
      console.warn("Play error:", e);
    }
  };

  // playback status updates
  const onPlaybackStatusUpdate = async (playbackStatus) => {
    setStatus(playbackStatus ?? {});
    setVideoLoading(false);

    // si la vidéo est terminée, on envoie automatiquement vers home
    if (playbackStatus?.didJustFinish) {
      setTimeout(() => {
        navigateHomeWithLang(true);
      }, 300);
    }
  };

  const { width: screenW, height: screenH } = Dimensions.get("window");
  const videoBlockHeight = Math.round(screenH * 0.62);

  // While resolving language, show a full screen spinner (avoids flicker)
  if (resolving) {
    return (
      <SafeAreaView style={[authStyles.container]}>
        <View style={styles.resolvingContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, color: "#444" }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If resolved but somehow null, redirect as safety
  if (!langResolved) {
    router.replace("/ChoiceLanguage");
    return null;
  }

  return (
    <SafeAreaView style={[authStyles.container]}>
      <View style={[styles.container]}>
        {/* Video area */}
        <View style={[styles.videoWrapper, { height: videoBlockHeight }]}>
          <Video
            ref={videoRef}
            source={videoSource}
            style={styles.video}
            resizeMode="cover"
            useNativeControls={false}
            shouldPlay={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            isLooping={false}
          />

          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.9)"]}
            style={styles.gradient}
            start={[0.5, 0]}
            end={[0.5, 1]}
          />

          {/* Skip button top-right */}
          <View style={styles.topRight}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Center play button overlay */}
          <View style={styles.centerOverlay}>
            {videoLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <>
                <TouchableOpacity activeOpacity={0.8} onPress={handlePlayPress} style={styles.playBtn}>
                  <View style={styles.playTriangle} />
                </TouchableOpacity>

                <Text style={styles.playLabel}>Play video</Text>
              </>
            )}
          </View>
        </View>

        {/* Bottom content + Continue button */}
        <View style={styles.bottom}>
          <Text style={styles.description}>{getDescriptionForLang(langResolved, paramThemeName)}</Text>

          <TouchableOpacity style={[authStyles.authButton, styles.continueBtn]} activeOpacity={0.85} onPress={handleContinue}>
            <Text style={authStyles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// small helper for localized description
function getDescriptionForLang(lang, themeName) {
  const langTitle = lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : "";
  if (themeName) {
    return `Vidéo culturelle - Thème ${themeName} (${langTitle})`;
  }
  return `Vidéo d'introduction - ${langTitle}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "flex-start" },
  resolvingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoWrapper: {
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  video: {
    ...StyleSheet.absoluteFillObject, // fill the wrapper
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topRight: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 54 : 20,
    zIndex: 30,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  skipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  centerOverlay: {
    position: "absolute",
    alignSelf: "center",
    top: "34%", // visually centered toward upper half
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: 84 / 2,
    backgroundColor: "#B22222", // rouge doux (ajuste)
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 6,
    borderLeftWidth: 18,
    borderLeftColor: "#fff",
    borderTopWidth: 12,
    borderTopColor: "transparent",
    borderBottomWidth: 12,
    borderBottomColor: "transparent",
  },
  playLabel: {
    marginTop: 12,
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  description: {
    color: "#444",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
  },
  continueBtn: {
    // override to make button larger & rounded like example
    borderRadius: 28,
    paddingVertical: 18,
    backgroundColor: "#B22222", // same red as playBtn
  },
});
