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
        { sourceText: "Moi",  targetText: "Moi (Duala)",  audioKey: "Moi" },
        { sourceText: "Toi",  targetText: "Toi (Duala)",  audioKey: "Toi" },
        { sourceText: "Lui",  targetText: "Lui (Duala)",  audioKey: "Lui" },
        { sourceText: "Nous", targetText: "Nous (Duala)", audioKey: "Nous" },
        { sourceText: "Vous", targetText: "Vous (Duala)", audioKey: "Vous" },
        { sourceText: "Eux",  targetText: "Eux (Duala)",  audioKey: "Eux" },
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
        { sourceText: "Il ou elle a",      targetText: "Il ou elle a (Duala)",      audioKey: "il_elle_a" },
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
        { sourceText: "Moi",  targetText: "Moi (Duala)",  audioKey: "Moi" },
        { sourceText: "Toi",  targetText: "Toi (Duala)",  audioKey: "Toi" },
        { sourceText: "Lui",  targetText: "Lui (Duala)",  audioKey: "Lui" },
        { sourceText: "Nous", targetText: "Nous (Duala)", audioKey: "Nous" },
        { sourceText: "Vous", targetText: "Vous (Duala)", audioKey: "Vous" },
        { sourceText: "Eux",  targetText: "Eux (Duala)",  audioKey: "Eux" },
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
        { sourceText: "Il ou elle a",      targetText: "Il ou elle a (Duala)",      audioKey: "il_elle_a" },
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
