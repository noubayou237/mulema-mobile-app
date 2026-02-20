// src/context/LanguageContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

// Separate keys for UI language vs learning language
const UI_LANGUAGE_KEY = "app_language"; // For English/French (app UI)
const LEARNING_LANGUAGE_KEY = "hasSelectedLanguage"; // For Duala/Bassa/Ghomala (learning)

const LanguageContext = createContext({
  language: null,
  setLanguage: async () => {},
  clearLanguage: async () => {},
  isLoading: true
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Check for UI language preference (English/French)
        const stored = await AsyncStorage.getItem(UI_LANGUAGE_KEY);
        if (stored && mounted) {
          const normalized = String(stored).toLowerCase();
          setLanguageState(normalized);
          // Initialize i18n with saved UI language
          await i18n.changeLanguage(normalized);
        } else {
          // Default to French if no language is selected
          await i18n.changeLanguage("fr");
          setLanguageState("fr");
        }
      } catch (e) {
        console.warn("LanguageProvider: erreur lecture langue", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * setLanguage: set the UI language (English/French)
   * This is different from the learning language (Duala/Bassa/Ghomala)
   * @param {string|null} lang - "en" or "fr"
   */
  const setLanguage = async (lang) => {
    try {
      if (!lang) {
        await AsyncStorage.removeItem(UI_LANGUAGE_KEY);
        setLanguageState(null);
        await i18n.changeLanguage("fr");
        return;
      }
      const normalized = String(lang).toLowerCase();
      // Only accept en or fr for UI language
      if (normalized !== "en" && normalized !== "fr") {
        console.warn("Invalid UI language, defaulting to French");
        await i18n.changeLanguage("fr");
        setLanguageState("fr");
        return;
      }
      await AsyncStorage.setItem(UI_LANGUAGE_KEY, normalized);
      setLanguageState(normalized);
      // Update i18n language
      await i18n.changeLanguage(normalized);
    } catch (e) {
      console.warn("LanguageProvider: erreur sauvegarde langue", e);
    }
  };

  /**
   * clearLanguage: clear the UI language preference
   */
  const clearLanguage = async () => {
    try {
      await AsyncStorage.removeItem(UI_LANGUAGE_KEY);
      setLanguageState(null);
      await i18n.changeLanguage("en");
    } catch (e) {
      console.warn("LanguageProvider: erreur clearLanguage", e);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, clearLanguage, isLoading }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
