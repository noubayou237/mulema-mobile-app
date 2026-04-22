/**
 * MULEMA — useAuthStore
 * Adapté au backend qui retourne { accessToken, refreshToken } sans user
 */

import { create } from "zustand";
import api, { saveSession, clearSession, getSession } from "../services/api";
import { useLanguageStore } from "./useLanguageStore";
import { useThemeStore } from "./useThemeStore";
import { useDashboardStore } from "./useDashboardStore";

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

      // Vérifier le token en appelant /auth/me
      const { data: user } = await api.get("/auth/me");

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
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isSessionLoaded: true,
        });
      } else {
        // Keep authentication active if backend fails (e.g. 500 Timeout)
        // User is null but they won't be pushed back to login
        set({
          isAuthenticated: true,
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

    // Charger le user via GET /auth/me
    let user = null;
    try {
      const meResponse = await api.get("/auth/me");
      user = meResponse.data;
    } catch (e) {
      console.warn("[AuthStore] GET /auth/me failed:", e);
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
    } catch (err) {
      console.warn("[Auth] Failed to load user profile:", err?.message);
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

  changePassword: async (oldPassword, newPassword) => {
    const { data } = await api.put("/user/change-password", {
      oldPassword,
      newPassword,
    });
    return data;
  },

  logout: async () => {
    // 1. Immediately clear the synchronous session flag and persistence
    await clearSession();
    
    // 2. Mark as unauthenticated (synchronous state update)
    set({ user: null, token: null, isAuthenticated: false });
    
    try {
      // 3. Inform backend (fire and forget)
      api.post("/auth/logout").catch(() => {});
    } catch {}
    
    // 4. Reset all other stores
    await useLanguageStore.getState().reset();
    useThemeStore.getState().reset();
    useDashboardStore.getState().reset();
  },
}));

export default useAuthStore;