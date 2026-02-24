import React, { useState, useCallback } from "react";
import {
  Alert,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const MIN_PASSWORD = 6;

const SignUpScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [ui, setUi] = useState({
    showPassword: false,
    showConfirm: false,
    loading: false
  });

  const onChange = (key) => (val) => setForm((s) => ({ ...s, [key]: val }));

  const validate = () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirm
    ) {
      return "Remplis tous les champs obligatoires.";
    }
    if (/\s/.test(form.username))
      return "Le nom d'utilisateur ne doit pas contenir d'espaces.";
    if (form.password.length < MIN_PASSWORD)
      return `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;
    if (form.password !== form.confirm)
      return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleSignUp = useCallback(async () => {
    const error = validate();
    if (error) return Alert.alert("Erreur", error);

    setUi((s) => ({ ...s, loading: true }));

    try {
      // console.log("Starting signup request...");
      // console.log("API URL:", api.defaults.baseURL);

      const response = await api.post("/auth/register", {
        email: form.email,
        username: form.username,
        name: form.username,
        password: form.password
      });

      console.log("Signup response:", response.data);

      // 👉 après inscription → vérification email / OTP
      Alert.alert(
        "Inscription réussie!",
        "Un code de vérification a été envoyé à votre email. Veuillez le vérifier pour activer votre compte."
      );
      router.replace({
        pathname: "/verify-email",
        params: { email: form.email, flow: "verify" }
      });
    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error response:", err.response?.data);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        (err.code === "ECONNABORTED"
          ? "La requête a expiré. Vérifie que le backend est en cours d'exécution."
          : "Erreur lors de la création du compte.");
      Alert.alert("Erreur", message);
    } finally {
      setUi((s) => ({ ...s, loading: false }));
    }
  }, [form, router]);

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={64}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/sign-up.png")}
              style={authStyles.image}
              contentFit='contain'
            />
          </View>

          <Text style={authStyles.title}>Create Account</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder='Username'
                placeholderTextColor={COLORS.textLight}
                value={form.username}
                onChangeText={onChange("username")}
                autoCapitalize='none'
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder='Email'
                placeholderTextColor={COLORS.textLight}
                value={form.email}
                onChangeText={onChange("email")}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder='Password'
                placeholderTextColor={COLORS.textLight}
                value={form.password}
                onChangeText={onChange("password")}
                secureTextEntry={!ui.showPassword}
                autoCapitalize='none'
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() =>
                  setUi((s) => ({ ...s, showPassword: !s.showPassword }))
                }
              >
                <Ionicons
                  name={ui.showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder='Confirm password'
                placeholderTextColor={COLORS.textLight}
                value={form.confirm}
                onChangeText={onChange("confirm")}
                secureTextEntry={!ui.showConfirm}
                autoCapitalize='none'
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() =>
                  setUi((s) => ({ ...s, showConfirm: !s.showConfirm }))
                }
              >
                <Ionicons
                  name={ui.showConfirm ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                ui.loading && authStyles.buttonDisabled
              ]}
              onPress={handleSignUp}
              disabled={ui.loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>
                {ui.loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} 
                onPress={() => router.replace("/(auth)/sign-in")}>
              <Text style={authStyles.linkText}>
                Already have an account ?{" "}
                <Text style={authStyles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;
