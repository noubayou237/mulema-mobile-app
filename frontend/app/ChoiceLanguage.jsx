import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import ScreenWrapper from "./components/ui/ScreenWrapper";
import AppTitle from "./components/ui/AppTitle";
import AppText from "./components/ui/AppText";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import api from "@/services/api";

const SELECTED_LANGUAGE_KEY = "selectedLanguage";

const LANGS = [
  { code: "bassa", label: "Le Bassa", patrimonialLanguageId: "bassa-id" },
  { code: "duala", label: "Le Duala", patrimonialLanguageId: "duala-id" },
  { code: "ghomala", label: "Le Ghomala", patrimonialLanguageId: "ghomala-id" }
];

function LangModalPicker({
  selected,
  setSelected,
  onSelect,
  availableLanguages = []
}) {
  const [open, setOpen] = useState(false);

  // Merge local LANGS with available languages from backend
  const allLangs =
    availableLanguages.length > 0
      ? availableLanguages.map((l) => ({
          code:
            l.patrimonialLanguage?.name?.toLowerCase() ||
            l.officialLanguage?.name?.toLowerCase(),
          label: l.patrimonialLanguage?.name || l.officialLanguage?.name,
          id: l.id
        }))
      : LANGS;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        className='border border-border rounded-xl py-4 px-4 bg-card'
      >
        <AppText className={!selected ? "text-muted-foreground" : ""}>
          {selected
            ? allLangs.find((l) => l.code === selected)?.label
            : "-- Choisir une langue --"}
        </AppText>
      </TouchableOpacity>

      <Modal visible={open} animationType='fade' transparent>
        <View className='flex-1 bg-black/50 justify-center px-6'>
          <View className='bg-card rounded-2xl p-6 border border-border'>
            <AppTitle className='text-lg mb-4 text-center'>
              Sélectionner une langue
            </AppTitle>

            <FlatList
              data={allLangs}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isSelected = selected === item.code;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelected(item.code);
                      if (onSelect) onSelect(item);
                      setOpen(false);
                    }}
                    className={`py-4 px-4 rounded-xl mb-2 
                      ${isSelected ? "bg-primary/10" : ""}`}
                  >
                    <AppText
                      className={`text-base 
                      ${isSelected ? "text-primary font-semibold" : ""}`}
                    >
                      {item.label}
                    </AppText>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() => setOpen(false)}
              className='mt-4 items-center'
            >
              <AppText className='text-muted-foreground'>Annuler</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function ChoiceLanguage() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Fetch available languages from backend
  useEffect(() => {
    fetchAvailableLanguages();
    loadSavedLanguage();
  }, []);

  const fetchAvailableLanguages = async () => {
    try {
      const response = await api.get("/user-languages/available");
      if (response.data?.patrimonialLanguages) {
        setAvailableLanguages(
          response.data.patrimonialLanguages.map((lang) => ({
            patrimonialLanguage: { name: lang.name }
          }))
        );
      }
    } catch (error) {
      console.log("Error fetching languages:", error);
      // Fall back to local LANGS
    }
  };

  const loadSavedLanguage = async () => {
    try {
      // First try to get from backend
      const userLanguagesResponse = await api.get("/user-languages");
      if (userLanguagesResponse.data?.length > 0) {
        // User already has languages, use the first one
        const firstLang = userLanguagesResponse.data[0];
        const langCode =
          firstLang.patrimonialLanguage?.name?.toLowerCase() ||
          firstLang.officialLanguage?.name?.toLowerCase();
        setSelected(langCode);
        setInitializing(false);
        return;
      }
    } catch (error) {
      console.log("Error fetching user languages:", error);
    }

    // Fall back to AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(SELECTED_LANGUAGE_KEY);
      if (stored) setSelected(stored);
    } catch (e) {
      console.warn("Erreur lecture langue:", e);
    } finally {
      setInitializing(false);
    }
  };

  const handleLanguageSelect = async (language) => {
    if (!language) return;

    setLoading(true);
    try {
      // Try to add language to backend
      try {
        await api.post("/user-languages", {
          patrimonialLanguageId: language.patrimonialLanguageId
        });
      } catch (apiError) {
        // Language might already exist, that's ok
        console.log("Language might already exist:", apiError.message);
      }

      // Save to AsyncStorage as backup
      await AsyncStorage.setItem(SELECTED_LANGUAGE_KEY, language.code);

      router.replace(`/PageVideo?lang=${encodeURIComponent(language.code)}`);
    } catch (e) {
      console.error("Error saving language:", e);
      Alert.alert("Erreur", "Impossible d'enregistrer la langue.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selected) {
      return Alert.alert("Choix requis", "Veuillez sélectionner une langue.");
    }

    const language = LANGS.find((l) => l.code === selected);
    await handleLanguageSelect(language);
  };

  if (initializing) {
    return (
      <ScreenWrapper>
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color='#5A4FCF' />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className='flex-1 px-6 pt-8'>
        <AppTitle className='text-3xl mb-2 text-center'>
          Bienvenue sur Mulema
        </AppTitle>
        <AppText className='text-center text-muted-foreground mb-8'>
          Apprenez les langues locales camerounaises
        </AppText>

        <AppTitle className='text-xl mb-4'>
          Quelle langue voulez-vous apprendre ?
        </AppTitle>

        <View className='mb-8'>
          <LangModalPicker
            selected={selected}
            setSelected={(code) => {
              setSelected(code);
              const lang = LANGS.find((l) => l.code === code);
              if (lang) handleLanguageSelect(lang);
            }}
            onSelect={handleLanguageSelect}
            availableLanguages={availableLanguages}
          />
        </View>

        <View className='space-y-4'>
          {LANGS.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageSelect(lang)}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Card
                className={`flex-row items-center justify-between p-4 ${
                  selected === lang.code ? "border-primary border-2" : ""
                }`}
              >
                <View className='flex-row items-center'>
                  <AppText className='text-lg ml-3'>{lang.label}</AppText>
                </View>
                {selected === lang.code && (
                  <AppText className='text-primary'>✓</AppText>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View className='mt-auto mb-8'>
          <Button
            onPress={handleContinue}
            disabled={!selected || loading}
            className={`w-full py-4 ${!selected || loading ? "opacity-50" : ""}`}
          >
            {loading ? "Chargement..." : "Continuer"}
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
}
