import React, { useState } from "react";
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import AuthInput from "../components/ui/AuthInput";
import Button from "../components/ui/Button";

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useUser();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert(t("common.error"), t("errors.requiredField"));
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Sign in failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    if (!email || !email.includes("@")) {
      return Alert.alert("Invalid Email", "Enter a valid email first.");
    }

    router.push({
      pathname: "/(auth)/ResetPasswordScreen",
      params: { email },
    });
  };

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
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 100, height: 100 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <AppTitle className="mb-6">
            {t("auth.welcomeBack")}
          </AppTitle>

          {/* Form */}
          <View>
            <AuthInput
              label="Email"
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View className="relative">
              <AuthInput
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10"
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={onForgotPassword}
              className="items-end mb-4"
            >
              <AppText variant="muted" className="underline">
                Forgot password?
              </AppText>
            </TouchableOpacity>

            {/* Button */}
            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
            />

            {/* Sign Up */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              className="mt-6 items-center"
            >
              <AppText variant="muted">
                Don’t have an account?{" "}
                <AppText className="text-primary">
                  Sign up
                </AppText>
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}