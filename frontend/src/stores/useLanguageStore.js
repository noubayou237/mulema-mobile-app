import Logger from "../utils/logger";
/**
 * MULEMA — useLanguageStore
 * Fonctionne avec le backend (/official-languages + /patrimonial-languages)
 * ET avec AsyncStorage comme fallback
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { languagesService } from "../services/languages.service";
import { isSessionActive } from "../services/api";

const STORAGE_KEY = "selectedLanguage";
const STORAGE_KEY_TYPE = "selectedLanguageType";

// Languages almost never change — cache for 30 minutes
const LANGUAGE_STALE_TIME = 30 * 60 * 1000;
let _languagesFetchPromise = null;
let _languagesLastFetch = 0;

export const useLanguageStore = create((set, get) => ({
  activeLanguage: null,
  hasSeenIntro: false,
  languages: [],
  isLoading: false,
  isLoaded: false,

  fetchLanguages: async (force = false) => {
    if (!isSessionActive()) return [];

    // Return in-flight promise — prevents duplicate concurrent requests
    if (_languagesFetchPromise) return _languagesFetchPromise;

    // Return cached data if still fresh
    const cached = get().languages;
    if (!force && cached.length > 0 && Date.now() - _languagesLastFetch < LANGUAGE_STALE_TIME) {
      return cached;
    }

    set({ isLoading: !cached.length });
    _languagesFetchPromise = (async () => {
      try {
        const languages = await languagesService.getAll();
        set({ languages, isLoading: false, isLoaded: true });
        _languagesLastFetch = Date.now();
        return languages;
      } catch (error) {
        set({ isLoading: false, isLoaded: true });
        if (error?.response?.status !== 401) {
          Logger.warn("[LanguageStore] fetchLanguages error:", error);
        }
        return get().languages; // return stale cache on error
      } finally {
        _languagesFetchPromise = null;
      }
    })();
    return _languagesFetchPromise;
  },

  loadActiveLanguage: async () => {
    const { languages } = get();

    // Helper : chercher d'abord par ID exact, sinon par nom
    // en priorisant les langues patrimoniales (celles qui ont des thèmes)
    const findLang = (query) => {
      if (!query || languages.length === 0) return null;
      // 1. ID exact
      const byId = languages.find((l) => l.id === query);
      if (byId) return byId;
      // 2. Nom — prioriser patrimonial
      const q = query.toLowerCase();
      const patrimonial = languages.find((l) => l.type === "patrimonial" && l.name.toLowerCase() === q);
      if (patrimonial) return patrimonial;
      return languages.find((l) => l.name.toLowerCase() === q) || null;
    };

    try {
      const storedId = await AsyncStorage.getItem(STORAGE_KEY);
      let found = findLang(storedId);

      const storedName = await AsyncStorage.getItem("selectedLanguageName");
      
      if (!found && storedName) {
        found = findLang(storedName);
      }

      // Fallback: If backend fails (languages.length === 0) but we have a stored language
      if (!found && storedId && storedName) {
        const storedType = (await AsyncStorage.getItem(STORAGE_KEY_TYPE)) || "patrimonial";
        found = { id: storedId, name: storedName, type: storedType };
      }

      if (found) {
        set({ activeLanguage: found });
      }

      // Load intro video seen flag — important: this must ALWAYS run
      const storedIntro = await AsyncStorage.getItem("hasSeenIntro");
      set({ hasSeenIntro: storedIntro === "true" });

      return get().activeLanguage;
    } catch {}

    return null;
  },

  setActiveLanguage: async (language) => {
    set({ activeLanguage: language });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, language.id);
      await AsyncStorage.setItem("selectedLanguageName", language.name);
      if (language.type) {
        await AsyncStorage.setItem(STORAGE_KEY_TYPE, language.type);
      }
    } catch {}

    // Notifier le backend (non bloquant)
    try {
      await languagesService.setUserLanguage(language.id, language.type);
    } catch {}

    return language;
  },

  setHasSeenIntro: async (val) => {
    set({ hasSeenIntro: val });
    try {
      await AsyncStorage.setItem("hasSeenIntro", val ? "true" : "false");
    } catch {}
  },

  hasLanguage: () => get().activeLanguage !== null,

  getSpecialCharacters: () => get().activeLanguage?.specialCharacters || [],
  
  syncWithUser: async (user) => {
    if (!user) return;
    const { languages } = get();

    const langId = user.patrimonial_language_id || user.official_language_id;
    if (!langId || !languages.length) return;

    // If the user has a locally stored language preference, always respect it.
    // loadActiveLanguage() will restore it from AsyncStorage after this call.
    // Only fall through to the backend language when there is NO stored preference
    // (i.e. a brand-new user who has never selected a language on this device).
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) return;
    } catch {}

    // No local preference — set the backend default so the user isn't stuck
    // on the language-selection screen.
    const found = languages.find((l) => l.id === langId);
    if (!found) return;

    await get().setActiveLanguage(found);
    set({ hasSeenIntro: true });
    AsyncStorage.setItem("hasSeenIntro", "true").catch(() => {});
  },

  reset: async () => {
    // Intentionally keep the language preference and hasSeenIntro flag in
    // AsyncStorage so the next login session restores the same language
    // automatically. loadActiveLanguage() in _layout.jsx runs after
    // syncWithUser() and will pick the stored values back up.
    _languagesFetchPromise = null;
    _languagesLastFetch = 0;
    set({ activeLanguage: null, hasSeenIntro: false, languages: [], isLoaded: false });
  },
}));

export default useLanguageStore;