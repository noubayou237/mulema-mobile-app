import Logger from "../utils/logger";
import { create } from "zustand";
import { dashboardService } from "../services/dashboard.service";
import { isSessionActive } from "../services/api";
import { getFriendlyErrorMessage, isNetworkError } from "../utils/errorUtils";
import i18n from "../i18n";

// Cache settings
const STALE_TIME = 60000; // 60 seconds
const inflightRequests = new Map();
const lastFetchTime = new Map();

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
  // ═════════════════════════════════════════════════════════════

  fetchDashboard: async () => {
    if (!isSessionActive()) return null;

    const reqKey = "dashboard_main";
    if (inflightRequests.has(reqKey)) return inflightRequests.get(reqKey);

    const now = Date.now();
    const lastFetch = lastFetchTime.get(reqKey) || 0;
    const { data: cached } = useDashboardStore.getState();

    if (cached && (now - lastFetch < STALE_TIME)) {
      return cached;
    }

    set({ isLoading: !cached });

    const fetchPromise = (async () => {
      try {
        const data = await dashboardService.get();
        set({ data, isLoading: false, error: null });
        lastFetchTime.set(reqKey, Date.now());
        return data;
      } catch (error) {
        const msg = getFriendlyErrorMessage(error);
        set({ isLoading: false, error: msg });
        
        if (error?.response?.status !== 401 && !isNetworkError(error) && isSessionActive()) {
          Logger.error("[DashboardStore] fetchDashboard error:", msg);
        }
        return null;
      } finally {
        inflightRequests.delete(reqKey);
      }
    })();

    inflightRequests.set(reqKey, fetchPromise);
    return fetchPromise;
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