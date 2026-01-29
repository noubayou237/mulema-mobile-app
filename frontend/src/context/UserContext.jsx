// src/context/UserContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../../services/api"; // ou ../api/api selon ton projet

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

const UserContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export default function UserProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Bootstrap session
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          const res = await api.get("/auth/me");
          setUser(res.data);
        }
      } catch {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
        ]);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    await AsyncStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      res.data.accessToken
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      res.data.refreshToken
    );

    const me = await api.get("/auth/me");
    setUser(me.data);

    router.replace("/(tabs)");
  };

  // ❌ LOGOUT
  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (e) {
      // silencieux
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
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
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
