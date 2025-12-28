// app/splash.jsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text, Easing, Dimensions } from "react-native";
import { Svg, G, Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const HAS_SELECTED_LANGUAGE = "hasSelectedLanguage";
const HAS_SEEN_INTRO = "hasSeenIntro";
const SPLASH_DURATION_MS = 5000;

// animation timing
const BASE_DELAY_MS = 800; // 0.8s
const STEP_DELAY_MS = 100; // 0.1s between elements
const ANIM_DURATION = 500; // 0.5s
const BEZIER = Easing.bezier(0.95, 0.05, 0.795, 0.035);

// --- paths from your svg (order preserved) ---
const PATHS = [
  {
    d: "M4144 6136 c-66 -37 -90 -104 -104 -291 -6 -77 -14 -180 -20 -230 -8 -84 -13 -105 -41 -187 -6 -18 -14 -45 -16 -60 -3 -15 -11 -33 -19 -39 -8 -6 -14 -21 -14 -33 0 -12 -6 -30 -13 -41 -8 -11 -20 -55 -27 -98 -18 -106 -8 -209 26 -277 28 -56 99 -134 136 -150 13 -6 30 -14 38 -18 44 -26 65 -33 132 -47 125 -26 218 -18 333 28 211 84 326 261 324 501 0 55 -5 124 -10 151 -5 28 -15 77 -20 110 -6 33 -14 65 -19 70 -4 6 -10 24 -14 40 -6 28 -28 81 -47 115 -5 8 -14 24 -19 35 -6 11 -19 34 -30 50 -11 17 -23 37 -27 45 -18 41 -130 173 -179 211 -31 24 -62 50 -69 57 -8 6 -18 12 -24 12 -5 0 -14 8 -20 17 -16 29 -26 5 -12 -32 6 -19 16 -87 22 -152 5 -65 12 -126 15 -135 5 -17 -3 -49 -31 -128 -7 -19 -18 -54 -24 -76 -12 -45 -37 -73 -50 -58 -4 5 -14 45 -20 89 -22 144 -40 249 -57 320 -8 39 -21 98 -28 133 -6 35 -18 67 -26 72 -18 11 -19 11 -46 -4z m-47 -592 c-7 -89 -34 -217 -68 -319 -6 -16 -13 -79 -16 -138 -6 -115 -17 -137 -51 -103 -21 21 -21 136 1 199 8 23 23 69 32 102 10 33 24 74 32 92 7 17 13 43 13 57 0 15 7 43 15 63 8 19 15 54 15 78 0 23 3 45 7 48 16 17 24 -16 20 -79z",
    fill: "#ff0000",
  },
  {
    d: "M4793 4447 c-13 -5 -23 -17 -23 -24 0 -8 -6 -27 -13 -41 -8 -15 -22 -45 -31 -67 -10 -22 -24 -52 -32 -68 -24 -50 24 -108 63 -75 32 26 143 215 143 243 0 31 -67 51 -107 32z",
    fill: "#ff0000",
  },
  {
    d: "M4070 4338 c-20 -31 -28 -596 -10 -738 20 -163 72 -220 203 -220 81 0 107 19 107 78 0 51 -11 65 -44 56 -33 -8 -69 14 -90 57 -14 28 -16 83 -16 391 0 229 -4 366 -10 379 -9 15 -22 19 -68 19 -48 0 -60 -4 -72 -22z",
    fill: "#ff0000",
  },
  {
    d: "M2338 4051 c-26 -4 -51 -10 -55 -15 -4 -4 -8 -142 -8 -306 l0 -298 24 -26 c32 -34 88 -36 118 -3 20 21 21 36 25 232 4 195 5 213 26 246 40 65 139 71 165 10 6 -15 13 -121 16 -249 6 -220 6 -224 30 -243 32 -26 82 -25 109 4 21 22 22 32 22 207 0 148 3 193 17 230 21 56 29 68 66 86 36 19 71 11 103 -23 24 -26 24 -27 24 -242 0 -187 2 -220 17 -241 22 -33 33 -40 65 -40 81 0 88 23 88 280 0 337 -28 395 -191 395 -67 0 -149 -28 -149 -51 0 -16 -34 -44 -54 -44 -10 0 -21 12 -27 28 -15 45 -63 66 -144 66 -74 -1 -116 -16 -141 -53 -22 -31 -42 -26 -61 16 -21 42 -22 42 -85 34z",
    fill: "#ff0000",
  },
  {
    d: "M3359 4038 c-5 -9 -9 -125 -9 -258 0 -224 2 -244 21 -287 38 -83 87 -113 182 -113 54 0 70 4 103 28 21 16 45 36 53 45 15 19 31 14 31 -12 0 -27 42 -61 77 -61 17 0 41 9 54 19 l24 19 3 279 c2 210 0 287 -10 317 l-13 39 -59 0 c-38 0 -61 -5 -67 -14 -5 -8 -9 -93 -9 -189 -1 -194 -11 -253 -54 -306 -24 -30 -32 -34 -75 -34 -38 0 -52 5 -72 26 -24 25 -24 29 -29 252 -3 137 -9 234 -16 246 -15 26 -122 29 -135 4z",
    fill: "#ff0000",
  },
  {
    d: "M4628 4047 c-145 -41 -220 -176 -204 -367 12 -135 64 -218 169 -269 57 -28 73 -31 153 -31 59 0 99 5 118 15 15 8 32 15 38 15 5 0 22 10 38 22 24 17 30 29 30 58 0 44 -15 61 -44 50 -150 -59 -280 -48 -314 25 -5 11 -15 32 -22 46 -6 14 -10 37 -8 50 l3 24 186 5 c201 5 219 10 219 59 0 41 -32 164 -47 182 -7 8 -13 20 -13 26 0 15 -41 49 -88 72 -54 27 -151 35 -214 18z m170 -115 c45 -45 67 -111 45 -141 -13 -19 -24 -21 -126 -21 -62 0 -118 4 -126 9 -36 23 12 138 69 169 36 19 112 10 138 -16z",
    fill: "#ff0000",
  },
  {
    d: "M5129 4038 c-5 -9 -9 -151 -9 -316 l0 -299 23 -21 c30 -28 80 -29 107 -2 18 18 20 33 20 191 0 240 21 315 97 340 38 12 82 -6 101 -43 8 -15 13 -96 14 -240 3 -214 3 -217 27 -242 33 -35 83 -35 115 -1 23 25 24 32 28 233 3 185 5 211 23 240 40 68 141 76 168 14 6 -16 13 -119 16 -250 6 -220 6 -224 30 -243 33 -27 82 -25 110 5 22 23 22 26 19 282 -3 252 -4 260 -27 297 -38 61 -101 83 -197 71 -50 -6 -63 -12 -101 -51 -51 -50 -72 -52 -93 -6 -34 74 -182 83 -261 17 -51 -42 -66 -43 -77 -1 -8 31 -11 32 -66 37 -48 4 -59 2 -67 -12z",
    fill: "#ff0000",
  },
  {
    d: "M6345 4050 c-141 -32 -151 -39 -143 -105 5 -48 28 -53 115 -22 94 32 135 34 178 7 26 -16 34 -30 42 -71 15 -74 3 -84 -127 -98 -177 -19 -217 -38 -243 -114 -14 -40 -14 -57 -5 -100 23 -104 102 -167 209 -167 62 0 90 12 136 57 28 29 39 29 47 -1 9 -37 34 -56 71 -56 26 0 39 7 54 29 20 27 21 43 21 241 0 279 -16 332 -113 382 -44 22 -178 32 -242 18z m183 -362 c7 -7 12 -33 12 -58 0 -75 -66 -150 -132 -150 -55 0 -104 70 -91 131 9 49 35 67 105 78 89 12 93 12 106 -1z",
    fill: "#ff0000",
  },
];

// Animated Path component
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Splash() {
  const router = useRouter();

  // animated values per path
  const animValuesRef = useRef(PATHS.map(() => new Animated.Value(0)));
  const animValues = animValuesRef.current;

  useEffect(() => {
    // create animations with delays
    const animations = animValues.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: ANIM_DURATION,
        delay: BASE_DELAY_MS + STEP_DELAY_MS * i,
        easing: BEZIER,
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start();

   // Redirection après le splash (5 secondes)
    const timer = setTimeout(async () => {
  try {
    const hasLang = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);

    // 🧪 Phase de test : on redirige TOUJOURS vers la page de choix de langue
    router.replace("/ChoiceLanguage");

    // -------------------------------------------
    // 🟢 Quand tu voudras activer la vraie logique :
    // -------------------------------------------
    // if (!hasLang) {
    //   // Première fois → aller sur la page de choix de langue
    //   router.replace("/ChoiceLanguage");
    //   return;
    // } else {
    //   // L'utilisateur a déjà choisi une langue → aller à la page d'accueil
    //   router.replace("/home");
    //   return;
    // }
    // -------------------------------------------

  } catch (err) {
    console.warn("Splash: erreur flags", err);
    // En cas d'erreur on redirige par sécurité vers la page de langue (test)
    router.replace("/ChoiceLanguage");
  }
    }, SPLASH_DURATION_MS);


    return () => clearTimeout(timer);
  }, [router]);

  // size control: max 70% width, max 420px
  const screenW = Dimensions.get("window").width;
  const svgSize = Math.min(420, screenW * 0.7);

  return (
    <View style={styles.outer}>
      <View style={[styles.card, { width: svgSize, height: svgSize }]}>
        <Svg width={svgSize} height={svgSize} viewBox="0 0 900 900" preserveAspectRatio="xMidYMid meet" accessible accessibilityLabel="Logo animé">
          <G transform="translate(0,900) scale(0.1,-0.1)" fill="none" stroke="none">
            {PATHS.map((p, i) => (
              <AnimatedPath key={i} d={p.d} fill={p.fill} opacity={animValues[i]} />
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 20 },
  card: {
    // keeps svg centered and not full width
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  appName: { marginTop: 18, fontSize: 18, fontWeight: "700", color: "#111" },
});
