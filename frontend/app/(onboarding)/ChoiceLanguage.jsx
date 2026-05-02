import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import api from "../../src/services/api";
import { useLanguageStore } from "../../src/stores/useLanguageStore";
import { useTranslation } from "react-i18next";
import Logger from "../../src/utils/logger";

export default function ChoiceLanguage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setActiveLanguage } = useLanguageStore();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    loadLanguages();
  }, []);

  // Charge les langues patrimoniales depuis le backend
  const loadLanguages = async () => {
    try {
      const { data } = await api.get("/patrimonial-languages");
      
      const uniqueLangsMap = new Map();
      (data || []).forEach((l) => {
        const code = l.name.toLowerCase();
        if (!uniqueLangsMap.has(code)) {
          uniqueLangsMap.set(code, {
            id: l.id,
            name: l.name,
            code: code,
            label: t("common.theLanguage", { name: l.name }),
            type: "patrimonial",
          });
        }
      });
      const langs = Array.from(uniqueLangsMap.values());
      setLanguages(langs);

      // Restaurer la sélection précédente
      const userLangs = await api.get("/user-languages").catch(() => ({ data: [] }));
      if (userLangs.data?.length > 0) {
        const first = userLangs.data[0];
        const code = first.patrimonialLanguage?.name?.toLowerCase();
        if (code) setSelected(code);
      }
    } catch (error) {
    } finally {
      setInitializing(false);
    }
  };

  const handleLanguageSelect = async (language) => {
    if (!language) return;

    setLoading(true);
    setSelected(language.code);
    try {
      // Enregistrer dans le backend
      try {
        await api.post("/user-languages", {
          patrimonialLanguageId: language.id,
        });
      } catch (apiError) {
        Logger.warn("[ChoiceLanguage] Language might already exist:", apiError.message);
      }

      // Mettre à jour le store (synchronise AsyncStorage + state)
      await setActiveLanguage(language);

      router.replace(`/(onboarding)/PageVideo?lang=${encodeURIComponent(language.name)}`);
    } catch (e) {
      Logger.error("Error saving language:", e);
      Alert.alert(t("common.error"), t("errors.languageNotSelected"));
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selected) {
      return Alert.alert(t("onboarding.choiceRequired"), t("onboarding.pleaseSelect"));
    }

    const language = languages.find((l) => l.code === selected);
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
        <AppTitle style={styles.mainTitle}>{t("onboarding.welcome")}</AppTitle>
        <AppText variant='muted' style={styles.subtitle}>
          {t("onboarding.subtitle")}
        </AppText>

        <AppTitle style={styles.sectionTitle}>
          {t("onboarding.selectLanguage")}
        </AppTitle>

        <View style={styles.langList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
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
          {languages.length === 0 && !initializing && (
            <AppText variant="muted" style={{ textAlign: "center" }}>
              {t("onboarding.noLanguages")}
            </AppText>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? t("common.loading") : t("common.next")}
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
