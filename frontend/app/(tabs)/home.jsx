// app/(tabs)/home.jsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

import HomeDouala from "../homedouala";
import HomeBassa from "../homebassa";
import HomeGhomala from "../homeghomala";
import { useLanguage } from "../../src/context/LanguageContext";

const HAS_SELECTED_LANGUAGE = "hasSelectedLanguage";

export default function HomeRouter() {
  const { language: ctxLanguage, isLoading: ctxLoading } = useLanguage();
  const params = useLocalSearchParams();               // ← correction ici
  const paramLang = params?.lang ?? null;

  const [langToRender, setLangToRender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1️⃣ Paramètre d'URL : priorité absolue
        if (paramLang) {
          const normalized = String(paramLang).toLowerCase();
          await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, normalized);
          if (mounted) {
            setLangToRender(normalized);
            setLoading(false);
          }
          return;
        }

        // 2️⃣ Si pas de param, utiliser le contexte
        if (ctxLanguage && !ctxLoading) {
          const normalized = String(ctxLanguage).toLowerCase();
          setLangToRender(normalized);
          setLoading(false);
          return;
        }

        // 3️⃣ Fallback: AsyncStorage
        const stored = await AsyncStorage.getItem(HAS_SELECTED_LANGUAGE);

        if (stored) {
          setLangToRender(String(stored).toLowerCase());
        } else {
          setLangToRender(null);
        }
      } catch (err) {
        console.warn("HomeRouter: erreur récupération langue", err);
        setLangToRender(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [paramLang, ctxLanguage, ctxLoading]);

  // Loader pendant la résolution
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D9534F" />
      </View>
    );
  }

  const lang = (langToRender || "").toLowerCase();

  // 4️⃣ Choix de la bonne Home Page
  switch (lang) {
    case "duala":
      return <HomeDouala />;

    case "bassa":
      return <HomeBassa />;

    case "ghomala":
      return <HomeGhomala />;

    default:
      return (
        <View style={styles.loadingContainer}>
          <Text>Erreur : Langue non définie. Veuillez sélectionner une langue depuis les paramètres.</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },
});
