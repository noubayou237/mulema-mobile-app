import Logger from "../utils/logger";
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — useDashboardStore (Zustand)                         ║
 * ║  Données agrégées pour la page d'accueil                     ║
 * ║  Se recharge quand activeLanguage change                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { useDashboardStore } from "@/stores/useDashboardStore";
 *
 *    const { activeLanguage } = useLanguageStore();
 *    const { data, fetchDashboard } = useDashboardStore();
 *
 *    useEffect(() => {
 *      if (activeLanguage) fetchDashboard();
 *    }, [activeLanguage?.id]);
 */

import { create } from "zustand";
import { dashboardService } from "../services/dashboard.service";
import { isSessionActive } from "../services/api";

export const useDashboardStore = create((set) => ({
  // ── State ──
  data: null,               // DashboardData | null
  isLoading: false,

  // Leaderboard (séparé car indépendant de la langue)
  leaderboard: [],           // LeaderboardEntry[]
  leaderboardLoading: false,

  // ═════════════════════════════════════════════════════════════
  // fetchDashboard — Charge les stats du dashboard
  // Le backend retourne les stats de la langue active de l'utilisateur
  // ═════════════════════════════════════════════════════════════

  fetchDashboard: async () => {
    if (!isSessionActive()) return null;
    set({ isLoading: true });
    try {
      const data = await dashboardService.get();
      set({ data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      // 401/NetworkError is expected during the logout race window — suppress it
      if (error?.response?.status !== 401 && isSessionActive()) {
        Logger.error("[DashboardStore] fetchDashboard error:", error);
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
        }
      }));
    } catch (error) {
      Logger.error("[DashboardStore] deductHeart error:", error);
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchLeaderboard — Charge le classement (indépendant de la langue)
  // ═════════════════════════════════════════════════════════════

  fetchLeaderboard: async () => {
    if (!isSessionActive()) return [];
    set({ leaderboardLoading: true });
    try {
      const leaderboard = await dashboardService.getLeaderboard();
      set({ leaderboard, leaderboardLoading: false });
      return leaderboard;
    } catch (error) {
      set({ leaderboardLoading: false });
      if (error?.response?.status !== 401 && isSessionActive()) {
        Logger.error("[DashboardStore] fetchLeaderboard error:", error);
      }
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