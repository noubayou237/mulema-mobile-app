/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — useExerciseStore (Zustand)                          ║
 * ║  Gère la session d'exercice en cours :                        ║
 * ║    - Chargement (E1, E2 ou E3)                                ║
 * ║    - Réponses de l'utilisateur                                ║
 * ║    - Timer                                                     ║
 * ║    - Soumission et résultat                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { useExerciseStore } from "@/stores/useExerciseStore";
 *
 *    const { exerciseData, loadExercise, submitAnswer, finishExercise } = useExerciseStore();
 */

import { create } from "zustand";
import { exercisesService } from "../services/exercises.service";

export const useExerciseStore = create((set, get) => ({
  // ── State ──
  themeId: null,              // string | null — thème de l'exercice
  exerciseType: null,         // "E1" | "E2" | "E3" | null
  exerciseData: null,         // ExerciseE1Data | E2Data | E3Data | null
  isLoading: false,

  // Progression dans l'exercice
  currentIndex: 0,            // index de la question en cours (E2, E3)
  answers: {},                // { [wordId]: userAnswer }
  score: 0,                   // score local calculé au fur et à mesure
  startTime: null,            // timestamp de début

  // Résultat final (après soumission)
  result: null,               // ExerciseResult | null

  // ═════════════════════════════════════════════════════════════
  // loadExercise — Charge un exercice depuis le backend
  // ═════════════════════════════════════════════════════════════

  loadExercise: async (themeId, type) => {
    set({
      isLoading: true,
      themeId,
      exerciseType: type,
      exerciseData: null,
      currentIndex: 0,
      answers: {},
      score: 0,
      startTime: Date.now(),
      result: null,
    });

    try {
      let data;
      switch (type) {
        case "E1":
          data = await exercisesService.generateE1(themeId);
          break;
        case "E2":
          data = await exercisesService.generateE2(themeId);
          break;
        case "E3":
          data = await exercisesService.generateE3(themeId);
          break;
        default:
          throw new Error(`Unknown exercise type: ${type}`);
      }

      set({ exerciseData: data, isLoading: false });
      return data;
    } catch (error) {
      console.error("[ExerciseStore] loadExercise error:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // ═════════════════════════════════════════════════════════════
  // submitAnswer — Enregistre une réponse localement
  // Appelé après chaque question (E2, E3) ou à la fin (E1)
  // ═════════════════════════════════════════════════════════════

  submitAnswer: (wordId, answer, isCorrect) => {
    const { answers, score, currentIndex } = get();

    set({
      answers: { ...answers, [wordId]: answer },
      score: isCorrect ? score + 1 : score,
      currentIndex: currentIndex + 1,
    });
  },

  // ═════════════════════════════════════════════════════════════
  // submitAllAnswers — Pour E1 (correspondance)
  // Toutes les paires sont soumises d'un coup
  // ═════════════════════════════════════════════════════════════

  submitAllAnswers: (answersMap, correctCount) => {
    set({
      answers: answersMap,
      score: correctCount,
    });
  },

  // ═════════════════════════════════════════════════════════════
  // finishExercise — Soumet au backend et récupère le résultat
  // ═════════════════════════════════════════════════════════════

  finishExercise: async () => {
    const { themeId, exerciseType, answers, startTime } = get();

    if (!themeId || !exerciseType) {
      throw new Error("No exercise in progress");
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      const result = await exercisesService.submit({
        themeId,
        exerciseType,
        answers,
        durationSeconds,
      });

      set({ result });
      return result;
    } catch (error) {
      console.error("[ExerciseStore] finishExercise error:", error);
      throw error;
    }
  },

  // ═════════════════════════════════════════════════════════════
  // Helpers
  // ═════════════════════════════════════════════════════════════

  /** Durée écoulée en secondes */
  getElapsedSeconds: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Math.round((Date.now() - startTime) / 1000);
  },

  /** Nombre total de questions */
  getTotalQuestions: () => {
    const { exerciseData, exerciseType } = get();
    if (!exerciseData) return 0;

    switch (exerciseType) {
      case "E1":
        return exerciseData.pairs?.length || 0;
      case "E2":
        return exerciseData.words?.length || 0;
      case "E3":
        return exerciseData.questions?.length || 0;
      default:
        return 0;
    }
  },

  /** Est-ce que l'exercice est terminé (toutes les questions répondues) ? */
  isComplete: () => {
    const { currentIndex } = get();
    const total = get().getTotalQuestions();
    return total > 0 && currentIndex >= total;
  },

  // ═════════════════════════════════════════════════════════════
  // reset — Nettoie tout quand on quitte un exercice
  // ═════════════════════════════════════════════════════════════

  reset: () => {
    set({
      themeId: null,
      exerciseType: null,
      exerciseData: null,
      isLoading: false,
      currentIndex: 0,
      answers: {},
      score: 0,
      startTime: null,
      result: null,
    });
  },
}));

export default useExerciseStore;