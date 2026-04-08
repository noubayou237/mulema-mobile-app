/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Dashboard Service                                   ║
 * ║  Appels API pour le dashboard + leaderboard                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage :
 *    import { dashboardService } from "@/services/dashboard.service";
 */

import api from "./api";

export const dashboardService = {
  /**
   * Récupère toutes les données du dashboard
   * GET /dashboard
   * @returns DashboardData
   */
  get: async () => {
    const { data } = await api.get("/user/dashboard");
    return data;
  },

  /**
   * Récupère le classement (top 20)
   * GET /leaderboard
   * @returns LeaderboardEntry[]
   */
  getLeaderboard: async () => {
    const { data } = await api.get("/leaderboard");
    return data;
  },
};

export default dashboardService;