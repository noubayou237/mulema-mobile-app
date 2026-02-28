import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";

const RESEND_COOLDOWN = 60;
const STORAGE_KEY = "userSession";

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const email = params?.email || "";
  const flow = params?.flow || "reset";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const countdownRef = useRef(null);

  useEffect(() => {
    startCountdown();
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setResendCooldown(RESEND_COOLDOWN);

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const autoLogin = async (responseData) => {
    const { accessToken, refreshToken } = responseData;

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken, refreshToken })
    );

    router.replace("/ChoiceLanguage");
  };

  const handleVerification = async () => {
    if (!code.trim()) {
      return Alert.alert(
        t("errors.codeRequired"),
        t("errors.enterCode")
      );
    }

    setLoading(true);
    try {
      if (flow === "reset") {
        router.push({
          pathname: "/(auth)/ResetPasswordScreen",
          params: { email, otpCode: code.trim() },
        });
      } else {
        const response = await api.post(
          "/auth/verify-email-and-login",
          { email, otpCode: code.trim() }
        );

        Alert.alert("Succès", "Email vérifié!");
        await autoLogin(response.data);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Échec de la vérification.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    try {
      await api.post("/auth/request-otp", { email });
      Alert.alert("Envoyé", `Nouveau code envoyé à ${email}`);
      startCountdown();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Impossible de renvoyer le code.";
      Alert.alert("Erreur", msg);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          {/* Image */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/otp.png")}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <AppTitle className="mb-2 text-center">
            {flow === "verify"
              ? t("auth.verifyEmail")
              : t("auth.verifyCode")}
          </AppTitle>

          <AppText
            variant="muted"
            className="text-center mb-6"
          >
            {t("auth.codeSentTo")} {email}
          </AppText>

          {/* OTP Input */}
          <TextInput
            className="bg-card border border-border rounded-xl py-4 text-center text-xl tracking-[8px] text-foreground mb-6"
            placeholder="------"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* Verify Button */}
          <Button
            title="Vérifier"
            onPress={handleVerification}
            loading={loading}
          />

          {/* Resend Section */}
          <View className="mt-6 items-center">
            <AppText variant="muted" className="mb-2">
              {resendCooldown > 0
                ? `Renvoyer dans ${formatTime(resendCooldown)}`
                : "Vous n'avez pas reçu le code ?"}
            </AppText>

            <TouchableOpacity
              onPress={handleResend}
              disabled={
                resendLoading || resendCooldown > 0
              }
              className={`px-4 py-2 ${
                resendCooldown > 0
                  ? "opacity-50"
                  : ""
              }`}
            >
              <AppText className="text-primary font-semibold">
                {resendLoading
                  ? "Envoi..."
                  : "Renvoyer le code"}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Back */}
          <TouchableOpacity
            onPress={() =>
              router.replace("/(auth)/sign-up")
            }
            className="mt-8 items-center"
          >
            <AppText variant="muted">
              Retour à{" "}
              <AppText className="text-primary">
                Inscription
              </AppText>
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}