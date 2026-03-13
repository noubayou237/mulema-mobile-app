// src/components/SocialButtons.jsx
import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import useSocialLogin from "../hooks/useSocialLogin";

const SocialButtons = ({ onSuccess }) => {
  const { t } = useTranslation();
  const {
    loading,
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    isAppleAvailable
  } = useSocialLogin();

  const handleLogin = async (provider) => {
    let result;

    switch (provider) {
      case "google":
        result = await handleGoogleLogin();
        break;
      case "facebook":
        result = await handleFacebookLogin();
        break;
      case "apple":
        result = await handleAppleLogin();
        break;
      default:
        return;
    }

    if (result?.success && onSuccess) {
      onSuccess(result.data);
    }
  };

  const isLoading = (provider) => loading === provider;

  return (
    <View style={styles.container}>
      <Text style={styles.dividerText}>{t("auth.orContinueWith")}</Text>

      <View style={styles.buttonsRow}>
        {/* Google */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleLogin("google")}
          disabled={!!loading}
          accessibilityLabel={t("auth.signInWithGoogle")}
          accessibilityRole='button'
        >
          {isLoading("google") ? (
            <ActivityIndicator size='small' color='#4285F4' />
          ) : (
            <Ionicons name='logo-google' size={24} color='#4285F4' />
          )}
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleLogin("facebook")}
          disabled={!!loading}
          accessibilityLabel={t("auth.signInWithFacebook")}
          accessibilityRole='button'
        >
          {isLoading("facebook") ? (
            <ActivityIndicator size='small' color='#1877F2' />
          ) : (
            <Ionicons name='logo-facebook' size={24} color='#1877F2' />
          )}
        </TouchableOpacity>

        {/* Apple - only available on iOS */}
        {isAppleAvailable && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleLogin("apple")}
            disabled={!!loading}
            accessibilityLabel={t("auth.signInWithApple")}
            accessibilityRole='button'
          >
            {isLoading("apple") ? (
              <ActivityIndicator size='small' color='#000' />
            ) : (
              <Ionicons name='logo-apple' size={24} color='#000' />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24
  },
  dividerText: {
    textAlign: "center",
    color: "#999",
    marginBottom: 16,
    fontSize: 14
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0"
  }
});

export default SocialButtons;
