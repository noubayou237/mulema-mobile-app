/**
 * MULEMA — Languages Service
 * Adapté aux endpoints backend : /official-languages + /patrimonial-languages
 */

import api from "./api";

export const languagesService = {
  getAll: async () => {
    const [official, patrimonial] = await Promise.all([
      api.get("/official-languages").catch(() => ({ data: [] })),
      api.get("/patrimonial-languages").catch(() => ({ data: [] })),
    ]);

    const all = [
      ...official.data.map((l) => ({ ...l, type: "official" })),
      ...patrimonial.data.map((l) => ({ ...l, type: "patrimonial" })),
    ];
    return all;
  },

  getById: async (id) => {
    try {
      const { data } = await api.get(`/official-languages/${id}`);
      return data;
    } catch {
      const { data } = await api.get(`/patrimonial-languages/${id}`);
      return data;
    }
  },

  setUserLanguage: async (languageId, type) => {
    const payload = type === "patrimonial"
      ? { patrimonialLanguageId: languageId }
      : { officialLanguageId: languageId };

    try {
      const { data } = await api.patch("/auth/me", payload);
      return data;
    } catch {
      // Fallback — certains backends utilisent /users/me
      return null;
    }
  },
};

export default languagesService;