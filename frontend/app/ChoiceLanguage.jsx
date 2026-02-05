// app/ChoiceLanguage.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const SELECTED_LANGUAGE_KEY = "selectedLanguage";

const LANGS = [
  { code: "bassa", label: "Le Bassa" },
  { code: "duala", label: "Le Duala" },
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
          {selected
            ? LANGS.find((l) => l.code === selected)?.label
            : "-- Choisir une langue --"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sélectionner une langue</Text>

            <FlatList
              data={LANGS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isSelected = selected === item.code;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelected(item.code);
                      setOpen(false);
                    }}
                    style={[
                      styles.langItem,
                      isSelected && styles.langItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.langText,
                        isSelected && styles.langTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={styles.closeBtn}
            >
              <Text>Annuler</Text>
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
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTED_LANGUAGE_KEY);
        if (stored) setSelected(stored);
      } catch (e) {
        console.warn("Erreur lecture langue:", e);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const handleContinue = async () => {
    if (!selected) {
      Alert.alert("Choix requis", "Veuillez sélectionner une langue.");
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(SELECTED_LANGUAGE_KEY, selected);
      router.replace(`/PageVideo?lang=${encodeURIComponent(selected)}`);
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer la langue.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#B22222" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Choisis la langue que tu souhaites apprendre
        </Text>
        <Text style={styles.subtitle}>
          Découvre l’histoire de cette langue maternelle
        </Text>

        <View style={styles.pickerWrap}>
          <LangModalPicker selected={selected} setSelected={setSelected} />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!selected || loading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selected || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Patiente..." : "Continuer"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#B22222",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  pickerWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 24,
  },
  selectorButton: {
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  selectorText: {
    fontSize: 16,
    color: "#111",
  },
  button: {
    backgroundColor: "#B22222",
    padding: 18,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
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
  langTextSelected: {
    fontWeight: "700",
    color: "#B22222",
  },
  closeBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
