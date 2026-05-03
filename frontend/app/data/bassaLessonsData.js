/**
 * Bassa lesson enrichment — audio key mapping + authoritative text from the PDF.
 * Keyed by normalized French lesson title (lowercase, diacritic-stripped).
 *
 * playAudioUrl() in audioUtils already resolves AUDIOS_MAP keys to local assets,
 * so we just pass the key string as the audio source.
 */

export const BASSA_ENRICHMENT_MAP = {
  // ── Les 7 jours de la semaine ──────────────────────────────────────────
  "lundi":                     { audioKey: "lundi_1",               bassaText: "ŋgwà njaŋgumba",  category: "Les jours de la semaine" },
  "mardi":                     { audioKey: "mardi_1",               bassaText: "ŋgwà ûm",          category: "Les jours de la semaine" },
  "mercredi":                  { audioKey: "mercredi_1",            bassaText: "ŋgwà ŋgê",         category: "Les jours de la semaine" },
  "jeudi":                     { audioKey: "jeudi_1",               bassaText: "ŋgwà mbɔk",        category: "Les jours de la semaine" },
  "vendredi":                  { audioKey: "vendredi_1",            bassaText: "ŋgwà kɔɔ",         category: "Les jours de la semaine" },
  "samedi":                    { audioKey: "samedi_1",              bassaText: "ŋgwà jôn",         category: "Les jours de la semaine" },
  "dimanche":                  { audioKey: "dimanche_1",            bassaText: "ŋgwà nɔŷ",         category: "Les jours de la semaine" },

  // ── Verbe ÊTRE ────────────────────────────────────────────────────────
  "je suis":                   { audioKey: "je_suis_1",             bassaText: "mè yè",            category: "Verbe ÊTRE" },
  "tu es":                     { audioKey: "tu_es_2",               bassaText: "Ù yè",             category: "Verbe ÊTRE" },
  "il ou elle est":            { audioKey: "il_elle_on_est_1",      bassaText: "A yè",             category: "Verbe ÊTRE" },
  "nous sommes":               { audioKey: "nous_sommes_1",         bassaText: "Di yè",            category: "Verbe ÊTRE" },
  "vous etes":                 { audioKey: "vous_etes_1",           bassaText: "Ni yè",            category: "Verbe ÊTRE" },
  "vous êtes":                 { audioKey: "vous_etes_1",           bassaText: "Ni yè",            category: "Verbe ÊTRE" },
  "ils ou elles sont":         { audioKey: "ils_elles_sont_1",      bassaText: "Ba yè",            category: "Verbe ÊTRE" },

  // ── Verbe AVOIR ───────────────────────────────────────────────────────
  "j'ai":                      { audioKey: "j_aiwav",               bassaText: "mè gwě",           category: "Verbe AVOIR" },
  "j ai":                      { audioKey: "j_aiwav",               bassaText: "mè gwě",           category: "Verbe AVOIR" },
  "tu as":                     { audioKey: "tu_as_1",               bassaText: "Ù gwě",            category: "Verbe AVOIR" },
  "il ou elle a":              { audioKey: "il_ou_elle_a",          bassaText: "A gwě",            category: "Verbe AVOIR" },
  "nous avons":                { audioKey: "nous_avons_1",          bassaText: "Di gwě",           category: "Verbe AVOIR" },
  "vous avez":                 { audioKey: "vous_avez_1",           bassaText: "Ni gwě",           category: "Verbe AVOIR" },
  "ils ou elles ont":          { audioKey: "ils_ou_elles_ont",      bassaText: "Ba gwě",           category: "Verbe AVOIR" },

  // ── Verbe MANGER ──────────────────────────────────────────────────────
  "je mange":                  { audioKey: "je_mange",              bassaText: "mè ŋjé",           category: "Verbe MANGER" },
  "tu manges":                 { audioKey: "tu_manges",             bassaText: "U ŋjé",            category: "Verbe MANGER" },
  "il ou elle mange":          { audioKey: "il_ou_elle_mange",      bassaText: "A ŋjé",            category: "Verbe MANGER" },
  "nous mangeons":             { audioKey: "nous_mangeons",         bassaText: "Di ŋjé",           category: "Verbe MANGER" },
  "vous mangez":               { audioKey: "vous_mangez",           bassaText: "Ni ŋjé",           category: "Verbe MANGER" },
  "ils ou elles mangent":      { audioKey: "ils_ou_elle_mangent",   bassaText: "Ba ŋjé",           category: "Verbe MANGER" },

  // ── Verbe MARCHER ─────────────────────────────────────────────────────
  "je marche":                 { audioKey: "je_marche",             bassaText: "mè Níòm",          category: "Verbe MARCHER" },
  "tu marches":                { audioKey: "tu_marches",            bassaText: "Ù Níòm",           category: "Verbe MARCHER" },
  "il ou elle marche":         { audioKey: "il_ou_elle_marche",     bassaText: "A Níòm",           category: "Verbe MARCHER" },
  "nous marchons":             { audioKey: "nous_marchons",         bassaText: "Di Níòm",          category: "Verbe MARCHER" },
  "vous marchez":              { audioKey: "vous_marchez",          bassaText: "Ni Níòm",          category: "Verbe MARCHER" },
  "ils ou elles marchent":     { audioKey: "ils_ou_elles_marchent", bassaText: "Ba Níòm",          category: "Verbe MARCHER" },

  // ── Verbe PRENDRE ─────────────────────────────────────────────────────
  "je prends":                 { audioKey: "je_prends",             bassaText: "Mè ŋýòŋ",          category: "Verbe PRENDRE" },
  "tu prends":                 { audioKey: "tu_prends",             bassaText: "Ù ŋýòŋ",           category: "Verbe PRENDRE" },
  "il ou elle prend":          { audioKey: "il_ou_elle_prend",      bassaText: "A ŋýòŋ",           category: "Verbe PRENDRE" },
  "nous prenons":              { audioKey: "nous_prenons",          bassaText: "Di ŋýòŋ",          category: "Verbe PRENDRE" },
  "vous prenez":               { audioKey: "vous_prenez",           bassaText: "Ni ŋýòŋ",          category: "Verbe PRENDRE" },
  "ils ou elles prennent":     { audioKey: "ils_ou_elles_prennent", bassaText: "Ba ŋýòŋ",          category: "Verbe PRENDRE" },

  // ── Verbe ACHETER ─────────────────────────────────────────────────────
  "j'achete":                  { audioKey: "j_achete",              bassaText: "Mè Ńsɔmb",         category: "Verbe ACHETER" },
  "j achete":                  { audioKey: "j_achete",              bassaText: "Mè Ńsɔmb",         category: "Verbe ACHETER" },
  "tu achetes":                { audioKey: "tu_achetes",            bassaText: "U Ńsɔmb",          category: "Verbe ACHETER" },
  "il ou elle achete":         { audioKey: "il_ou_elle_achete",     bassaText: "A Ńsɔmb",          category: "Verbe ACHETER" },
  "nous achetons":             { audioKey: "nous_achetons",         bassaText: "Di Ńsɔmb",         category: "Verbe ACHETER" },
  "vous achetez":              { audioKey: "vous_achetez",          bassaText: "Ni Ńsɔmb",         category: "Verbe ACHETER" },
  "ils ou elles achetent":     { audioKey: "ils_ou_elles_achetent", bassaText: "Ba Ńsɔmb",         category: "Verbe ACHETER" },

  // ── Verbe AIMER ───────────────────────────────────────────────────────
  // (no dedicated local audio files yet, keys kept for future use)
  // ── Famille (Thème 0 exercices) ──────────────────────────────────────
  "un homme":                  { audioKey: "un_homme",              bassaText: "Ùmɛ",              category: "La famille" },
  "une femme":                 { audioKey: "une_femme",             bassaText: "Ngɔnɛ",            category: "La famille" },
  "le bebe":                   { audioKey: "le_bebe",               bassaText: "Mòmbí",            category: "La famille" },
  "l'oncle":                   { audioKey: "l_oncle",               bassaText: "Nkɔm",             category: "La famille" },
  "l oncle":                   { audioKey: "l_oncle",               bassaText: "Nkɔm",             category: "La famille" },
};

/**
 * Find Bassa enrichment data for a lesson by its French title.
 * Matching is case-insensitive and diacritic-tolerant.
 * Returns null if no match found.
 *
 * @param {string} title — French lesson title from the backend
 */
export function getBassaEnrichment(title = "") {
  const strip = (s) =>
    s.toLowerCase().trim()
     .replace(/[éèêë]/g, "e").replace(/[àâä]/g, "a")
     .replace(/[îï]/g, "i").replace(/[ôö]/g, "o")
     .replace(/[ùûü]/g, "u").replace(/['']/g, " ")
     .replace(/\s+/g, " ").trim();

  const query = strip(title);

  for (const [key, value] of Object.entries(BASSA_ENRICHMENT_MAP)) {
    const normKey = strip(key);
    if (query === normKey || query.startsWith(normKey) || normKey.startsWith(query)) {
      return value;
    }
  }
  return null;
}
