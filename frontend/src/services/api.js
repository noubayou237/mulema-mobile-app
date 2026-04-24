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
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Config ──
// Change cette URL selon ton environnement
// Local :    http://10.0.2.2:50001/api   (Android emulator)
//            http://localhost:3000/api    (iOS simulator)
// Production: https://api.mulema.app/api

<<<<<<< HEAD
const API_IP = process.env.EXPO_PUBLIC_API_IP || "172.20.10.04";
const BASE_URL = __DEV__
  ? `http://${API_IP}:5001`
  : "https://api.mulema.app/api";
=======
  if (__DEV__) {
    // 1. Prioritize explicit environment variable from .env
    const EXPO_PUBLIC_API_IP = process.env.EXPO_PUBLIC_API_IP;
    if (EXPO_PUBLIC_API_IP) {
      return `http://${EXPO_PUBLIC_API_IP}:5001`;
    }

    // 2. Fallback to auto-detection for physical devices
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
    return `http://${localhost}:5001`;
  }

  return "https://api.mulema.app/api";
};

const BASE_URL = getBaseUrl();
>>>>>>> 05d59aa94cded19d34e4805b2c7a1da2b701d38b

const STORAGE_KEY = "userSession";
const TIMEOUT = 10000;

// Synchronous flag — set/cleared together with AsyncStorage so that store
// fetch functions can guard against post-logout calls without async I/O.
let _sessionActive = false;
export const isSessionActive = () => _sessionActive;

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
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
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

    // Ignorer les requêtes d'authentification pour éviter de déclencher l'interceptor sur login/register
    const isAuthRequest = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh') || originalRequest.url?.includes('auth/register');

    // Si ce n'est pas un 401, si c'est déjà un retry, ou si c'est une route d'auth → rejeter
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRequest) {
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
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);

      if (!raw || !JSON.parse(raw)?.refreshToken) {
        return Promise.reject(error);
      }

      const session = JSON.parse(raw);

      // Appel refresh — utilise axios directement (pas l'instance api)
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: session.refreshToken,
      });

      // Sauvegarder les nouveaux tokens
      const newSession = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || session.refreshToken,
      };
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(newSession));

      // Débloquer la queue
      processQueue(null, data.accessToken);

      // Retry la requête originale
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh échoué → déconnecter l'utilisateur
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync(STORAGE_KEY);

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

export const saveSession = async (tokens) => {
  _sessionActive = true;
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
};

export const clearSession = async () => {
  _sessionActive = false;
  await SecureStore.deleteItemAsync(STORAGE_KEY);
};

export const getSession = async () => {
  try {
    // Primary: read from encrypted storage
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.accessToken) _sessionActive = true;
      return session;
    }

    // Migration: silently move tokens saved by older app versions from
    // AsyncStorage to SecureStore so existing users are not logged out.
    const legacyRaw = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacyRaw) {
      await SecureStore.setItemAsync(STORAGE_KEY, legacyRaw);
      await AsyncStorage.removeItem(STORAGE_KEY);
      const session = JSON.parse(legacyRaw);
      if (session?.accessToken) _sessionActive = true;
      return session;
    }

    return null;
  } catch {
    return null;
  }
};

export default api;