import React, { useState } from "react";
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { Image } from "expo-image";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";

export default function VerifyEmailScreen() {
  const { isLoaded, signUp } = useSignUp();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [code, setCode] = useState("");
  const email = params?.email || "";

  const handleVerify = async () => {
    if (!code.trim()) {
      return Alert.alert("Erreur", "Entre le code reçu par email.");
    }

    if (!isLoaded || !signUp) {
      return Alert.alert(
        "Erreur",
        "Service d'authentification non prêt."
      );
    }

    try {
      await signUp.attemptEmailAddressVerification({ code });

      Alert.alert("Succès", "Email vérifié.");
      router.replace("/ChoiceLanguage");
    } catch (err) {
      Alert.alert(
        "Erreur",
        err?.message || "Échec de la vérification."
      );
    }
  };

  const resend = async () => {
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      Alert.alert(
        "Envoyé",
        `Un nouveau code a été envoyé à ${email}`
      );
    } catch (e) {
      Alert.alert(
        "Erreur",
        "Impossible de renvoyer le code."
      );
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          {/* Image */}
          <View className="items-center mb-6">
            <Image
              source={require("../../assets/images/otp.png")}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
          </View>

          <AppTitle className="mb-2 text-center">
            Vérifier l'email
          </AppTitle>

          <AppText
            variant="muted"
            className="text-center mb-6"
          >
            Code envoyé à : {email}
          </AppText>

          {/* OTP Input */}
          <TextInput
            className="bg-card border border-border rounded-xl py-4 text-center text-xl tracking-[6px] text-foreground mb-6"
            placeholder="------"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title="Vérifier"
            onPress={handleVerify}
          />

          <TouchableOpacity
            onPress={resend}
            className="mt-4 items-center"
          >
            <AppText className="text-primary font-semibold">
              Renvoyer le code
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.replace("/(auth)/sign-up")
            }
            className="mt-8 items-center"
          >
            <AppText variant="muted">
              Back to{" "}
              <AppText className="text-primary">
                Sign up
              </AppText>
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}