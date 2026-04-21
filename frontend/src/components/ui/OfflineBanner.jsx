import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { Colors } from "../../theme/tokens";

export default function OfflineBanner() {
  const { t } = useTranslation();
  const isConnected = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-60)).current;
  const prevConnected = useRef(true);

  useEffect(() => {
    if (!isConnected) {
      // Slide down to show
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else if (!prevConnected.current) {
      // Was offline, now back — slide up to hide after brief delay
      Animated.delay(1200);
      Animated.timing(translateY, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    prevConnected.current = isConnected;
  }, [isConnected]);

  return (
    <Animated.View
      style={[s.banner, { transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Ionicons name="cloud-offline-outline" size={16} color="#FFF" />
      <Text style={s.text}>{t("errors.noInternet")}</Text>
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
    backgroundColor: "#323232",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  text: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Nunito-SemiBold",
  },
});
