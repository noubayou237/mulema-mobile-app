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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useCowrie from "../../hooks/useCowrie";
import { 
  THEME_FAMILLE_WORDS, 
  THEME_VETEMENTS_WORDS, 
  THEME_AUDIO 
} from "../../data/themeData";
import { generateBlockExercises } from "../../../src/services/ExerciseApiService";
import AudioService from "../../src/services/AudioService";

// Initialize audio on module load
AudioService.initializeAudio().catch(() => { });

const { width } = Dimensions.get("window");

const ExerciseScreen = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "fr";
  const params = useLocalSearchParams();
  const router = useRouter();

  // Theme management
  const themeId = params.themeId || "famille";
  const pool = themeId === "vetements" ? THEME_VETEMENTS_WORDS : THEME_FAMILLE_WORDS;
  const THEME_BLOCK_ID = themeId === "vetements" ? "block-vetements-001" : "block-famille-001";
  const MULEMA_RED = "#C81E2F";

  // --- STATE ---
  const [exercisesData, setExercisesData] = useState([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseError, setExerciseError] = useState(null);
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [shuffledLeftColumn, setShuffledLeftColumn] = useState([]);
  const [shuffledRightColumn, setShuffledRightColumn] = useState([]);

  // Timer state
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Cowrie lives
  const { cowries, setCowries, canPlay, isRecharging, formatRechargeTime } = useCowrie(5);

  // --- EFFECTS ---
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoadingExercises(true);
        const backendExercises = await generateBlockExercises(THEME_BLOCK_ID);
        
        if (backendExercises && backendExercises.length > 0) {
          const matchingExercise = backendExercises.find(ex => ex.type === "MATCHING");
          if (matchingExercise && matchingExercise.questions?.[0]) {
            const pairs = matchingExercise.questions[0].pairs.map(p => ({
              id: p.id || p.word?.id,
              fr: p.fr || p.word?.fr,
              local: p.local || p.word?.local
            }));
            initializeColumns(pairs);
            setIsLoadingExercises(false);
            return;
          }
        }
        // Fallback to static
        initializeColumns(pool.slice(0, 5));
      } catch (error) {
        console.log("⚠️ Fallback to static:", error.message);
        initializeColumns(pool.slice(0, 5));
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

  const initializeColumns = (pairs) => {
    const left = pairs.map(p => ({ id: p.id, text: p.fr, side: "left" }));
    const right = [...pairs].sort(() => Math.random() - 0.5).map(p => ({ id: p.id, text: p.local, side: "right" }));
    setShuffledLeftColumn(left);
    setShuffledRightColumn(right);
  };

  // --- HANDLERS ---
  const handlePlayAudio = async (wordId) => {
    try {
      if (audioRef.current) await audioRef.current.unloadAsync();
      const audioSource = THEME_AUDIO[themeId]?.[wordId];
      if (!audioSource) return;

      const { sound } = await Audio.Sound.createAsync(audioSource);
      audioRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Audio error:", e);
    }
  };

  const handlePress = (item, side) => {
    if (matchedPairs.includes(item.id) || errorIds.length > 0) return;

    if (side === "left") {
      setSelectedLeft(item.id);
      if (selectedRight) checkMatch(item.id, selectedRight);
    } else {
      setSelectedRight(item.id);
      if (selectedLeft) checkMatch(selectedLeft, item.id);
    }
  };

  const checkMatch = async (leftId, rightId) => {
    if (leftId === rightId) {
      const newMatched = [...matchedPairs, leftId];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (newMatched.length === shuffledLeftColumn.length) setIsCompleted(true);
    } else {
      setErrorCount(prev => prev + 1);
      setCowries(prev => Math.max(0, prev - 1));
      setErrorIds([leftId, rightId]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setErrorIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  const handleNextExercise = () => {
    router.push({
      pathname: "/exercices/famille/exos2",
      params: {
        ...params,
        currentLives: cowries,
        totalTime: (parseInt(params.totalTime) || 0) + elapsedTime,
        totalProgress: 33,
        errorCount,
        themeId
      }
    });
  };

  if (isLoadingExercises) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={MULEMA_RED} />
          <Text style={styles.loadingText}>Préparation du puzzle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='#F8F9FA' />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.themeTitle}>{themeId === "vetements" ? "Vêtements" : "Famille"}</Text>
          <View style={styles.statsRow}>
            <View style={styles.livesBadge}>
              <Ionicons name="heart" size={18} color={MULEMA_RED} />
              <Text style={styles.livesText}>{cowries}</Text>
            </View>
            <Text style={styles.timerText}>🕒 {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${(matchedPairs.length / shuffledLeftColumn.length) * 100}%` }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Instruction */}
          <Text style={styles.instruction}>Associe chaque mot avec sa bonne traduction !</Text>

          <View style={styles.gameContainer}>
            {/* Left Column (French) */}
            <View style={styles.column}>
              {shuffledLeftColumn.map((item) => {
                const isSelected = selectedLeft === item.id;
                const isMatched = matchedPairs.includes(item.id);
                const isError = errorIds.includes(item.id) && isSelected;

                return (
                  <TouchableOpacity
                    key={"L"+item.id}
                    style={[
                      styles.wordCard,
                      isSelected && styles.cardSelected,
                      isMatched && styles.cardMatched,
                      isError && styles.cardError
                    ]}
                    onPress={() => handlePress(item, "left")}
                    disabled={isMatched}
                  >
                    <Text style={[styles.wordText, isMatched && styles.textMatched]}>{item.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Right Column (Local) */}
            <View style={styles.column}>
              {shuffledRightColumn.map((item) => {
                const isSelected = selectedRight === item.id;
                const isMatched = matchedPairs.includes(item.id);
                const isError = errorIds.includes(item.id) && isSelected;

                return (
                  <TouchableOpacity
                    key={"R"+item.id}
                    style={[
                      styles.wordCard,
                      isSelected && styles.cardSelected,
                      isMatched && styles.cardMatched,
                      isError && styles.cardError
                    ]}
                    onPress={() => handlePress(item, "right")}
                    disabled={isMatched}
                  >
                    <Text style={[styles.wordText, isMatched && styles.textMatched]}>{item.text}</Text>
                    {!isMatched && (
                      <TouchableOpacity onPress={() => handlePlayAudio(item.id)} style={styles.miniVolume}>
                        <Ionicons name="volume-medium" size={16} color={isSelected ? MULEMA_RED : "#6C757D"} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainBtn, !isCompleted && styles.btnDisabled]}
            disabled={!isCompleted}
            onPress={handleNextExercise}
          >
            <Text style={styles.btnText}>CONTINUER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontWeight: "500" },
  header: { padding: 20, backgroundColor: "#FFF", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  themeTitle: { fontSize: 24, fontWeight: "800", color: "#212529", marginBottom: 5 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  livesBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF5F5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  livesText: { marginLeft: 5, fontWeight: "bold", fontSize: 16, color: "#C81E2F" },
  timerText: { color: "#6C757D", fontWeight: "600" },
  progressContainer: { height: 8, backgroundColor: "#E9ECEF", borderRadius: 4 },
  progressFill: { height: "100%", backgroundColor: "#C81E2F", borderRadius: 4 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  instruction: { textAlign: "center", fontSize: 16, color: "#495057", fontWeight: "600", marginBottom: 30 },
  gameContainer: { flexDirection: "row", justifyContent: "space-between" },
  column: { width: "47%" },
  wordCard: { 
    backgroundColor: "#FFF", paddingVertical: 20, paddingHorizontal: 15, borderRadius: 16, 
    marginBottom: 15, alignItems: "center", justifyContent: "center", elevation: 2,
    borderWidth: 2, borderColor: "transparent"
  },
  cardSelected: { borderColor: "#C81E2F", backgroundColor: "#FFF5F5" },
  cardMatched: { backgroundColor: "#D1FAE5", borderColor: "#34C759" },
  cardError: { backgroundColor: "#FEE2E2", borderColor: "#FF4D4D" },
  wordText: { fontSize: 15, fontWeight: "700", color: "#212529", textAlign: "center" },
  textMatched: { color: "#065F46" },
  miniVolume: { position: "absolute", bottom: 5, right: 10 },
  footer: { position: "absolute", bottom: 0, width: "100%", padding: 20, backgroundColor: "#FFF" },
  mainBtn: { backgroundColor: "#C81E2F", paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  btnDisabled: { backgroundColor: "#DEE2E6" },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16, letterSpacing: 1 }
});

export default ExerciseScreen;
