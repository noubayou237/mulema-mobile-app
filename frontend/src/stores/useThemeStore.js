"use no memo";
import Logger from "../utils/logger";
import { create } from "zustand";
import { themesService } from "../services/themes.service";
import api, { isSessionActive } from "../services/api";
import { getFriendlyErrorMessage, isNetworkError } from "../utils/errorUtils";

// Cache settings
const STALE_TIME = 300_000; // 5 minutes — keeps data fresh for an entire session
const inflightRequests = new Map();
const lastFetchTime = new Map();

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

  // Cache pour les mots (pour éviter de re-fetcher en boucle)
  wordsCache: {},            // { [lessonId]: Word[] }

  // ═════════════════════════════════════════════════════════════
  // fetchThemes — Charge les thèmes d'une langue
  // ═════════════════════════════════════════════════════════════

  fetchThemes: async (languageId, force = false) => {
    if (!languageId || !isSessionActive()) return [];

    // 1. De-duplication: Return existing promise if already fetching this lang
    const reqKey = `themes_${languageId}`;
    if (!force && inflightRequests.has(reqKey)) return inflightRequests.get(reqKey);

    // 2. Cache Logic: If data is fresh, don't fetch
    const now = Date.now();
    const lastFetch = lastFetchTime.get(reqKey) || 0;
    if (!force && get().themes.length > 0 && (now - lastFetch < STALE_TIME)) {
      return get().themes;
    }

    const hasCache = get().themes.length > 0;
    set({ isLoading: !hasCache });

    const fetchPromise = (async () => {
      try {
        const themes = await themesService.getByLanguage(languageId);
        set({ themes, isLoading: false, error: null });
        lastFetchTime.set(reqKey, Date.now());
        return themes;
      } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        set({ isLoading: false, error: msg });
        
        if (error?.response?.status !== 401 && !isNetworkError(error)) {
          Logger.error("[ThemeStore] fetchThemes error:", msg);
        }
        return [];
      } finally {
        inflightRequests.delete(reqKey);
      }
    })();

    inflightRequests.set(reqKey, fetchPromise);
    return fetchPromise;
  },

  // ═════════════════════════════════════════════════════════════
  // fetchLessons — Charge les leçons d'un thème
  // ═════════════════════════════════════════════════════════════

  fetchLessons: async (themeId, force = false) => {
    if (!themeId || !isSessionActive()) return [];

    const reqKey = `lessons_${themeId}`;
    if (!force && inflightRequests.has(reqKey)) return inflightRequests.get(reqKey);

    const now = Date.now();
    const lastFetch = lastFetchTime.get(reqKey) || 0;
    const state = get();
    const currentThemeId = state.currentThemeId;
    const cached = state.lessons || [];
    
    // Skip network for virtual themes (already injected in store)
    if (themeId?.toString().startsWith("virtual_")) {
      if (!force && currentThemeId === themeId && cached.length > 0) {
        return cached;
      }
      // If we somehow lost the virtual data, we can't fetch it from API
      set({ lessonsLoading: false });
      return cached; 
    }

    if (!force && currentThemeId === themeId && cached.length > 0 && (now - lastFetch < STALE_TIME)) {
      return cached;
    }

    const hasCache = currentThemeId === themeId && cached.length > 0;
    set({ currentThemeId: themeId, lessonsLoading: !hasCache });

    const fetchPromise = (async () => {
      try {
        const lessons = await themesService.getLessons(themeId);
        set({ lessons, lessonsLoading: false });
        lastFetchTime.set(reqKey, Date.now());

        // Prefetch words for unlocked lessons to make entry instant
        const unlockedIds = lessons
          .filter(l => !get().isLessonLocked(l.id, l.order))
          .map(l => l.id);
        
        if (unlockedIds.length > 0) {
          // Fire and forget prefetch
          get().prefetchWords(unlockedIds);
        }

        return lessons;
      } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        set({ lessonsLoading: false, error: msg });
        if (error?.response?.status !== 401 && !isNetworkError(error)) {
          Logger.error("[ThemeStore] fetchLessons error:", msg);
        }
        return [];
      } finally {
        inflightRequests.delete(reqKey);
      }
    })();

    inflightRequests.set(reqKey, fetchPromise);
    return fetchPromise;
  },

  // ═════════════════════════════════════════════════════════════
  // fetchWords — Charge les mots d'une leçon
  // ═════════════════════════════════════════════════════════════

  fetchWords: async (lessonId, silent = false) => {
    if (!lessonId || !isSessionActive()) return [];

    const reqKey = `words_${lessonId}`;
    
    // 1. Check if this is a "Virtual Lesson" (a group of MulemWords)
    const state = get();
    const lessonsList = state.lessons || [];
    const lessonData = lessonsList.find(l => l.id === lessonId);
    
    if (lessonData && lessonData.words) {
      // It's a grouped virtual lesson. Return its words.
      const virtualWords = lessonData.words.map(w => ({
        id: w.id,
        sourceText: w.word_fr,
        targetText: w.word_local,
        audioUrl: w.audio_url,
        imageUrl: w.image_url,
        hint: w.hint,
        // Carry any other properties needed for exercises
        category: w.category,
      }));

      if (!silent) {
        set({ words: virtualWords, currentLessonId: lessonId, wordsLoading: false });
      }
      return virtualWords;
    }

    // 2. Check cache for traditional lessons
    const now = Date.now();
    const lastFetch = lastFetchTime.get(reqKey) || 0;
    const wCache = state.wordsCache || {};

    if (wCache[lessonId] && (now - lastFetch < STALE_TIME)) {
      if (!silent) {
        set({ words: wCache[lessonId], currentLessonId: lessonId, wordsLoading: false });
      }
      return wCache[lessonId];
    }

    if (inflightRequests.has(reqKey)) return inflightRequests.get(reqKey);

    if (!silent) {
      set({ currentLessonId: lessonId, wordsLoading: true });
    }

    const fetchPromise = (async () => {
      try {
        const words = await themesService.getWords(lessonId);
        set((state) => ({ 
          wordsCache: { ...state.wordsCache, [lessonId]: words },
          ...(silent ? {} : { words, wordsLoading: false })
        }));
        lastFetchTime.set(reqKey, Date.now());
        return words;
      } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        if (!silent) set({ wordsLoading: false, error: msg });
        
        // Only log if it's not a 404 (we expect some virtual items to not have sub-words)
        if (error?.response?.status !== 404 && error?.response?.status !== 401 && !isNetworkError(error)) {
          Logger.error("[ThemeStore] fetchWords error:", msg);
        }
        return [];
      } finally {
        inflightRequests.delete(reqKey);
      }
    })();

    inflightRequests.set(reqKey, fetchPromise);
    return fetchPromise;
  },

  /**
   * Prefetch words for one or more lessons silently.
   */
  prefetchWords: async (lessonIds) => {
    if (!Array.isArray(lessonIds)) lessonIds = [lessonIds];
    const { fetchWords } = get();
    // Fetch in parallel
    return Promise.all(lessonIds.map(id => fetchWords(id, true)));
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
    const state = get();
    const themesList = state.themes || [];
    const theme = themesList.find((t) => t.id === themeId);
    if (!theme) return true;

    // Premier thème = toujours débloqué
    if (theme.order === 0) return false;

    // Vérifier le backend (le champ locked est injecté par le serveur)
    if (theme.locked !== undefined) return theme.locked;

    // Fallback : vérifier le thème précédent
    const prevTheme = themesList.find((t) => t.order === theme.order - 1);
    if (!prevTheme) return false;

    return !prevTheme.e3Completed;
  },

  // ═════════════════════════════════════════════════════════════
  // getExerciseAccess — Vérifie quel exercice est accessible
  // Retourne : { e1: bool, e2: bool, e3: bool }
  // ═════════════════════════════════════════════════════════════

  getExerciseAccess: (themeId) => {
    const state = get();
    const lessonsList = state.lessons || [];
    if (lessonsList.length === 0) return { e1: false, e2: false, e3: false };

    // The final challenge (e1) is unlocked only when all regular category 
    // nodes in the tree are completed.
    const allCompleted = lessonsList.every(l => l.isCompleted);
    return { e1: allCompleted, e2: allCompleted, e3: allCompleted };
  },

  // ═════════════════════════════════════════════════════════════
  // isLessonLocked — Vérifie si une leçon est verrouillée
  // Directive : 2 premières leçons débloquées, le reste via exercices
  // ═════════════════════════════════════════════════════════════

  isLessonLocked: (lessonId, order) => {
    // First two lesson categories (order 0 and 1) are always unlocked
    if (order === 0 || order === 1) return false;

    const state = get();
    const lessonsList = state.lessons || [];
    const lesson = lessonsList.find((l) => l.id === lessonId);
    
    // Use the isUnlocked property calculated by the service/backend
    if (lesson?.isUnlocked) return false;

    // Fallback logic: check previous lesson completion if not explicitly unlocked
    const prevLesson = lessonsList.find((l) => l.order === order - 1);
    if (prevLesson && prevLesson.isCompleted) return false;

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
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    // Unlock the theme whose order immediately follows this one.
    // Using order+1 (not array index+1) so the correct theme is unlocked
    // regardless of the order themes were returned by the API.
    const nextOrder = (theme.order ?? -1) + 1;
    const updated = themes.map((t) => {
      if (t.id === themeId) return { ...t, videoWatched: true };
      if (t.order === nextOrder) return { ...t, locked: false };
      return t;
    });
    set({ themes: updated });
  },

  // ═════════════════════════════════════════════════════════════
  // setVirtualData — Injects virtual lessons/words for specific themes
  // ═════════════════════════════════════════════════════════════
  setVirtualData: (themeId, data) => {
    if (!data) return;
    // Stamp the cache so fetchLessons treats this as fresh and won't hit the API.
    lastFetchTime.set(`lessons_${themeId}`, Date.now());
    set(() => ({
      currentThemeId: themeId,
      lessons: data.lessons || [],
      lessonsLoading: false,
      wordsLoading: false,
    }));
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
      wordsCache: {},
    });
  },
  // ═════════════════════════════════════════════════════════════
  // clearAll — Full reset
  // ═════════════════════════════════════════════════════════════
  clearAll: () => {
    set({
      themes: [],
      currentThemeId: null,
      lessons: [],
      currentLessonId: null,
      words: [],
      isLoading: false,
      lessonsLoading: false,
      wordsLoading: false,
      wordsCache: {},
      error: null,
    });
  },
}));


export default useThemeStore;