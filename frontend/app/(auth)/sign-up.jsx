import React, { useState, useCallback } from "react";
import {
  Alert,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

const MIN_PASSWORD = 6;

const SignUpScreen = () => {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [ui, setUi] = useState({
    showPassword: false,
    showConfirm: false,
    loading: false,
  });

  const onChange = (key) => (val) => setForm((s) => ({ ...s, [key]: val }));

  const validate = () => {
    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirm) {
      return "Remplis tous les champs obligatoires.";
    }
    if (/\s/.test(form.username)) return "Le nom d'utilisateur ne doit pas contenir d'espaces.";
    if (form.password.length < MIN_PASSWORD) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`;
    if (form.password !== form.confirm) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleSignUp = useCallback(async () => {
    const error = validate();
    if (error) return Alert.alert("Erreur", error);

    if (!isLoaded || !signUp) {
      console.warn("Clerk not ready:", { isLoaded, signUp });
      return Alert.alert("Erreur", "Service d'authentification non prêt. Réessaye plus tard.");
    }

    if (typeof signUp.create !== "function") {
      console.error("signUp.create missing", signUp);
      return Alert.alert("Erreur", "Problème SDK Clerk — méthode manquante.");
    }

    setUi((s) => ({ ...s, loading: true }));

    try {
      // create user (Clerk sign-up)
      const created = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        username: form.username,
      });

      console.log("signUp.create response:", created);

      // send verification code by email (email_code strategy)
      try {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } catch (prepErr) {
        // non-blocking: still navigate to verification screen so user can request/enter code
        console.warn("prepareEmailAddressVerification failed:", prepErr);
      }

      // navigate to VerifyEmail screen; pass whatever you need (email, signUpId if needed)
      router.push(`/verify-email1?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      console.error("SignUp error raw:", err);
      const message =
        err?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Erreur inconnue lors de la création du compte.";
      Alert.alert("Erreur", message);
    } finally {
      setUi((s) => ({ ...s, loading: false }));
    }
  }, [form, isLoaded, signUp, router]);

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={authStyles.imageContainer}>
            <Image source={require("../../assets/images/sign-up.png")} style={authStyles.image} contentFit="contain" />
          </View>

          <Text style={authStyles.title}>Create Account</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Username"
                placeholderTextColor={COLORS.textLight}
                value={form.username}
                onChangeText={onChange("username")}
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Email"
                placeholderTextColor={COLORS.textLight}
                value={form.email}
                onChangeText={onChange("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Password"
                placeholderTextColor={COLORS.textLight}
                value={form.password}
                onChangeText={onChange("password")}
                secureTextEntry={!ui.showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={authStyles.eyeButton} onPress={() => setUi((s) => ({ ...s, showPassword: !s.showPassword }))}>
                <Ionicons name={ui.showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Confirm password"
                placeholderTextColor={COLORS.textLight}
                value={form.confirm}
                onChangeText={onChange("confirm")}
                secureTextEntry={!ui.showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity style={authStyles.eyeButton} onPress={() => setUi((s) => ({ ...s, showConfirm: !s.showConfirm }))}>
                <Ionicons name={ui.showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, ui.loading && authStyles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={ui.loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>{ui.loading ? "Creating Account..." : "Sign Up"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.push("/sign-in")}>
              <Text style={authStyles.linkText}>
                Already have an account ? <Text style={authStyles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpScreen;
