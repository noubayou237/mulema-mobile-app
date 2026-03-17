// src/hooks/useSocialLogin.js
import { useState, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { Platform } from "react-native";
import api from "../../services/api";

// Dynamically import Apple Auth to handle case where module is not available
// On Android and Web, Apple Sign-In is not supported
let AppleAuth = null;
try {
  AppleAuth = require("expo-apple-authentication");
} catch (error) {
  console.warn("expo-apple-authentication is not available on this platform");
}

// Environment variables - only imported here to prevent exposure
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

// Expo username and app slug from environment variables (not exposed to client)
// Note: EXPO_USERNAME and APP_SLUG are defined but kept for future use
// const EXPO_USERNAME = process.env.EXPO_PUBLIC_EXPO_USERNAME;
// const APP_SLUG = process.env.EXPO_PUBLIC_APP_SLUG || "mulema";

export const useSocialLogin = () => {
  const [loading, setLoading] = useState(null); // 'google' | 'facebook' | 'apple' | null

  // Google Auth - Use explicit redirect URI to match Google Console
  const [googleRequest, , googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: "https://auth.expo.io/@leila237/mulema"
  });

  // Facebook Auth - Use explicit redirect URI
  const [fbRequest, , fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: "https://auth.expo.io/@leila237/mulema"
  });

  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading("google");
      const result = await googlePromptAsync();

      if (result?.type === "success") {
        // Get user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization: `Bearer ${result.authentication.accessToken}`
            }
          }
        );
        const userInfo = await userInfoResponse.json();

        // Send to your backend
        const response = await api.post("/auth/google", {
          idToken: result.authentication.idToken,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        });

        return { success: true, data: response.data };
      }
      return { success: false, cancelled: result?.type === "cancel" };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(null);
    }
  }, [googlePromptAsync]);

  const handleFacebookLogin = useCallback(async () => {
    try {
      setLoading("facebook");
      const result = await fbPromptAsync();

      if (result?.type === "success") {
        // Get user info from Facebook
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${result.authentication.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        // Send to your backend
        const response = await api.post("/auth/facebook", {
          accessToken: result.authentication.accessToken,
          facebookId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture?.data?.url
        });

        return { success: true, data: response.data };
      }
      return { success: false, cancelled: result?.type === "cancel" };
    } catch (error) {
      console.error("Facebook login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(null);
    }
  }, [fbPromptAsync]);

  const handleAppleLogin = useCallback(async () => {
    try {
      setLoading("apple");

      // Check if Apple Auth is available
      if (!AppleAuth) {
        return {
          success: false,
          error: "Apple Sign-In is not available on this platform"
        };
      }

      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL
        ]
      });

      // Send to your backend
      const response = await api.post("/auth/apple", {
        identityToken: credential.identityToken,
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName
      });

      return { success: true, data: response.data };
    } catch (error) {
      // Apple Sign In is cancelled by user pressing cancel button
      if (error.code === "ERROR_CANCELLED") {
        return { success: false, cancelled: true };
      }
      console.error("Apple login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(null);
    }
  }, []);

  return {
    loading,
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    googleReady: !!googleRequest,
    facebookReady: !!fbRequest,
    isAppleAvailable: AppleAuth !== null && Platform.OS === "ios"
  };
};

export default useSocialLogin;
