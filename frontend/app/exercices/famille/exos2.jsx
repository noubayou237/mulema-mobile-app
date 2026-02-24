import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  Alert
} from "react-native";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";

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

// Audio playback function with error handling
const playWordAudio = async (wordKey) => {
  // Skip if audio is disabled
  if (audioDisabled) {
    return false;
  }

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

// --- DONNÉES DE L'EXERCICE ACTUEL ---
const CORRECT_ANSWER = "Papá"; // Utilisez la majuscule correcte pour l'affichage de la solution
const AUDIO_URL = "URL_SIMULEE_AUDIO_PAPA";

const ExerciseTwoScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";

  // --- SÉCURISATION ET CONVERSION DES PARAMÈTRES ---
  const getParamAsNumber = (key, fallback) => {
    const value = params[key];
    const num = value ? parseInt(value, 10) : fallback;
    return isNaN(num) ? fallback : num;
  };

  const initialLives = getParamAsNumber("currentLives", 5);
  const initialTimer = getParamAsNumber("currentTimer", 0);
  const totalProgress = getParamAsNumber("totalProgress", 33);

  // --- ÉTATS ---
  const [inputText, setInputText] = useState("");
  const [lives, setLives] = useState(initialLives);
  const [timer] = useState(initialTimer); // Timer n'est pas utilisé pour l'instant

  // États de l'exercice
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'error'
  const [isAnswered, setIsAnswered] = useState(false); // Vrai après le clic sur Valider

  // --- LOGIQUE AUDIO ---
  const handlePlayAudio = async () => {
    // Play the word audio
    const success = await playWordAudio("papa");
    if (!success) {
      Alert.alert(t("errors.audioError"), t("errors.audioNotAvailable"));
    }
  };

  // --- LOGIQUE DE VALIDATION ---
  const handleValidate = async () => {
    if (inputText.trim() === "") return; // Ne rien faire si vide

    const normalizedInput = inputText.trim().toLowerCase();

    // Le statut d'erreur/succès est défini maintenant
    const isSuccess = normalizedInput === CORRECT_ANSWER.toLowerCase();

    if (isSuccess) {
      // --- SUCCÈS ✅ ---
      setStatus("success");
      // Play positive feedback sound
      await playFeedbackSound(true, currentLanguage);
    } else {
      // --- ERREUR ❌ ---
      setStatus("error");
      // Play negative feedback sound
      await playFeedbackSound(false, currentLanguage);
      // Déduit la vie immédiatement, mais l'état n'est mis à jour qu'à la fin
      setLives((prev) => Math.max(0, prev - 1));
    }

    // On bloque la saisie et affiche le résultat
    setIsAnswered(true);
  };

  // --- LOGIQUE DE NAVIGATION (UNIFIÉE) ---
  const handleNextStep = () => {
    const isSuccess = status === "success";
    const progressBonus = isSuccess ? 33 : 0;

    // Si l'utilisateur est Game Over, naviguer vers la fin du thème
    if (lives === 0) {
      Alert.alert("Game Over", "Vous avez épuisé toutes vos vies !");
      router.push("/exercices/famille/endexos");
      return;
    }

    // Naviguer vers l'exercice 3
    router.push({
      pathname: "/exercices/famille/exos3",
      params: {
        currentLives: lives, // Utilise la valeur mise à jour
        currentTimer: timer,
        totalProgress: totalProgress + progressBonus
      }
    });
  };

  // --- RENDU ---
  const isInputDisabled = isAnswered;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* --- HEADER SIMULÉ (VIES & PROGRESSION) --- */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Progression : {totalProgress}%
            </Text>
            <Text style={styles.livesText}>🐚 {lives} vies restantes</Text>
          </View>

          {/* --- CONSIGNE --- */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instruction}>
              Écoutez le mot et écrivez-le ci-dessous :
            </Text>
            {/* Le bouton joue le son */}
            <TouchableOpacity
              style={styles.audioButton}
              onPress={handlePlayAudio}
            >
              <Text style={styles.audioIcon}>🎧</Text>
            </TouchableOpacity>
          </View>

          {/* Champ de Saisie */}
          <TextInput
            style={[
              styles.input,
              status === "error" && styles.inputError,
              status === "success" && styles.inputSuccess
            ]}
            placeholder={isAnswered ? "" : "Écrivez votre réponse ici..."}
            value={inputText}
            onChangeText={(t) => {
              setInputText(t);
              // Reset le statut uniquement si on recommence à taper avant de valider
              if (!isAnswered) setStatus("idle");
            }}
            // Désactivé si on a déjà répondu
            editable={!isInputDisabled}
          />

          {/* --- ZONE DE CORRECTION --- */}
          {isAnswered && (
            <View
              style={
                status === "success"
                  ? styles.correctionSuccess
                  : styles.correctionError
              }
            >
              <Text
                style={
                  status === "success"
                    ? styles.correctionTitleSuccess
                    : styles.correctionTitleError
                }
              >
                {status === "success" ? "Parfait ! ✅" : "Dommage ! ❌"}
              </Text>
              {status === "error" && (
                <Text style={styles.correctionText}>
                  La bonne réponse était :{" "}
                  <Text style={styles.boldRed}>{CORRECT_ANSWER}</Text>
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* // ... (à l'intérieur du bloc <KeyboardAvoidingView>) ... */}

        {/* --- FOOTER / BOUTONS D'ACTION --- */}
        <View style={styles.footerActions}>
          {/* Bouton Valider / Continuer */}
          <TouchableOpacity
            style={[
              styles.validateButton,
              isAnswered && status === "error" && styles.continueButtonError,
              isAnswered &&
                status === "success" &&
                styles.continueButtonSuccess,
              // Grisé si on n'a pas tapé et qu'on n'a pas encore répondu
              !isAnswered && inputText.trim() === "" && { opacity: 0.5 }
            ]}
            // 💡 LOGIQUE CLÉ : Si isAnswered est vrai (après la validation), on navigue. Sinon, on valide.
            onPress={isAnswered ? handleNextStep : handleValidate}
            disabled={!isAnswered && inputText.trim() === ""}
          >
            <Text style={styles.validateButtonText}>
              {/* Le texte change après la validation */}
              {isAnswered ? "Continuer" : "Valider"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5"
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    // justifyContent: 'space-between', // Retiré pour laisser le footer au bas du KeyboardAvoidingView
    paddingBottom: 20
  },
  // ... (Styles existants) ...
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10
  },
  headerText: {
    fontSize: 14,
    color: "#000"
  },
  livesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C81E2F"
  },
  instructionContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40
  },
  instruction: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center"
  },
  audioButton: {
    backgroundColor: "#C81E2F",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  audioIcon: {
    fontSize: 40
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#CCC",
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30
  },
  inputError: {
    borderColor: "#C81E2F",
    borderBottomWidth: 3
  },
  inputSuccess: {
    borderColor: "#34C759",
    borderBottomWidth: 3
  },

  // NOUVEAUX STYLES DE CORRECTION
  correctionError: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 5,
    borderLeftColor: "#C81E2F",
    padding: 15,
    marginTop: 10,
    width: "100%",
    borderRadius: 8
  },
  correctionSuccess: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 5,
    borderLeftColor: "#34C759",
    padding: 15,
    marginTop: 10,
    width: "100%",
    borderRadius: 8
  },
  correctionTitleError: {
    color: "#C81E2F",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16
  },
  correctionTitleSuccess: {
    color: "#34C759",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16
  },
  correctionText: {
    fontSize: 16,
    color: "#333"
  },
  boldRed: {
    fontWeight: "bold",
    color: "#C81E2F",
    fontSize: 18
  },

  // FOOTER ACTIONS PLACÉ EN BAS DU KEYBOARDAVOIDINGVIEW
  footerActions: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#EEE"
  },
  validateButton: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#C81E2F"
  },
  continueButtonError: {
    backgroundColor: "#C81E2F"
  },
  continueButtonSuccess: {
    backgroundColor: "#34C759"
  },
  validateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase"
  }
});

export default ExerciseTwoScreen;
