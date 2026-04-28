import Logger from "../utils/logger";
import { create } from "zustand";
import { themesService } from "../services/themes.service";
import api, { isSessionActive } from "../services/api";
import { getFriendlyErrorMessage, isNetworkError } from "../utils/errorUtils";

export const useThemeStore = create((set, get) => ({
  // ── State ──
  themes: [],                // Theme[] — thèmes de la langue active
  isLoading: false,
  error: null,

  // Leçon en cours (quand l'utilisateur navigue dans un thème)
  currentThemeId: null,      // string | null
  lessons: [],               // Lesson[] — leçons du thème sélectionné
  lessonsLoading: false,

  // Mots de la leçon en cours
  currentLessonId: null,     // string | null
  words: [],                 // Word[] — mots de la leçon sélectionnée
  wordsLoading: false,

  // ═════════════════════════════════════════════════════════════
  // fetchThemes — Charge les thèmes d'une langue
  // Appelé quand activeLanguage change
  // ═════════════════════════════════════════════════════════════

  fetchThemes: async (languageId) => {
    if (!languageId || !isSessionActive()) return [];
    const hasCache = get().themes.length > 0;
    set({ isLoading: !hasCache });
    try {
      const themes = await themesService.getByLanguage(languageId);
      set({ themes, isLoading: false, error: null });
      return themes;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      set({ isLoading: false, error: msg });
      
      const isNetErr = isNetworkError(error);
      if (error?.response?.status !== 401 && !isNetErr && isSessionActive()) {
        Logger.error("[ThemeStore] fetchThemes error:", msg);
      } else if (isNetErr) {
        Logger.warn("[ThemeStore] fetchThemes network error:", msg);
      }
      return [];
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchLessons — Charge les leçons d'un thème
  // Appelé quand l'utilisateur entre dans un thème
  // ═════════════════════════════════════════════════════════════

  fetchLessons: async (themeId) => {
    if (!themeId || !isSessionActive()) return [];
    const { currentThemeId, lessons: cached } = get();
    const hasCache = currentThemeId === themeId && cached.length > 0;
    set({ currentThemeId: themeId, lessonsLoading: !hasCache });
    try {
      const lessons = await themesService.getLessons(themeId);
      set({ lessons, lessonsLoading: false });
      return lessons;
    } catch (error) {
      set({ lessonsLoading: false });
      const isNetErr = isNetworkError(error);
      if (error?.response?.status !== 401 && !isNetErr) {
        Logger.error("[ThemeStore] fetchLessons error:", error);
      } else if (isNetErr) {
        Logger.warn("[ThemeStore] fetchLessons network error:", error.message);
      }
      return [];
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchWords — Charge les mots d'une leçon
  // Appelé quand l'utilisateur entre dans une leçon
  // ═════════════════════════════════════════════════════════════

  fetchWords: async (lessonId) => {
    if (!lessonId || !isSessionActive()) return [];
    set({ currentLessonId: lessonId, wordsLoading: true });
    try {
      const words = await themesService.getWords(lessonId);
      set({ words, wordsLoading: false });
      return words;
    } catch (error) {
      set({ wordsLoading: false });
      const isNetErr = isNetworkError(error);
      if (error?.response?.status !== 401 && !isNetErr) {
        Logger.error("[ThemeStore] fetchWords error:", error);
      } else if (isNetErr) {
        Logger.warn("[ThemeStore] fetchWords network error:", error.message);
      }
      return [];
    }
  },

  // ═════════════════════════════════════════════════════════════
  // getThemeById — Raccourci pour trouver un thème par ID
  // ═════════════════════════════════════════════════════════════

  getThemeById: (themeId) => {
    return get().themes.find((t) => t.id === themeId) || null;
  },

  // ═════════════════════════════════════════════════════════════
  // isThemeLocked — Vérifie si un thème est verrouillé
  // Un thème est débloqué si :
  //   - C'est le premier thème (order === 0), OU
  //   - Le thème précédent a E3 completed
  // ═════════════════════════════════════════════════════════════

  isThemeLocked: (themeId) => {
    const { themes } = get();
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return true;

    // Premier thème = toujours débloqué
    if (theme.order === 0) return false;

    // Vérifier le backend (le champ locked est injecté par le serveur)
    if (theme.locked !== undefined) return theme.locked;

    // Fallback : vérifier le thème précédent
    const prevTheme = themes.find((t) => t.order === theme.order - 1);
    if (!prevTheme) return false;

    return !prevTheme.e3Completed;
  },

  // ═════════════════════════════════════════════════════════════
  // getExerciseAccess — Vérifie quel exercice est accessible
  // Retourne : { e1: bool, e2: bool, e3: bool }
  // ═════════════════════════════════════════════════════════════

  getExerciseAccess: (themeId) => {
    const { lessons } = get();

    const lessonsCompletedCount = lessons.reduce((acc, l) => {
      const prog = l.userProgress?.[0];
      return acc + (prog?.isCompleted ? 1 : 0);
    }, 0);

    // Exercise unlocks progressively: available once the auto-unlocked lessons (first 2) are done.
    // Each pass of the exercise unlocks the next lesson until all are complete.
    const enoughLessonsCompleted = lessons.length > 0 && lessonsCompletedCount >= 2;

    return {
      e1: enoughLessonsCompleted,
      e2: enoughLessonsCompleted,
      e3: enoughLessonsCompleted,
    };
  },

  // ═════════════════════════════════════════════════════════════
  // isLessonLocked — Vérifie si une leçon est verrouillée
  // Directive : 2 premières leçons débloquées, le reste via exercices
  // ═════════════════════════════════════════════════════════════

  isLessonLocked: (lessonId, order) => {
    // Les 2 premières leçons (order 0 et 1) sont toujours débloquées
    if (order < 2) return false;

    const { lessons } = get();
    const lesson = lessons.find((l) => l.id === lessonId);
    
    // Progrès depuis la DB : l'include Prisma renvoie un tableau
    const prog = lesson?.userProgress?.[0];

    // Si débloqué explicitement dans la DB
    if (prog?.isUnlocked) return false;

    return true;
  },

  // ═════════════════════════════════════════════════════════════
  // clearLesson — Reset quand on quitte une leçon
  // ═════════════════════════════════════════════════════════════

  clearLesson: () => {
    set({ currentLessonId: null, words: [] });
  },

  // ═════════════════════════════════════════════════════════════
  // clearTheme — Reset quand on quitte un thème
  // ═════════════════════════════════════════════════════════════

  clearTheme: () => {
    set({
      currentThemeId: null,
      lessons: [],
      currentLessonId: null,
      words: [],
    });
  },

  // ═════════════════════════════════════════════════════════════
  // completeTheme — Marque un thème comme terminé (exercice final réussi)
  // Le thème suivant ne débloque qu'après que la vidéo est regardée.
  // ═════════════════════════════════════════════════════════════

  completeTheme: (themeId, score) => {
    const { themes } = get();
    const idx = themes.findIndex((t) => t.id === themeId);
    if (idx === -1) return;

    const updated = [...themes];
    updated[idx] = { ...updated[idx], e3Completed: score >= 60 };
    // Do NOT unlock next theme here — video watching is required first.
    set({ themes: updated });
  },

  // ═════════════════════════════════════════════════════════════
  // watchVideo — Marque la vidéo story comme regardée, puis
  //              débloque le thème suivant localement + en base.
  // ═════════════════════════════════════════════════════════════

  watchVideo: async (themeId) => {
    try {
      await api.post(`/progress/video-watched/${themeId}`);
    } catch (err) {
      Logger.warn("[ThemeStore] watchVideo error:", err?.message);
    }
    const { themes } = get();
    const idx = themes.findIndex((t) => t.id === themeId);
    if (idx === -1) return;

    const updated = [...themes];
    updated[idx] = { ...updated[idx], videoWatched: true };
    if (idx + 1 < updated.length) {
      updated[idx + 1] = { ...updated[idx + 1], locked: false };
    }
    set({ themes: updated });
  },

  // ═════════════════════════════════════════════════════════════
  // reset — Nettoie tout (appelé par logout ou changement de langue)
  // ═════════════════════════════════════════════════════════════

  reset: () => {
    set({
      themes: [],
      isLoading: false,
      currentThemeId: null,
      lessons: [],
      lessonsLoading: false,
      currentLessonId: null,
      words: [],
      wordsLoading: false,
    });
  },
}));

export default useThemeStore;