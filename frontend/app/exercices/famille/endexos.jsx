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
  ScrollView,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SmartRepetition from "../../components/SmartRepetition";
import useFailedExercises from "../../hooks/useFailedExercises";
import { getScoringBreakdown } from "../../../src/utils/scoring";
import { THEME_FAMILLE_WORDS, THEME_VETEMENTS_WORDS } from "../../data/themeData";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const EndScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const themeId = params.themeId || "famille";
  const pool = themeId === "vetements" ? THEME_VETEMENTS_WORDS : THEME_FAMILLE_WORDS;

  const [showRepetition, setShowRepetition] = useState(false);
  const { clearFailedExercises } = useFailedExercises();

  const totalTime = parseInt(params?.totalTime) || 0;
  const errorCount = parseInt(params?.errorCount) || 0;
  const lives = parseInt(params?.currentLives) || 5;
  const completedExercises = parseInt(params?.completedExercises) || 0;
  const totalExercises = parseInt(params?.totalExercises) || 3;

  const heartsLost = 5 - lives;
  const scoring = getScoringBreakdown(heartsLost, totalTime);
  const isPassed = scoring.accuracy >= 60;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRestart = () => {
    router.replace(`/exercices/${themeId}/exos1`);
  };

  const handleNext = async () => {
    if (!isPassed) {
      Alert.alert(
        "Presque !",
        "Tu as besoin d'au moins 60% de précision pour débloquer la suite. Réessaie !",
        [{ text: "D'accord", onPress: handleRestart }]
      );
      return;
    }

    try {
      // Local unlock fallback
      await AsyncStorage.setItem(`${themeId}_completed`, "true");
      // Nav back to exercises list
      router.dismissAll();
      router.replace("/exercices");
    } catch (e) {
      console.error("Unlock error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#C81E2F" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Trophy Section */}
        <View style={styles.topSection}>
          <View style={styles.medalCircle}>
            <Ionicons name={isPassed ? "trophy" : "refresh-circle"} size={80} color="#FFD700" />
          </View>
          <Text style={styles.congratsText}>
            {isPassed ? "Bravo !" : "Continue tes efforts !"}
          </Text>
          <Text style={styles.themeTitle}>{themeId === "vetements" ? "Vêtements" : "Famille"}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{scoring.xp} XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PRÉCISION</Text>
              <Text style={[styles.statValue, !isPassed && { color: "#FFD700" }]}>
                {scoring.accuracy}%
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Ionicons name="time-outline" size={20} color="#FFF" />
              <Text style={styles.detailText}>{formatTime(totalTime)}</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.detailText}>{errorCount} erreurs</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="heart-outline" size={20} color="#FFF" />
              <Text style={styles.detailText}>-{heartsLost} cœurs</Text>
            </View>
          </View>

          {/* Feedback message */}
          <Text style={styles.description}>
            {isPassed 
              ? "Tu as brillamment réussi ce bloc ! La suite de ton aventure est désormais accessible."
              : "Tu y es presque ! Recommence pour atteindre les 60% et débloquer les prochaines leçons."}
          </Text>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleRestart}>
              <Text style={styles.secondaryBtnText}>RECOMMENCER</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryBtn, !isPassed && styles.btnLocked]} 
              onPress={handleNext}
            >
              <Text style={styles.primaryBtnText}>
                {isPassed ? "CONTINUER" : "BLOQUÉ"}
              </Text>
              {!isPassed && <Ionicons name="lock-closed" size={16} color="#C81E2F" style={{marginLeft:5}} />}
            </TouchableOpacity>
          </View>

          {/* Smart Repetition */}
          <TouchableOpacity 
            style={styles.reviewBtn} 
            onPress={() => setShowRepetition(true)}
          >
            <Ionicons name="repeat" size={18} color="#FFF" />
            <Text style={styles.reviewBtnText}>RÉVISION RAPIDE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Revision Modal */}
      <Modal visible={showRepetition} animationType="slide">
        <SafeAreaView style={{flex:1}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Révision</Text>
            <TouchableOpacity onPress={() => setShowRepetition(false)}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
          <SmartRepetition words={pool} onComplete={() => setShowRepetition(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#C81E2F" },
  container: { padding: 25, alignItems: "center", paddingTop: 50 },
  topSection: { alignItems: "center", marginBottom: 30 },
  medalCircle: { 
    width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center", marginBottom: 20
  },
  congratsText: { color: "#FFF", fontSize: 32, fontWeight: "800", letterSpacing: 1 },
  themeTitle: { color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: "600", marginTop: 5 },
  statsCard: { 
    width: "100%", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 30, padding: 25,
    alignItems: "center"
  },
  statRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginVertical: 10 },
  statItem: { alignItems: "center" },
  statLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "bold", marginBottom: 5 },
  statValue: { color: "#FFF", fontSize: 28, fontWeight: "800" },
  divider: { height: 1, width: "100%", backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 20 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 25 },
  detail: { flexDirection: "row", alignItems: "center" },
  detailText: { color: "#FFF", marginLeft: 6, fontWeight: "600", fontSize: 14 },
  description: { textAlign: "center", color: "#FFF", lineHeight: 22, marginBottom: 30, opacity: 0.9 },
  btnRow: { flexDirection: "row", gap: 15, width: "100%", marginBottom: 15 },
  primaryBtn: { 
    flex: 2, backgroundColor: "#FFF", paddingVertical: 18, borderRadius: 18, 
    flexDirection: "row", justifyContent: "center", alignItems: "center" 
  },
  btnLocked: { opacity: 0.5 },
  primaryBtnText: { color: "#C81E2F", fontWeight: "bold", fontSize: 16 },
  secondaryBtn: { flex: 1, borderWidth: 2, borderColor: "#FFF", borderRadius: 18, justifyContent: "center", alignItems: "center" },
  secondaryBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  reviewBtn: { 
    flexDirection: "row", alignItems: "center", marginTop: 10, paddingVertical: 10, 
    paddingHorizontal: 20, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" 
  },
  reviewBtnText: { color: "#FFF", marginLeft: 8, fontWeight: "bold", fontSize: 12 },
  modalHeader: { backgroundColor: "#C81E2F", padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" }
});

export default EndScreen;
