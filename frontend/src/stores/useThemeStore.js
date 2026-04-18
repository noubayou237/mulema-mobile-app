/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — useThemeStore (Zustand)                             ║
 * ║  Thèmes de la langue active + leçons + mots                  ║
 * ║  Se recharge quand activeLanguage change                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { useThemeStore } from "@/stores/useThemeStore";
 *
 *    // Dans un écran, recharger quand la langue change :
 *    const { activeLanguage } = useLanguageStore();
 *    const { themes, fetchThemes } = useThemeStore();
 *
 *    useEffect(() => {
 *      if (activeLanguage) fetchThemes(activeLanguage.id);
 *    }, [activeLanguage?.id]);
 */

import { create } from "zustand";
import { themesService } from "../services/themes.service";

export const useThemeStore = create((set, get) => ({
  // ── State ──
  themes: [],                // Theme[] — thèmes de la langue active
  isLoading: false,

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
    if (!languageId) return;
    set({ isLoading: true });
    try {
      const themes = await themesService.getByLanguage(languageId);
      set({ themes, isLoading: false });
      return themes;
    } catch (error) {
      console.error("[ThemeStore] fetchThemes error:", error);
      set({ isLoading: false });
      return [];
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchLessons — Charge les leçons d'un thème
  // Appelé quand l'utilisateur entre dans un thème
  // ═════════════════════════════════════════════════════════════

  fetchLessons: async (themeId) => {
    if (!themeId) return;
    set({ currentThemeId: themeId, lessonsLoading: true });
    try {
      const lessons = await themesService.getLessons(themeId);
      set({ lessons, lessonsLoading: false });
      return lessons;
    } catch (error) {
      console.error("[ThemeStore] fetchLessons error:", error);
      set({ lessonsLoading: false });
      return [];
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchWords — Charge les mots d'une leçon
  // Appelé quand l'utilisateur entre dans une leçon
  // ═════════════════════════════════════════════════════════════

  fetchWords: async (lessonId) => {
    if (!lessonId) return;
    set({ currentLessonId: lessonId, wordsLoading: true });
    try {
      const words = await themesService.getWords(lessonId);
      set({ words, wordsLoading: false });
      return words;
    } catch (error) {
      console.error("[ThemeStore] fetchWords error:", error);
      set({ wordsLoading: false });
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
    
    // Directive: Exercises available after 2 lessons are completed
    // We count how many lessons have isCompleted: true in their userProgress array
    const lessonsCompletedCount = lessons.reduce((acc, l) => {
      const prog = l.userProgress?.[0];
      return acc + (prog?.isCompleted ? 1 : 0);
    }, 0);

    const enoughLessonsCompleted = lessonsCompletedCount >= 2;

    return {
      e1: enoughLessonsCompleted,
      e2: enoughLessonsCompleted && false, // Placeholder for levels E2/E3 if needed
      e3: enoughLessonsCompleted && false,
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

    // Fallback : Les 2 premières leçons (order 0 et 1) sont toujours débloquées par défaut
    if (order < 2) return false;

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
  // completeTheme — Marque un thème comme terminé + débloque le suivant
  // Appelé depuis la page résultats quand score >= 60
  // ═════════════════════════════════════════════════════════════

  completeTheme: (themeId, score) => {
    const { themes } = get();
    const idx = themes.findIndex((t) => t.id === themeId);
    if (idx === -1) return;

    const updated = [...themes];
    updated[idx] = { ...updated[idx], e3Completed: score >= 60, locked: false };

    // Débloquer le thème suivant si score suffisant
    if (score >= 60 && idx + 1 < updated.length) {
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