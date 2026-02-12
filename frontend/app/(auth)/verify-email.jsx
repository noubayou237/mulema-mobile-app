import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authStyles } from "../../assets/styles/auth.styles";
import api from "../../services/api";

const RESEND_COOLDOWN = 60; // seconds
const STORAGE_KEY = "userSession";

const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

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
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    countdownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
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

    router.replace("/splash");
  };

  const handleVerification = async () => {
    // console.log("=== HANDLE VERIFICATION ===");
    // console.log("Email:", email);
    // console.log("Code:", code);
    // console.log("Flow:", flow);

    if (!code.trim()) {
      return Alert.alert(
        "Code required",
        "Please enter your verification code."
      );
    }

    setLoading(true);
    try {
      if (flow === "reset") {
        router.push({
          pathname: "/ResetPasswordScreen",
          params: { email, otpCode: code.trim() }
        });
      } else {
        // Signup verification - verify OTP and auto-login
        const response = await api.post("/auth/verify-email-and-login", {
          email,
          otpCode: code.trim()
        });

        Alert.alert("Succès", "Email vérifié! Connexion en cours...");
        await autoLogin(response.data);
      }
    } catch (err) {
      console.error("Verify error:", err);
      console.error("Error response:", err.response?.data);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Échec de la vérification. Vérifiez le code et réessayez.";
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
      Alert.alert("Envoyé", `Un nouveau code a été envoyé à ${email}`);
      startCountdown();
    } catch (err) {
      console.error("Resend error:", err);
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
                contentFit='contain'
              />
            </View>

            <Text style={authStyles.title}>
              {flow === "verify" ? "Vérifier l'email" : "Vérifier le code"}
            </Text>

            <Text style={styles.subtitle}>Code envoyé à: {email}</Text>

            <TextInput
              style={authStyles.textInput}
              placeholder='Entrez le code'
              value={code}
              onChangeText={setCode}
              keyboardType='number-pad'
              maxLength={6}
              textAlign='center'
              letterSpacing={8}
            />

            <TouchableOpacity
              style={authStyles.authButton}
              onPress={handleVerification}
              disabled={loading || code.length < 4}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Vérification..." : "Vérifier"}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.timerText}>
                {resendCooldown > 0
                  ? `Renvoyer dans ${formatTime(resendCooldown)}`
                  : "Vous n'avez pas reçu le code ?"}
              </Text>

              <TouchableOpacity
                onPress={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                style={[
                  styles.resendButton,
                  (resendLoading || resendCooldown > 0) &&
                    styles.resendButtonDisabled
                ]}
              >
                <Text
                  style={[
                    styles.resendText,
                    (resendLoading || resendCooldown > 0) &&
                      styles.resendTextDisabled
                  ]}
                >
                  {resendLoading ? "Envoi..." : "Renvoyer le code"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push("/sign-up")}
            >
              <Text style={authStyles.linkText}>
                Retour à <Text style={authStyles.link}>Inscription</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center"
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center"
  },
  timerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  resendButtonDisabled: {
    opacity: 0.6
  },
  resendText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600"
  },
  resendTextDisabled: {
    color: "#999"
  }
});

export default VerifyEmail;
