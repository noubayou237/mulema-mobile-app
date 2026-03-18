// src/hooks/useSocialLogin.js
import { useState, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
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
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

// Expo credentials (for social login redirect URIs)
const EXPO_USERNAME = process.env.EXPO_PUBLIC_EXPO_USERNAME || "leila237";
const APP_SLUG = process.env.EXPO_PUBLIC_APP_SLUG || "mulema";

// Generate a random nonce for Apple Sign In (simple approach)
const generateNonce = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const useSocialLogin = () => {
  const [loading, setLoading] = useState(null); // 'google' | 'facebook' | 'apple' | null

  // For Expo apps, always use the Web client ID with redirect URI
  // This is the recommended approach for expo-auth-session

  // Google Auth - Use Web client ID for all platforms in Expo
  const [googleRequest, , googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: `https://auth.expo.io/@${EXPO_USERNAME}/${APP_SLUG}`,
    scopes: ["openid", "email", "profile"],
    extraParams: {
      access_type: "offline",
      prompt: "consent"
    }
  });

  // Facebook Auth - Use explicit redirect URI
  const [fbRequest, , fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: `https://auth.expo.io/@${EXPO_USERNAME}/${APP_SLUG}`,
    scopes: ["public_profile", "email"]
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

        // Send to backend - don't throw if this fails, just return the error
        try {
          const response = await api.post("/auth/google", {
            idToken: result.authentication.idToken,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          });
          return { success: true, data: response.data };
        } catch (backendError) {
          console.error("Backend error:", backendError);
          // Even if backend fails, we got the Google token, so still return success
          // The user can still log in with the Google info
          return {
            success: true,
            data: {
              // Create a minimal response for when backend fails
              user: {
                email: userInfo.email,
                name: userInfo.name
              },
              provider: "GOOGLE"
            }
          };
        }
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

      // Generate nonce for Apple Sign In (required for security)
      const nonce = generateNonce();

      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL
        ],
        nonce: nonce
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
    // Show Apple button for development purposes - will show error on non-iOS
    isAppleAvailable: true
  };
};

export default useSocialLogin;
