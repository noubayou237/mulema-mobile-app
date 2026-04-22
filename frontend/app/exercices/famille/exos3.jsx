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
  Image,
  ActivityIndicator
} from "react-native";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  THEME_FAMILLE_WORDS,
  THEME_VETEMENTS_WORDS,
  getWrongOptions,
  THEME_IMAGES,
  THEME_AUDIO
} from "../../data/themeData";
import { generateBlockExercises } from "../../../src/services/ExerciseApiService";
import AudioService from "../../src/services/AudioService";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

// Initialize audio on module load
AudioService.initializeAudio().catch(() => {});

// Play feedback sound
const playFeedbackSound = async (isCorrect) => {
  try {
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (error) {
    console.log("Feedback error:", error);
  }
};

const ExerciseThreeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  
  // Theme management
  const themeId = params.themeId || "famille";
  const pool = themeId === "vetements" ? THEME_VETEMENTS_WORDS : THEME_FAMILLE_WORDS;
  const THEME_BLOCK_ID = themeId === "vetements" ? "block-vetements-001" : "block-famille-001";

  // --- STATE ---
  const [exerciseQuestions, setExerciseQuestions] = useState([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseError, setExerciseError] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(params.currentLives ? parseInt(params.currentLives) : 5);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [errorCount, setErrorCount] = useState(params.errorCount ? parseInt(params.errorCount) : 0);

  // Timer state
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // --- QUESTION GENERATION ---
  const generateQuestions = (wordPool) => {
    return wordPool.map((word, index) => {
      const wrongOptions = getWrongOptions(themeId, word.id, 3);
      const allOptions = [word, ...wrongOptions];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      return {
        id: word.id,
        questionNumber: index + 1,
        fr: word.fr,
        local: word.local,
        imageKey: word.image,
        options: shuffledOptions.map((opt) => ({
          id: opt.id,
          text: opt.local,
          imageKey: opt.image
        }))
      };
    });
  };

  // --- EFFECTS ---
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoadingExercises(true);
        // Try backend first
        const backendExercises = await generateBlockExercises(THEME_BLOCK_ID);
        if (backendExercises && backendExercises.length > 0) {
          const typeMatch = backendExercises.find(ex => ex.type === "LISTEN_SELECT_IMAGE") || backendExercises.find(ex => ex.type === "MATCHING");
          if (typeMatch && typeMatch.questions) {
            const transformed = typeMatch.questions.map((q, idx) => ({
              id: q.word?.id || `q-${idx}`,
              questionNumber: idx + 1,
              fr: q.word?.fr || "",
              local: q.word?.local || "",
              imageKey: q.word?.image_key || q.word?.image,
              options: (q.options || []).map((o, oid) => ({
                id: o.id || `opt-${oid}`,
                text: o.text || o.word_local,
                imageKey: o.image_key || o.image
              }))
            }));
            setExerciseQuestions(transformed);
            return;
          }
        }
        // Fallback to static
        setExerciseQuestions(generateQuestions(pool));
      } catch (error) {
        console.log("⚠️ Fallback to static:", error.message);
        setExerciseQuestions(generateQuestions(pool));
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.unloadAsync();
    };
  }, [startTime]);

  // Audio Auto-play on question change
  useEffect(() => {
    if (exerciseQuestions.length > 0 && !isLoadingExercises) {
      handlePlayAudio();
    }
  }, [currentQuestionIndex, isLoadingExercises]);

  const currentQuestion = exerciseQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exerciseQuestions.length - 1;

  // --- HANDLERS ---
  const handlePlayAudio = async () => {
    try {
      if (audioRef.current) await audioRef.current.unloadAsync();
      
      const audioSource = THEME_AUDIO[themeId]?.[currentQuestion.id] || THEME_AUDIO[themeId]?.[currentQuestion.imageKey];
      if (!audioSource) return;

      const { sound } = await Audio.Sound.createAsync(audioSource);
      audioRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Audio play error:", e);
    }
  };

  const handleOptionSelect = async (option) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    const correct = option.id === currentQuestion.id;
    setIsCorrect(correct);

    if (correct) {
      await playFeedbackSound(true);
    } else {
      setErrorCount(prev => prev + 1);
      setLives(prev => Math.max(0, prev - 1));
      await playFeedbackSound(false);
    }
  };

  const handleNextQuestion = () => {
    if (lives <= 0) {
      router.push({
        pathname: "/exercices/famille/endexos",
        params: { ...params, currentLives: 0, errorCount }
      });
      return;
    }

    if (isLastQuestion) {
      router.push({
        pathname: "/exercices/famille/endexos",
        params: {
          ...params,
          currentLives: lives,
          totalProgress: 100,
          errorCount,
          completedExercises: 3
        }
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  if (isLoadingExercises || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#C81E2F' />
          <Text style={styles.loadingText}>Préparation des images...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F5F5F5' />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / exerciseQuestions.length) * 100}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.timerText}>🕒 {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</Text>
            <View style={styles.livesRow}>
              <Ionicons name="heart" size={20} color="#C81E2F" />
              <Text style={styles.livesText}>{lives}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Instruction */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionType}>SÉLECTIONNE L'IMAGE</Text>
            <View style={styles.wordRow}>
              <Text style={styles.targetWord}>{currentQuestion.local}</Text>
              <TouchableOpacity onPress={handlePlayAudio} style={styles.volumeBtn}>
                <Ionicons name="volume-medium" size={32} color="#C81E2F" />
              </TouchableOpacity>
            </View>
            <Text style={styles.translationHint}>({currentQuestion.fr})</Text>
          </View>

          {/* 2x2 Image Grid */}
          <View style={styles.grid}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrectOpt = opt.id === currentQuestion.id;
              
              let cardStyle = styles.card;
              if (isAnswered) {
                if (isCorrectOpt) cardStyle = [styles.card, styles.cardCorrect];
                else if (isSelected) cardStyle = [styles.card, styles.cardWrong];
                else cardStyle = [styles.card, styles.cardFade];
              } else if (isSelected) {
                cardStyle = [styles.card, styles.cardSelected];
              }

              return (
                <TouchableOpacity
                  key={opt.id}
                  style={cardStyle}
                  onPress={() => handleOptionSelect(opt)}
                  disabled={isAnswered}
                >
                  <View style={styles.imageBox}>
                    <Image 
                      source={THEME_IMAGES[themeId]?.[opt.imageKey] || THEME_IMAGES[themeId]?.[opt.id]} 
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.labelBox}>
                    <Text style={styles.cardLabel}>{opt.text}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Action */}
        <View style={styles.footer}>
          {isAnswered && (
            <View style={[styles.feedbackBanner, isCorrect ? styles.bannerSuccess : styles.bannerError]}>
              <Text style={styles.feedbackText}>
                {isCorrect ? "Excellent ! ✅" : `Oups ! C'était : ${currentQuestion.local}`}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.mainBtn, !isAnswered && styles.btnDisabled]}
            disabled={!isAnswered}
            onPress={handleNextQuestion}
          >
            <Text style={styles.btnText}>
              {isLastQuestion ? "TERMINER" : "CONTINUER"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontWeight: "500" },
  container: { flex: 1 },
  header: { padding: 20 },
  progressContainer: { height: 8, backgroundColor: "#E9ECEF", borderRadius: 4, marginBottom: 12 },
  progressFill: { height: "100%", backgroundColor: "#C81E2F", borderRadius: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timerText: { color: "#6C757D", fontWeight: "600" },
  livesRow: { flexDirection: "row", alignItems: "center" },
  livesText: { marginLeft: 5, fontSize: 18, fontWeight: "bold", color: "#C81E2F" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  instructionCard: { 
    backgroundColor: "#FFF", padding: 20, borderRadius: 20, alignItems: "center", 
    marginBottom: 25, elevation: 4, shadowOpacity: 0.1, shadowRadius: 10 
  },
  instructionType: { color: "#ADB5BD", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
  wordRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  targetWord: { fontSize: 32, fontWeight: "800", color: "#212529" },
  volumeBtn: { marginLeft: 15 },
  translationHint: { color: "#6C757D", marginTop: 5, fontStyle: "italic" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { 
    width: CARD_WIDTH, backgroundColor: "#FFF", borderRadius: 16, marginBottom: 20,
    elevation: 3, shadowOpacity: 0.05, overflow: "hidden", borderWidth: 2, borderColor: "transparent"
  },
  cardSelected: { borderColor: "#C81E2F", backgroundColor: "#FFF5F5" },
  cardCorrect: { borderColor: "#34C759", backgroundColor: "#F0FFF4" },
  cardWrong: { borderColor: "#FF4D4D", backgroundColor: "#FFF5F5" },
  cardFade: { opacity: 0.5 },
  imageBox: { width: "100%", height: CARD_WIDTH * 0.8, backgroundColor: "#F8F9FA" },
  cardImage: { width: "100%", height: "100%" },
  labelBox: { padding: 12, alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F3F5" },
  cardLabel: { fontWeight: "700", color: "#495057" },
  footer: { position: "absolute", bottom: 0, width: "100%", padding: 20, backgroundColor: "#FFF" },
  feedbackBanner: { padding: 15, borderRadius: 12, marginBottom: 20, alignItems: "center" },
  bannerSuccess: { backgroundColor: "#D1FAE5" },
  bannerError: { backgroundColor: "#FEE2E2" },
  feedbackText: { fontWeight: "bold", fontSize: 16 },
  mainBtn: { backgroundColor: "#C81E2F", paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  btnDisabled: { backgroundColor: "#DEE2E6" },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, letterSpacing: 1 }
});

export default ExerciseThreeScreen;
