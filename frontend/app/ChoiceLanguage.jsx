// app/ChoiceLanguage.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Définition de styles d'authentification minimalistes si authStyles n'est pas fourni
const authStyles = {
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#B22222", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 40, textAlign: "center" },
  formContainer: { width: "100%", alignItems: "center" },
  authButton: { backgroundColor: "#B22222", padding: 18, borderRadius: 12, width: "100%" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18, textAlign: "center" },
  buttonDisabled: { opacity: 0.6 },
};

const HAS_SELECTED_LANGUAGE = "hasSelectedLanguage"; // contiendra la chaîne de langue (ex: "duala")
const SELECTED_LANGUAGE_KEY = "selectedLanguage";

const LANGS = [
  { code: "bassa", label: "Le Bassa" },
  { code: "duala", label: "Le Duala" }, // corrigé en "duala"
  { code: "ghomala", label: "Le Ghomala" },
];

function LangModalPicker({ selected, setSelected }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.selectorButton}
        activeOpacity={0.85}
      >
        <Text style={[styles.selectorText, !selected && { color: "#888" }]}>
          {selected ? LANGS.find((l) => l.code === selected)?.label : "-- Choisir une langue --"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sélectionner une langue</Text>

            <FlatList
              data={LANGS}
              keyExtractor={(item) => item.code}
              contentContainerStyle={{ paddingBottom: 8 }}
              renderItem={({ item }) => {
                const isSel = selected === item.code;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelected(item.code);
                      setOpen(false);
                    }}
                    activeOpacity={0.8}
                    style={[styles.langItem, isSel && styles.langItemSelected]}
                  >
                    <Text style={[styles.langText, isSel && { fontWeight: "700", color: "#B22222" }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />

            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={{ color: "#333" }}>Annuler</Text>
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

  useEffect(() => {
    // préremplir si l'utilisateur a déjà choisi une langue
    (async () => {
      try {
        const prev = await AsyncStorage.getItem(SELECTED_LANGUAGE_KEY);
        if (prev) setSelected(String(prev).toLowerCase());
      } catch (e) {
        console.warn("Erreur récupération langue:", e);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  async function handleContinue() {
    if (!selected) {
      Alert.alert("Choix requis", "Veuillez sélectionner une langue pour continuer.");
      return;
    }

    setLoading(true);
    try {
      const normalized = String(selected).toLowerCase();

      // Stocke la langue choisie comme valeur (pas seulement "true")
      await AsyncStorage.setItem(SELECTED_LANGUAGE_KEY, normalized);
      await AsyncStorage.setItem(HAS_SELECTED_LANGUAGE, normalized);

      // Redirection vers la page vidéo avec param lang (nom de route: intro-video)
      router.replace(`/PageVideo?lang=${encodeURIComponent(normalized)}`);
    } catch (err) {
      console.warn("Erreur sauvegarde langue:", err);
      Alert.alert("Erreur", "Impossible d'enregistrer la langue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <SafeAreaView style={authStyles.container}>
        <View style={[authStyles.scrollContent, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#B22222" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={authStyles.container}>
      <View style={authStyles.scrollContent}>
        <Text style={authStyles.title}>Choisis la langue que tu souhaites apprendre</Text>
        <Text style={authStyles.subtitle}>Découvre l'histoire de cette langue maternelle</Text>

        <View style={authStyles.formContainer}>
          <View style={styles.pickerWrap}>
            <LangModalPicker selected={selected} setSelected={setSelected} />
          </View>

          <TouchableOpacity
            style={[authStyles.authButton, (!selected || loading) && authStyles.buttonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!selected || loading}
          >
            <Text style={authStyles.buttonText}>{loading ? "Patiente..." : "Continuer"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ----- styles locaux ----- */
const styles = StyleSheet.create({
  pickerWrap: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  selectorButton: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  selectorText: {
    fontSize: 16,
    color: "#111",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  langItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  langItemSelected: {
    backgroundColor: "#fff4f4",
  },
  langText: {
    fontSize: 16,
    color: "#111",
  },
  closeBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
});
