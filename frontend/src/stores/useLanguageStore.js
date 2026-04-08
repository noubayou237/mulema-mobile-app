/**
 * MULEMA — useLanguageStore
 * Fonctionne avec le backend (/official-languages + /patrimonial-languages)
 * ET avec AsyncStorage comme fallback
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { languagesService } from "../services/languages.service";

const STORAGE_KEY = "selectedLanguage";
const STORAGE_KEY_TYPE = "selectedLanguageType";

export const useLanguageStore = create((set, get) => ({
  activeLanguage: null,
  languages: [],
  isLoading: false,
  isLoaded: false,

  fetchLanguages: async () => {
    set({ isLoading: true });
    try {
      const languages = await languagesService.getAll();
      set({ languages, isLoading: false, isLoaded: true });
      return languages;
    } catch (error) {
      console.warn("[LanguageStore] fetchLanguages error:", error);
      set({ isLoading: false, isLoaded: true });
      return [];
    }
  },

  loadActiveLanguage: async () => {
    const { languages } = get();
    if (languages.length === 0) return null;

    // Helper : chercher d'abord par ID exact, sinon par nom
    // en priorisant les langues patrimoniales (celles qui ont des thèmes)
    const findLang = (query) => {
      if (!query) return null;
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
      const found = findLang(storedId);
      if (found) {
        set({ activeLanguage: found });
        return found;
      }

      const storedName = await AsyncStorage.getItem("selectedLanguageName");
      const foundByName = findLang(storedName);
      if (foundByName) {
        set({ activeLanguage: foundByName });
        return foundByName;
      }
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

  hasLanguage: () => get().activeLanguage !== null,

  getSpecialCharacters: () => get().activeLanguage?.specialCharacters || [],

  reset: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem("selectedLanguageName");
      await AsyncStorage.removeItem(STORAGE_KEY_TYPE);
    } catch {}
    set({ activeLanguage: null, languages: [], isLoaded: false });
  },
}));

export default useLanguageStore;