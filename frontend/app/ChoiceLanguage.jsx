import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
<<<<<<< HEAD
  ActivityIndicator,
  StyleSheet,
  Text
=======
  ActivityIndicator
>>>>>>> feat/settings-page
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import ScreenWrapper from "./components/ui/ScreenWrapper";
import AppTitle from "./components/ui/AppTitle";
import AppText from "./components/ui/AppText";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
<<<<<<< HEAD
import api from "../services/api";
=======
import api from "@/services/api";
>>>>>>> feat/settings-page

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

<<<<<<< HEAD
=======
  // Merge local LANGS with available languages from backend
>>>>>>> feat/settings-page
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

<<<<<<< HEAD
  const selectedLabel = selected
    ? allLangs.find((l) => l.code === selected)?.label
    : "-- Choisir une langue --";

=======
>>>>>>> feat/settings-page
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
<<<<<<< HEAD
        style={styles.picker}
      >
        <AppText variant={selected ? "body" : "muted"}>{selectedLabel}</AppText>
      </TouchableOpacity>

      <Modal visible={open} animationType='fade' transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppTitle style={styles.modalTitle}>
=======
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
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
                    style={[
                      styles.langItem,
                      isSelected && styles.langItemSelected
                    ]}
                  >
                    <Text
                      style={[
                        styles.langItemText,
                        isSelected && styles.langItemTextSelected
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
=======
                    className={`py-4 px-4 rounded-xl mb-2 
                      ${isSelected ? "bg-primary/10" : ""}`}
                  >
                    <AppText
                      className={`text-base 
                      ${isSelected ? "text-primary font-semibold" : ""}`}
                    >
                      {item.label}
                    </AppText>
>>>>>>> feat/settings-page
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() => setOpen(false)}
<<<<<<< HEAD
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
=======
              className='mt-4 items-center'
            >
              <AppText className='text-muted-foreground'>Annuler</AppText>
>>>>>>> feat/settings-page
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function ChoiceLanguage() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
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
<<<<<<< HEAD
      console.log("Error fetching languages:", error.message);
      // Fall back to local LANGS - already handled
=======
      console.log("Error fetching languages:", error);
      // Fall back to local LANGS
>>>>>>> feat/settings-page
    }
  };

  const loadSavedLanguage = async () => {
    try {
<<<<<<< HEAD
      const userLanguagesResponse = await api.get("/user-languages");
      if (userLanguagesResponse.data?.length > 0) {
=======
      // First try to get from backend
      const userLanguagesResponse = await api.get("/user-languages");
      if (userLanguagesResponse.data?.length > 0) {
        // User already has languages, use the first one
>>>>>>> feat/settings-page
        const firstLang = userLanguagesResponse.data[0];
        const langCode =
          firstLang.patrimonialLanguage?.name?.toLowerCase() ||
          firstLang.officialLanguage?.name?.toLowerCase();
        setSelected(langCode);
        setInitializing(false);
        return;
      }
    } catch (error) {
<<<<<<< HEAD
      console.log("Error fetching user languages:", error.message);
    }

=======
      console.log("Error fetching user languages:", error);
    }

    // Fall back to AsyncStorage
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
=======
      // Try to add language to backend
>>>>>>> feat/settings-page
      try {
        await api.post("/user-languages", {
          patrimonialLanguageId: language.patrimonialLanguageId
        });
      } catch (apiError) {
<<<<<<< HEAD
        console.log("Language might already exist:", apiError.message);
      }

=======
        // Language might already exist, that's ok
        console.log("Language might already exist:", apiError.message);
      }

      // Save to AsyncStorage as backup
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#D32F2F' />
=======
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color='#5A4FCF' />
>>>>>>> feat/settings-page
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
<<<<<<< HEAD
      <View style={styles.container}>
        <AppTitle style={styles.mainTitle}>Bienvenue sur Mulema</AppTitle>
        <AppText variant='muted' style={styles.subtitle}>
          Apprenez les langues locales camerounaises
        </AppText>

        <AppTitle style={styles.sectionTitle}>
          Quelle langue voulez-vous apprendre ?
        </AppTitle>

        <View style={styles.pickerContainer}>
=======
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
>>>>>>> feat/settings-page
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

<<<<<<< HEAD
        <View style={styles.langList}>
=======
        <View className='space-y-4'>
>>>>>>> feat/settings-page
          {LANGS.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageSelect(lang)}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Card
<<<<<<< HEAD
                style={[
                  styles.langCard,
                  selected === lang.code ? styles.langCardSelected : null
                ]}
              >
                <View style={styles.langCardRow}>
                  <AppText style={styles.langLabel}>{lang.label}</AppText>
                </View>
                {selected === lang.code && (
                  <AppText style={styles.checkmarkText}>✓</AppText>
=======
                className={`flex-row items-center justify-between p-4 ${
                  selected === lang.code ? "border-primary border-2" : ""
                }`}
              >
                <View className='flex-row items-center'>
                  <AppText className='text-lg ml-3'>{lang.label}</AppText>
                </View>
                {selected === lang.code && (
                  <AppText className='text-primary'>✓</AppText>
>>>>>>> feat/settings-page
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

<<<<<<< HEAD
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Chargement..." : "Continuer"}
            onPress={handleContinue}
            disabled={!selected || loading}
            style={[
              styles.button,
              !selected || loading ? styles.buttonDisabled : null
            ]}
          />
=======
        <View className='mt-auto mb-8'>
          <Button
            onPress={handleContinue}
            disabled={!selected || loading}
            className={`w-full py-4 ${!selected || loading ? "opacity-50" : ""}`}
          >
            {loading ? "Chargement..." : "Continuer"}
          </Button>
>>>>>>> feat/settings-page
        </View>
      </View>
    </ScreenWrapper>
  );
}
<<<<<<< HEAD

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    paddingTop: 32
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#050303"
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#6B6B6B"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#050303"
  },
  pickerContainer: {
    marginBottom: 32
  },
  picker: {
    borderWidth: 1,
    borderColor: "#F3E8E8",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F3E8E8"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#050303"
  },
  langItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  langItemSelected: {
    backgroundColor: "#FFEBEE"
  },
  langItemText: {
    fontSize: 16,
    color: "#050303"
  },
  langItemTextSelected: {
    color: "#D32F2F",
    fontWeight: "600"
  },
  checkmark: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "bold"
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center"
  },
  closeButtonText: {
    color: "#6B6B6B",
    fontSize: 16
  },
  langList: {
    gap: 16
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16
  },
  langCardSelected: {
    borderWidth: 2,
    borderColor: "#D32F2F"
  },
  langCardRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  langLabel: {
    fontSize: 16,
    color: "#050303"
  },
  checkmarkText: {
    color: "#D32F2F",
    fontSize: 16
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 32
  },
  button: {
    backgroundColor: "#D32F2F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  }
});
=======
>>>>>>> feat/settings-page
