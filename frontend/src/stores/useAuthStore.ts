/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — useAuthStore (Zustand)                              ║
 * ║  Gère : token, user, login, register, logout, loadSession     ║
 * ║  Utilisé par : toutes les pages auth + le root _layout.tsx    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { useAuthStore } from "@/stores/useAuthStore";
 *
 *    // Dans un composant :
 *    const { user, isAuthenticated, login, logout } = useAuthStore();
 *
 *    // Au démarrage (dans _layout.tsx) :
 *    useEffect(() => { useAuthStore.getState().loadSession(); }, []);
 */

import { create } from "zustand";
import api, { saveSession, clearSession, getSession } from "../services/api";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

const AuthState = {};
// Voir src/types/index.ts pour User, AuthTokens, LoginResponse, RegisterPayload

// ═══════════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════════

export const useAuthStore = create((set, get) => ({
  // ── State ──
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,         // true pendant loadSession au démarrage
  isSessionLoaded: false,   // true une fois que loadSession a terminé (même si pas de token)

  // ═════════════════════════════════════════════════════════════
  // loadSession — Appelé UNE FOIS au démarrage de l'app
  // Lit AsyncStorage, vérifie le token, charge le user
  // ═════════════════════════════════════════════════════════════

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const session = await getSession();

      if (!session?.accessToken) {
        // Pas de session → utilisateur non connecté
        set({ isLoading: false, isSessionLoaded: true });
        return;
      }

      // Tester le token en appelant /auth/me
      const { data: user } = await api.get("/auth/me");

      set({
        user,
        token: session.accessToken,
        isAuthenticated: true,
        isLoading: false,
        isSessionLoaded: true,
      });
    } catch (error) {
      // Token invalide ou expiré (le refresh a échoué)
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

  // ═════════════════════════════════════════════════════════════
  // login — POST /auth/login
  // ═════════════════════════════════════════════════════════════

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // data = { accessToken, refreshToken, user }

    await saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    set({
      user: data.user,
      token: data.accessToken,
      isAuthenticated: true,
    });

    return data;
  },

  // ═════════════════════════════════════════════════════════════
  // register — POST /auth/register
  // NE connecte PAS l'utilisateur (il doit vérifier son email d'abord)
  // ═════════════════════════════════════════════════════════════

  register: async (payload) => {
    // payload : { name, username, email, password }
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  // ═════════════════════════════════════════════════════════════
  // loginWithTokens — Utilisé après verify-email-and-login
  // Quand le backend retourne directement les tokens
  // ═════════════════════════════════════════════════════════════

  loginWithTokens: async (tokens) => {
    // tokens : { accessToken, refreshToken }
    await saveSession(tokens);

    // Charger le profil
    const { data: user } = await api.get("/auth/me");

    set({
      user,
      token: tokens.accessToken,
      isAuthenticated: true,
    });

    return user;
  },

  // ═════════════════════════════════════════════════════════════
  // updateUser — Met à jour le user local (après PATCH /users/me)
  // ═════════════════════════════════════════════════════════════

  updateUser: (updates) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...updates } });
  },

  // ═════════════════════════════════════════════════════════════
  // logout — Nettoie tout et redirige vers sign-in
  // ═════════════════════════════════════════════════════════════

  logout: async () => {
    try {
      // Optionnel : appeler le backend pour invalider le refresh token
      await api.post("/auth/logout").catch(() => {});
    } catch {
      // Ignore — on déconnecte quand même
    }

    await clearSession();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;