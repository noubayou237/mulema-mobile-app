import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import "../src/i18n";

// --- Importez vos images locales ---
// Assurez-vous d'avoir les images à ces chemins ou dans vos assets
const boatImage = require("../assets/images/boat.png");
const islandImage = require("../assets/images/island.png");
const lockIcon = require("../assets/images/lock.png"); // Icone de cadenas

const { width } = Dimensions.get("window");

// --- Composant Principal Home Douala ---
export default function HomeDouala() {
  const router = useRouter();
  const { t } = useTranslation();

  // Initialize on mount
  useEffect(() => {
    // Component mounted
  }, []);

  // Play welcome audio when pressing the start button
  const playWelcomeAudio = async () => {
    try {
      // Try haptic feedback with proper error handling
      // Wrap in try-catch as haptics may not be available on all devices
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (hapticsError) {
        console.log("Haptics not available:", hapticsError.message);
      }
    } catch (error) {
      console.log("Feedback error:", error);
    }
  };

  // --- DONNÉES DES NIVEAUX ---
  const LEVELS_DATA = [
    {
      id: 1,
      title: t("home.levelI"),
      unlocked: true,
      path: "/exercices/exos1"
    },
    {
      id: 2,
      title: t("home.levelII"),
      unlocked: false,
      path: "/levels/douala/level2"
    },
    {
      id: 3,
      title: t("home.levelIII"),
      unlocked: false,
      path: "/levels/douala/level3"
    },
    {
      id: 4,
      title: t("home.levelIV"),
      unlocked: false,
      path: "/levels/douala/level4"
    }
  ];

  // Fonction de navigation unique (utilisée par le TouchableOpacity)
  const handleStartLevel = async (level) => {
    // Play audio feedback when starting
    await playWelcomeAudio();

    if (level.unlocked) {
      console.log(`Démarrage du niveau : ${level.title} -> ${level.path}`);
      router.push(level.path);
    } else {
      console.log(`Le niveau ${level.id} est verrouillé.`);
    }
  };

  // Rendu de la carte de niveau
  const renderLevelCard = (level, index) => {
    const opacityStyle = level.unlocked ? null : styles.lockedContent;
    const isFirstLevel = index === 0;

    // Détermine la position des éléments pour simuler le sentier sinueux
    const alignStyle = level.id % 2 === 0 ? "flex-end" : "flex-start";

    return (
      <View
        key={level.id}
        style={[styles.levelContainer, { alignItems: alignStyle }]}
      >
        {/* --- CONTENEUR CLICQUABLE (Île et bateau) --- */}
        <TouchableOpacity
          style={[styles.levelCardButton, opacityStyle]}
          onPress={() => handleStartLevel(level)}
          disabled={!level.unlocked}
          activeOpacity={0.8}
        >
          {/* Titre du niveau (pour le Niveau I) */}
          {isFirstLevel && (
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelSubtitle}>
                {t("home.unlockMessage")}
              </Text>
            </View>
          )}

          {/* Éléments visuels spécifiques au thème (Bateau et île) */}
          <View style={styles.mapElement}>
            <Image source={islandImage} style={styles.islandImage} />
            <Image
              source={boatImage}
              style={[
                styles.boatImage,
                // Positionnement dynamique du bateau près de l'île
                {
                  left: level.id % 2 === 0 ? 10 : null,
                  right: level.id % 2 !== 0 ? 10 : null
                }
              ]}
            />

            {/* Cadenas si le niveau est verrouillé */}
            {!level.unlocked && (
              <Image source={lockIcon} style={styles.lockIcon} />
            )}
          </View>

          {/* Nom du Niveau (affiché comme un indicateur) */}
          <View style={styles.levelIndicator}>
            <Text style={styles.levelIndicatorText}>
              {isFirstLevel
                ? t("home.start")
                : `${t("home.niveau")} ${level.id}`}
            </Text>
          </View>
        </TouchableOpacity>
        {/* Simule l'espace sur la rivière bleue */}
        <View style={styles.riverGap} />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mapContainer}>
        {/* La ligne de carte (Rivière bleue) */}
        <View style={styles.mapPath} />

        {/* --- Rendu des Niveaux --- */}
        {LEVELS_DATA.map(renderLevelCard)}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F5F7"
  },
  scrollContent: {
    paddingTop: 20,
    alignItems: "center"
  },
  mapContainer: {
    width: "100%",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 20
  },

  // --- LIGNE DE CARTE (Rivière bleue) ---
  mapPath: {
    position: "absolute",
    width: 60, // Largeur de la rivière
    top: 0,
    bottom: 0,
    backgroundColor: "#3498DB", // Bleu vif pour la rivière
    borderRadius: 30,
    zIndex: -1,
    // Centre la rivière
    left: "50%",
    transform: [{ translateX: -30 }]
  },

  // --- CONTENEUR DE NIVEAU ---
  levelContainer: {
    width: "100%",
    minHeight: 250, // Espace entre les niveaux
    justifyContent: "flex-start",
    paddingHorizontal: 20
  },

  // 💡 STYLE: La carte clicquable (Représente l'île/niveau)
  levelCardButton: {
    width: 150, // Taille de la zone de clic de l'île
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent", // Rendre le fond transparent
    zIndex: 2,
    marginTop: 20
  },
  lockedContent: {
    opacity: 0.3 // Effet flou/verrouillé
  },

  // --- NIVEAU 1 (HEADER) ---
  levelHeader: {
    width: width, // Prend toute la largeur pour le texte
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 20,
    zIndex: 2,
    position: "absolute",
    top: -100,
    left: 0
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D9534F",
    marginBottom: 5
  },
  levelSubtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    paddingHorizontal: 30
  },

  // --- ÉLÉMENTS DE LA CARTE ---
  mapElement: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  islandImage: {
    width: 120,
    height: 120,
    position: "absolute",
    resizeMode: "contain",
    zIndex: 1
  },
  boatImage: {
    width: 80,
    height: 40,
    position: "absolute",
    resizeMode: "contain",
    zIndex: 2,
    top: 50
  },
  lockIcon: {
    width: 40,
    height: 40,
    position: "absolute",
    zIndex: 10,
    resizeMode: "contain"
  },

  // 💡 STYLE: Indicateur de niveau (simule le bouton START/Niveau)
  levelIndicator: {
    backgroundColor: "#D9534F",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
    zIndex: 3,
    position: "absolute",
    bottom: 0
  },
  levelIndicatorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold"
  },
  riverGap: {
    height: 100 // Espace entre les îles pour laisser voir la rivière
  }
});
