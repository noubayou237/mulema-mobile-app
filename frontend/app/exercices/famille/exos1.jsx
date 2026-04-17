import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useCowrie from "../../hooks/useCowrie";
import { THEME_FAMILLE_WORDS } from "../../data/themeData";
import { generateBlockExercises } from "../../../src/services/ExerciseApiService";

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
initializeAudio().catch(() => { });

// Audio playback function with error handling
const playWordAudio = async (wordKey) => {
  // Skip if audio is disabled
  if (audioDisabled) {
    return false;
  }

  try {
    // Map words to their audio files based on available assets
    const audioMap = {
      // Exercise 1 pairs
      p1: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Mon Frère en duala.wav"),
      p2: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/les grands parents en duala.wav"),
      p3: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Le bebe en duala.wav"),
      p4: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/l'oncle en douala.wav"),
      // Exercise 2 pairs
      p5: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Mon Frère en duala.wav"),
      p6: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Le bebe en duala.wav")
    };

    const audioSource = audioMap[wordKey];
    if (!audioSource) {
      // console.log(`Audio not available for: ${wordKey}`);
      return false;
    }

    // Ensure audio is initialized
    const initResult = await initializeAudio();
    if (!initResult) {
      return false;
    }

    const { sound } = await Audio.Sound.createAsync(audioSource);
    await sound.playAsync();

    // Cleanup after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    return true;
  } catch (error) {
    // Handle keep awake error gracefully
    if (isKeepAwakeError(error)) {
      console.warn("Keep awake error during playback:", error.message);
      audioDisabled = true;
      return false;
    }
    console.error("Error playing audio:", error.message);
    return false;
  }
};

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
      // console.log("Haptics not available:", hapticsError.message);
    }
  } catch (error) {
    // console.log("Feedback error:", error);
  }
};

// --- DONNÉES DU THÈME (SHARED WORD POOL) ---
// Uses the same 6 words across ALL exercises for pedagogical repetition

// Block ID for the "Famille" theme in the backend
// This should match a block ID in your database
const THEME_BLOCK_ID = "block-famille-001";

// Transform words into pairs for matching exercise
const transformMatchingPairs = (words) => {
  return words.map((word) => ({
    id: word.id || word.sourceText,
    fr: word.sourceText || word.fr,
    local: word.targetText || word.local
  }));
};

// Static fallback data
const staticMatchingPairs = THEME_FAMILLE_WORDS.map((word) => ({
  id: word.id,
  fr: word.fr,
  local: word.local
}));

const staticExercisesData = [
  {
    id: 1,
    type: "matching",
    instruction: "Associe chaque mot avec sa bonne traduction !",
    pairs: staticMatchingPairs
  }
];

const ExerciseScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";
  const { width } = Dimensions.get("window");
  const params = useLocalSearchParams();

  // --- ÉTATS (STATE) ---
  const router = useRouter();
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [exercisesData, setExercisesData] = useState(staticExercisesData);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseError, setExerciseError] = useState(null);

  // Fetch exercises from backend on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoadingExercises(true);
        // Try to fetch from backend
        const backendExercises = await generateBlockExercises(THEME_BLOCK_ID);

        if (backendExercises && backendExercises.length > 0) {
          // Transform backend data to frontend format
          const matchingExercise = backendExercises.find(
            (ex) => ex.type === "MATCHING"
          );

          if (
            matchingExercise &&
            matchingExercise.questions &&
            matchingExercise.questions[0]
          ) {
            const transformedPairs = matchingExercise.questions[0].pairs || [];
            setExercisesData([
              {
                id: matchingExercise.id,
                type: "matching",
                instruction:
                  matchingExercise.questions[0].instruction ||
                  "Associe chaque mot avec sa bonne traduction !",
                pairs: transformedPairs
              }
            ]);
            console.log("✅ Loaded exercises from backend API");
          } else {
            console.log(
              "⚠️ No matching exercise in backend response, using static data"
            );
          }
        } else {
          console.log("⚠️ No exercises from backend, using static data");
        }
      } catch (error) {
        console.log("⚠️ Failed to fetch from backend:", error.message);
        setExerciseError(error.message);
        // Fall back to static data
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  // Use cowrie hook for automatic recharging
  const { cowries, setCowries, canPlay, isRecharging, formatRechargeTime } =
    useCowrie(5);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer state - Track time taken to complete exercise
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Store time per exercise for end screen
  const [exerciseTimes, setExerciseTimes] = useState([]);

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

  // NOUVEAUX ÉTATS pour stocker les colonnes mélangées de manière statique
  const [shuffledLeftColumn, setShuffledLeftColumn] = useState([]);
  const [shuffledRightColumn, setShuffledRightColumn] = useState([]);

  const currentExercise = exercisesData[currentExIndex];

  // --- INITIALISATION STATIQUE DES COLONNES ---
  useEffect(() => {
    if (!currentExercise) return;

    // 1. Colonne de gauche (Généralement non mélangée, mais stockée statiquement)
    const initialLeft = currentExercise.pairs.map((p) => ({
      id: p.id,
      text: p.fr,
      side: "left"
    }));

    // 2. Colonne de droite (Mélangée une seule fois)
    // On crée une copie des paires, on les mélange, puis on mappe.
    const shuffledPairs = [...currentExercise.pairs].sort(
      () => Math.random() - 0.5
    );
    const initialRight = shuffledPairs.map((p) => ({
      id: p.id,
      text: p.local,
      side: "right"
    }));

    setShuffledLeftColumn(initialLeft);
    setShuffledRightColumn(initialRight);
  }, [currentExIndex, currentExercise]); // Dépend de l'index de l'exercice pour le recharger

  // --- LOGIQUE DU JEU ---

  const handlePress = (item, side) => {
    // Si déjà validé, on ne fait rien
    if (matchedPairs.includes(item.id)) return;
    // Si on est en train d'afficher une erreur, on attend
    if (errorIds.length > 0) return;

    if (side === "left") {
      setSelectedLeft(item.id);
      // Si on a déjà un droit sélectionné, on vérifie
      if (selectedRight) checkMatch(item.id, selectedRight);
    } else {
      setSelectedRight(item.id);
      // Si on a déjà un gauche sélectionné, on vérifie
      if (selectedLeft) checkMatch(selectedLeft, item.id);
    }
  };

  const checkMatch = (leftId, rightId) => {
    if (leftId === rightId) {
      // --- SUCCÈS ✅ ---
      const newMatched = [...matchedPairs, leftId];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      // Play positive feedback sound
      playFeedbackSound(true, currentLanguage);

      // Vérifier si l'exercice est fini
      if (newMatched.length === currentExercise.pairs.length) {
        setIsCompleted(true);
      }
    } else {
      // --- ÉCHEC ❌ ---
      setCowries((prev) => Math.max(0, prev - 1)); // Perdre une vie
      setErrorCount((prev) => prev + 1);
      setErrorIds([leftId, rightId]); // Marquer ces deux comme erreur

      // Play negative feedback sound
      playFeedbackSound(false, currentLanguage);

      // Feedback visuel rouge pendant 1 seconde, puis reset
      setTimeout(() => {
        setErrorIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);

      if (cowries <= 1) {
        Alert.alert("Oups !", "Vous n'avez plus de coris !");
        // Logique de "Game Over" ici
      }
    }
  };

  const handleNextExercise = () => {
    // Stop timer and calculate final time for this exercise
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Use elapsedTime which is already tracked by the interval
    const exerciseTime = elapsedTime;

    // Store time for this exercise
    const newExerciseTimes = [...exerciseTimes, exerciseTime];

    if (currentExIndex < exercisesData.length - 1) {
      // Pass to next exercise with cumulative time data
      const newTotalTime = (parseInt(params?.totalTime) || 0) + exerciseTime;

      // Navigate to exos2
      router.push({
        pathname: "/exercices/famille/exos2",
        params: {
          currentLives: cowries,
          totalTime: newTotalTime,
          totalProgress: 33,
          errorCount: errorCount,
          exerciseTimes: JSON.stringify(newExerciseTimes)
        }
      });
    } else {
      // Fin du thème - navigate to end page with all data
      const totalTime = (parseInt(params?.totalTime) || 0) + exerciseTime;
      router.push({
        pathname: "/exercices/famille/endexos",
        params: {
          currentLives: cowries,
          totalTime: totalTime,
          totalProgress: 100,
          errorCount: errorCount,
          completedExercises: exercisesData.length,
          totalExercises: exercisesData.length,
          exerciseTimes: JSON.stringify(newExerciseTimes)
        }
      });
    }
  };

  // --- RENDU DES BOUTONS ---

  const renderButton = (item, side) => {
    const isSelected =
      (side === "left" ? selectedLeft : selectedRight) === item.id;
    const isMatched = matchedPairs.includes(item.id);
    const isError = errorIds.includes(item.id) && isSelected;

    let backgroundColor = "#F0F2F8";
    let textColor = "#1A1A2E";
    let borderColor = "#E2E6F0";
    let shadowStyle = {};

    if (isMatched) {
      backgroundColor = "#E8F5E9";
      textColor = "#2E7D32";
      borderColor = "#66BB6A";
    } else if (isError) {
      backgroundColor = "#FFEBEE";
      borderColor = "#EF5350";
      textColor = "#C62828";
    } else if (isSelected) {
      backgroundColor = "#FFF3E0";
      borderColor = "#E8A020";
      textColor = "#E65100";
      shadowStyle = { shadowColor: "#E8A020", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 };
    }

    // Pour assurer la stabilité de la position, tous les boutons doivent avoir une bordure de 2px
    // (fixe le problème de décalage lié à l'affichage conditionnel des bordures).
    return (
      <TouchableOpacity
        key={item.id + side}
        style={[
          styles.optionBtn,
          {
            backgroundColor,
            borderColor: borderColor,
            borderWidth: 2,
            ...shadowStyle,
          }
        ]}
        onPress={() => handlePress(item, side)}
        disabled={isMatched}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, { color: textColor }]}>
          {item.text}
        </Text>
        {!isMatched && (
          <TouchableOpacity
            style={styles.audioIconContainer}
            onPress={async () => {
              const success = await playWordAudio(item.id);
              if (!success) {
                Alert.alert(
                  t("errors.audioError"),
                  t("errors.audioNotAvailable")
                );
              }
            }}
          >
            <Ionicons name='volume-high' size={18} color={textColor} />
          </TouchableOpacity>
        )}
        {isMatched && (
          <Ionicons name='checkmark-circle' size={20} color={textColor} style={{ marginLeft: 4 }} />
        )}
      </TouchableOpacity>
    );
  };

  // Show loading while fetching exercises from backend
  if (isLoadingExercises) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#D32F2F' />
          <Text style={styles.loadingText}>Chargement des exercices...</Text>
          {exerciseError && (
            <Text style={styles.fallbackText}>
              Utilisation des données locales
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <View style={styles.container}>
        <Text style={styles.pageTitle}>Vie sociale & famille</Text>
        <View style={styles.headerLine} />

        {/* --- IMAGE ILLUSTRATIVE --- */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/images/avatar-famille.png")}
            style={styles.illustrationImage}
            resizeMode='contain'
          />
        </View>

        {/* --- STATS BAR --- */}
        <View style={styles.statsContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(matchedPairs.length / currentExercise.pairs.length) * 100}%`
                }
              ]}
            />
          </View>
          <View style={styles.livesContainer}>
            <Text style={styles.livesText}>
              {String(cowries).padStart(2, "0")}
            </Text>
            <Image
              source={require("../../../assets/images/colla.png")}
              style={{ width: 30, height: 30, resizeMode: "contain" }}
            />
          </View>
        </View>

        {/* --- TIMER & RECHARGE STATUS --- */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            🕒 Temps : {formatTime(elapsedTime)}
          </Text>
          {isRecharging && (
            <Text style={styles.rechargeText}>
              ⚡ Recharge: {formatRechargeTime()}
            </Text>
          )}
        </View>

        {/* --- CONSIGNE --- */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Consigne</Text>
          <View style={styles.instructionLine} />
          <Text style={styles.instructionText}>
            {currentExercise.instruction}
          </Text>
        </View>

        {/* --- ZONE DE JEU (2 COLONNES) --- */}
        <ScrollView contentContainerStyle={styles.gameArea}>
          <View style={styles.columnsContainer}>
            {/* Colonne Gauche (Français) */}
            <View style={styles.column}>
              {/* UTILISATION DE L'ÉTAT STATIQUE */}
              {shuffledLeftColumn.map((item) => renderButton(item, "left"))}
            </View>

            {/* Colonne Droite (Langue) */}
            <View style={styles.column}>
              {/* UTILISATION DE L'ÉTAT STATIQUE */}
              {shuffledRightColumn.map((item) => renderButton(item, "right"))}
            </View>
          </View>
        </ScrollView>

        {/* --- COMPTEUR D'ERREURS --- */}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>erreurs : {errorCount}</Text>
        </View>

        {/* --- BOUTON SUIVANT --- */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: isCompleted ? "#C81E2F" : "#E0E0E0" }
          ]}
          onPress={handleNextExercise}
          disabled={!isCompleted}
        >
          <Text
            style={[
              styles.nextButtonText,
              { color: isCompleted ? "#FFF" : "#A0A0A0" }
            ]}
          >
            Suivant
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F8"
  },
  container: {
    flex: 1,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F8",
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#5A6070",
    fontFamily: "Nunito-Regular"
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B71C1C",
    textAlign: "left",
    fontFamily: "Fredoka_700Bold"
  },
  headerLine: {
    height: 3,
    backgroundColor: "#B71C1C",
    width: "100%",
    marginTop: 6,
    marginBottom: 20,
    borderRadius: 2
  },
  imageContainer: {
    width: "100%",
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  illustrationImage: {
    width: 100,
    height: 100
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#A0A8C0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  progressBarContainer: {
    height: 10,
    flex: 1,
    backgroundColor: "#E2E6F0",
    borderRadius: 5,
    marginRight: 15
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#B71C1C",
    borderRadius: 5
  },
  livesContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  livesText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
    color: "#1A1A2E",
    fontFamily: "Fredoka_600SemiBold"
  },
  timerContainer: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  timerText: {
    color: "#B71C1C",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Fredoka_600SemiBold"
  },
  rechargeText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Nunito-Regular"
  },
  instructionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#A0A8C0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  instructionTitle: {
    color: "#B71C1C",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    fontFamily: "Fredoka_600SemiBold"
  },
  instructionLine: {
    height: 1,
    width: "80%",
    backgroundColor: "#E2E6F0",
    marginBottom: 8
  },
  instructionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "500",
    fontFamily: "Nunito-Regular"
  },
  gameArea: {
    flexGrow: 1,
    justifyContent: "center"
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  column: {
    width: "48%"
  },
  optionBtn: {
    minHeight: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row"
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    fontFamily: "Fredoka_600SemiBold"
  },
  audioIconContainer: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)"
  },
  errorContainer: {
    marginBottom: 10,
    alignItems: "flex-start",
    paddingLeft: 10
  },
  errorText: {
    color: "#B71C1C",
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: "Nunito-Regular"
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
    fontStyle: "italic"
  },
  nextButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Fredoka_700Bold"
  }
});

export default ExerciseScreen;
