import React, { useState, useCallback } from "react";
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import api from "../../services/api";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import AuthInput from "../components/ui/AuthInput";
import Button from "../components/ui/Button";

const MIN_PASSWORD = 6;

export default function SignUpScreen() {
  const router = useRouter();

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

  const onChange = (key) => (val) =>
    setForm((s) => ({ ...s, [key]: val }));

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
      await api.post("/auth/register", {
        email: form.email,
        username: form.username,
        name: form.username,
        password: form.password,
      });

      Alert.alert(
        "Inscription réussie!",
        "Un code de vérification a été envoyé à votre email."
      );

      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: form.email, flow: "verify" },
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la création du compte.";
      Alert.alert("Erreur", message);
    } finally {
      setUi((s) => ({ ...s, loading: false }));
    }
  }, [form, router]);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/sign-up.png")}
              style={{ width: 110, height: 110 }}
              contentFit="contain"
            />
          </View>

          <AppTitle className="mb-6">
            Create Account
          </AppTitle>

          {/* Username */}
          <AuthInput
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChangeText={onChange("username")}
          />

          {/* Email */}
          <AuthInput
            label="Email"
            placeholder="Enter your email"
            value={form.email}
            onChangeText={onChange("email")}
            keyboardType="email-address"
          />

          {/* Password */}
          <View className="relative">
            <AuthInput
              label="Password"
              placeholder="Enter password"
              value={form.password}
              onChangeText={onChange("password")}
              secureTextEntry={!ui.showPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setUi((s) => ({
                  ...s,
                  showPassword: !s.showPassword,
                }))
              }
              className="absolute right-4 top-10"
            >
              <Ionicons
                name={
                  ui.showPassword
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View className="relative">
            <AuthInput
              label="Confirm Password"
              placeholder="Confirm password"
              value={form.confirm}
              onChangeText={onChange("confirm")}
              secureTextEntry={!ui.showConfirm}
            />

            <TouchableOpacity
              onPress={() =>
                setUi((s) => ({
                  ...s,
                  showConfirm: !s.showConfirm,
                }))
              }
              className="absolute right-4 top-10"
            >
              <Ionicons
                name={
                  ui.showConfirm
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Button */}
          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={ui.loading}
          />

          {/* Sign In */}
          <TouchableOpacity
            onPress={() =>
              router.replace("/(auth)/sign-in")
            }
            className="mt-6 items-center"
          >
            <AppText variant="muted">
              Already have an account?{" "}
              <AppText className="text-primary">
                Sign In
              </AppText>
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}