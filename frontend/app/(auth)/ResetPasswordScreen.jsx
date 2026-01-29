import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import api from "../../services/api";

const ResetPasswordScreen = () => {
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
        newPassword,
      });

      Alert.alert(
        "Succès",
        "Mot de passe mis à jour. Tu peux maintenant te connecter."
      );

      router.replace("/sign-in");
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
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={authStyles.title}>Réinitialiser le mot de passe</Text>
          <Text style={{ marginBottom: 12 }}>Compte : {email || "—"}</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Nouveau mot de passe"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Enregistrement..." : "OK"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;
