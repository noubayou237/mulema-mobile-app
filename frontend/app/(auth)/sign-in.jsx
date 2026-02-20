import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";

const SignInScreen = () => {
  const router = useRouter();
  const { login } = useUser();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("errors.requiredField"));
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Login function handles redirect to home
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("errors.invalidCredentials");
      Alert.alert(t("common.error"), msg);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    if (!email || !email.includes("@")) {
      Alert.alert(t("errors.invalidEmail"), t("errors.invalidEmail"));
      return;
    }

    router.push({
      pathname: "/verify-email",
      params: { email, flow: "reset" }
    });
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
              contentFit='contain'
            />
          </View>

          <Text style={authStyles.title}>{t("auth.welcomeBack")}</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder={t("auth.email")}
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder={t("auth.password")}
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize='none'
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
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                authStyles.authButton,
                loading && authStyles.buttonDisabled
              ]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={authStyles.buttonText}>
                {loading ? t("common.loading") : t("auth.signIn")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={authStyles.linkContainer}
              onPress={() => router.push("/sign-up")}
            >
              <Text style={authStyles.linkText}>
                {t("auth.dontHaveAccount")}{" "}
                <Text style={authStyles.link}>{t("auth.signUp")}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;
