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

  // ── Helper ──
  getRealThemeId: (id) => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Check if it's already a UUID or look-alike
    if (!id || id.toString().length > 20 || UUID_REGEX.test(id)) return id;

    const themes = get().themes;
    const lowerId = id.toString().toLowerCase();

    // Logic for Duala/Ghomala virtual IDs
    if (lowerId.includes("duala")) {
      return themes.find(t => t.name.toLowerCase().includes("duala"))?.id || id;
    }
    if (lowerId.includes("ghomala")) {
      return themes.find(t => t.name.toLowerCase().includes("ghomala"))?.id || id;
    }

    // For Bassa or generic codes
    const foundByCode = themes.find(t => t.code === id || (t.name && t.name.toLowerCase().includes(id)));
    if (foundByCode) return foundByCode.id;

    return id;
  },

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
    // Return early if no themeId is provided or it matches string literals from uninitialized state
    if (!themeId || themeId === "undefined" || themeId === "null" || !isSessionActive()) return [];

    const reqKey = `lessons_${themeId}`;
    if (!force && inflightRequests.has(reqKey)) return inflightRequests.get(reqKey);

    const startTime = Date.now();
    const now = startTime;
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

    // When switching to a different theme, clear stale lessons so the UI
    // doesn't flash old data while the new theme's lessons are loading.
    set({
      currentThemeId: themeId,
      lessonsLoading: true,
      error: null,
      ...(currentThemeId !== themeId ? { lessons: [] } : {}),
    });

    const fetchPromise = (async () => {
      try {
        const lessons = await themesService.getLessons(themeId);
        
        // Race condition: If state was updated (e.g., setVirtualData) while we were fetching, ignore this result.
        if (lastFetchTime.get(reqKey) > startTime) {
          Logger.log(`[ThemeStore] fetchLessons(${themeId}) result ignored: newer data present.`);
          return get().lessons;
        }

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
        // If state was updated while we were fetching, don't set error/empty lessons.
        if (lastFetchTime.get(reqKey) > startTime) {
          return get().lessons;
        }

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
    if (!lessonId || lessonId === "undefined" || lessonId === "null" || !isSessionActive()) return [];

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
  // Optimistic Updates — Pour un déblocage instantané côté UI
  // ═════════════════════════════════════════════════════════════

  /**
   * Marque une catégorie comme terminée et débloque la suivante
   * sans attendre la réponse de l'API.
   */
  optimisticUnlockCategory: (themeId, currentOrder) => {
    const { lessons, currentThemeId, themes } = get();
    
    // 1. Update lessons if we are currently looking at this theme's adventure tree
    if (currentThemeId === themeId && lessons.length > 0) {
      const updatedLessons = lessons.map(l => {
        if (l.order === currentOrder) return { ...l, isCompleted: true };
        if (l.order === currentOrder + 1) return { ...l, isUnlocked: true };
        return l;
      });
      set({ lessons: updatedLessons });
    }

    // 2. Update themes list (used by home screen cards)
    const updatedThemes = themes.map(t => {
      if (t.id === themeId && t.categories) {
        const updatedCats = t.categories.map((c, idx) => {
          if (idx === currentOrder) return { ...c, isCompleted: true };
          if (idx === currentOrder + 1) return { ...c, isUnlocked: true };
          return c;
        });
        return { ...t, categories: updatedCats };
      }
      return t;
    });

    set({ themes: updatedThemes });
  },

  /**
   * Marque le défi final comme réussi et prépare l'accès vidéo.
   */
  optimisticUnlockFinal: (themeId) => {
    const { themes } = get();
    const updated = themes.map(t => {
      if (t.id === themeId) return { ...t, e3Completed: true };
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