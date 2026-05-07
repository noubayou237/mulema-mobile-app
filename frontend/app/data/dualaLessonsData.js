/**
 * Duala Lessons Enrichment Data
 */

export const DUALA_ENRICHMENT_MAP = {
  // ── Les pronoms personnel ────────────────────────────────────────────────
  "Moi":                { audioKey: "Moi", category: "Les pronoms personnel" },
  "Toi":                { audioKey: "Toi", category: "Les pronoms personnel" },
  "Lui":                { audioKey: "Lui", category: "Les pronoms personnel" },
  "Nous":               { audioKey: "Nous", category: "Les pronoms personnel" },
  "Vous":               { audioKey: "Vous", category: "Les pronoms personnel" },
  "Eux":                { audioKey: "Eux", category: "Les pronoms personnel" },

  // ── Le verbe etre ────────────────────────────────────────────────────────
  "je suis":            { audioKey: "je_suis", category: "Le verbe etre" },
  "tu es":              { audioKey: "tu_es", category: "Le verbe etre" },
  "il ou elle est":     { audioKey: "il_elle_est", category: "Le verbe etre" },
  "nous sommes":        { audioKey: "nous_sommes", category: "Le verbe etre" },
  "vous etes":          { audioKey: "vous_etes", category: "Le verbe etre" },
  "ils ou elles sont":  { audioKey: "ils_elles_sont", category: "Le verbe etre" },

  // ── Le verbe avoir ───────────────────────────────────────────────────────
  "j ai":               { audioKey: "j_ai", category: "Le verbe avoir" },
  "tu as":              { audioKey: "tu_as", category: "Le verbe avoir" },
  "il ou elle a":       { audioKey: "il_elle_a", category: "Le verbe avoir" },
  "nous avons":         { audioKey: "nous_avons", category: "Le verbe avoir" },
  "vous avez":          { audioKey: "vous_avez", category: "Le verbe avoir" },
  "ils ou elles ont":   { audioKey: "ils_elles_ont", category: "Le verbe avoir" },

  // ── Les sept jour de la semaine ──────────────────────────────────────────
  "lundi":              { audioKey: "lundi", category: "Les sept jour de la semaine" },
  "mardi":              { audioKey: "mardi", category: "Les sept jour de la semaine" },
  "mercredi":           { audioKey: "mercredi", category: "Les sept jour de la semaine" },
  "jeudi":              { audioKey: "jeudi", category: "Les sept jour de la semaine" },
  "vendredi":           { audioKey: "vendredi", category: "Les sept jour de la semaine" },
  "samedi":             { audioKey: "samedi", category: "Les sept jour de la semaine" },
  "dimanche":           { audioKey: "dimanche", category: "Les sept jour de la semaine" },
  
  // ── Les chiffres 1-9 en duala ──────────────────────────────────────────────
  "un":                 { audioKey: "un", category: "Les chiffres 1-9 en duala" },
  "deux":               { audioKey: "deux", category: "Les chiffres 1-9 en duala" },
  "zero":               { audioKey: "zero", category: "Les chiffres 1-9 en duala" },
  "trois":              { audioKey: "trois", category: "Les chiffres 1-9 en duala" },
  "quatre":             { audioKey: "quatre", category: "Les chiffres 1-9 en duala" },
  "cinq":               { audioKey: "cinq", category: "Les chiffres 1-9 en duala" },
  "six":                { audioKey: "six", category: "Les chiffres 1-9 en duala" },
  "sept":               { audioKey: "sept", category: "Les chiffres 1-9 en duala" },
  "huit":               { audioKey: "huit", category: "Les chiffres 1-9 en duala" },
  "neuf":               { audioKey: "neuf", category: "Les chiffres 1-9 en duala" },
  
  // ── Les couleur ──────────────────────────────────────────────────────────
  "noir":               { audioKey: "noir", category: "Les couleur" },
  "blanc":              { audioKey: "blanc", category: "Les couleur" },
  "jaune":              { audioKey: "jaune", category: "Les couleur" },
  "orange":             { audioKey: "orange", category: "Les couleur" },
  "rouge":              { audioKey: "rouge", category: "Les couleur" },
  "bleu":               { audioKey: "bleu", category: "Les couleur" },
  "vert":               { audioKey: "vert", category: "Les couleur" },
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
 * Retrieves Duala enrichment specific to a category.
 */
export function getDualaEnrichment(title, categoryFallback) {
  if (!title) return null;

  // Search through our map
  const normalizedTitle = normalizeStr(title);

  for (const [key, enrich] of Object.entries(DUALA_ENRICHMENT_MAP)) {
    if (normalizeStr(key) === normalizedTitle) {
      if (categoryFallback && enrich.category === categoryFallback) {
         return enrich;
      }
      if (!categoryFallback) {
         return enrich;
      }
    }
  }

  return null;
}
