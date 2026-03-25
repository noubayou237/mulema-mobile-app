<<<<<<< HEAD
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

// Generate a random nonce for Apple Sign In
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
          // Check if it's a network error (backend not running)
          if (
            backendError.code === "ECONNREFUSED" ||
            backendError.code === "TIMEOUT" ||
            backendError.message?.includes("Network")
          ) {
            return {
              success: false,
              error:
                "Backend server is not running. Please start the backend or check your connection."
            };
          }
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
=======
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-facebook";
import {
  isAvailableAsync,
  signInAsync,
  AppleAuthenticationScope
} from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { env } from "../env";

const SESSION_KEY = "userSession";

// Google configuration - Using environment variables for security
// These values are securely imported from the validated env object
const GOOGLE_CLIENT_ID = env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

// Facebook configuration - Using environment variable
const FACEBOOK_APP_ID = env.EXPO_PUBLIC_FACEBOOK_APP_ID;

export function useGoogleLogin() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["profile", "email"],
    useProxy: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleGoogleLogin = useCallback(async (accessToken) => {
    setLoading(true);
    setError(null);
    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const userInfo = await userInfoResponse.json();

      // Send to backend
      const { data } = await api.post("/auth/social-login", {
        provider: "GOOGLE",
        providerId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        username: userInfo.given_name
      });

      // Store session
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        })
      );

      const loginResult = {
        success: true,
        isNewUser: data.isNewUser,
        user: data.user
      };
      setResult(loginResult);
      return loginResult;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Google login failed";
      setError(errorMessage);
      const errorResult = { success: false, error: errorMessage };
      setResult(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleLogin(response.authentication.accessToken).catch((err) => {
        const errorMessage = err?.message || "Google login failed";
        setError(errorMessage);
        setResult({ success: false, error: errorMessage });
      });
    } else if (response?.type === "error") {
      const errorMessage =
        response.error?.message || "Google authentication failed";
      setError(errorMessage);
      setResult({ success: false, error: errorMessage });
    }
  }, [response, handleGoogleLogin]);

  const signIn = async () => {
    setError(null);
    setResult(null);

    try {
      await promptAsync();
      // Return the result that will be set by the useEffect
      // We need to wait a bit for the async operation to complete
      return new Promise((resolve) => {
        // Check every 100ms if we have a result
        const checkResult = () => {
          if (result) {
            resolve(result);
          } else if (error) {
            resolve({ success: false, error: error });
          } else {
            setTimeout(checkResult, 100);
          }
        };
        // Start checking after a short delay
        setTimeout(checkResult, 500);
      });
    } catch (err) {
      const errorMessage = err?.message || "Failed to initiate Google login";
      return { success: false, error: errorMessage };
    }
  };

  return { signIn, loading, error, result };
}

// Facebook Login
export function useFacebookLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to extract error message from various error types
  const extractErrorMessage = (err) => {
    if (!err) return "Unknown error";

    // If it's a string, return it
    if (typeof err === "string") return err;

    // If it has a message property that's a string
    if (err.message && typeof err.message === "string") return err.message;

    // If it's a native error with toString method
    if (err.toString && typeof err.toString === "function") {
      const str = err.toString();
      if (typeof str === "string") return str;
    }

    // Try to get message from response data
    if (err.response?.data?.message) {
      const msg = err.response.data.message;
      return typeof msg === "string" ? msg : JSON.stringify(msg);
    }

    // Fallback to generic message
    return "Facebook login failed";
  };

  const signIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await Facebook.initializeAsync({
        appId: FACEBOOK_APP_ID
      });

      const { type, token } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ["public_profile", "email"]
      });

      if (type === "success") {
        // Get user info from Facebook
        const response = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`
        );
        const userInfo = await response.json();

        // Send to backend
        const { data } = await api.post("/auth/social-login", {
          provider: "FACEBOOK",
          providerId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name
        });

        // Store session
        await AsyncStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          })
        );

        return { success: true, isNewUser: data.isNewUser, user: data.user };
      }

      return { success: false, error: "Facebook login was cancelled" };
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}

// Apple Sign-In
export function useAppleLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check if Apple Sign-In is available
    isAvailableAsync()
      .then(setIsAvailable)
      .catch(() => setIsAvailable(false));
  }, []);

  const signIn = async () => {
    if (!isAvailable) {
      setError("Apple Sign-In is not available on this device");
      return { success: false, error: "Not available" };
    }

    setLoading(true);
    setError(null);

    try {
      const credential = await signInAsync({
        requestedScopes: [
          AppleAuthenticationScope.FULL_NAME,
          AppleAuthenticationScope.EMAIL
        ]
      });

      // Send to backend
      const { data } = await api.post("/auth/social-login", {
        provider: "APPLE",
        providerId: credential.user,
        email: credential.email,
        name: credential.fullName?.givenName || "Apple User"
      });

      // Store session
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        })
      );

      return { success: true, isNewUser: data.isNewUser, user: data.user };
    } catch (err) {
      // Apple Sign-In can be cancelled by user
      if (err.code === "ERR_CANCELLED") {
        return { success: false, error: "Cancelled" };
      }
      setError(err?.message || "Apple login failed");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error, isAvailable };
}
>>>>>>> feat/settings-page
