import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

/**
 * ResetPasswordScreen (version simple)
 * - Reçoit uniquement "email" via params (venant de verify-email)
 * - Suppose que le code OTP a déjà été vérifié sur verify-email
 * - Appelle signIn.resetPassword(...) pour appliquer le nouveau mot de passe
 * - Si Clerk renvoie createdSessionId, active la session (connexion auto)
 */
const ResetPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params?.email === "string" ? params.email : "";

  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // validations minimales
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Erreur", "Complète tous les champs.");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
    }
    if (newPassword.length < 8) {
      return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
    }
    if (!email) {
      return Alert.alert("Erreur", "Email manquant.");
    }
    if (!signInLoaded) {
      return Alert.alert("Erreur", "Service d'authentification non prêt.");
    }

    setLoading(true);
    try {
      // Ici on suppose que verify-email a déjà validé le code avec Clerk.
      // Appel simple pour appliquer le nouveau mot de passe au signIn courant.
      const resetResult = await signIn.resetPassword?.({ password: newPassword });

      // Certaines versions peuvent renvoyer createdSessionId sous différentes clés :
      const createdSessionId =
        resetResult?.createdSessionId || resetResult?.created_session_id || null;

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      }

      Alert.alert("Succès", "Mot de passe mis à jour. Tu es connecté.");
      router.replace("/home");
    } catch (err) {
      // Message lisible pour l'utilisateur
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Impossible de réinitialiser le mot de passe.";

      // Si le flow a expiré / code non validé, suggère de relancer l'OTP
      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        Alert.alert("Erreur", `${msg}\n\nReviens sur la page de connexion pour redemander un code.`);
      } else {
        Alert.alert("Erreur", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={authStyles.keyboardView} keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
        <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
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
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>{loading ? "Enregistrement..." : "OK"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPasswordScreen;
