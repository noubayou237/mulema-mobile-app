import React, { useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator
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
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-muted-foreground">Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
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
          </TouchableOpacity>
        </View>

        {/* CENTER PLAY */}
        <View className="absolute top-[34%] self-center items-center">
          {videoLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <TouchableOpacity
                onPress={handlePlay}
                className="w-20 h-20 rounded-full bg-primary items-center justify-center shadow-lg"
              >
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

              <Text className="mt-4 text-white text-xl font-bold">
                Play video
              </Text>
            </>
          )}
        </View>
      </View>

      {/* BOTTOM CONTENT */}
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
}