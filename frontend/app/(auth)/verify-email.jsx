import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { authStyles } from "../../assets/styles/auth.styles";
import api from "../../services/api";

const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = params?.email || "";
  const flow = params?.flow || "reset";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!code.trim()) {
      return Alert.alert("Code required", "Please enter your verification code.");
    }

    setLoading(true);
    try {
      if (flow === "reset") {
        // 👉 on ne reset PAS ici, on vérifie juste le code
        router.push({
          pathname: "/ResetPasswordScreen",
          params: { email, otpCode: code.trim() },
        });
      } else {
        // flow signup (optionnel pour plus tard)
        Alert.alert("Success", "Email verified. You can sign in.");
        router.replace("/sign-in");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Verification failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
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

            <Text style={authStyles.title}>
              {flow === "verify"
                ? "Verify Your Email"
                : "Verify Reset Code"}
            </Text>

            <Text style={authStyles.subtitle}>
              {flow === "verify"
                ? `We've sent a verification code to (${email})`
                : `Enter the reset code sent to (${email})`}
            </Text>

            <TextInput
              style={authStyles.textInput}
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={authStyles.authButton}
              onPress={handleVerification}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Please wait..." : "Verify"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push("/sign-in")}
            >
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
