// src/context/UserContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../../services/api";
import { changeLanguage, initializeLanguage } from "../i18n";

const STORAGE_KEY = "userSession"; // Single key for session storage

const UserContext = createContext({
  user: null,
  isLoading: true,
  language: "en",
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  setLanguage: async () => {}
});

export default function UserProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState("en");

  // 🔄 Initialize language on mount
  useEffect(() => {
    initializeAppLanguage();
  }, []);

  // Initialize language from storage
  const initializeAppLanguage = async () => {
    try {
      const savedLanguage = await initializeLanguage();
      setLanguageState(savedLanguage);
    } catch (error) {
      console.log("Error initializing language:", error);
    }
  };

  // 🔄 Bootstrap session
  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(STORAGE_KEY);
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed?.accessToken) {
            // Validate token with backend
            const res = await api.get("/auth/me");
            setUser(res.data);
          }
        }
      } catch {
        // Token invalid or expired - clear storage
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    // Store session as single object
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken
      })
    );

    // Get user data
    const me = await api.get("/auth/me");
    setUser(me.data);

    // Redirect to home
    router.replace("/(tabs)/home");
  };

  // ❌ LOGOUT
  const logout = async () => {
    console.log("UserContext: Logout started");
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEY);
      console.log("UserContext: Session found:", !!session);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.refreshToken) {
          console.log("UserContext: Calling /auth/logout");
          await api.post("/auth/logout", { refreshToken: parsed.refreshToken });
        }
      }
    } catch (e) {
      console.warn(
        "UserContext: Logout API error (continuing anyway):",
        e.message
      );
    } finally {
      console.log("UserContext: Clearing storage and redirecting");
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      router.replace("/(auth)/sign-in");
    }
  };

  // 🔄 REFRESH USER
  const refreshUser = async () => {
    try {
      const response = await api.get("/user/profile");
      setUser(response.data);
      return response.data;
    } catch (e) {
      console.warn("UserContext: Refresh user error:", e.message);
      throw e;
    }
  };

  // 🌐 CHANGE LANGUAGE
  const setLanguage = async (newLanguage) => {
    try {
      await changeLanguage(newLanguage);
      setLanguageState(newLanguage);

      // Optionally save to backend
      try {
        await api.put("/user/language", { language: newLanguage });
      } catch (error) {
        console.log("Error saving language to backend:", error.message);
      }
    } catch (error) {
      console.error("Error changing language:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        language,
        login,
        logout,
        refreshUser,
        setLanguage
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
