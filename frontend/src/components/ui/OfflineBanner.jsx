import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

const BANNER_HEIGHT = 54;

export default function OfflineBanner() {
  const { t } = useTranslation();
  const isConnected = useNetworkStatus();

  // "idle" | "offline" | "reconnected"
  const [status, setStatus] = useState("idle");
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const dismissTimer = useRef(null);

  // Transition logic
  useEffect(() => {
    if (!isConnected) {
      // Drop offline, but hide after 3 seconds
      setStatus("offline");
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => setStatus("idle"), 3000);
    } else if (status === "offline" || status === "idle") {
      // Just came back online or startup
      if (status === "offline") {
        setStatus("reconnected");
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(() => setStatus("idle"), 2500);
      }
    }
  }, [isConnected]);

  // Animate in/out whenever status changes
  useEffect(() => {
    const toValue = status === "idle" ? -BANNER_HEIGHT : 0;
    const useSpring = status === "offline";

    if (useSpring) {
      Animated.spring(translateY, {
        toValue,
        bounciness: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const offline = status === "offline";
  const bgColor = offline ? "#323232" : "#2E7D32";
  const icon    = offline ? "cloud-offline-outline" : "checkmark-circle-outline";
  const label   = offline ? t("errors.noInternet") : t("errors.backOnline");

  return (
    <Animated.View
      style={[s.banner, { backgroundColor: bgColor, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Ionicons name={icon} size={16} color="#FFF" />
      <Text style={s.text}>{label}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 44,
    height: BANNER_HEIGHT + 44,
  },
  text: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Nunito-SemiBold",
  },
});
