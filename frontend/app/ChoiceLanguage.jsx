import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import ScreenWrapper from "./components/ui/ScreenWrapper";
import AppTitle from "./components/ui/AppTitle";
import AppText from "./components/ui/AppText";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";

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
        activeOpacity={0.85}
        className="border border-border rounded-xl py-4 px-4 bg-card"
      >
        <AppText className={!selected ? "text-muted-foreground" : ""}>
          {selected
            ? LANGS.find((l) => l.code === selected)?.label
            : "-- Choisir une langue --"}
        </AppText>
      </TouchableOpacity>

      <Modal visible={open} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-card rounded-2xl p-6 border border-border">
            <AppTitle className="text-lg mb-4 text-center">
              Sélectionner une langue
            </AppTitle>

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
              className="mt-4 items-center"
            >
              <AppText className="text-muted-foreground">
                Annuler
              </AppText>
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
      return Alert.alert("Choix requis", "Veuillez sélectionner une langue.");
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
      <ScreenWrapper className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="justify-center">
      <View className="mb-10">
        <AppTitle className="text-center mb-4">
          Choisis la langue que tu souhaites apprendre
        </AppTitle>

        <AppText className="text-center text-muted-foreground">
          Découvre l’histoire de cette langue maternelle
        </AppText>
      </View>

      <Card className="mb-6">
        <LangModalPicker selected={selected} setSelected={setSelected} />
      </Card>

      <Button
        title={loading ? "Patiente..." : "Continuer"}
        onPress={handleContinue}
        disabled={!selected || loading}
      />
    </ScreenWrapper>
  );
}