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
    set({ isLoading: true });
    try {
      const data = await dashboardService.get();
      set({ data, isLoading: false });
      return data;
    } catch (error) {
      console.error("[DashboardStore] fetchDashboard error:", error);
      set({ isLoading: false });
      return null;
    }
  },

  // ═════════════════════════════════════════════════════════════
  // fetchLeaderboard — Charge le classement (indépendant de la langue)
  // ═════════════════════════════════════════════════════════════

  fetchLeaderboard: async () => {
    set({ leaderboardLoading: true });
    try {
      const leaderboard = await dashboardService.getLeaderboard();
      set({ leaderboard, leaderboardLoading: false });
      return leaderboard;
    } catch (error) {
      console.error("[DashboardStore] fetchLeaderboard error:", error);
      set({ leaderboardLoading: false });
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