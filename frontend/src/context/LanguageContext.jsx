// src/context/LanguageContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_SELECTED_LANGUAGE = "hasSelectedLanguage"; // clé utilisée ailleurs dans ton app

const LanguageContext = createContext({
  language: null,
  setLanguage: async () => {},
  clearLanguage: async () => {},
  isLoading: true,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);
        if (stored && mounted) {
          setLanguageState(String(stored).toLowerCase());
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
   * setLanguage: persiste la langue (normalisée) ou supprime si value falsy
   * @param {string|null} lang
   */
  const setLanguage = async (lang) => {
    try {
      if (!lang) {
        await AsyncStorage.removeItem(HAS_SELECTED_LANGUAGE);
        setLanguageState(null);
        return;
      }
      const normalized = String(lang).toLowerCase();
      await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, normalized);
      setLanguageState(normalized);
    } catch (e) {
      console.warn("LanguageProvider: erreur sauvegarde langue", e);
    }
  };

  /**
   * clearLanguage: utilitaire pour effacer la langue (utile après inscription)
   */
  const clearLanguage = async () => {
    try {
      await AsyncStorage.removeItem(HAS_SELECTED_LANGUAGE);
      setLanguageState(null);
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
