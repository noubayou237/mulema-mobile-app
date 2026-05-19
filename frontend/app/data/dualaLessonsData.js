/**
 * Duala Lessons Enrichment Data
 */

export const DUALA_ENRICHMENT_MAP = {
  // ── Les pronoms personnel ────────────────────────────────────────────────
  // ── Les pronoms personnel ────────────────────────────────────────────────
  "Moi":                { targetText: "mba", audioKey: "moi", category: "Les pronoms personnel" },
  "Toi":                { targetText: "wa", audioKey: "toi", category: "Les pronoms personnel" },
  "Lui":                { targetText: "mɔ́", audioKey: "lui", category: "Les pronoms personnel" },
  "Nous":               { targetText: "bisɔ́", audioKey: "nous", category: "Les pronoms personnel" },
  "Vous":               { targetText: "binyɔ́", audioKey: "vous", category: "Les pronoms personnel" },
  "Eux":                { targetText: "babó", audioKey: "eux", category: "Les pronoms personnel" },

  // ── Le verbe etre ────────────────────────────────────────────────────────
  "je suis":            { targetText: "Na e", audioKey: "je_suis", category: "Le verbe etre" },
  "tu es":              { targetText: "O e", audioKey: "tu_es", category: "Le verbe etre" },
  "il ou elle est":     { targetText: "A e", audioKey: "il_elle_est", category: "Le verbe etre" },
  "nous sommes":        { targetText: "DI e", audioKey: "nous_sommes", category: "Le verbe etre" },
  "vous etes":          { targetText: "LO e", audioKey: "vous_etes", category: "Le verbe etre" },
  "ils ou elles sont":  { targetText: "BA e", audioKey: "ils_elles_sont", category: "Le verbe etre" },

  // ── Le verbe avoir ───────────────────────────────────────────────────────
  "j ai":               { targetText: "Na bén", audioKey: "j_ai", category: "Le verbe avoir" },
  "tu as":              { targetText: "O bén", audioKey: "tu_as", category: "Le verbe avoir" },
  "il ou elle a":       { targetText: "A bén", audioKey: "il_elle_on_a", category: "Le verbe avoir" },
  "nous avons":         { targetText: "DI bén", audioKey: "nous_avons", category: "Le verbe avoir" },
  "vous avez":          { targetText: "LO bén", audioKey: "vous_avez", category: "Le verbe avoir" },
  "ils ou elles ont":   { targetText: "BA bén", audioKey: "ils_elles_ont", category: "Le verbe avoir" },

  // ── Les sept jour de la semaine ──────────────────────────────────────────
  "lundi":              { targetText: "Mɔsi", audioKey: "lundi", category: "Les sept jour de la semaine" },
  "mardi":              { targetText: "Kwasi", audioKey: "mardi", category: "Les sept jour de la semaine" },
  "mercredi":           { targetText: "Mukɔsi", audioKey: "mercredi", category: "Les sept jour de la semaine" },
  "jeudi":              { targetText: "Ngisi", audioKey: "jeudi", category: "Les sept jour de la semaine" },
  "vendredi":           { targetText: "Ndɔsi", audioKey: "vendredi", category: "Les sept jour de la semaine" },
  "samedi":             { targetText: "Esaba", audioKey: "samedi", category: "Les sept jour de la semaine" },
  "dimanche":           { targetText: "Étina", audioKey: "dimanche", category: "Les sept jour de la semaine" },
  
  // ── Les chiffres 1-9 en duala ──────────────────────────────────────────────
  "un":                 { targetText: "ewɔ́", audioKey: "un", category: "Les chiffres 1-9 en duala" },
  "deux":               { targetText: "ɓéɓǎ", audioKey: "deux", category: "Les chiffres 1-9 en duala" },
  "zero":               { targetText: "tɔ lambo", audioKey: "zero", category: "Les chiffres 1-9 en duala" },
  "trois":              { targetText: "ɓélálo", audioKey: "trois", category: "Les chiffres 1-9 en duala" },
  "quatre":             { targetText: "ɓénɛí", audioKey: "quatre", category: "Les chiffres 1-9 en duala" },
  "cinq":               { targetText: "ɓétánu", audioKey: "cinq", category: "Les chiffres 1-9 en duala" },
  "six":                { targetText: "mutóɓá", audioKey: "six", category: "Les chiffres 1-9 en duala" },
  "sept":               { targetText: "saámbá", audioKey: "sept", category: "Les chiffres 1-9 en duala" },
  "huit":               { targetText: "lɔɔmbi", audioKey: "huit", category: "Les chiffres 1-9 en duala" },
  "neuf":               { targetText: "dibuá", audioKey: "neuf", category: "Les chiffres 1-9 en duala" },
  
  // ── Les couleur ──────────────────────────────────────────────────────────
  "noir":               { targetText: "mundo", audioKey: "noir", category: "Les couleur" },
  "blanc":              { targetText: "sánga", audioKey: "blanc", category: "Les couleur" },
  "jaune":              { targetText: "njabi", audioKey: "jaune", category: "Les couleur" },
  "orange":             { targetText: "epumá", audioKey: "orange", category: "Les couleur" },
  "rouge":              { targetText: "jóla", audioKey: "rouge", category: "Les couleur" },
  "bleu":               { targetText: "bulu", audioKey: "bleu", category: "Les couleur" },
  "vert":               { targetText: "musono mw’éyadí", audioKey: "vert", category: "Les couleur" },
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

/**
 * Returns virtual lessons for a given virtual Duala themeId.
 * These are all local — no network round-trip needed.
 */
export function getDualaVirtualData(themeId) {
  const themeMap = {
    "duala_jour": {
      title: "Les sept jour de la semaine",
      items: [
        { sourceText: "Lundi",    targetText: "Lundi (Duala)",    audioKey: "lundi" },
        { sourceText: "Mardi",    targetText: "Mardi (Duala)",    audioKey: "mardi" },
        { sourceText: "Mercredi", targetText: "Mercredi (Duala)", audioKey: "mercredi" },
        { sourceText: "Jeudi",    targetText: "Jeudi (Duala)",   audioKey: "jeudi" },
        { sourceText: "Vendredi", targetText: "Vendredi (Duala)", audioKey: "vendredi" },
        { sourceText: "Samedi",   targetText: "Samedi (Duala)",   audioKey: "samedi" },
        { sourceText: "Dimanche", targetText: "Dimanche (Duala)", audioKey: "dimanche" },
      ],
    },
    "duala_pronoms": {
      title: "Les pronoms personnel",
      items: [
        { sourceText: "Moi",  targetText: "Moi (Duala)",  audioKey: "moi" },
        { sourceText: "Toi",  targetText: "Toi (Duala)",  audioKey: "toi" },
        { sourceText: "Lui",  targetText: "Lui (Duala)",  audioKey: "lui" },
        { sourceText: "Nous", targetText: "Nous (Duala)", audioKey: "nous" },
        { sourceText: "Vous", targetText: "Vous (Duala)", audioKey: "vous" },
        { sourceText: "Eux",  targetText: "Eux (Duala)",  audioKey: "eux" },
      ],
    },
    "duala_etre": {
      title: "Le verbe etre",
      items: [
        { sourceText: "Je suis",           targetText: "Je suis (Duala)",           audioKey: "je_suis" },
        { sourceText: "Tu es",             targetText: "Tu es (Duala)",             audioKey: "tu_es" },
        { sourceText: "Il ou elle est",    targetText: "Il ou elle est (Duala)",    audioKey: "il_elle_est" },
        { sourceText: "Nous sommes",       targetText: "Nous sommes (Duala)",       audioKey: "nous_sommes" },
        { sourceText: "Vous êtes",         targetText: "Vous êtes (Duala)",         audioKey: "vous_etes" },
        { sourceText: "Ils ou elles sont", targetText: "Ils ou elles sont (Duala)", audioKey: "ils_elles_sont" },
      ],
    },
    "duala_avoir": {
      title: "Le verbe avoir",
      items: [
        { sourceText: "J'ai",              targetText: "J'ai (Duala)",              audioKey: "j_ai" },
        { sourceText: "Tu as",             targetText: "Tu as (Duala)",             audioKey: "tu_as" },
        { sourceText: "Il ou elle a",      targetText: "Il ou elle a (Duala)",      audioKey: "il_elle_on_a" },
        { sourceText: "Nous avons",        targetText: "Nous avons (Duala)",        audioKey: "nous_avons" },
        { sourceText: "Vous avez",         targetText: "Vous avez (Duala)",         audioKey: "vous_avez" },
        { sourceText: "Ils ou elles ont",  targetText: "Ils ou elles ont (Duala)",  audioKey: "ils_elles_ont" },
      ],
    },
    "duala_chiffres": {
      title: "Les chiffres 1-9 en duala",
      items: [
        { sourceText: "Zéro",  targetText: "Zéro (Duala)",  audioKey: "zero" },
        { sourceText: "Un",    targetText: "Un (Duala)",    audioKey: "un" },
        { sourceText: "Deux",  targetText: "Deux (Duala)",  audioKey: "deux" },
        { sourceText: "Trois", targetText: "Trois (Duala)", audioKey: "trois" },
        { sourceText: "Quatre",targetText: "Quatre (Duala)",audioKey: "quatre" },
        { sourceText: "Cinq",  targetText: "Cinq (Duala)",  audioKey: "cinq" },
        { sourceText: "Six",   targetText: "Six (Duala)",   audioKey: "six" },
        { sourceText: "Sept",  targetText: "Sept (Duala)",  audioKey: "sept" },
        { sourceText: "Huit",  targetText: "Huit (Duala)",  audioKey: "huit" },
        { sourceText: "Neuf",  targetText: "Neuf (Duala)",  audioKey: "neuf" },
      ],
    },
    "duala_couleurs": {
      title: "Les couleur",
      items: [
        { sourceText: "Noir",   targetText: "Noir (Duala)",   audioKey: "noir" },
        { sourceText: "Blanc",  targetText: "Blanc (Duala)",  audioKey: "blanc" },
        { sourceText: "Jaune",  targetText: "Jaune (Duala)",  audioKey: "jaune" },
        { sourceText: "Orange", targetText: "Orange (Duala)", audioKey: "orange" },
        { sourceText: "Rouge",  targetText: "Rouge (Duala)",  audioKey: "rouge" },
        { sourceText: "Bleu",   targetText: "Bleu (Duala)",   audioKey: "bleu" },
        { sourceText: "Vert",   targetText: "Vert (Duala)",   audioKey: "vert" },
      ],
    },
  };

  const data = themeMap[themeId];
  if (!data) return null;

  // Create a single consolidated lesson for the entire theme
  return {
    lessons: [
      {
        id: `virt_${themeId}_0`,
        title: data.title,
        subtitle: "Consolidated Lesson",
        audioUrl: null,
        order: 0,
      }
    ],
  };
}

export function getDualaThemeItems(themeId) {
  const themeMap = {
    "duala_jour": {
      title: "Les sept jour de la semaine",
      items: [
        { sourceText: "Lundi",    targetText: "Mɔsi",    audioKey: "lundi" },
        { sourceText: "Mardi",    targetText: "Kwasi",    audioKey: "mardi" },
        { sourceText: "Mercredi", targetText: "Mukɔsi", audioKey: "mercredi" },
        { sourceText: "Jeudi",    targetText: "Ngisi",   audioKey: "jeudi" },
        { sourceText: "Vendredi", targetText: "Ndɔsi", audioKey: "vendredi" },
        { sourceText: "Samedi",   targetText: "Esaba",   audioKey: "samedi" },
        { sourceText: "Dimanche", targetText: "Étina", audioKey: "dimanche" },
      ],
    },
    "duala_pronoms": {
      title: "Les pronoms personnel",
      items: [
        { sourceText: "Moi",  targetText: "mba",  audioKey: "moi" },
        { sourceText: "Toi",  targetText: "wa",  audioKey: "toi" },
        { sourceText: "Lui",  targetText: "mɔ́",  audioKey: "lui" },
        { sourceText: "Nous", targetText: "bisɔ́", audioKey: "nous" },
        { sourceText: "Vous", targetText: "binyɔ́", audioKey: "vous" },
        { sourceText: "Eux",  targetText: "babó",  audioKey: "eux" },
      ],
    },
    "duala_etre": {
      title: "Le verbe etre",
      items: [
        { sourceText: "Je suis",           targetText: "Na e",           audioKey: "je_suis" },
        { sourceText: "Tu es",             targetText: "O e",             audioKey: "tu_es" },
        { sourceText: "Il ou elle est",    targetText: "A e",    audioKey: "il_elle_est" },
        { sourceText: "Nous sommes",       targetText: "DI e",       audioKey: "nous_sommes" },
        { sourceText: "Vous êtes",         targetText: "LO e",         audioKey: "vous_etes" },
        { sourceText: "Ils ou elles sont", targetText: "BA e", audioKey: "ils_elles_sont" },
      ],
    },
    "duala_avoir": {
      title: "Le verbe avoir",
      items: [
        { sourceText: "J'ai",              targetText: "Na bén",              audioKey: "j_ai" },
        { sourceText: "Tu as",             targetText: "O bén",             audioKey: "tu_as" },
        { sourceText: "Il ou elle a",      targetText: "A bén",      audioKey: "il_elle_on_a" },
        { sourceText: "Nous avons",        targetText: "DI bén",        audioKey: "nous_avons" },
        { sourceText: "Vous avez",         targetText: "LO bén",         audioKey: "vous_avez" },
        { sourceText: "Ils ou elles ont",  targetText: "BA bén",  audioKey: "ils_elles_ont" },
      ],
    },
    "duala_chiffres": {
      title: "Les chiffres 1-9 en duala",
      items: [
        { sourceText: "Zéro",  targetText: "tɔ lambo",  audioKey: "zero" },
        { sourceText: "Un",    targetText: "ewɔ́",    audioKey: "un" },
        { sourceText: "Deux",  targetText: "ɓéɓǎ",    audioKey: "deux" },
        { sourceText: "Trois", targetText: "ɓélálo", audioKey: "trois" },
        { sourceText: "Quatre",targetText: "ɓénɛí",audioKey: "quatre" },
        { sourceText: "Cinq",  targetText: "ɓétánu",  audioKey: "cinq" },
        { sourceText: "Six",   targetText: "mutóɓá",   audioKey: "six" },
        { sourceText: "Sept",  targetText: "saámbá",  audioKey: "sept" },
        { sourceText: "Huit",  targetText: "lɔɔmbi",  audioKey: "huit" },
        { sourceText: "Neuf",  targetText: "dibuá",  audioKey: "neuf" },
      ],
    },
    "duala_couleurs": {
      title: "Les couleur",
      items: [
        { sourceText: "Noir",   targetText: "mundo",   audioKey: "noir" },
        { sourceText: "Blanc",  targetText: "sánga",  audioKey: "blanc" },
        { sourceText: "Jaune",  targetText: "njabi",  audioKey: "jaune" },
        { sourceText: "Orange", targetText: "epumá", audioKey: "orange" },
        { sourceText: "Rouge",  targetText: "jóla",  audioKey: "rouge" },
        { sourceText: "Bleu",   targetText: "bulu",   audioKey: "bleu" },
        { sourceText: "Vert",   targetText: "musono mw’éyadí",   audioKey: "vert" },
      ],
    },
  };
  return themeMap[themeId]?.items || [];
}

export const DUALA_VIRTUAL_IDS = [
  "duala_jour",
  "duala_pronoms",
  "duala_etre",
  "duala_avoir",
  "duala_chiffres",
  "duala_couleurs",
];

export function isDualaVirtualId(themeId) {
  return DUALA_VIRTUAL_IDS.includes(themeId);
}

export function getAllDualaVirtualData() {
  const lessons = DUALA_VIRTUAL_IDS.map((id, idx) => {
    const data = getDualaVirtualData(id);
    if (!data || !data.lessons || data.lessons.length === 0) return null;
    return {
      ...data.lessons[0],
      id: `virt_${id}_0`,
      order: idx,
      virtualThemeId: id,
    };
  }).filter(Boolean);

  return { lessons };
}

export default {};
