import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const HAS_SEEN_INTRO = "hasSeenIntro";
const HAS_SELECTED_LANGUAGE = "selectedLanguage";

const VIDEO_BY_LANG = {
  bassa: "https://example.com/videos/bassa/intro.m3u8",
  duala: "https://example.com/videos/duala/intro.m3u8",
  ghomala: "https://example.com/videos/ghomala/intro.m3u8",
  default: "https://example.com/videos/default/intro.m3u8"
};

export default function PageVideo() {
  const router = useRouter();
  const params = useLocalSearchParams?.() ?? {};
  const paramLang = params?.lang ?? null;

  const videoRef = useRef(null);

  const [langResolved, setLangResolved] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);

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

    return () => (mounted = false);
  }, [paramLang]);

  const videoUri = VIDEO_BY_LANG[langResolved] ?? VIDEO_BY_LANG.default;

  const persistAndGoHome = async () => {
    await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, langResolved);
    await AsyncStorage.setItem(HAS_SEEN_INTRO, "true");
    router.replace(`/(tabs)/home?lang=${langResolved}`);
  };

  const handlePlay = async () => {
    try {
      await videoRef.current?.replayAsync?.();
    } catch {}
  };

  const { height } = Dimensions.get("window");
  const videoHeight = Math.round(height * 0.62);

  if (resolving) {
    return (
<<<<<<< HEAD
      <SafeAreaView className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' />
        <Text className='mt-3 text-muted-foreground'>Chargement...</Text>
=======
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-muted-foreground">Chargement...</Text>
>>>>>>> feat/settings-page
      </SafeAreaView>
    );
  }

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      {/* VIDEO BLOCK */}
      <View style={[styles.videoContainer, { height: videoHeight }]}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          resizeMode='cover'
          shouldPlay={false}
          isLooping={false}
          style={styles.video}
          onPlaybackStatusUpdate={(s) => {
            setVideoLoading(false);
            if (s?.didJustFinish) persistAndGoHome();
          }}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
          style={styles.gradient}
        />

        {/* SKIP */}
        <View style={styles.skipContainer}>
          <TouchableOpacity
            onPress={persistAndGoHome}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
=======
    <SafeAreaView className="flex-1 bg-background">

      {/* VIDEO BLOCK */}
      <View className="w-full bg-black relative overflow-hidden"
            style={{ height: videoHeight }}>

        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          resizeMode="cover"
          shouldPlay={false}
          isLooping={false}
          className="absolute w-full h-full"
          onPlaybackStatusUpdate={(s) => {
            setVideoLoading(false);
            if (s?.didJustFinish) persistAndGoHome();
          }}
        />

        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
          className="absolute w-full h-full"
        />

        {/* SKIP */}
        <View className={`absolute right-4 ${Platform.OS === "ios" ? "top-14" : "top-6"}`}>
          <TouchableOpacity
            onPress={persistAndGoHome}
            className="px-4 py-2 rounded-full bg-white/10"
          >
            <Text className="text-white font-semibold text-sm">Skip</Text>
>>>>>>> feat/settings-page
          </TouchableOpacity>
        </View>

        {/* CENTER PLAY */}
<<<<<<< HEAD
        <View style={styles.playContainer}>
          {videoLoading ? (
            <ActivityIndicator size='large' color='#fff' />
          ) : (
            <>
              <TouchableOpacity onPress={handlePlay} style={styles.playButton}>
=======
        <View className="absolute top-[34%] self-center items-center">
          {videoLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <TouchableOpacity
                onPress={handlePlay}
                className="w-20 h-20 rounded-full bg-primary items-center justify-center shadow-lg"
              >
>>>>>>> feat/settings-page
                <View
                  style={{
                    width: 0,
                    height: 0,
                    marginLeft: 6,
                    borderLeftWidth: 18,
                    borderLeftColor: "white",
                    borderTopWidth: 12,
                    borderTopColor: "transparent",
                    borderBottomWidth: 12,
                    borderBottomColor: "transparent"
                  }}
                />
              </TouchableOpacity>

<<<<<<< HEAD
              <Text style={styles.playText}>Play video</Text>
=======
              <Text className="mt-4 text-white text-xl font-bold">
                Play video
              </Text>
>>>>>>> feat/settings-page
            </>
          )}
        </View>
      </View>

      {/* BOTTOM CONTENT */}
<<<<<<< HEAD
      <View style={styles.bottomContent}>
        <Text style={styles.description}>{getDescription(langResolved)}</Text>

        <TouchableOpacity
          onPress={persistAndGoHome}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Continue</Text>
=======
      <View className={`flex-1 px-6 pt-6 justify-end ${Platform.OS === "ios" ? "pb-10" : "pb-6"}`}>
        <Text className="text-center text-base text-muted-foreground mb-5">
          {getDescription(langResolved)}
        </Text>

        <TouchableOpacity
          onPress={persistAndGoHome}
          className="bg-primary rounded-full py-5 items-center"
        >
          <Text className="text-white text-lg font-bold">
            Continue
          </Text>
>>>>>>> feat/settings-page
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getDescription(lang) {
  switch ((lang || "").toLowerCase()) {
    case "bassa":
      return "Vidéo d'introduction - Bassa";
    case "duala":
      return "Vidéo d'introduction - Duala";
    case "ghomala":
      return "Vidéo d'introduction - Ghomala";
    default:
      return "Vidéo d'introduction";
  }
<<<<<<< HEAD
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F5F5"
  },
  videoContainer: {
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden"
  },
  video: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%"
  },
  skipContainer: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 56 : 24
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  skipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  },
  playContainer: {
    position: "absolute",
    top: "34%",
    alignSelf: "center",
    alignItems: "center"
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  playText: {
    marginTop: 16,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 40 : 24
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B6B6B",
    marginBottom: 20
  },
  continueButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: "center"
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }
});
=======
}
>>>>>>> feat/settings-page
