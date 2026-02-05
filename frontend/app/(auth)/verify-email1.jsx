import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import { authStyles } from "../../assets/styles/auth.styles";

const VerifyEmailScreen = () => {
  const { isLoaded, signUp } = useSignUp();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [code, setCode] = useState("");
  const email = params?.email || "";

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert("Erreur", "Entre le code reçu par email.");
      return;
    }

    if (!isLoaded || !signUp) {
      Alert.alert("Erreur", "Service d'authentification non prêt.");
      return;
    }

    try {
      await signUp.attemptEmailAddressVerification({ code });

      Alert.alert("Succès", "Email vérifié.");

      // 🔥 FLOW APK : OTP → CHOIX DE LANGUE
      router.replace("/ChoiceLanguage");
    } catch (err) {
      console.error("Verify error:", err);
      Alert.alert("Erreur", err?.message || "Échec de la vérification.");
    }
  };

  const resend = async () => {
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      Alert.alert("Envoyé", `Un nouveau code a été envoyé à ${email}`);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de renvoyer le code.");
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={64}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent}>
          <View style={authStyles.container}>
            <View style={authStyles.imageContainer}>
              <Image
                source={require("../../assets/images/otp.png")}
                style={authStyles.image}
                contentFit="contain"
              />
            </View>

            <Text style={authStyles.title}>Vérifier l'email</Text>
            <Text style={{ marginBottom: 12 }}>
              Code envoyé à : {email}
            </Text>

            <TextInput
              style={authStyles.textInput}
              placeholder="Entrez le code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={authStyles.authButton}
              onPress={handleVerify}
            >
              <Text style={authStyles.buttonText}>Vérifier</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resend} style={{ marginTop: 10 }}>
              <Text style={authStyles.link}>Renvoyer le code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.replace("/(auth)/sign-up")}
            >
              <Text style={authStyles.linkText}>
                Back to <Text style={authStyles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmailScreen;
