import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-facebook";
import {
  isAvailableAsync,
  signInAsync,
  AppleAuthenticationScope
} from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import api from "@/services/api";

const SESSION_KEY = "userSession";

// Google configuration - Replace with your actual Google Cloud credentials
export const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "YOUR_GOOGLE_IOS_CLIENT_ID";
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  "YOUR_GOOGLE_ANDROID_CLIENT_ID";

// Facebook configuration 
export const FACEBOOK_APP_ID =
  process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";

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

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleLogin(response.authentication.accessToken).catch((err) =>
        setError(err?.message || err)
      );
    } else if (response?.type === "error") {
      setError(response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken) => {
    setLoading(true);
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

      return { success: true, isNewUser: data.isNewUser, user: data.user };
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setError(null);
    await promptAsync();
  };

  return { signIn, loading, error };
}

// Facebook Login
export function useFacebookLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err?.message || "Facebook login failed");
      return { success: false, error: err };
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
