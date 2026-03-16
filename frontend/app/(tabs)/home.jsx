// app/(tabs)/home.jsx

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import HomeDouala from "../homedouala";
import HomeBassa from "../homebassa";
import HomeGhomala from "../homeghomala";

const HAS_SELECTED_LANGUAGE = "selectedLanguage";

// Design tokens
const COLORS = {
  background: "#F9F5F5",
  card: "#FFFFFF",
  foreground: "#050303",
  border: "#F3E8E8",
  muted: "#6B6B6B"
};

export default function HomeRouter() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const paramLang = params?.lang ?? null;

  const [langToRender, setLangToRender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1️⃣ Param URL prioritaire
        if (paramLang) {
          const normalized = String(paramLang).toLowerCase();
          await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, normalized);

          if (mounted) {
            setLangToRender(normalized);
            setLoading(false);
          }
          return;
        }

        // 2️⃣ Fallback storage
        const stored = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);

        if (mounted) {
          setLangToRender(stored ? stored.toLowerCase() : null);
        }
      } catch (err) {
        console.warn("HomeRouter: erreur récupération langue", err);
        if (mounted) setLangToRender(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [paramLang]);

  // Loader
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  const lang = (langToRender || "").toLowerCase();

  switch (lang) {
    case "duala":
      return <HomeDouala />;

    case "bassa":
      return <HomeBassa />;

    case "ghomala":
      return <HomeGhomala />;

    default:
      return (
        <View style={styles.defaultContainer}>
          <View style={styles.defaultCard}>
            <Text style={styles.defaultText}>
              {t("errors.languageNotSelected") ||
                "Langue non définie. Sélectionnez une langue."}
            </Text>
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center"
  },
  defaultContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  defaultCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24
  },
  defaultText: {
    textAlign: "center",
    color: COLORS.foreground
  }
});
