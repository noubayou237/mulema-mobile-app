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

/**
 * Get words for a specific exercise type
 *
 * @param {string} exerciseType - Type of exercise (matching, write, select)
 * @param {number} count - Number of words to return
 * @returns {Array} Array of word objects
 */
export const getWordsForExercise = (exerciseType, count = 6) => {
  switch (exerciseType) {
    case "matching":
      // Use all 6 words for matching exercise
      return THEME_FAMILLE_WORDS;
    case "write":
      // Use 3-4 words for writing exercise (subset)
      return THEME_FAMILLE_WORDS.slice(0, Math.min(count, 4));
    case "select":
      // Use 2-3 words for selection exercise (subset)
      return THEME_FAMILLE_WORDS.slice(0, Math.min(count, 3));
    default:
      return THEME_FAMILLE_WORDS;
  }
};

/**
 * Get a random subset of words
 *
 * @param {number} count - Number of words to return
 * @returns {Array} Array of random word objects
 */
export const getRandomWords = (count = 3) => {
  const shuffled = [...THEME_FAMILLE_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, THEME_FAMILLE_WORDS.length));
};

/**
 * Get wrong options for select exercise
 * Returns words that are NOT the correct answer
 *
 * @param {string} correctWordId - ID of the correct word
 * @param {number} optionCount - Total number of options needed
 * @returns {Array} Array of wrong word objects
 */
export const getWrongOptions = (correctWordId, optionCount = 3) => {
  const wrongWords = THEME_FAMILLE_WORDS.filter((w) => w.id !== correctWordId);
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
