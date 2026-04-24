import Logger from "../utils/logger";
import { create } from "zustand";
import { dashboardService } from "../services/dashboard.service";
import { isSessionActive } from "../services/api";
import { getFriendlyErrorMessage } from "../utils/errorUtils";
import i18n from "../i18n";

export const useDashboardStore = create((set) => ({
  // ── State ──
  data: null,               // DashboardData | null
  isLoading: false,
  error: null,              // Message d'erreur convivial

  // Leaderboard (séparé car indépendant de la langue)
  leaderboard: [],           // LeaderboardEntry[]
  leaderboardLoading: false,
  leaderboardError: null,    // user-friendly error string | null

  // ═════════════════════════════════════════════════════════════
  // fetchDashboard — Charge les stats du dashboard
  // Le backend retourne les stats de la langue active de l'utilisateur
  // ═════════════════════════════════════════════════════════════

  fetchDashboard: async () => {
    if (!isSessionActive()) return null;
    set({ isLoading: true });
    try {
      const data = await dashboardService.get();
      set({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      set({ isLoading: false, error: msg });
      
      // 401/NetworkError is expected during the logout race window — suppress it
      if (error?.response?.status !== 401 && isSessionActive()) {
        Logger.error("[DashboardStore] fetchDashboard error:", msg);
      }
      return null;
    }
  },

  deductHeart: async () => {
    const { data } = useDashboardStore.getState();
    if (!data || data.hearts <= 0) return;
    
    // Optimistic UI update
    set({
      data: { ...data, hearts: data.hearts - 1 }
    });

    try {
      const result = await dashboardService.deductCowry(1);
      set((state) => ({
        data: { 
          ...state.data, 
          hearts: result.currentCowries,
          nextRechargeIn: result.nextRechargeIn
        },
        error: null
      }));
    } catch (error) {
      // Revert optimistic update gracefully without displaying developer logs
      set((state) => ({
        data: { ...(state.data || {}), hearts: (state.data?.hearts || 0) + 1 },
        error: "Impossible de synchroniser tes cœurs. Vérifie ta connexion."
      }));
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchLeaderboard — Charge le classement (indépendant de la langue)
  // ═════════════════════════════════════════════════════════════

  fetchLeaderboard: async () => {
    if (!isSessionActive()) return [];
    set({ leaderboardLoading: true, leaderboardError: null });
    try {
      const leaderboard = await dashboardService.getLeaderboard();
      set({ leaderboard, leaderboardLoading: false, leaderboardError: null });
      return leaderboard;
    } catch (error) {
      const status = error?.response?.status;
      // Suppress 401 errors during logout window — not a user-facing issue
      if (status === 401 || !isSessionActive()) {
        set({ leaderboardLoading: false });
        return [];
      }

      // Build a friendly error message for the user
      const t = i18n.t.bind(i18n);
      let friendlyMsg;
      if (status === 404 || error.message === "Network Error") {
        friendlyMsg = t("community.rankingsUnavailable", "Le classement n'est pas disponible pour le moment. Réessaie plus tard.");
      } else {
        friendlyMsg = getFriendlyErrorMessage(error);
      }

      set({ leaderboardLoading: false, leaderboardError: friendlyMsg });
      Logger.warn("[DashboardStore] fetchLeaderboard:", friendlyMsg);
      return [];
    }
  },

  // ═════════════════════════════════════════════════════════════
  // reset — Nettoie (appelé par logout)
  // ═════════════════════════════════════════════════════════════

  reset: () => {
    set({ data: null, isLoading: false });
  },
}));

export default useDashboardStore;