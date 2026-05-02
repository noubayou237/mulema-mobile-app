/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — API Service (Axios)                                 ║
 * ║  Instance centralisée avec :                                  ║
 * ║  - JWT auto-inject sur chaque requête                         ║
 * ║  - Refresh token automatique sur 401                          ║
 * ║  - Timeout de 15s                                             ║
 * ║  - Gestion d'erreurs propre                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// ── Config ──

const getBaseUrl = () => {
  const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;
  if (EXPO_PUBLIC_API_URL) {
    return EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  if (__DEV__) {
    const EXPO_PUBLIC_API_IP = process.env.EXPO_PUBLIC_API_IP;
    if (EXPO_PUBLIC_API_IP) {
      return `http://${EXPO_PUBLIC_API_IP}:5001`;
    }

    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
    return `http://${localhost}:5001`;
  }

  return "https://mulema-mobile-app-production.up.railway.app";
};

const BASE_URL = getBaseUrl();
const STORAGE_KEY = "userSession";
const TIMEOUT = 10000;

// Synchronous flag — set/cleared together with AsyncStorage so that store
// fetch functions can guard against post-logout calls without async I/O.
let _sessionActive = false;
let _cachedAccessToken = null;
let _cachedRefreshToken = null;

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
    const start = Date.now();
    try {
      // Logic: Use memory cache if available, otherwise read from SecureStore
      if (!_cachedAccessToken) {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          _cachedAccessToken = session?.accessToken;
          _cachedRefreshToken = session?.refreshToken;
          if (_cachedAccessToken) _sessionActive = true;
        }
      }

      if (_cachedAccessToken) {
        config.headers.Authorization = `Bearer ${_cachedAccessToken}`;
      }
      
      // Performance tagging for debug
      config.metadata = { startTime: start };
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
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    if (duration > 1000) {
      console.warn(`[API] Slow request: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`);
    }
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh') || originalRequest.url?.includes('auth/register');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

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

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = _cachedRefreshToken || (await getSession())?.refreshToken;

      if (!refreshToken) {
        return Promise.reject(error);
      }

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken,
      });

      _cachedAccessToken = data.accessToken;
      _cachedRefreshToken = data.refreshToken || refreshToken;

      const newSession = {
        accessToken: _cachedAccessToken,
        refreshToken: _cachedRefreshToken,
      };
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(newSession));

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearSession();
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
  _cachedAccessToken = tokens.accessToken;
  _cachedRefreshToken = tokens.refreshToken;
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
};

export const clearSession = async () => {
  _sessionActive = false;
  _cachedAccessToken = null;
  _cachedRefreshToken = null;
  await SecureStore.deleteItemAsync(STORAGE_KEY);
};

export const getSession = async () => {
  if (_cachedAccessToken) {
    return { accessToken: _cachedAccessToken, refreshToken: _cachedRefreshToken };
  }

  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      _cachedAccessToken = session?.accessToken;
      _cachedRefreshToken = session?.refreshToken;
      if (_cachedAccessToken) _sessionActive = true;
      return session;
    }

    const legacyRaw = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacyRaw) {
      await SecureStore.setItemAsync(STORAGE_KEY, legacyRaw);
      await AsyncStorage.removeItem(STORAGE_KEY);
      const session = JSON.parse(legacyRaw);
      _cachedAccessToken = session?.accessToken;
      _cachedRefreshToken = session?.refreshToken;
      if (_cachedAccessToken) _sessionActive = true;
      return session;
    }

    return null;
  } catch {
    return null;
  }
};

export default api;