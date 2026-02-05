import React, { useState } from "react";
import {
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

const SignInScreen = () => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLoaded) {
      Alert.alert("Wait", "Authentication not ready yet.");
      return;
    }

    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
        });

        // ✅ LOGIN → HOME DIRECT
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Error", "Sign in not complete.");
      }
    } catch (err) {
      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Sign in failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email first.");
      return;
    }

    if (!isLoaded) {
      Alert.alert("Wait", "Authentication not ready yet.");
      return;
    }

    try {
      setLoading(true);
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      router.push({
        pathname: "/verify-email",
        params: { email, flow: "reset" },
      });

      Alert.alert(
        "Check your inbox",
        `A verification code was sent to ${email}`
      );
    } catch (err) {
      const msg =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to send reset code.";
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Welcome</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onForgotPassword}
              style={{ alignSelf: "flex-end", marginBottom: 12 }}
            >
              <Text style={[authStyles.link, { fontSize: 13 }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Sign In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push("/sign-up")}
            >
              <Text style={authStyles.linkText}>
                Don't have an account?{" "}
                <Text style={authStyles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;
