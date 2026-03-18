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
import Svg, { G, Path } from "react-native-svg";
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
            <Svg width={24} height={24} viewBox='0 0 16 16'>
              <G fill='none' fillRule='evenodd'>
                <Path
                  d='M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86'
                  fill='#F44336'
                  opacity='.987'
                />
                <Path
                  d='M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92'
                  fill='#FFC107'
                  opacity='.997'
                />
                <Path
                  d='M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49'
                  fill='#448AFF'
                  opacity='.999'
                />
                <Path
                  d='M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z'
                  fill='#43A047'
                  opacity='.993'
                />
              </G>
            </Svg>
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

        {/* Apple Sign In */}
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
    gap: 16,
    marginBottom: 24
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
