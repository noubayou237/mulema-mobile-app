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

export const useLanguageStore = create((set, get) => ({
  activeLanguage: null,
  hasSeenIntro: false,
  languages: [],
  isLoading: false,
  isLoaded: false,

  fetchLanguages: async () => {
    if (!isSessionActive()) return [];
    set({ isLoading: true });
    try {
      const languages = await languagesService.getAll();
      set({ languages, isLoading: false, isLoaded: true });
      return languages;
    } catch (error) {
      set({ isLoading: false, isLoaded: true });
      if (error?.response?.status !== 401) {
        Logger.warn("[LanguageStore] fetchLanguages error:", error);
      }
      return [];
    }
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
    const { languages, activeLanguage, setActiveLanguage } = get();
    
    // Si on a déjà une langue active, on ne l'écrase pas sauf si elle est différente
    // de celle du backend (le backend est la source de vérité pour le compte)
    const langId = user.patrimonial_language_id || user.official_language_id;
    if (langId && (!activeLanguage || activeLanguage.id !== langId)) {
      const found = languages.find(l => l.id === langId);
      if (found) {
        await setActiveLanguage(found);
        set({ hasSeenIntro: true });
        AsyncStorage.setItem("hasSeenIntro", "true").catch(() => {});
      }
    }
  },

  reset: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem("selectedLanguageName");
      await AsyncStorage.removeItem(STORAGE_KEY_TYPE);
      await AsyncStorage.removeItem("hasSeenIntro");
    } catch {}
    set({ activeLanguage: null, hasSeenIntro: false, languages: [], isLoaded: false });
  },
}));

export default useLanguageStore;