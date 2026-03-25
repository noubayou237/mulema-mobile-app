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
<<<<<<< HEAD
  Image,
  ActivityIndicator
=======
  Image
>>>>>>> feat/settings-page
} from "react-native";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { THEME_FAMILLE_WORDS, getWrongOptions } from "../../data/themeData";
<<<<<<< HEAD
import { generateBlockExercises } from "../../src/services/ExerciseApiService";
=======
>>>>>>> feat/settings-page

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

// Audio initialization with error handling
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
<<<<<<< HEAD
// Block ID for the "Famille" theme in the backend
const THEME_BLOCK_ID = "block-famille-001";

// Static fallback data
const generateStaticExerciseQuestions = () => {
  return THEME_FAMILLE_WORDS.map((word, index) => {
    // Generate options: correct answer + wrong options
    const wrongOptions = getWrongOptions(word.id, 3);
    const allOptions = [word, ...wrongOptions];
    // Shuffle options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

    return {
      id: word.id,
      questionNumber: index + 1,
      fr: word.fr,
      local: word.local,
      options: shuffledOptions.map((opt, optIndex) => ({
        id: `opt${optIndex + 1}`,
        text: opt.local
      }))
    };
  });
};

const staticExerciseQuestions = generateStaticExerciseQuestions();

const TOTAL_QUESTIONS = staticExerciseQuestions.length;
=======
// Using all 6 words from the shared pool for pedagogical consistency
const EXERCISE_QUESTIONS = THEME_FAMILLE_WORDS.map((word, index) => {
  // Generate options: correct answer + wrong options
  const wrongOptions = getWrongOptions(word.id, 3);
  const allOptions = [word, ...wrongOptions];
  // Shuffle options
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

  return {
    id: word.id,
    questionNumber: index + 1,
    fr: word.fr,
    local: word.local,
    options: shuffledOptions.map((opt, optIndex) => ({
      id: `opt${optIndex + 1}`,
      text: opt.local
    }))
  };
});

const TOTAL_QUESTIONS = EXERCISE_QUESTIONS.length;
>>>>>>> feat/settings-page

const ExerciseThreeScreen = () => {
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
  const totalProgress = getParamAsNumber("totalProgress", 66);

  // --- STATE ---
<<<<<<< HEAD
  // Backend data state
  const [exerciseQuestions, setExerciseQuestions] = useState(
    staticExerciseQuestions
  );
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseError, setExerciseError] = useState(null);

=======
>>>>>>> feat/settings-page
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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
<<<<<<< HEAD
  const currentQuestion = exerciseQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exerciseQuestions.length - 1;

  // Initialize timer
  useEffect(() => {
    // Fetch exercises from backend
    const fetchExercises = async () => {
      try {
        setIsLoadingExercises(true);
        const backendExercises = await generateBlockExercises(THEME_BLOCK_ID);

        if (backendExercises && backendExercises.length > 0) {
          const listenSelectExercise = backendExercises.find(
            (ex) => ex.type === "LISTEN_SELECT_IMAGE"
          );

          if (listenSelectExercise && listenSelectExercise.questions) {
            const transformedQuestions = listenSelectExercise.questions.map(
              (q, index) => {
                // Get wrong options from backend or generate locally
                const options = q.options || [];
                return {
                  id: q.word?.id || `q-${index}`,
                  questionNumber: index + 1,
                  fr: q.word?.sourceText || q.word?.fr || "",
                  local: q.word?.targetText || q.word?.local || "",
                  options: options.map((opt, optIndex) => ({
                    id: `opt${optIndex + 1}`,
                    text: opt.text || opt
                  }))
                };
              }
            );
            setExerciseQuestions(transformedQuestions);
            console.log(
              "✅ Loaded LISTEN_SELECT_IMAGE exercises from backend API"
            );
          }
        }
      } catch (error) {
        console.log("⚠️ Failed to fetch from backend:", error.message);
        setExerciseError(error.message);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();

=======
  const currentQuestion = EXERCISE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;

  // Initialize timer
  useEffect(() => {
>>>>>>> feat/settings-page
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

  const handleOptionSelect = async (optionText) => {
    if (isAnswered) return;

    setSelectedOption(optionText);
    setIsAnswered(true);

    const success = optionText === currentQuestion.local;
    setIsCorrect(success);

    // Record result
    const result = {
      questionId: currentQuestion.id,
      questionNumber: currentQuestion.questionNumber,
      userAnswer: optionText,
      correctAnswer: currentQuestion.local,
      isCorrect: success
    };
    setQuestionResults((prev) => [...prev, result]);

    if (success) {
      await playFeedbackSound(true);
    } else {
      setErrorCount((prev) => prev + 1);
      setLives((prev) => Math.max(0, prev - 1));
      await playFeedbackSound(false);
    }
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
                totalProgress: 100,
                errorCount: errorCount,
                completedExercises: 3,
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
      finishExercise();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  const finishExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const exerciseTime = elapsedTime;
    const totalTime = (parseInt(params?.totalTime) || 0) + exerciseTime;

    router.push({
      pathname: "/exercices/famille/endexos",
      params: {
        currentLives: lives,
        totalTime: totalTime,
        totalProgress: 100,
        errorCount: errorCount,
        completedExercises: 3,
        totalExercises: 3,
        exerciseTimes: JSON.stringify([exerciseTime])
      }
    });
  };

  // Get button style based on state
  const getButtonStyle = (optionText) => {
    let style = {
      backgroundColor: "#E0E0E0",
      borderWidth: 1,
      borderColor: "#E0E0E0"
    };
    let textStyle = { color: "#000" };

    if (isAnswered) {
      if (optionText === currentQuestion.local) {
        // Always show correct answer in green
        style = {
          backgroundColor: "#34C759",
          borderColor: "#34C759",
          borderWidth: 2
        };
        textStyle = { color: "#FFF" };
      } else if (optionText === selectedOption && !isCorrect) {
        // Selected wrong answer in red
        style = {
          backgroundColor: "#FFCDD2",
          borderColor: "#C81E2F",
          borderWidth: 2
        };
        textStyle = { color: "#C81E2F" };
      } else {
        // Other options fade
        style = {
          backgroundColor: "#F0F0F0",
          opacity: 0.6,
          borderWidth: 1,
          borderColor: "#E0E0E0"
        };
      }
    } else if (optionText === selectedOption) {
      // Selected before answering - blue
      style = {
        backgroundColor: "#E3F2FD",
        borderColor: "#2196F3",
        borderWidth: 2
      };
      textStyle = { color: "#2196F3" };
    }

    return { style, textStyle };
  };

  // Calculate progress
<<<<<<< HEAD
  const exerciseProgress =
    ((currentQuestionIndex + 1) / exerciseQuestions.length) * 34;
  const overallProgress = totalProgress + exerciseProgress;

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

=======
  const exerciseProgress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 34;
  const overallProgress = totalProgress + exerciseProgress;

>>>>>>> feat/settings-page
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <View style={styles.container}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${overallProgress}%` }]}
            />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timerText}>🕒 {formatTime(elapsedTime)}</Text>
            <Text style={styles.livesText}>🐚 {lives}</Text>
          </View>
        </View>

        {/* Question counter */}
        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>
            Question {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* --- IMAGE --- */}
          <View style={styles.imageContainer}>
            <Image
              source={require("../../../assets/images/avatar-famille.png")}
              style={styles.illustrationImage}
              resizeMode='contain'
            />
          </View>

          {/* --- QUESTION --- */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>
              Traduisez en langue locale
            </Text>
            <Text style={styles.instructionText}>{currentQuestion.fr}</Text>
          </View>

          {/* --- OPTIONS --- */}
          <View style={styles.optionsGrid}>
            {currentQuestion.options.map((opt) => {
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

          {/* --- FEEDBACK --- */}
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
                  : `La bonne réponse est : ${currentQuestion.local}`}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* --- FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isAnswered && styles.nextButtonDisabled,
            isAnswered && !isCorrect && { backgroundColor: "#C81E2F" },
            isAnswered && isCorrect && { backgroundColor: "#34C759" }
          ]}
          onPress={handleNextQuestion}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {isAnswered
              ? isLastQuestion
                ? "Terminer"
                : "Question suivante"
              : "Valider"}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666"
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
    fontStyle: "italic"
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

  // --- HEADER ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10
  },
  progressBarContainer: {
    height: 10,
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginRight: 15,
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#C81E2F",
    borderRadius: 5
  },
  headerRight: {
    alignItems: "flex-end"
  },
  timerText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4
  },
  livesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C81E2F"
  },

  // --- QUESTION COUNTER ---
  questionCounter: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15
  },
  questionCounterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },

  // --- IMAGE ---
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

  // --- INSTRUCTIONS ---
  instructionContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  instructionTitle: {
    color: "#C81E2F",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 10
  },
  instructionText: {
    textAlign: "center",
    fontSize: 22,
    color: "#000",
    fontWeight: "600"
  },

  // --- OPTIONS ---
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

  // --- FEEDBACK ---
  correctionBanner: {
    backgroundColor: "#FFCDD2",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#C81E2F",
    alignItems: "center",
    width: "100%"
  },
  correctionBannerText: {
    color: "#C81E2F",
    fontSize: 16,
    fontWeight: "600"
  },
  correctionSuccess: {
    backgroundColor: "#C8E6C9",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#4CAF50",
    alignItems: "center",
    width: "100%"
  },
  correctionSuccessText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600"
  },

  // --- FOOTER ---
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#EEE"
  },
  nextButton: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#C81E2F"
  },
  nextButtonDisabled: {
    backgroundColor: "#CCC"
  },
  nextButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase"
  }
});

export default ExerciseThreeScreen;
