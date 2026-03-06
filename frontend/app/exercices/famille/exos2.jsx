import React, { useState, useEffect, useRef } from "react";
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
import * as Haptics from "expo-haptics";
import { THEME_FAMILLE_WORDS } from "../../data/themeData";

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

// Audio mapping for all 6 words - using available audio files
// Note: In production, each word should have its own audio file
const getAudioForWord = async (wordId) => {
  if (audioDisabled) return false;

  // Audio map for available files - map each word to available audio
  // Since we have limited audio files, we'll map them to available ones
  const audioMap = {
    // p1: Le papa -> Papá
    p1: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Mon Frère en duala.wav"),
    // p2: La tante paternelle -> Ndómɛ á tetɛ́
    p2: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/les grands parents en duala.wav"),
    // p3: La maman -> Mamá
    p3: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Le bebe en duala.wav"),
    // p4: L'oncle paternel -> Árí á tetɛ́
    p4: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/l'oncle en douala.wav"),
    // p5: Le frère -> Muna
    p5: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Mon Frère en duala.wav"),
    // p6: La sœur -> Sango
    p6: require("../../../assets/audio/Theme 0 de la langue duala (Voices)/Exercise 1 du theme 0 en duala/Le bebe en duala.wav")
  };

  const audioSource = audioMap[wordId];
  if (!audioSource) {
    console.log(`Audio not available for: ${wordId}`);
    return false;
  }

  try {
    const initResult = await initializeAudio();
    if (!initResult) return false;

    const { sound } = await Audio.Sound.createAsync(audioSource);
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    return true;
  } catch (error) {
    if (isKeepAwakeError(error)) {
      audioDisabled = true;
    }
    console.error("Error playing audio:", error.message);
    return false;
  }
};

// Play feedback sound
const playFeedbackSound = async (isCorrect) => {
  try {
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

// --- EXERCISE DATA: ALL 6 WORDS ---
// Using all 6 words from the shared pool for pedagogical consistency
const EXERCISE_QUESTIONS = THEME_FAMILLE_WORDS.map((word, index) => ({
  id: word.id,
  questionNumber: index + 1,
  fr: word.fr,
  local: word.local,
  audio: word.audio
}));

const TOTAL_QUESTIONS = EXERCISE_QUESTIONS.length;

const ExerciseTwoScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";

  // --- PARAMETER HANDLING ---
  const getParamAsNumber = (key, fallback) => {
    const value = params[key];
    const num = value ? parseInt(value, 10) : fallback;
    return isNaN(num) ? fallback : num;
  };

  const initialLives = getParamAsNumber("currentLives", 5);
  const totalProgress = getParamAsNumber("totalProgress", 33);

  // --- STATE ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [lives, setLives] = useState(initialLives);
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'error'
  const [isAnswered, setIsAnswered] = useState(false);
  const [errorCount, setErrorCount] = useState(
    getParamAsNumber("errorCount", 0)
  );

  // Track results for each question
  const [questionResults, setQuestionResults] = useState([]);

  // Timer state
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Current question
  const currentQuestion = EXERCISE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;

  // Initialize timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- HANDLERS ---

  const handlePlayAudio = async () => {
    const success = await getAudioForWord(currentQuestion.id);
    if (!success) {
      Alert.alert(
        t("errors.audioError") || "Audio Error",
        t("errors.audioNotAvailable") || "Audio not available"
      );
    }
  };

  const handleValidate = async () => {
    if (inputText.trim() === "") return;

    const normalizedInput = inputText.trim().toLowerCase();
    const isSuccess = normalizedInput === currentQuestion.local.toLowerCase();

    // Record result
    const result = {
      questionId: currentQuestion.id,
      questionNumber: currentQuestion.questionNumber,
      userAnswer: inputText.trim(),
      correctAnswer: currentQuestion.local,
      isCorrect: isSuccess
    };
    setQuestionResults((prev) => [...prev, result]);

    if (isSuccess) {
      setStatus("success");
      await playFeedbackSound(true);
    } else {
      setStatus("error");
      setErrorCount((prev) => prev + 1);
      setLives((prev) => Math.max(0, prev - 1));
      await playFeedbackSound(false);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    // Check if game over
    if (lives <= 1) {
      Alert.alert("Game Over", "Vous avez épuisé toutes vos vies !", [
        {
          text: "OK",
          onPress: () => {
            const exerciseTime = elapsedTime;
            const totalTime = (parseInt(params?.totalTime) || 0) + exerciseTime;
            router.push({
              pathname: "/exercices/famille/endexos",
              params: {
                currentLives: 0,
                totalTime: totalTime,
                totalProgress: totalProgress,
                errorCount: errorCount,
                completedExercises: 2,
                totalExercises: 3,
                exerciseTimes: JSON.stringify([exerciseTime])
              }
            });
          }
        }
      ]);
      return;
    }

    // Move to next question or finish
    if (isLastQuestion) {
      // Finish exercise 2, go to exercise 3
      finishExercise();
    } else {
      // Go to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setInputText("");
      setStatus("idle");
      setIsAnswered(false);
    }
  };

  const finishExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const exerciseTime = elapsedTime;
    const cumulativeTime = (parseInt(params?.totalTime) || 0) + exerciseTime;

    router.push({
      pathname: "/exercices/famille/exos3",
      params: {
        currentLives: lives,
        totalTime: cumulativeTime,
        totalProgress: 66, // After 2 exercises (33% + 33%)
        errorCount: errorCount,
        exerciseTimes: JSON.stringify([exerciseTime])
      }
    });
  };

  // Calculate progress for this exercise (0-33%)
  const exerciseProgress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 33;
  const overallProgress = totalProgress + exerciseProgress;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* --- HEADER --- */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerText}>
                Question {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
              </Text>
              <Text style={styles.timerText}>
                🕒 Temps : {formatTime(elapsedTime)}
              </Text>
            </View>
            <Text style={styles.livesText}>🐚 {lives} vies</Text>
          </View>

          {/* Progress bar for this exercise */}
          <View style={styles.exerciseProgressContainer}>
            <View style={styles.exerciseProgressBar}>
              <View
                style={[
                  styles.exerciseProgressFill,
                  {
                    width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%`
                  }
                ]}
              />
            </View>
          </View>

          {/* --- INSTRUCTION --- */}
          <View style={styles.instructionContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../../assets/images/avatar-famille.png")}
                style={styles.illustrationImage}
                resizeMode='contain'
              />
            </View>
            <Text style={styles.instruction}>
              Écoutez et écrivez le mot en langue locale :
            </Text>
            <Text style={styles.frenchWord}>
              &quot;{currentQuestion.fr}&quot;
            </Text>

            <TouchableOpacity
              style={styles.audioButton}
              onPress={handlePlayAudio}
            >
              <Text style={styles.audioIcon}>🎧</Text>
            </TouchableOpacity>
          </View>

          {/* --- INPUT --- */}
          <TextInput
            style={[
              styles.input,
              status === "error" && styles.inputError,
              status === "success" && styles.inputSuccess
            ]}
            placeholder={isAnswered ? "" : "Écrivez votre réponse ici..."}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (!isAnswered) setStatus("idle");
            }}
            editable={!isAnswered}
            autoCapitalize='none'
            autoCorrect={false}
          />

          {/* --- FEEDBACK --- */}
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
                  <Text style={styles.boldRed}>{currentQuestion.local}</Text>
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* --- FOOTER --- */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[
              styles.validateButton,
              isAnswered && status === "error" && styles.continueButtonError,
              isAnswered &&
                status === "success" &&
                styles.continueButtonSuccess,
              !isAnswered && inputText.trim() === "" && { opacity: 0.5 }
            ]}
            onPress={isAnswered ? handleNextQuestion : handleValidate}
            disabled={!isAnswered && inputText.trim() === ""}
          >
            <Text style={styles.validateButtonText}>
              {isAnswered
                ? isLastQuestion
                  ? "Terminer"
                  : "Question suivante"
                : "Valider"}
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
    paddingBottom: 20
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 10
  },
  headerText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600"
  },
  livesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C81E2F"
  },
  timerText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4
  },
  exerciseProgressContainer: {
    width: "100%",
    marginBottom: 20
  },
  exerciseProgressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden"
  },
  exerciseProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3
  },
  instructionContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30
  },
  imageContainer: {
    width: "100%",
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15
  },
  illustrationImage: {
    width: 60,
    height: 60
  },
  instruction: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
    textAlign: "center"
  },
  frenchWord: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    fontStyle: "italic"
  },
  audioButton: {
    backgroundColor: "#C81E2F",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  audioIcon: {
    fontSize: 32
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#CCC",
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20
  },
  inputError: {
    borderColor: "#C81E2F",
    borderBottomWidth: 3
  },
  inputSuccess: {
    borderColor: "#34C759",
    borderBottomWidth: 3
  },
  correctionError: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 5,
    borderLeftColor: "#C81E2F",
    padding: 15,
    width: "100%",
    borderRadius: 8
  },
  correctionSuccess: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 5,
    borderLeftColor: "#34C759",
    padding: 15,
    width: "100%",
    borderRadius: 8
  },
  correctionTitleError: {
    color: "#C81E2F",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5
  },
  correctionTitleSuccess: {
    color: "#34C759",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5
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
  footerActions: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
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
