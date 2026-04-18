import React, { useEffect, useRef, useState } from "react";
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
import { Colors, Space, Typo } from "../../src/theme/tokens";

const { width: SW, height: SH } = Dimensions.get("window");

const VIDEOS = {
  bassa: require("../../assets/BassaVideos/video_2026-04-15_13-47-01.mp4"),
  duala: require("../../assets/DualaVideos/IMG_5666.MOV"),
  ghomala: require("../../assets/GhomalaVidoes/IMG_5927.MOV"),
};

export default function OnboardingVideoScreen() {
  const router = useRouter();
  const { langCode, themeId } = useLocalSearchParams();
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const source = VIDEOS[langCode?.toLowerCase()] || VIDEOS.duala;

  const handleFinished = () => {
    // Navigate to the theme or home after video
    if (themeId) {
      router.replace(`/(tabs)/lessons/${themeId}`);
    } else {
      router.replace("/(tabs)/home");
    }
  };

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
