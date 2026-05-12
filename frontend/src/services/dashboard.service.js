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
    const { data } = await api.get("/user/leaderboard");
    return data;
  },

  /**
   * Deduct user cowries
   * PUT /user/cowries
   */
  deductCowry: async (amount = 1) => {
    const { data } = await api.put("/user/cowries", { amount });
    return data;
  },

  /**
   * Purchase hearts using points (XP)
   * PUT /user/purchase-heart
   * @param {number} count - Number of hearts to buy (30 XP per heart)
   */
  purchaseHearts: async (count = 1) => {
    const { data } = await api.put("/user/purchase-heart", { count });
    return data;
  },
};

export default dashboardService;