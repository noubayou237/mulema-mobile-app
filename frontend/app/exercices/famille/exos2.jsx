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
  ActivityIndicator,
  Alert
} from "react-native";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { 
  THEME_FAMILLE_WORDS, 
  THEME_VETEMENTS_WORDS, 
  THEME_AUDIO,
  THEME_IMAGES
} from "../../data/themeData";
import { generateBlockExercises } from "../../../src/services/ExerciseApiService";
import AudioService from "../../src/services/AudioService";

const { width } = Dimensions.get("window");
const MULEMA_RED = "#C81E2F";

// Initialize audio on module load
AudioService.initializeAudio().catch(() => {});

const ExerciseTwoScreen = () => {
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [lives, setLives] = useState(params.currentLives ? parseInt(params.currentLives) : 5);
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'error'
  const [isAnswered, setIsAnswered] = useState(false);
  const [errorCount, setErrorCount] = useState(params.errorCount ? parseInt(params.errorCount) : 0);

  // Timer state
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // --- EFFECTS ---
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoadingExercises(true);
        const backendExercises = await generateBlockExercises(THEME_BLOCK_ID);
        if (backendExercises && backendExercises.length > 0) {
          const typeMatch = backendExercises.find(ex => ex.type === "LISTEN_WRITE");
          if (typeMatch && typeMatch.questions) {
            const transformed = typeMatch.questions.map((q, idx) => ({
              id: q.word?.id || `q-${idx}`,
              fr: q.word?.fr || "",
              local: q.word?.local || "",
            }));
            setExerciseQuestions(transformed);
            return;
          }
        }
        setExerciseQuestions(pool.slice(0, 5));
      } catch (error) {
        setExerciseQuestions(pool.slice(0, 5));
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

  const currentQuestion = exerciseQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exerciseQuestions.length - 1;

  // --- HANDLERS ---
  const handlePlayAudio = async () => {
    try {
      if (audioRef.current) await audioRef.current.unloadAsync();
      const audioSource = THEME_AUDIO[themeId]?.[currentQuestion.id];
      if (!audioSource) return;

      const { sound } = await Audio.Sound.createAsync(audioSource);
      audioRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Audio error:", e);
    }
  };

  const handleValidate = async () => {
    if (inputText.trim() === "") return;

    const success = inputText.trim().toLowerCase() === currentQuestion.local.toLowerCase();
    
    if (success) {
      setStatus("success");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStatus("error");
      setErrorCount(prev => prev + 1);
      setLives(prev => Math.max(0, prev - 1));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setIsAnswered(true);
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
        pathname: "/exercices/famille/exos3",
        params: {
          ...params,
          currentLives: lives,
          totalTime: (parseInt(params.totalTime) || 0) + elapsedTime,
          totalProgress: 66,
          errorCount,
          themeId
        }
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setInputText("");
      setStatus("idle");
      setIsAnswered(false);
    }
  };

  if (isLoadingExercises || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={MULEMA_RED} />
          <Text style={styles.loadingText}>Préparation de l'exercice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F8F9FA' />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.themeTitle}>{themeId === "vetements" ? "Vêtements" : "Famille"}</Text>
              <View style={styles.livesBadge}>
                <Ionicons name="heart" size={18} color={MULEMA_RED} />
                <Text style={styles.livesText}>{lives}</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / exerciseQuestions.length) * 100}%` }]} />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Instruction Card */}
            <View style={styles.instructionCard}>
              <Ionicons name="mic-outline" size={24} color={MULEMA_RED} />
              <Text style={styles.instruction}>Écoute et écris en langue locale</Text>
              <TouchableOpacity onPress={handlePlayAudio} style={styles.audioBtn}>
                <Ionicons name="volume-medium" size={60} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.hint}>Indice : "{currentQuestion.fr}"</Text>
            </View>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  status === "success" && styles.inputSuccess,
                  status === "error" && styles.inputError
                ]}
                placeholder="Tape ta réponse ici..."
                value={inputText}
                onChangeText={text => !isAnswered && setInputText(text)}
                editable={!isAnswered}
                autoCapitalize="none"
              />
            </View>

            {/* Feedback area */}
            {isAnswered && (
              <View style={[styles.feedbackBox, status === "success" ? styles.successBox : styles.errorBox]}>
                <Text style={styles.feedbackTitle}>{status === "success" ? "Super ! 🔥" : "Presque ! 🧐"}</Text>
                {status === "error" && <Text style={styles.correctText}>La réponse était : {currentQuestion.local}</Text>}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.mainBtn, inputText.trim() === "" && !isAnswered && styles.btnDisabled]}
              onPress={isAnswered ? handleNextQuestion : handleValidate}
              disabled={inputText.trim() === "" && !isAnswered}
            >
              <Text style={styles.btnText}>{isAnswered ? "CONTINUER" : "VALIDER"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontWeight: "500" },
  header: { padding: 20, backgroundColor: "#FFF", elevation: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  themeTitle: { fontSize: 22, fontWeight: "800", color: "#212529" },
  livesBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF5F5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  livesText: { marginLeft: 5, fontWeight: "bold", fontSize: 16, color: "#MULEMA_RED" },
  progressContainer: { height: 8, backgroundColor: "#E9ECEF", borderRadius: 4 },
  progressFill: { height: "100%", backgroundColor: "#C81E2F", borderRadius: 4 },
  scrollContent: { padding: 25, alignItems: "center" },
  instructionCard: { width: "100%", alignItems: "center", marginBottom: 40 },
  instruction: { fontSize: 18, fontWeight: "700", color: "#495057", marginTop: 10, textAlign: "center" },
  audioBtn: { backgroundColor: "#C81E2F", width: 120, height: 120, borderRadius: 60, justifyContent: "center", alignItems: "center", marginVertical: 30, elevation: 5 },
  hint: { color: "#ADB5BD", fontStyle: "italic", fontSize: 16 },
  inputContainer: { width: "100%" },
  input: { 
    height: 70, borderBottomWidth: 3, borderColor: "#DEE2E6", fontSize: 24, 
    fontWeight: "800", textAlign: "center", color: "#212529" 
  },
  inputSuccess: { borderColor: "#34C759", color: "#166534" },
  inputError: { borderColor: "#FF4D4D", color: "#991B1B" },
  feedbackBox: { width: "100%", marginTop: 30, padding: 20, borderRadius: 16 },
  successBox: { backgroundColor: "#D1FAE5" },
  errorBox: { backgroundColor: "#FEE2E2" },
  feedbackTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 5 },
  correctText: { fontSize: 16, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)", paddingTop: 10 },
  footer: { padding: 20, backgroundColor: "#FFF" },
  mainBtn: { backgroundColor: "#C81E2F", paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  btnDisabled: { backgroundColor: "#DEE2E6" },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, letterSpacing: 1 }
});

export default ExerciseTwoScreen;
