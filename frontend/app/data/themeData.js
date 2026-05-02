import { IMAGES_MAP, AUDIOS_MAP } from "../../src/utils/AssetsMap";

/**
 * Shared Word Pool for Theme: Famille (Family)
 *
 * This file contains the core vocabulary for the Family theme.
 * ALL exercises should use these same 6 words to ensure proper
 * pedagogical repetition and memorization.
 *
 * Each word contains:
 * - id: Unique identifier
 * - fr: French source text
 * - local: Target language (Duala) text
 * - image: Image asset key
 * - audio: Audio asset key
 * - difficulty: Difficulty level (1-5)
 */

export const THEME_FAMILLE_WORDS = [
  {
    id: "p1",
    fr: "Le papa",
    local: "Papá",
    image: "father",
    audio: "papa",
    difficulty: 1
  },
  {
    id: "p2",
    fr: "La tante paternelle",
    local: "Ndómɛ á tetɛ́",
    image: "paternal_aunt",
    audio: "tante_paternelle",
    difficulty: 3
  },
  {
    id: "p3",
    fr: "La maman",
    local: "Mamá",
    image: "mother",
    audio: "maman",
    difficulty: 1
  },
  {
    id: "p4",
    fr: "L'oncle paternel",
    local: "Árí á tetɛ́",
    image: "paternal_uncle",
    audio: "oncle_paternel",
    difficulty: 3
  },
  {
    id: "p5",
    fr: "Le frère",
    local: "Muna",
    image: "brother",
    audio: "frere",
    difficulty: 1
  },
  {
    id: "p6",
    fr: "La sœur",
    local: "Sango",
    image: "sister",
    audio: "soeur",
    difficulty: 1
  }
];

export const THEME_VETEMENTS_WORDS = [
  {
    id: "v1",
    fr: "La cravate",
    local: "ŋkwə̂ntúŋ",
    image: "tie",
    audio: "tie",
    difficulty: 2
  },
  {
    id: "v2",
    fr: "La veste",
    local: "dzə̂msə̀m",
    image: "jacket",
    audio: "jacket",
    difficulty: 2
  },
  {
    id: "v3",
    fr: "Cette chaussure",
    local: "Mtǎp mɔ̌",
    image: "shoes",
    audio: "shoes",
    difficulty: 1
  },
  {
    id: "v4",
    fr: "Les babouches",
    local: "mlə̀pâsì",
    image: "babouches",
    audio: "babouches",
    difficulty: 2
  },
  {
    id: "v5",
    fr: "Le t-shirt",
    local: "tíshɔ́t",
    image: "tshirt",
    audio: "tshirt",
    difficulty: 1
  },
  {
    id: "v6",
    fr: "Le pantalon",
    local: "mlâshì",
    image: "pants",
    audio: "pants",
    difficulty: 2
  },
  {
    id: "v7",
    fr: "Le boubou",
    local: "ndùǎ-ndùǎ",
    image: "boubou",
    audio: "boubou",
    difficulty: 2
  }
];

/**
 * Image Asset Mapping for Themes
 */
export const THEME_IMAGES = {
  famille: {
    p1: IMAGES_MAP.avatar_paul,
    p2: IMAGES_MAP.avatar_sophie_1,
    p3: IMAGES_MAP.avatar_ngon_1,
    p4: IMAGES_MAP.avatar_tjega_1,
    p5: IMAGES_MAP.avatar_paul,
    p6: IMAGES_MAP.avatar_sophie_1,
  },
  vetements: {
    tie: IMAGES_MAP.tie,
    jacket: IMAGES_MAP.suit,
    shoes: IMAGES_MAP.shoes,
    babouches: IMAGES_MAP.ladder_shoes,
    tshirt: IMAGES_MAP.t_shirt,
    pants: IMAGES_MAP.trouser,
    boubou: IMAGES_MAP.t_shirt, // Fallback for boubou
  }
};

/**
 * Audio Asset Mapping for Themes (Centralized)
 */
export const THEME_AUDIO = {
  famille: {
    p1: AUDIOS_MAP.mon_frere_en_duala,
    p2: AUDIOS_MAP.les_grands_parents_en_duala,
    p3: AUDIOS_MAP.le_bebe_en_duala,
    p4: AUDIOS_MAP.l_oncle_en_douala,
    p5: AUDIOS_MAP.mon_frere_en_duala,
    p6: AUDIOS_MAP.le_bebe_en_duala
  },
  vetements: {
    tie: AUDIOS_MAP.exer_n2_rpsne_n1,
    jacket: AUDIOS_MAP.exer_3_rpsne_n1_la_veste_duala,
    shoes: AUDIOS_MAP.cette_chaussure_en_langue_duala,
    babouches: AUDIOS_MAP.exer_3_rpsne_n5_la_paire_de_babouche_en_duala,
    tshirt: AUDIOS_MAP.cette_habit_en_langue_duala,
    pants: AUDIOS_MAP.exer_3_rpsne_n2_les_pentalons_en_duala,
    boubou: AUDIOS_MAP.ces_boubou_en_lanue_duala
  }
};

/**
 * Get words for a specific exercise type
 *
 * @param {string} theme - Theme code (famille, vetements)
 * @param {string} exerciseType - Type of exercise (matching, write, select)
 * @param {number} count - Number of words to return
 * @returns {Array} Array of word objects
 */
export const getWordsForExercise = (theme, exerciseType, count = 6) => {
  const pool = theme === "vetements" ? THEME_VETEMENTS_WORDS : THEME_FAMILLE_WORDS;
  switch (exerciseType) {
    case "matching":
      return pool;
    case "write":
      return pool.slice(0, Math.min(count, 4));
    case "select":
      return pool.slice(0, Math.min(count, 4));
    default:
      return pool;
  }
};

/**
 * Get a random subset of words
 *
 * @param {string} theme - Theme code
 * @param {number} count - Number of words to return
 * @returns {Array} Array of random word objects
 */
export const getRandomWords = (theme, count = 3) => {
  const pool = theme === "vetements" ? THEME_VETEMENTS_WORDS : THEME_FAMILLE_WORDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
};

/**
 * Get wrong options for select exercise
 * Returns words that are NOT the correct answer
 *
 * @param {string} theme - Theme code
 * @param {string} correctWordId - ID of the correct word
 * @param {number} optionCount - Total number of options needed
 * @returns {Array} Array of wrong word objects
 */
export const getWrongOptions = (theme, correctWordId, optionCount = 3) => {
  const pool = theme === "vetements" ? THEME_VETEMENTS_WORDS : THEME_FAMILLE_WORDS;
  const wrongWords = pool.filter((w) => w.id !== correctWordId);
  const shuffled = wrongWords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(optionCount, wrongWords.length));
};

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  id: "famille",
  title: "Vie sociale & famille",
  description: "Learn vocabulary for family members",
  language: "dual", // Duala
  targetLanguage: "fr", // From French
  wordCount: 6,
  difficulty: 1
};

export default THEME_FAMILLE_WORDS;
