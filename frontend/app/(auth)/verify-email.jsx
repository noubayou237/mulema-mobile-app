// VerifyEmail.jsx
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View, TextInput, TouchableOpacity } from "react-native";
import { useSignUp, useSignIn } from "@clerk/clerk-expo";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { authStyles } from "../../assets/styles/auth.styles";

const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email = "", flow = "reset" } = params;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: signInLoaded, signIn } = useSignIn();

  const handleVerification = async () => {
  if (!code || !code.trim()) {
    return Alert.alert("Code required", "Please enter your verification code.");
  }

  setLoading(true);
  try {
    if (!signInLoaded) {
      Alert.alert("Wait", "Authentication not ready yet.");
      return;
    }

    // Vérifie le code OTP
    await signIn.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code: code.trim(),
    });

    // Redirection simplifiée
    router.push({ pathname: "/ResetPasswordScreen", params: { email } });
  } catch (err) {
    const msg = err?.errors?.[0]?.message || err?.message || "Verification failed.";
    Alert.alert("Error", msg);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={authStyles.keyboardView} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={authStyles.scrollContent}>

          <View style={authStyles.container}>
            <View style={authStyles.imageContainer}>
              <Image source={require("../../assets/images/otp.png")} style={authStyles.image} contentFit="contain" />
            </View>

            <Text style={authStyles.title}>{flow === "signup" ? "Verify Your Email" : "Verify Reset Code"}</Text>
            <Text style={authStyles.subtitle}>
              {flow === "signup"
                ? `We've sent a verification code to (${email})`
                : `Enter the reset code sent to (${email})`}
            </Text>
            <TextInput
              style={authStyles.textInput}
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={8}
            />
            <View></View>

            <TouchableOpacity style={authStyles.authButton} onPress={handleVerification} disabled={loading}>
              <Text style={authStyles.buttonText}>{loading ? "Please wait..." : "Verify"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.push("/sign-in")}>
              <Text style={authStyles.linkText}>
                Back to <Text style={authStyles.link}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;
