/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — API Service (Axios)                                 ║
 * ║  Instance centralisée avec :                                  ║
 * ║  - JWT auto-inject sur chaque requête                         ║
 * ║  - Refresh token automatique sur 401                          ║
 * ║  - Timeout de 15s                                             ║
 * ║  - Gestion d'erreurs propre                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import api from "@/services/api";
 *    const { data } = await api.get("/languages");
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Constants from "expo-constants";

// ── Config ──
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // Try to auto-detect host IP for physical device testing
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
    return `http://${localhost}:5001`;
  }

  return "https://api.mulema.app/api";
};

const BASE_URL = getBaseUrl();

const STORAGE_KEY = "userSession";
const TIMEOUT = 15000;

// ── Instance Axios ──

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ═══════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR — Ajoute le JWT à chaque requête
// ═══════════════════════════════════════════════════════════════

api.interceptors.request.use(
  async (config) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      }
    } catch {
      // Silently fail — pas de token = requête sans auth
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR — Gère les 401 (token expiré)
// ═══════════════════════════════════════════════════════════════

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // Succès — retourne directement
  (response) => response,

  // Erreur
  async (error) => {
    const originalRequest = error.config;

    // Si ce n'est pas un 401 ou si c'est déjà un retry → rejeter
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si on est déjà en train de refresh → mettre en queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Tenter le refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error("No session");

      const session = JSON.parse(raw);
      if (!session?.refreshToken) throw new Error("No refresh token");

      // Appel refresh — utilise axios directement (pas l'instance api)
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: session.refreshToken,
      });

      // Sauvegarder les nouveaux tokens
      const newSession = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || session.refreshToken,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

      // Débloquer la queue
      processQueue(null, data.accessToken);

      // Retry la requête originale
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh échoué → déconnecter l'utilisateur
      processQueue(refreshError, null);
      await AsyncStorage.removeItem(STORAGE_KEY);

      // Note : le useAuthStore détectera l'absence de token au prochain check
      // et redirigera vers sign-in
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Sauvegarde les tokens dans AsyncStorage.
 * Appelé par useAuthStore après login/register.
 */
export const saveSession = async (tokens) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

/**
 * Supprime la session de AsyncStorage.
 * Appelé par useAuthStore.logout().
 */
export const clearSession = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

/**
 * Lit la session depuis AsyncStorage.
 * Appelé par useAuthStore.loadSession() au démarrage.
 */
export const getSession = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default api;