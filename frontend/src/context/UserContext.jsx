// src/context/UserContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const USER_SESSION_KEY = "userSession";

// Structure par défaut du contexte
const UserContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

/**
 * Provider principal
 */
export default function UserProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 🔄 Au démarrage, on essaie de recharger une session si elle existe
   */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_SESSION_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("UserProvider: error reading session", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /**
   * 👉  Login user (session saved)
   *  - userData = { id, email, token, ... }
   */
  const login = async (userData) => {
    try {
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.warn("UserProvider: login error", e);
    }
  };

  /**
   * 👉  Mise à jour partielle de l'utilisateur
   */
  const updateUser = async (data) => {
    try {
      const newUser = { ...user, ...data };
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (e) {
      console.warn("UserProvider: updateUser error", e);
    }
  };

  /**
   * ❌ Déconnexion
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      setUser(null);
      router.replace("/auth/login"); // ou autre route
    } catch (e) {
      console.warn("UserProvider: logout error", e);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook personnalisé pour accéder facilement au contexte utilisateur
 */
export function useUser() {
  return useContext(UserContext);
}
