/**
 * MULEMA — useAuthStore
 * Adapté au backend qui retourne { accessToken, refreshToken } sans user
 */

import { create } from "zustand";
import api, { saveSession, clearSession, getSession } from "../services/api";

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
    } catch {
      await clearSession();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isSessionLoaded: true,
      });
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
    await saveSession(tokens);
    let user = null;
    try {
      const { data } = await api.get("/auth/me");
      user = data;
    } catch {}

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
    get().updateUser(data);
    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } catch {}
    await clearSession();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;