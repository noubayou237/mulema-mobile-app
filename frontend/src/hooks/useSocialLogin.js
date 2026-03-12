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
