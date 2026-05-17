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
  // ── Pronoms ──────────────────────────────────────────────────
  "Moi":                "Me",
  "Toi":                "You",
  "Lui":                "Him / Her",
  "Elle":               "Her",
  "Nous":               "We",
  "Vous":               "You (plural)",
  "Eux":                "Them",
  "Tu":                 "You",
  "Il ou Elle":         "He or She",
  "Il / Elle":          "He / She",
  "Il/Elle":            "He / She",
  "Ils ou Elles":       "They",
  "Ils / Elles":        "They",
  "Ils/Elles":          "They",

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
  "Il ou Elle est":     "He / She is",
  "Il/Elle est":        "He / She is",
  "Il ou elle est":     "He / She is",
  "Nous sommes":        "We are",
  "Vous êtes":          "You are (plural)",
  "Vous etes":          "You are (plural)",
  "Ils / Elles sont":   "They are",
  "Ils ou Elles sont":  "They are",
  "Ils/Elles sont":     "They are",
  "Ils ou elles sont":  "They are",

  // ── Verbe AVOIR ───────────────────────────────────────────────
  "J'ai":               "I have",
  "J'ai":               "I have",
  "Tu as":              "You have",
  "Il / Elle a":        "He / She has",
  "Il ou Elle a":       "He / She has",
  "Il/Elle a":          "He / She has",
  "Il ou elle a":       "He / She has",
  "Nous avons":         "We have",
  "Vous avez":          "You have (plural)",
  "Ils / Elles ont":    "They have",
  "Ils ou Elles ont":   "They have",
  "Ils/Elles ont":      "They have",
  "Ils ou elles ont":   "They have",

  // ── Verbe MANGER ──────────────────────────────────────────────
  "Je mange":             "I eat",
  "Tu manges":            "You eat",
  "Il / Elle mange":      "He / She eats",
  "Il ou Elle mange":     "He / She eats",
  "Il ou elle mange":     "He / She eats",
  "Nous mangeons":        "We eat",
  "Vous mangez":          "You eat (plural)",
  "Ils / Elles mangent":  "They eat",
  "Ils ou Elles mangent": "They eat",
  "Ils ou elles mangent": "They eat",

  // ── Verbe MARCHER ─────────────────────────────────────────────
  "Je marche":              "I walk",
  "Tu marches":             "You walk",
  "Il / Elle marche":       "He / She walks",
  "Il ou Elle marche":      "He / She walks",
  "Il ou elle marche":      "He / She walks",
  "Nous marchons":          "We walk",
  "Vous marchez":           "You walk (plural)",
  "Ils / Elles marchent":   "They walk",
  "Ils ou Elles marchent":  "They walk",
  "Ils ou elles marchent":  "They walk",

  // ── Verbe PRENDRE ─────────────────────────────────────────────
  "Je prends":              "I take",
  "Tu prends":              "You take",
  "Il / Elle prend":        "He / She takes",
  "Il ou Elle prend":       "He / She takes",
  "Il ou elle prend":       "He / She takes",
  "Nous prenons":           "We take",
  "Vous prenez":            "You take (plural)",
  "Ils / Elles prennent":   "They take",
  "Ils ou Elles prennent":  "They take",
  "Ils ou elles prennent":  "They take",

  // ── Verbe ACHETER ─────────────────────────────────────────────
  "J'achète":               "I buy",
  "J'achete":               "I buy",
  "Tu achètes":             "You buy",
  "Tu achetes":             "You buy",
  "Il / Elle achète":       "He / She buys",
  "Il ou Elle achete":      "He / She buys",
  "Il ou elle achète":      "He / She buys",
  "Il ou elle achete":      "He / She buys",
  "Nous achetons":          "We buy",
  "Vous achetez":           "You buy (plural)",
  "Ils / Elles achètent":   "They buy",
  "Ils ou Elles achetent":  "They buy",
  "Ils ou elles achètent":  "They buy",
  "Ils ou elles achetent":  "They buy",

  // ── Les Chiffres ──────────────────────────────────────────────
  "Zéro":   "Zero",
  "Zero":   "Zero",
  "Un":     "One",
  "Deux":   "Two",
  "Trois":  "Three",
  "Quatre": "Four",
  "Cinq":   "Five",
  "Six":    "Six",
  "Sept":   "Seven",
  "Huit":   "Eight",
  "Neuf":   "Nine",

  // ── Les Couleurs ──────────────────────────────────────────────
  "Noir":   "Black",
  "Blanc":  "White",
  "Jaune":  "Yellow",
  "Orange": "Orange",
  "Rouge":  "Red",
  "Bleu":   "Blue",
  "Vert":   "Green",

  // ── Les Leçons de la Langue Bassa ─────────────────────────────
  "le 7 jour de la semaine": "The 7 days of the week",
  "Les 7 jours de la semaine": "The 7 days of the week",
  "le 7 jours de la semaine": "The 7 days of the week",
  "Les verbes": "The verbs",
  "Verbe ÊTRE": "Verb TO BE",
  "Verbe AVOIR": "Verb TO HAVE",
  "Verbe MANGER": "Verb TO EAT",
  "Verbe MARCHER": "Verb TO WALK",
  "Verbe PRENDRE": "Verb TO TAKE",
  "Verbe ACHETER": "Verb TO BUY",

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
  "Bonjour mon ami":   "Hello my friend",
  "Comment vas-tu ?":   "How are you?",
  "Je vais assez bien": "I am doing well",
  "Merci":             "Thank you",

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
  "La tante paternelle":     "Paternal aunt",
  "L'oncle paternel":        "Paternal uncle",
  "Le frère":                "Brother",
  "La sœur":                 "Sister",
  "Bonjour":                 "Hello",
  "Bonne chance":            "Good luck",
  "Bonsoir":                 "Good evening",

  // ── Common across languages ───────────────────────────────────
  "Le bœuf":          "The ox / The bull",
  "Les poulets":      "Chickens",
  "La girafe":        "The giraffe",
  "Le chat":          "The cat",
  "Les termites":     "Termites",
  "La farine":        "Flour",
  "Le sucre":         "Sugar",
  "La pierre":        "The stone",
  "Le couteau":       "The knife",

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
