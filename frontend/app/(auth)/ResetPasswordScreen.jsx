import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "@/services/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = typeof params?.email === "string" ? params.email : "";
  const otpCode = typeof params?.otpCode === "string" ? params.otpCode : "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Erreur", "Complète tous les champs.");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
    }
    if (newPassword.length < 8) {
      return Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 8 caractères."
      );
    }
    if (!email || !otpCode) {
      return Alert.alert(
        "Erreur",
        "Informations manquantes. Recommence la procédure."
      );
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otpCode,
        newPassword
      });

      Alert.alert(
        "Succès",
        "Mot de passe mis à jour. Tu peux maintenant te connecter."
      );

      router.replace("/(auth)/sign-in");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Impossible de réinitialiser le mot de passe.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-background px-6'>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className='flex-1'
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <Text className='text-2xl font-semibold text-foreground mb-2'>
            Réinitialiser le mot de passe
          </Text>

          <Text className='text-muted-foreground mb-6'>
            Compte : {email || "—"}
          </Text>

          <View className='space-y-4'>
            <TextInput
              className='bg-card border border-border rounded-xl px-4 py-3 text-foreground'
              placeholder='Nouveau mot de passe'
              placeholderTextColor='#9CA3AF'
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize='none'
            />

            <TextInput
              className='bg-card border border-border rounded-xl px-4 py-3 text-foreground'
              placeholder='Confirmer le mot de passe'
              placeholderTextColor='#9CA3AF'
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize='none'
            />

            <TouchableOpacity
              className={`rounded-xl py-3 items-center ${
                loading ? "bg-muted" : "bg-primary"
              }`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Enregistrement..." : "Confirmer"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
