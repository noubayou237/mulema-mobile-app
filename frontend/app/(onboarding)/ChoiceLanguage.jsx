import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import api from "../../src/services/api";

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

  const selectedLabel = selected
    ? allLangs.find((l) => l.code === selected)?.label
    : "-- Choisir une langue --";

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        style={styles.picker}
      >
        <AppText variant={selected ? "body" : "muted"}>{selectedLabel}</AppText>
      </TouchableOpacity>

      <Modal visible={open} animationType='fade' transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppTitle style={styles.modalTitle}>
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
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
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
      console.log("Error fetching languages:", error.message);
      // Fall back to local LANGS - already handled
    }
  };

  const loadSavedLanguage = async () => {
    try {
      const userLanguagesResponse = await api.get("/user-languages");
      if (userLanguagesResponse.data?.length > 0) {
        const firstLang = userLanguagesResponse.data[0];
        const langCode =
          firstLang.patrimonialLanguage?.name?.toLowerCase() ||
          firstLang.officialLanguage?.name?.toLowerCase();
        setSelected(langCode);
        setInitializing(false);
        return;
      }
    } catch (error) {
      console.log("Error fetching user languages:", error.message);
    }

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
      try {
        await api.post("/user-languages", {
          patrimonialLanguageId: language.patrimonialLanguageId
        });
      } catch (apiError) {
        console.log("Language might already exist:", apiError.message);
      }

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#D32F2F' />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <AppTitle style={styles.mainTitle}>Bienvenue sur Mulema</AppTitle>
        <AppText variant='muted' style={styles.subtitle}>
          Apprenez les langues locales camerounaises
        </AppText>

        <AppTitle style={styles.sectionTitle}>
          Quelle langue voulez-vous apprendre ?
        </AppTitle>

        <View style={styles.pickerContainer}>
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

        <View style={styles.langList}>
          {LANGS.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageSelect(lang)}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Card
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
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

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
        </View>
      </View>
    </ScreenWrapper>
  );
}

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
