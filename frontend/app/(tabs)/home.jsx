// app/(tabs)/home.jsx

import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
=======
import { View, ActivityIndicator, Text } from "react-native";
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
      <View style={styles.loadingContainer}>
=======
      <View className='flex-1 bg-background justify-center items-center'>
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
        <View style={styles.defaultContainer}>
          <View style={styles.defaultCard}>
            <Text style={styles.defaultText}>
=======
        <View className='flex-1 bg-background justify-center items-center px-6'>
          <View className='bg-card border border-border rounded-2xl p-6'>
            <Text className='text-center text-foreground'>
>>>>>>> feat/settings-page
              {t("errors.languageNotSelected") ||
                "Langue non définie. Sélectionnez une langue."}
            </Text>
          </View>
        </View>
      );
  }
}
<<<<<<< HEAD

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
=======
>>>>>>> feat/settings-page
