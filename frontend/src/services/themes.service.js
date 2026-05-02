/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Themes Service                                      ║
 * ║  Appels API liés aux thèmes (levels), leçons et mots         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { themesService } from "@/services/themes.service";
 *
 *  Note backend :
 *    Les "thèmes" côté frontend correspondent aux "levels" côté backend.
 *    Les routes sont donc /levels/... et /lessons/level/...
 */

import api from "./api";

export const themesService = {
  /**
   * Récupère tous les thèmes (levels) d'une langue
   * GET /levels/language/:languageId
   * @param {string} languageId
   * @returns Theme[]
   */
  getByLanguage: async (languageId) => {
    const { data } = await api.get(`/levels/themes/language/${languageId}`);
    return data;
  },

  /**
   * Récupère les leçons d'un thème (level)
   * GET /lessons/level/:themeId
   * @param {string} themeId — correspond au levelId côté backend
   * @returns Lesson[]
   */
  getLessons: async (themeId) => {
    const { data } = await api.get(`/levels/${themeId}/words`);
    // Map words to lesson format expected by [themeId]/index.jsx
    return data.map((w, idx) => ({
      id: w.id,
      order: w.order,
      title: w.word_fr,
      subtitle: w.word_local,
      hint: w.hint,
      audioUrl: w.audio_url,
      imageUrl: w.image_url,
      userProgress: w.userProgress || [],
      hasSubWords: false, // In the new system, each word is a self-contained lesson
    }));
  },

  /**
   * Récupère les mots d'une leçon
   * GET /lessons/:lessonId/words
   * @param {string} lessonId
   * @returns Word[]
   */
  getWords: async (lessonId) => {
    const { data } = await api.get(`/lessons/${lessonId}/words`);
    return data;
  },
};

export default themesService;
