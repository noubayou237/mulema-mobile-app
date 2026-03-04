import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SmartRepetition from "../../components/SmartRepetition";
import useFailedExercises from "../../hooks/useFailedExercises";

const { width, height } = Dimensions.get("window");

// Words for smart repetition
const REPETITION_WORDS = [
  { id: "p1", fr: "Le papa", local: "Papá" },
  { id: "p2", fr: "La tante paternelle", local: "Ndómɛ á tetɛ́" },
  { id: "p3", fr: "La maman", local: "Mamá" },
  { id: "p4", fr: "L'oncle paternel", local: "Árí á tetɛ́" },
  { id: "p5", fr: "Le frère", local: "Muna" },
  { id: "p6", fr: "La sœur", local: "Sango" }
];

const EndScreen = ({ navigation, route }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showRepetition, setShowRepetition] = useState(false);
  const { failedExercises, hasFailedExercises, clearFailedExercises } =
    useFailedExercises();

  // Extract data from params
  const totalTime = parseInt(params?.totalTime) || 0;
  const errorCount = parseInt(params?.errorCount) || 0;
  const lives = parseInt(params?.currentLives) || 5;
  const completedExercises = parseInt(params?.completedExercises) || 0;
  const totalExercises = parseInt(params?.totalExercises) || 3;
  const finalProgress = parseInt(params?.totalProgress) || 0;

  // Parse exercise times
  const getExerciseTimes = () => {
    try {
      return params?.exerciseTimes ? JSON.parse(params.exerciseTimes) : [];
    } catch (e) {
      return [];
    }
  };
  const exerciseTimes = getExerciseTimes();

  // Calculate success rate based on lives and errors
  // Base success rate on lives remaining (out of 5) and errors
  const maxLives = 5;
  const successRate = Math.round((lives / maxLives) * 100 - errorCount * 5);
  const finalSuccessRate = Math.max(0, Math.min(100, successRate));

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate score based on lives remaining and success rate
  const baseScore = lives * 20;
  const bonusScore = Math.floor((finalSuccessRate / 100) * 50);
  const totalScore = baseScore + bonusScore;

  // Exercise names for display
  const exerciseNames = ["Exercice 1", "Exercice 2", "Exercice 3"];

  // Fonction pour sauvegarder le déblocage
  const unlockNextTheme = async () => {
    try {
      // On enregistre que le thème 2 est débloqué
      await AsyncStorage.setItem("theme2_unlocked", "true");
      console.log("Theme 2 débloqué !");
    } catch (e) {
      console.error("Erreur lors du déblocage", e);
    }
  };
  // On récupère les stats finales si besoin (pour une logique future)
  // const { finalScore, totalMistakes } = route.params || {};

  const handleRestart = () => {
    // Logique : On retourne au premier exercice pour recommencer
    // On reset les paramètres de navigation si nécessaire
    router.replace("/exercices/famille/exos1");
  };

  const handleNext = () => {
    // Logique : Retour à l'accueil ou à la leçon suivante
    router.dismissAll(); // Vide la pile pour revenir au début
    router.replace("/exercices");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='light-content' backgroundColor='#CD4C58' />

      <View style={styles.container}>
        {/* --- SECTION HAUTE : MÉDAILLE --- */}
        <View style={styles.topSection}>
          {/* Décorations (Étoiles/Étincelles) - Positionnement absolu simulé */}
          <Text style={[styles.sparkle, { top: 40, left: 60, fontSize: 30 }]}>
            ✨
          </Text>
          <Text style={[styles.sparkle, { top: 80, right: 60, fontSize: 25 }]}>
            ✨
          </Text>
          <Text
            style={[styles.sparkle, { bottom: 20, left: 80, fontSize: 20 }]}
          >
            ✨
          </Text>

          {/* Image de la médaille */}
          <View style={styles.medalContainer}>
            {/* Remplacer par <Image source={require('./medal.png')} /> */}
            <Text style={{ fontSize: 120 }}>🏅</Text>
          </View>

          <Text style={styles.congratsText}>félicitations</Text>
        </View>

        {/* --- SECTION CARTE : RÉSULTATS --- */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Section 1 :</Text>

          <Text style={styles.themeTitle}>Vie sociale & famille</Text>

          <Text style={styles.scoreText}>
            {completedExercises} / {totalExercises} exercices
          </Text>

          {/* Time display */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>⏱️ Temps total:</Text>
            <Text style={styles.timeValue}>{formatTime(totalTime)}</Text>
          </View>

          {/* Success Rate display */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>🎯 Taux de réussite:</Text>
            <Text style={styles.timeValue}>{finalSuccessRate}%</Text>
          </View>

          {/* Time per exercise display */}
          {exerciseTimes.length > 0 && (
            <View style={styles.timePerExerciseContainer}>
              <Text style={styles.timePerExerciseTitle}>
                ⏱️ Temps par exercice:
              </Text>
              {exerciseTimes.map((time, index) => (
                <View key={index} style={styles.timePerExerciseRow}>
                  <Text style={styles.timePerExerciseLabel}>
                    {exerciseNames[index] || `Exercice ${index + 1}`}
                  </Text>
                  <Text style={styles.timePerExerciseValue}>
                    {formatTime(time)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Errors display */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>❌ Erreurs:</Text>
            <Text style={styles.timeValue}>{errorCount}</Text>
          </View>

          {/* Score display */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>⭐ Points:</Text>
            <Text style={styles.timeValue}>{totalScore} pts</Text>
          </View>

          {/* Progress display */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>📊 Progression:</Text>
            <Text style={styles.timeValue}>{finalProgress}%</Text>
          </View>

          {/* Ligne "Terminées" avec icône */}
          <View style={styles.statusRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.statusText}>Terminées</Text>
          </View>

          <Text style={styles.descriptionText}>
            Tu connais maintenant les mots essentiels pour parler de tes
            proches.
          </Text>

          {/* --- BOUTONS D'ACTION --- */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={handleRestart}
            >
              <Text style={styles.restartButtonText}>Recommencer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Suivant</Text>
            </TouchableOpacity>
          </View>

          {/* Smart Repetition Button */}
          <TouchableOpacity
            style={styles.repetitionButton}
            onPress={() => setShowRepetition(true)}
          >
            <Text style={styles.repetitionButtonText}>🔄 Révision rapide</Text>
          </TouchableOpacity>

          {/* Retry Failed Exercises Button */}
          {hasFailedExercises && (
            <View style={styles.retryContainer}>
              <Text style={styles.retryMessage}>Revenons à vos erreurs !</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={async () => {
                  // Clear failed exercises and go back to first exercise
                  await clearFailedExercises();
                  router.replace("/exercices/famille/exos1");
                }}
              >
                <Text style={styles.retryButtonText}>
                  Réessayer les exercices ratés
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Smart Repetition Modal */}
      <Modal
        visible={showRepetition}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setShowRepetition(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Révision rapide</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRepetition(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <SmartRepetition
              words={REPETITION_WORDS}
              showWordCount={10}
              autoPlayInterval={3000}
              onComplete={() => {
                console.log("Smart repetition completed!");
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#CD4C58" // Rouge clair du fond (pipette sur l'image)
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between", // Répartit l'espace entre le haut et la carte
    paddingVertical: 20
  },
  // --- Top Section ---
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20
  },
  sparkle: {
    position: "absolute",
    color: "#FAD02C", // Jaune doré
    opacity: 0.8
  },
  medalContainer: {
    marginBottom: 10,
    // Ajoutez ici une ombre ou un style spécifique si vous utilisez une vraie image
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  congratsText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FAD02C", // Jaune du texte
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  // --- Card Section ---
  cardContainer: {
    backgroundColor: "#9E2A36", // Rouge foncé de la carte
    width: width * 0.9, // 90% de la largeur de l'écran
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20, // Marge par rapport au bas
    // Ombre de la carte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  sectionTitle: {
    color: "#E0E0E0",
    fontSize: 16,
    marginBottom: 5
  },
  themeTitle: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },
  scoreText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
    paddingHorizontal: 20
  },
  timeLabel: {
    color: "#E0E0E0",
    fontSize: 16
  },
  timeValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold"
  },
  timePerExerciseContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  timePerExerciseTitle: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8
  },
  timePerExerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  timePerExerciseLabel: {
    color: "#E0E0E0",
    fontSize: 13
  },
  timePerExerciseValue: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold"
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  checkIcon: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold"
  },
  statusText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold"
  },
  descriptionText: {
    color: "#E0E0E0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10
  },
  // --- Buttons ---
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15
  },
  restartButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFF",
    alignItems: "center",
    backgroundColor: "transparent"
  },
  restartButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold"
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#FFF",
    alignItems: "center"
  },
  nextButtonText: {
    color: "#9E2A36", // Couleur texte rouge foncé pour le contraste
    fontSize: 16,
    fontWeight: "bold"
  },
  // Smart Repetition Button Styles
  repetitionButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginTop: 15
  },
  repetitionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold"
  },
  // Retry Button Styles
  retryContainer: {
    width: "100%",
    marginTop: 15,
    alignItems: "center"
  },
  retryMessage: {
    color: "#FF9800",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center"
  },
  retryButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#FF9800",
    alignItems: "center"
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold"
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#CD4C58",
    borderBottomWidth: 1,
    borderBottomColor: "#9E2A36"
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF"
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold"
  },
  modalContent: {
    flexGrow: 1,
    paddingBottom: 40
  }
});

export default EndScreen;
