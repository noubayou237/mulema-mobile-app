import React, { useState, useEffect } from "react";
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
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Audio initialization with error handling for keep-awake issues
const initializeAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true
    });
  } catch (error) {
    // Handle keep awake error gracefully
    if (error.message && error.message.includes("keep awake")) {
      console.warn("Keep awake not available:", error.message);
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false
        });
      } catch (fallbackError) {
        console.warn("Audio fallback also failed:", fallbackError.message);
      }
    }
  }
};

// Initialize audio on module load
initializeAudio().catch(() => {});

// Audio playback function with error handling
const playWordAudio = async (wordKey) => {
  try {
    // Map words to their audio files based on available assets
    const audioMap = {
      papa: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/l'oncle en douala.wav"),
      maman: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Le bebe en duala.wav")
    };

    const audioSource = audioMap[wordKey];
    if (!audioSource) {
      console.log(`Audio not available for: ${wordKey}`);
      return false;
    }

    // Ensure audio is initialized
    await initializeAudio();

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
    if (error.message && error.message.includes("keep awake")) {
      console.warn("Keep awake error during playback:", error.message);
      // Audio might still work, try again
      try {
        const audioMap = {
          papa: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/l'oncle en douala.wav"),
          maman: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Le bebe en duala.wav")
        };
        const audioSource = audioMap[wordKey];
        if (audioSource) {
          const { sound } = await Audio.Sound.createAsync(audioSource, {
            shouldPlay: true
          });
          return true;
        }
      } catch (retryError) {
        console.error("Retry also failed:", retryError.message);
      }
    }
    console.error("Error playing audio:", error.message);
    return false;
  }
};

// Play correct/incorrect feedback sound
const playFeedbackSound = async (isCorrect, language = "fr") => {
  try {
    const { Haptics } = await import("expo-haptics");
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (error) {
    console.log("Haptics not available:", error.message);
  }
};

// --- DONNÉES SIMULÉES (THEME 1) ---
const exercisesData = [
  {
    id: 1,
    type: "matching",
    instruction: "Associe chaque mot avec sa bonne traduction !",
    pairs: [
      { id: "p1", fr: "Le papa", local: "Papá" },
      { id: "p2", fr: "La tante paternelle", local: "Ndómɛ á tetɛ́" },
      { id: "p3", fr: "La maman", local: "Mamá" },
      { id: "p4", fr: "L'oncle paternel", local: "Árí á tetɛ́" }
    ]
  },
  {
    id: 2,
    type: "matching",
    instruction: "Associe les membres de la fratrie !",
    pairs: [
      { id: "p5", fr: "Le frère", local: "Muna" },
      { id: "p6", fr: "La soeur", local: "Sango" }
    ]
  }
];

const ExerciseScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";
  const { width } = Dimensions.get("window");

  // --- ÉTATS (STATE) ---
  const router = useRouter();
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

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
      setLives((prev) => Math.max(0, prev - 1)); // Perdre une vie
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

      if (lives <= 1) {
        Alert.alert("Oups !", "Vous n'avez plus de coris !");
        // Logique de "Game Over" ici
      }
    }
  };

  const handleNextExercise = () => {
    if (currentExIndex < exercisesData.length - 1) {
      // Passer à l'exercice suivant
      setCurrentExIndex((prev) => prev + 1);
      // Reset des états pour le nouveau jeu (le useEffect gère le nouveau mélange)
      setMatchedPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setIsCompleted(false);
      setErrorCount(0);
    } else {
      // Fin du thème ou page suivante
      router.push({
        pathname: "/exercices/famille/exos2",
        params: {
          currentLives: lives,
          currentTimer: 0,
          totalProgress: 33
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

    let backgroundColor = "#E0E0E0"; // Gris par défaut
    let textColor = "#000";
    let borderColor = "#E0E0E0"; // Gris pour la bordure "non active"

    if (isMatched) {
      backgroundColor = "#34C759"; // Vert iOS
      textColor = "#FFF";
      borderColor = "#34C759";
    } else if (isError) {
      backgroundColor = "#FFCDD2"; // Rouge clair
      borderColor = "#C62828";
      textColor = "#C62828";
    } else if (isSelected) {
      backgroundColor = "#E3F2FD"; // Bleu clair sélection
      borderColor = "#2196F3";
      textColor = "#2196F3";
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
            borderWidth: 2 // <-- Bordure fixe pour empêcher le décalage de layout
          }
        ]}
        onPress={() => handlePress(item, side)}
        disabled={isMatched}
      >
        <Text style={[styles.optionText, { color: textColor }]}>
          {item.text}
        </Text>
        {!isMatched && (
          <TouchableOpacity
            style={styles.audioIconContainer}
            onPress={async () => {
              // Try to play word audio
              const success = await playWordAudio(item.id);
              if (!success) {
                Alert.alert(
                  t("errors.audioError"),
                  t("errors.audioNotAvailable")
                );
              }
            }}
          >
            <Ionicons name='volume-high' size={20} color={textColor} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <View style={styles.container}>
        <Text style={styles.pageTitle}>Vie sociale & famille</Text>
        <View style={styles.headerLine} />

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
              {String(lives).padStart(2, "0")}
            </Text>
            <Image
              source={require("../../../assets/images/colla.png")}
              style={{ width: 30, height: 30, resizeMode: "contain" }}
            />
          </View>
        </View>

        {/* --- TIMER --- */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>🕒 Temps : 1 min 20 s</Text>
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
    backgroundColor: "#F5F5F5"
  },
  container: {
    flex: 1,
    padding: 20
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#C81E2F",
    textAlign: "left"
  },
  headerLine: {
    height: 2,
    backgroundColor: "#000",
    width: "100%",
    marginTop: 5,
    marginBottom: 20
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
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
    marginRight: 5
  },
  timerContainer: {
    marginBottom: 15
  },
  timerText: {
    color: "#C81E2F",
    fontSize: 14
  },
  instructionCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 5
  },
  instructionLine: {
    height: 1,
    width: "80%",
    backgroundColor: "#DDD",
    marginBottom: 8
  },
  instructionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#000",
    fontWeight: "500"
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
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
    flexDirection: "row"
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    flex: 1
  },
  audioIconContainer: {
    padding: 8,
    marginLeft: 5
  },
  errorContainer: {
    marginBottom: 10,
    alignItems: "flex-start",
    paddingLeft: 10
  },
  errorText: {
    color: "#C81E2F",
    fontSize: 16,
    fontStyle: "italic"
  },
  nextButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold"
  }
});

export default ExerciseScreen;
