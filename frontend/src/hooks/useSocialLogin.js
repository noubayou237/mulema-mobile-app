// src/hooks/useSocialLogin.js
import { useState, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AppleAuth from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";
import api from "../../services/api";

// Environment variables - only imported here to prevent exposure
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

export const useSocialLogin = () => {
  const [loading, setLoading] = useState(null); // 'google' | 'facebook' | 'apple' | null

  // Google Auth
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      redirectUri: makeRedirectUri({
        scheme: "mulema",
        path: "auth"
      })
    });

  // Facebook Auth
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: makeRedirectUri({
      scheme: "mulema",
      path: "auth"
    })
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

      const credential = await AppleAuth.signInAsync({
        requestedScopes: [AppleAuth.Scope.FULL_NAME, AppleAuth.Scope.EMAIL]
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
    isAppleAvailable: Platform.OS !== "web"
  };
};

export default useSocialLogin;
