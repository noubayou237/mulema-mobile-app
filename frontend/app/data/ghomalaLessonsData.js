/**
 * Ghomala Lessons Enrichment Data
 */

export const GHOMALA_ENRICHMENT_MAP = {
  // ── Les Chiffres 0-9 ──────────────────────────────────────────────────
  "zero":               { audioKey: "le_chiffre_0_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "un":                 { audioKey: "le_chiffre_1_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "deux":               { audioKey: "le_chiffre_2_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "trois":              { audioKey: "le_chiffre_3_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "quatre":             { audioKey: "le_chiffre_4_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "cinq":               { audioKey: "le_chiffre_5_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "six":                { audioKey: "le_chiffre_6_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "sept":               { audioKey: "le_chiffre_7_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "huit":               { audioKey: "le_chiffre_8_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },
  "neuf":               { audioKey: "le_chiffre_9_en_ngohmala", category: "Les chiffres 0-9 en ghomala" },

  // ── Les Jours de la Semaine ───────────────────────────────────────────
  "lundi":              { audioKey: "monday_in_bami", category: "Les jours de la semaine en ghomala" },
  "mardi":              { audioKey: "tuesday", category: "Les jours de la semaine en ghomala" },
  "mercredi":           { audioKey: "wednesday", category: "Les jours de la semaine en ghomala" },
  "jeudi":              { audioKey: "thursday", category: "Les jours de la semaine en ghomala" },
  "vendredi":           { audioKey: "friday", category: "Les jours de la semaine en ghomala" },
  "samedi":             { audioKey: "saturday", category: "Les jours de la semaine en ghomala" },
  "dimanche":           { audioKey: "sunday", category: "Les jours de la semaine en ghomala" },
  
  // ── Le Verbe Être ────────────────────────────────────────────────────────
  "je suis":            { audioKey: "ga_b_je_suis", category: "Le verbe etre en ghomala" },
  "tu es":              { audioKey: "o_b_tu_es", category: "Le verbe etre en ghomala" },
  "il ou elle est":     { audioKey: "e_b_il_ou_elle_est", category: "Le verbe etre en ghomala" },
  "nous sommes":        { audioKey: "py_b_nus_sommes", category: "Le verbe etre en ghomala" },
  "vous etes":          { audioKey: "po_b_vous_etes", category: "Le verbe etre en ghomala" },
  "ils ou elles sont":  { audioKey: "wap_b_ils_ou_elles_sont", category: "Le verbe etre en ghomala" },

  // ── Le Verbe Avoir ──────────────────────────────────────────────────────
  "j ai":               { audioKey: "ga_g_j_ai", category: "Le verbe avoir en ghomala" },
  "tu as":              { audioKey: "o_g_tu_as", category: "Le verbe avoir en ghomala" },
  "il ou elle a":       { audioKey: "e_g_il_ou_elle_as", category: "Le verbe avoir en ghomala" },
  "nous avons":         { audioKey: "py_g_nous_avons", category: "Le verbe avoir en ghomala" },
  "vous avez":          { audioKey: "po_g_vous_avez", category: "Le verbe avoir en ghomala" },
  "ils ou elles ont":   { audioKey: "wap_g", category: "Le verbe avoir en ghomala" },

  // ── Le Verbe Manger ──────────────────────────────────────────────────────
  "je mange":           { audioKey: "ga_mpfa_je_mange", category: "Le verbe manger en ghomala" },
  "tu manges":          { audioKey: "o_mpfa_tu_mange", category: "Le verbe manger en ghomala" },
  "il ou elle mange":   { audioKey: "e_mpfa_il_ou_elle_mange", category: "Le verbe manger en ghomala" },
  "nous mangeons":      { audioKey: "py_mpfa_nous_mangeons", category: "Le verbe manger en ghomala" },
  "vous mangez":        { audioKey: "po_mpfa_vous_mangez", category: "Le verbe manger en ghomala" },
  "ils ou elles mangent": { audioKey: "wap_mpfa_ils_ou_elles_magent", category: "Le verbe manger en ghomala" },

  // ── Le Verbe Marcher ──────────────────────────────────────────────────────
  "je marche":           { audioKey: "ga_gi_je_marche", category: "Le verbe marcher en ghomala" },
  "tu marches":          { audioKey: "o_gi_tu_marche", category: "Le verbe marcher en ghomala" },
  "il ou elle marche":   { audioKey: "e_gi_il_ou_elle_marche", category: "Le verbe marcher en ghomala" },
  "nous marchons":       { audioKey: "py_gi_nous_marchons", category: "Le verbe marcher en ghomala" },
  "vous marchez":        { audioKey: "po_gi_vous_marchez", category: "Le verbe marcher en ghomala" },
  "ils ou elles marchent": { audioKey: "wap_gi_ils_ou_elles_marchent", category: "Le verbe marcher en ghomala" },

  // ── Le Verbe Acheter ──────────────────────────────────────────────────────
  "j achete":           { audioKey: "ga_jo_j_achete", category: "Le verbe acheter en ghomala" },
  "tu achetes":         { audioKey: "o_jo_tu_achete", category: "Le verbe acheter en ghomala" },
  "il ou elle achete":  { audioKey: "e_jo_il_ou_elle_achete", category: "Le verbe acheter en ghomala" },
  "nous achetons":      { audioKey: "py_jo_nous_achetons", category: "Le verbe acheter en ghomala" },
  "vous achetez":       { audioKey: "po_jo_vous_achetez", category: "Le verbe acheter en ghomala" },
  "ils ou elles achetent": { audioKey: "wap_jo_ils_ou_elles_achetent", category: "Le verbe acheter en ghomala" },
};

/**
 * Normalizes strings by removing accents, non-alphanumeric chars, and lowercasing.
 */
const normalizeStr = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

/**
 * Retrieves Ghomala enrichment specific to a category.
 */
export function getGhomalaEnrichment(title, categoryFallback) {
  if (!title) return null;

  const normalizedTitle = normalizeStr(title);

  for (const [key, enrich] of Object.entries(GHOMALA_ENRICHMENT_MAP)) {
    if (normalizeStr(key) === normalizedTitle || normalizeStr(key).includes(normalizedTitle) || normalizedTitle.includes(normalizeStr(key))) {
      return enrich;
    }
  }

  return null;
}
