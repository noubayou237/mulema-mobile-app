import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, Image, StatusBar, Easing } from "react-native";
import { IMAGES_MAP } from "../../utils/AssetsMap";

const { width } = Dimensions.get("window");

export const SplashScreen = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Phase 1: Reveal the logo from invisible to visible
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 2200, // Slightly slower alpha reveal
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2: Steady "breathing" animation to indicate loading progress
      // (Forward and backward subtle zoom)
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.06, 
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.94,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Image source={IMAGES_MAP.logo} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    width: width * 0.45,
    height: width * 0.45,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
