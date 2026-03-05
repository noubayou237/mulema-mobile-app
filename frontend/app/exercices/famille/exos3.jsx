import React, { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image
} from "react-native";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { THEME_FAMILLE_WORDS, getWrongOptions } from "../../data/themeData";

const { width } = Dimensions.get("window");

// Audio state flags
let audioInitialized = false;
let audioDisabled = false;

/**
 * Check if error is keep-awake related
 */
const isKeepAwakeError = (error) => {
  if (!error) return false;
  const message = error.message || String(error);
  return (
    message.includes("keep awake") || message.includes("Unable to activate")
  );
};

// Audio initialization with error handling for keep-awake issues
const initializeAudio = async () => {
  if (audioInitialized || audioDisabled) return !audioDisabled;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true
    });
    audioInitialized = true;
    return true;
  } catch (error) {
    // Handle keep awake error gracefully
    if (isKeepAwakeError(error)) {
      console.warn("Keep awake not available:", error.message);
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false
        });
        audioInitialized = true;
        return true;
      } catch (fallbackError) {
        console.warn("Audio fallback also failed:", fallbackError.message);
        audioDisabled = true;
        return false;
      }
    }
    audioDisabled = true;
    return false;
  }
};

// Initialize audio on module load
initializeAudio().catch(() => {});

// Play correct/incorrect feedback sound
const playFeedbackSound = async (isCorrect, language = "fr") => {
  try {
    // Try haptic feedback with proper error handling
    try {
      if (isCorrect) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (hapticsError) {
      console.log("Haptics not available:", hapticsError.message);
    }
  } catch (error) {
    console.log("Feedback error:", error);
  }
};

// --- DONNÉES DE L'EXERCICE (SHARED WORD POOL) ---
// Uses words from the shared pool for pedagogical consistency

// Get a random word from the pool for this exercise
const getSelectWord = () => {
  const words = THEME_FAMILLE_WORDS;
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

// Initialize with a random word
const currentWord = getSelectWord();
const QUESTION_TEXT = `Quel est le mot local pour dire '${currentWord.fr}' ?`;
const CORRECT_ANSWER = currentWord.local;

// Generate options: correct answer + wrong options
const wrongOptions = getWrongOptions(currentWord.id, 3);
const allOptions = [currentWord, ...wrongOptions];
// Shuffle options
const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
const options = shuffledOptions.map((opt, index) => ({
  id: `opt${index + 1}`,
  text: opt.local
}));

const ExerciseThreeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";

  // --- SÉCURISATION ET CONVERSION DES PARAMÈTRES (Reçu de exos2) ---
  const getParamAsNumber = (key, fallback) => {
    const value = params[key];
    const num = value ? parseInt(value, 10) : fallback;
    return isNaN(num) ? fallback : num;
  };

  const initialLives = getParamAsNumber("currentLives", 5);
  const initialTimer = getParamAsNumber("currentTimer", 0);
  const totalProgress = getParamAsNumber("totalProgress", 66); // Commence à 66% après deux exos

  // --- ÉTATS ---
  const [lives, setLives] = useState(initialLives);
  const [timer] = useState(initialTimer);
  const [progress, setProgress] = useState(totalProgress); // Progression affichée
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Store time per exercise for end screen
  const getExerciseTimes = () => {
    try {
      return params?.exerciseTimes ? JSON.parse(params.exerciseTimes) : [];
    } catch (e) {
      return [];
    }
  };
  const [exerciseTimes, setExerciseTimes] = useState(getExerciseTimes());

  // Timer state - Track time taken to complete exercise
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Initialize timer when component mounts
  useEffect(() => {
    // Start timer interval
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- LOGIQUE DU JEU ---
  const handleOptionSelect = async (optionText) => {
    if (isAnswered) return; // On bloque après la 1ère réponse

    setSelectedOption(optionText);
    setIsAnswered(true);

    if (optionText === CORRECT_ANSWER) {
      setIsCorrect(true);
      setProgress(100); // Ex. réussi, progression à 100%
      // Play positive feedback sound
      await playFeedbackSound(true, currentLanguage);
    } else {
      setIsCorrect(false);
      // Play negative feedback sound
      await playFeedbackSound(false, currentLanguage);
      // Déduit la vie immédiatement
      setLives((prev) => Math.max(0, prev - 1));
      // Progression reste inchangée si raté
    }
  };

  const handleNext = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const exerciseTime = elapsedTime;
    const cumulativeTime = (parseInt(params?.totalTime) || 0) + exerciseTime;
    const totalErrors = parseInt(params?.errorCount) || 0;

    // Store time for this exercise
    const newExerciseTimes = [...exerciseTimes, exerciseTime];

    // Navigation vers la page de fin avec les résultats
    router.push({
      pathname: "/exercices/famille/endexos",
      params: {
        currentLives: lives,
        totalProgress: progress,
        totalTime: cumulativeTime,
        errorCount: totalErrors,
        completedExercises: 3,
        totalExercises: 3,
        exerciseTimes: JSON.stringify(newExerciseTimes)
      }
    });
  };

  // --- RENDU DYNAMIQUE DES BOUTONS (Gris, Rouge, Vert) ---
  const getButtonStyle = (optText) => {
    let style = {
      backgroundColor: "#E0E0E0",
      borderWidth: 1,
      borderColor: "#E0E0E0"
    };
    let textStyle = { color: "#000" };

    if (isAnswered) {
      if (optText === CORRECT_ANSWER) {
        // TOUJOURS afficher la bonne réponse en VERT à la fin
        style = {
          backgroundColor: "#34C759",
          borderColor: "#34C759",
          borderWidth: 2
        };
        textStyle = { color: "#FFF" };
      } else if (optText === selectedOption && !isCorrect) {
        // Si c'est celle qu'on a cliqué et qu'elle est fausse -> ROUGE
        style = {
          backgroundColor: "#FFCDD2",
          borderColor: "#C81E2F",
          borderWidth: 2
        };
        textStyle = { color: "#C81E2F" };
      } else {
        // Les autres s'effacent légèrement
        style = {
          backgroundColor: "#F0F0F0",
          opacity: 0.6,
          borderWidth: 1,
          borderColor: "#E0E0E0"
        };
      }
    } else if (optText === selectedOption) {
      // État "Sélectionné avant validation" (Bleu)
      style = {
        backgroundColor: "#E3F2FD",
        borderColor: "#2196F3",
        borderWidth: 2
      };
      textStyle = { color: "#2196F3" };
    }

    return { style, textStyle };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <View style={styles.container}>
        {/* --- HEADER (VIES & PROGRESSION) --- */}
        <View style={styles.header}>
          {/* Barre de progression */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          {/* Timer and lives */}
          <View style={styles.headerRight}>
            <Text style={styles.timerText}>🕒 {formatTime(elapsedTime)}</Text>
            <Text style={styles.livesText}>🐚 {lives}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* --- IMAGE ILLUSTRATIVE --- */}
          <View style={styles.imageContainer}>
            <Image
              source={require("../../../assets/images/avatar-famille.png")}
              style={styles.illustrationImage}
              resizeMode='contain'
            />
          </View>

          {/* --- CONSIGNE --- */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Question Finale</Text>
            <Text style={styles.instructionText}>{QUESTION_TEXT}</Text>
          </View>

          {/* --- GRILLE D'OPTIONS --- */}
          <View style={styles.optionsGrid}>
            {options.map((opt) => {
              const { style, textStyle } = getButtonStyle(opt.text);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionButton, style]}
                  onPress={() => handleOptionSelect(opt.text)}
                  disabled={isAnswered}
                >
                  <Text style={[styles.optionText, textStyle]}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* --- BANDEAU DE CORRECTION EN BAS --- */}
          {isAnswered && (
            <View
              style={
                isCorrect ? styles.correctionSuccess : styles.correctionBanner
              }
            >
              <Text
                style={
                  isCorrect
                    ? styles.correctionSuccessText
                    : styles.correctionBannerText
                }
              >
                {isCorrect
                  ? "Bravo ! C'est correct !"
                  : `La bonne réponse est : ${CORRECT_ANSWER}`}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* --- FOOTER / BOUTON CONTINUER --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isAnswered && styles.nextButtonDisabled, // Grisé tant qu'on n'a pas joué
            isAnswered && !isCorrect && { backgroundColor: "#C81E2F" }, // Rouge si raté
            isAnswered && isCorrect && { backgroundColor: "#34C759" } // Vert si réussi
          ]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {isAnswered ? "Continuer" : "Valider"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5"
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20
  },

  // --- HEADER & STATS ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20
  },
  progressBarContainer: {
    height: 12,
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    marginRight: 15
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#C81E2F",
    borderRadius: 6
  },
  livesContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  livesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C81E2F"
  },
  headerRight: {
    alignItems: "flex-end"
  },
  timerText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4
  },

  // --- INSTRUCTIONS ---
  imageContainer: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15
  },
  illustrationImage: {
    width: 80,
    height: 80
  },
  instructionContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  instructionTitle: {
    color: "#C81E2F",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10
  },
  instructionText: {
    textAlign: "center",
    fontSize: 18,
    color: "#000",
    fontWeight: "600"
  },

  // --- GRILLE D'OPTIONS ---
  optionsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  optionButton: {
    width: "48%",
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#E0E0E0"
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold"
  },

  // --- BANDEAUX DE CORRECTION ---
  correctionBanner: {
    backgroundColor: "#FFCDD2",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#C81E2F",
    alignItems: "center",
    width: "100%"
  },
  correctionBannerText: {
    color: "#C81E2F",
    fontSize: 16,
    fontWeight: "500"
  },
  correctionSuccess: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#34C759",
    alignItems: "center",
    width: "100%"
  },
  correctionSuccessText: {
    color: "#34C759",
    fontSize: 16,
    fontWeight: "bold"
  },

  // --- FOOTER & BOUTON ---
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderColor: "#E0E0E0"
  },
  nextButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center"
  },
  nextButtonDisabled: {
    backgroundColor: "#E0E0E0"
  },
  nextButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase"
  }
});

export default ExerciseThreeScreen;
