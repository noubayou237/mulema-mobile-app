import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import fr from "./locales/fr.json";

const LANGUAGE_STORAGE_KEY = "app_language";

// Get the device language or default to English
const getDefaultLanguage = async () => {
  try {
    // First check AsyncStorage for saved preference
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
  } catch (error) {
    console.warn("[i18n] Error reading language from storage:", error);
  }
  return "fr"; // Default to French
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr }
  },
  lng: "fr", // Default language - will be updated after loading
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false // React already escapes values
  },
  compatibilityJSON: "v3" // Use v3 format for better React Native support
});

// Function to change language and persist to storage
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

// Function to initialize language from storage
export const initializeLanguage = async () => {
  const language = await getDefaultLanguage();
  await i18n.changeLanguage(language);
  return language;
};

// Export current language
export const getCurrentLanguage = () => i18n.language;

export default i18n;
