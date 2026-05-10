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
    const { data: lessons } = await api.get(`/levels/${themeId}/words`);
    
    // The backend now returns virtual lessons (categories) directly.
    return lessons.map((lesson) => ({
      ...lesson,
      subtitle: `${lesson.words?.length || 0} mots`,
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
