// app/(tabs)/home.jsx

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import HomeDouala from "../homedouala";
import HomeBassa from "../homebassa";
import HomeGhomala from "../homeghomala";

const HAS_SELECTED_LANGUAGE = "selectedLanguage";

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
      <View className='flex-1 bg-background justify-center items-center'>
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
        <View className='flex-1 bg-background justify-center items-center px-6'>
          <View className='bg-card border border-border rounded-2xl p-6'>
            <Text className='text-center text-foreground'>
              {t("errors.languageNotSelected") ||
                "Langue non définie. Sélectionnez une langue."}
            </Text>
          </View>
        </View>
      );
  }
}
