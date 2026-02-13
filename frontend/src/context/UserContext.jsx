// src/context/UserContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../../services/api"; // ou ../api/api selon ton projet

const STORAGE_KEY = "userSession"; // Single key for session storage

const UserContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {}
});

export default function UserProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
