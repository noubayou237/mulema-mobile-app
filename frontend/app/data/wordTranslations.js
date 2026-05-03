/**
 * English translations for French lesson/exercise words.
 * Patrimonial-language text (word_local / subtitle) is NEVER translated here —
 * it is always shown as-is regardless of UI language.
 *
 * Usage:
 *   import { getWordDisplay } from "./wordTranslations";
 *   const display = getWordDisplay(lesson.title, i18n.language); // EN or FR
 */

const FR_TO_EN = {
  // ── Les 7 Jours de la Semaine ──────────────────────────────────
  "Lundi":     "Monday",
  "Mardi":     "Tuesday",
  "Mercredi":  "Wednesday",
  "Jeudi":     "Thursday",
  "Vendredi":  "Friday",
  "Samedi":    "Saturday",
  "Dimanche":  "Sunday",

  // ── Verbe ÊTRE ────────────────────────────────────────────────
  "Je suis":            "I am",
  "Tu es":              "You are",
  "Il / Elle est":      "He / She is",
  "Nous sommes":        "We are",
  "Vous êtes":          "You are (plural)",
  "Ils / Elles sont":   "They are",

  // ── Verbe AVOIR ───────────────────────────────────────────────
  "J'ai":               "I have",
  "Tu as":              "You have",
  "Il / Elle a":        "He / She has",
  "Nous avons":         "We have",
  "Vous avez":          "You have (plural)",
  "Ils / Elles ont":    "They have",

  // ── Verbe MANGER ──────────────────────────────────────────────
  "Je mange":             "I eat",
  "Tu manges":            "You eat",
  "Il / Elle mange":      "He / She eats",
  "Nous mangeons":        "We eat",
  "Vous mangez":          "You eat (plural)",
  "Ils / Elles mangent":  "They eat",

  // ── Verbe MARCHER ─────────────────────────────────────────────
  "Je marche":              "I walk",
  "Tu marches":             "You walk",
  "Il / Elle marche":       "He / She walks",
  "Nous marchons":          "We walk",
  "Vous marchez":           "You walk (plural)",
  "Ils / Elles marchent":   "They walk",

  // ── Verbe PRENDRE ─────────────────────────────────────────────
  "Je prends":              "I take",
  "Tu prends":              "You take",
  "Il / Elle prend":        "He / She takes",
  "Nous prenons":           "We take",
  "Vous prenez":            "You take (plural)",
  "Ils / Elles prennent":   "They take",

  // ── Verbe ACHETER ─────────────────────────────────────────────
  "J'achète":               "I buy",
  "Tu achètes":             "You buy",
  "Il / Elle achète":       "He / She buys",
  "Nous achetons":          "We buy",
  "Vous achetez":           "You buy (plural)",
  "Ils / Elles achètent":   "They buy",

  // ── Vie de Famille ────────────────────────────────────────────
  "Le papa":            "Dad",
  "La maman":           "Mom",
  "La tante":           "The aunt",
  "Un homme":           "A man",
  "L'oncle":            "The uncle",
  "Une femme":          "A woman",
  "Les grands-parents": "The grandparents",
  "Mon frère":          "My brother",
  "Les enfants":        "The children",
  "Le bébé":            "The baby",
  "Bonjour mon ami.":   "Hello my friend.",
  "Comment vas-tu ?":   "How are you?",
  "Je vais assez bien.":"I am doing well.",
  "Merci.":             "Thank you.",

  // ── La Savane ─────────────────────────────────────────────────
  "Le lion":        "The lion",
  "L'épervier":     "The sparrowhawk",
  "Le poisson":     "The fish",
  "Les poissons":   "The fish (plural)",
  "Le cheval":      "The horse",
  "Le bœuf":        "The ox",
  "Le poulet":      "The chicken",
  "Le serpent":     "The snake",
  "Les sangliers":  "The wild boars",
  "L'éléphant":     "The elephant",
  "Les abeilles":   "The bees",
  "La sauterelle":  "The grasshopper",
  "Le cafard":      "The cockroach",
  "Les singes":     "The monkeys",

  // ── La Cuisine ────────────────────────────────────────────────
  "Le feu":         "Fire",
  "La flamme":      "The flame",
  "L'eau":          "Water",
  "Le sel":         "Salt",
  "L'huile":        "Oil",
  "Les légumes":    "Vegetables",
  "Le gibier":      "Game (meat)",
  "La fourchette":  "The fork",
  "La marmite":     "The cooking pot",
  "Le puits":       "The well",
  "Le feu de bois": "The wood fire",

  // ── La Mode ───────────────────────────────────────────────────
  "Cet habit":       "This outfit",
  "Cette chemise":   "This shirt",
  "Ce pantalon":     "These trousers",
  "Ces caleçons":    "These underwear",
  "Ce manteau":      "This coat",
  "Ces costumes":    "These suits",
  "Cette chaussure": "This shoe",
  "Ces boubous":     "These boubous",
  "Ce chapeau":      "This hat",
  "La cravate":      "The tie",
  "La veste":        "The jacket",
  "Une chemise":     "A shirt",
  "Un habit":        "An outfit",
  "Les pantalons":   "Trousers",
  "La chaussure":    "The shoe",

  // ── Duala — Vie de Famille ────────────────────────────────────
  "Le papa":                 "Dad",
  "La tante paternelle":     "Paternal aunt",
  "La maman":                "Mom",
  "L'oncle paternel":        "Paternal uncle",
  "Le frère":                "Brother",
  "La sœur":                 "Sister",
  "Bonjour":                 "Hello",
  "Bonne chance":            "Good luck",
  "Bonsoir":                 "Good evening",
  "Merci":                   "Thank you",

  // ── Common across languages ───────────────────────────────────
  "Le bœuf":          "The ox / The bull",
  "Les poulets":      "Chickens",
  "La girafe":        "The giraffe",
  "Le chat":          "The cat",
  "Les termites":     "Termites",
  "La farine":        "Flour",
  "La flamme":        "The flame",
  "Le feu":           "Fire",
  "Le sel":           "Salt",
  "L'eau":            "Water",
  "Le sucre":         "Sugar",
  "L'huile":          "Oil",
  "La pierre":        "The stone",
  "Le couteau":       "The knife",
  "Le poisson":       "Fish",
  "Le gibier":        "Game (meat)",
  "Ce chapeau":       "This hat",
  "Ce manteau":       "This coat",
  "Ce pantalon":      "These trousers",
  "Ces boubous":      "These boubous",
  "Ces caleçons":     "These underwear",
  "Ces costumes":     "These suits",
  "Cet habit":        "This outfit",
  "Cette chaussure":  "This shoe",
  "Cette chemise":    "This shirt",
  "La veste":         "The jacket",
  "La cravate":       "The tie",
  "Un habit":         "An outfit",
  "Une chemise":      "A shirt",
  "Les pantalons":    "Trousers",
  "La chaussure":     "The shoe",
};

/**
 * Return the display text for a source word.
 * - If UI language is English (starts with 'en'), returns English if available.
 * - Otherwise returns the original French text.
 * - Never called on patrimonial text (word_local / subtitle).
 *
 * @param {string} wordFr   — French word from the DB (lesson.title)
 * @param {string} uiLang   — Current i18n language code (e.g. 'en', 'fr')
 * @returns {string}
 */
export function getWordDisplay(wordFr, uiLang = "fr") {
  if (!wordFr) return wordFr;
  if (uiLang?.startsWith("en")) {
    return FR_TO_EN[wordFr] ?? wordFr;
  }
  return wordFr;
}

export default FR_TO_EN;
