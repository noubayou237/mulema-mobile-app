/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Exercises Service                                   ║
 * ║  Appels API pour générer et soumettre les exercices           ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { exercisesService } from "@/services/exercises.service";
 *
 *  Note backend :
 *    L'endpoint de génération est /exercises/theme/:themeId/generate
 *    avec un paramètre query `type` pour choisir E1, E2 ou E3.
 */

import api from "./api";

export const exercisesService = {
  /**
   * Génère un exercice E1 (Correspondance) pour un thème
   * GET /exercises/theme/:themeId/generate?type=E1
   * @param {string} themeId
   * @returns ExerciseE1Data
   */
  generateE1: async (themeId) => {
    const { data } = await api.get(`/exercises/theme/${themeId}/generate`, {
      params: { type: "E1" },
    });
    return data;
  },

  /**
   * Génère un exercice E2 (Écriture) pour un thème
   * GET /exercises/theme/:themeId/generate?type=E2
   * @param {string} themeId
   * @returns ExerciseE2Data
   */
  generateE2: async (themeId) => {
    const { data } = await api.get(`/exercises/theme/${themeId}/generate`, {
      params: { type: "E2" },
    });
    return data;
  },

  /**
   * Génère un exercice E3 (Sélection image) pour un thème
   * GET /exercises/theme/:themeId/generate?type=E3
   * @param {string} themeId
   * @returns ExerciseE3Data
   */
  generateE3: async (themeId) => {
    const { data } = await api.get(`/exercises/theme/${themeId}/generate`, {
      params: { type: "E3" },
    });
    return data;
  },

  /**
   * Soumet les réponses d'un exercice
   * POST /exercises/word-progress
   * @param {object} payload
   * @returns ExerciseResult
   */
  submit: async (payload) => {
    const { data } = await api.post("/exercises/word-progress", payload);
    return data;
  },
};

export default exercisesService;
