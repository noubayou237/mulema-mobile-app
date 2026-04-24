import Logger from "../utils/logger";
/**
 * MULEMA — useAuthStore
 * Adapté au backend qui retourne { accessToken, refreshToken } sans user
 */

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import api, { saveSession, clearSession, getSession } from "../services/api";
import { useLanguageStore } from "./useLanguageStore";
import { useThemeStore } from "./useThemeStore";
import { useDashboardStore } from "./useDashboardStore";

const USER_CACHE_KEY = "cachedUser";

const cacheUser = async (user) => {
  try {
    await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(user));
  } catch { }
};

const getCachedUser = async () => {
  try {
    const raw = await SecureStore.getItemAsync(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearCachedUser = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_CACHE_KEY);
  } catch { }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionLoaded: false,

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const session = await getSession();
      if (!session?.accessToken) {
        set({ isLoading: false, isSessionLoaded: true });
        return;
      }

      const { data: user } = await api.get("/auth/me");
      await cacheUser(user);

      set({
        user,
        token: session.accessToken,
        isAuthenticated: true,
        isLoading: false,
        isSessionLoaded: true,
      });
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        await clearSession();
        await clearCachedUser();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isSessionLoaded: true,
        });
      } else {
        // Non-auth error (timeout, 5xx) — backend temporarily unavailable.
        // Restore the last cached user so screens don't receive a null user
        // object and crash. Stay authenticated so the user isn't kicked out.
        const cachedUser = await getCachedUser();
        set({
          user: cachedUser,
          isAuthenticated: !!cachedUser,
          isLoading: false,
          isSessionLoaded: true,
        });
      }
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Backend retourne { accessToken, refreshToken } — PAS de user

    await saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    let user = null;
    try {
      const meResponse = await api.get("/auth/me");
      user = meResponse.data;
      await cacheUser(user);
    } catch (e) {
      Logger.warn("[AuthStore] GET /auth/me failed:", e);
    }

    set({
      user,
      token: data.accessToken,
      isAuthenticated: true,
    });

    return data;
  },

  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  loginWithTokens: async (tokens) => {
    // ✅ FIX: Clear any stale language/onboarding data from a previous session
    // before we authenticate. This prevents a previous user's AsyncStorage
    // (selectedLanguage, hasSeenIntro) from bypassing onboarding for a new user.
    await useLanguageStore.getState().reset();

    await saveSession(tokens);
    let user = null;
    try {
      const { data } = await api.get("/auth/me");
      user = data;
      await cacheUser(user);
    } catch (err) {
      Logger.warn("[Auth] Failed to load user profile:", err?.message);
      set({ isAuthenticated: false, token: null });
      return null;
    }

    set({
      user,
      token: tokens.accessToken,
      isAuthenticated: true,
    });
    return user;
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get("/user/profile");
      const current = get().user || {};
      const updatedUser = { ...current, ...data };
      set({ user: updatedUser });
      cacheUser(updatedUser);
      return updatedUser;
    } catch (err) {
      Logger.warn("[AuthStore] fetchProfile failed:", err?.message);
      return null;
    }
  },

  updateUser: (updates) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...updates } });
  },

  updateProfile: async (name) => {
    const { data } = await api.put("/user/profile", { name });
    get().updateUser(data);
    return data;
  },

  updateProfilePicture: async (uri, type, fileName) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: type || "image/jpeg",
      name: fileName || "avatar.jpg",
    });

    const { data } = await api.put("/user/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    get().updateUser({ avatar: data.imageUrl });
    return data;
  },

  selectPreDrawnAvatar: async (avatarId) => {
    const { data } = await api.put("/user/avatar/select", { avatarId });
    get().updateUser({ avatar: data.imageUrl });
    return data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const { data } = await api.put("/user/change-password", {
      oldPassword,
      newPassword,
    });
    return data;
  },

  logout: async () => {
    // 1. Get tokens before clearing
    let refreshToken = null;
    try {
      const session = await getSession();
      refreshToken = session?.refreshToken;
    } catch { }

    // 2. Immediately clear persistence, cache, and local state
    await clearSession();
    await clearCachedUser();
    set({ user: null, token: null, isAuthenticated: false });

    try {
      // 3. Inform backend to invalidate the refresh token
      if (refreshToken) {
        api.post("/auth/logout", { refreshToken }).catch(() => { });
      }
    } catch { }

    // 4. Reset all other stores
    await useLanguageStore.getState().reset();
    useThemeStore.getState().reset();
    useDashboardStore.getState().reset();
  },
}));

export default useAuthStore;