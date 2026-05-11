/**
 * Bassa exercise data — curated for premium thematic progression.
 * Sourced from the docx files and refined for the new UI.
 *
 * Each theme typically features:
 *   match    → Exercise 1: Pair matching
 *   write    → Exercise 2: Listen & Write phrases
 *   imageQcm → Exercise 3: Image selection
 */
import { getWordDisplay } from "./wordTranslations";

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDATION POOLS (Used for mixing into theme sessions)
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_POOL = [
  { id: 'mix_d_0', title: "Lundi",    subtitle: "ŋgwà njaŋgumba", audioUrl: "lundi_1" },
  { id: 'mix_d_1', title: "Mardi",    subtitle: "ŋgwà ûm",        audioUrl: "mardi_1" },
  { id: 'mix_d_2', title: "Mercredi", subtitle: "ŋgwà ŋgê",       audioUrl: "mercredi_1" },
  { id: 'mix_d_3', title: "Jeudi",    subtitle: "ŋgwà mbɔk",      audioUrl: "jeudi_1" },
  { id: 'mix_d_4', title: "Vendredi", subtitle: "ŋgwà kɔɔ",       audioUrl: "vendredi_1" },
  { id: 'mix_d_5', title: "Samedi",   subtitle: "ŋgwà jôn",       audioUrl: "samedi_1" },
  { id: 'mix_d_6', title: "Dimanche", subtitle: "ŋgwà nɔŷ",       audioUrl: "dimanche_1" },
];

const VERBS_POOL = [
  { id: 'mix_v_0', title: "J'ai",           subtitle: "mè gwě", audioUrl: "j_aiwav" },
  { id: 'mix_v_1', title: "Tu as",          subtitle: "Ù gwě",  audioUrl: "tu_as_1" },
  { id: 'mix_v_2', title: "Nous avons",      subtitle: "Di gwě", audioUrl: "nous_avons_1" },
  { id: 'mix_v_3', title: "Je suis",        subtitle: "mè yè",  audioUrl: "je_suis_1" },
  { id: 'mix_v_4', title: "Tu es",          subtitle: "Ù yè",   audioUrl: "tu_es_2" },
  { id: 'mix_v_5', title: "Nous sommes",    subtitle: "Di yè",  audioUrl: "nous_sommes_1" },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME 0 — La Famille (Vie de famille en Bassa)
// ─────────────────────────────────────────────────────────────────────────────
const t0_match = [
  { id: 'b0m1',  title: 'Le papa',          subtitle: 'Itâ',       audioUrl: 'le_papa' },
  { id: 'b0m2',  title: 'La maman',         subtitle: 'Inī',       audioUrl: 'la_maman' },
  { id: 'b0m3',  title: 'La tante',         subtitle: 'Sità',      audioUrl: 'la_tante' },
  { id: 'b0m4',  title: 'Un homme',         subtitle: 'Mùnlom',    audioUrl: 'un_homme_exer1' },
  { id: 'b0m5',  title: "L'oncle",          subtitle: 'Nyàndom',   audioUrl: 'l_oncle_exer1' },
  { id: 'b0m6',  title: 'Une femme',        subtitle: 'Mùdǎ',      audioUrl: 'une_femme_exer1' },
  { id: 'b0m7',  title: 'Les grands-parents', subtitle: 'Màjò',   audioUrl: 'les_grands_parents' },
];

const t0_write = [
  { id: 'b0w1', title: 'Bonjour mon ami',       subtitle: 'Mɛ̀ ǹyega',    audioUrl: 'bonjour_mon_ami' },
  { id: 'b0w2', title: 'Comment vas-tu ?',      subtitle: 'Ù ŋ́kɛ̀ laa',  audioUrl: 'comment_vastu' },
  { id: 'b0w3', title: 'Je vais assez bien',    subtitle: 'Mɛ̀ yè mboo',  audioUrl: 'je_vais_assez_bien_merci' },
  { id: 'b0w4', title: 'Merci',                 subtitle: 'Mɛ̀ ǹyegà',   audioUrl: 'merci_bassa' },
];

const t0_imageQcm = [
  { id: 'b0i1', title: "L'oncle",           subtitle: 'Nyàndom',  audioUrl: 'l_oncle',          imageUrl: 'uncle'        },
  { id: 'b0i2', title: 'Le bébé',           subtitle: 'Ǹsɛt man', audioUrl: 'le_bebe',          imageUrl: 'baby'         },
  { id: 'b0i3', title: 'Un homme',          subtitle: 'Mùnlom',   audioUrl: 'un_homme',          imageUrl: 'couple'       },
  { id: 'b0i4', title: 'Une femme',         subtitle: 'Mùdǎ',     audioUrl: 'une_femme',         imageUrl: 'aunty'        },
  { id: 'b0i5', title: 'Les grands-parents', subtitle: 'Màjò',   audioUrl: 'les_grands_parents', imageUrl: 'grandparents' },
  { id: 'b0i6', title: 'Les enfants',       subtitle: 'Ɓɔ̀ŋgɛ',   audioUrl: 'les_enfants',       imageUrl: 'children'     },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME 1 — La Savane
// ─────────────────────────────────────────────────────────────────────────────
const t1_match = [
  { id: 'b1m1', title: 'Le lion',       subtitle: 'Hɔ́sì',    audioUrl: 'le_lion' },
  { id: 'b1m2', title: "L'épervier",    subtitle: 'Hyɔ̀bí',   audioUrl: 'l_epervier' },
  { id: 'b1m3', title: 'Le poisson',    subtitle: 'Nyɔ̀ɔ́',   audioUrl: 'le_poisson' },
  { id: 'b1m4', title: 'Les poissons',  subtitle: 'Njèé',     audioUrl: 'les_poissons' },
  { id: 'b1m5', title: 'Le cheval',     subtitle: 'Cɔ̀bí',    audioUrl: 'le_cheval' },
  { id: 'b1m6', title: 'Le bœuf',       subtitle: 'Kóp',      audioUrl: 'le_boeuf' },
  { id: 'b1m7', title: 'Le poulet',     subtitle: 'Ǹyògól',  audioUrl: 'le_poulet' },
  { id: 'b1m8', title: 'Le serpent',    subtitle: 'Nyàgà',   audioUrl: 'le_serpent' },
];

const t1_write = [
  { id: 'b1w1', title: 'Les poissons',  subtitle: 'Cɔ̀bí',       audioUrl: 'les_poissons_e2' },
  { id: 'b1w2', title: 'Les sangliers', subtitle: 'Ngǒy bìkay', audioUrl: 'les_sangliers' },
  { id: 'b1w3', title: "L'éléphant",    subtitle: 'Njɔ̀k',       audioUrl: 'l_elephant' },
  { id: 'b1w4', title: 'Les abeilles',  subtitle: 'Nyǒy',       audioUrl: 'les_abeilles' },
  { id: 'b1w5', title: 'La sauterelle', subtitle: 'Tátáŋgá',    audioUrl: 'la_sauterelle' },
];

const t1_imageQcm = [
  { id: 'b1i1', title: 'Le lion',       subtitle: 'Hɔ́sì',  audioUrl: 'le_lion',   imageUrl: 'lion'     },
  { id: 'b1i2', title: "L'éléphant",    subtitle: 'Njɔ̀k',  audioUrl: 'l_elephant', imageUrl: 'elephant' },
  { id: 'b1i3', title: 'Les singes',    subtitle: 'Kóy',   audioUrl: 'les_singes', imageUrl: 'monkeys'  },
  { id: 'b1i4', title: 'Le cafard',     subtitle: 'Pépéé', audioUrl: 'le_cafard',  imageUrl: 'cocroach' },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME 2 — Apprentissage Culinaire
// ─────────────────────────────────────────────────────────────────────────────
const t2_match = [
  { id: 'b2m1', title: 'Le feu',       subtitle: 'Hyèé',        audioUrl: 'le_feu' },
  { id: 'b2m2', title: 'La flamme',    subtitle: 'Lìndòmbò',   audioUrl: 'la_flamme' },
  { id: 'b2m3', title: "L'eau",        subtitle: 'Màlép',       audioUrl: 'l_eau' },
  { id: 'b2m4', title: 'Le sel',       subtitle: 'Ɓás',         audioUrl: 'le_sel' },
  { id: 'b2m5', title: "L'huile",      subtitle: 'Mòó',         audioUrl: 'l_huile' },
  { id: 'b2m6', title: 'Les légumes',  subtitle: 'Bìkáy bí jɛ́', audioUrl: 'les_legumes' },
];

const t2_write = [
  { id: 'b2w1', title: "L'eau",        subtitle: 'Màlép',       audioUrl: 'l_eau_e2' },
  { id: 'b2w2', title: 'Le poisson',   subtitle: 'Hyɔ̀bí',      audioUrl: 'le_poisson_e2' },
  { id: 'b2w3', title: 'Le feu',       subtitle: 'Hyèé',        audioUrl: 'le_feu_e2' },
  { id: 'b2w4', title: 'Le gibier',    subtitle: 'Nùgá',        audioUrl: 'le_gibier' },
  { id: 'b2w5', title: 'Les légumes',  subtitle: 'Bìkáy bi jɛ́', audioUrl: 'les_legumes_e2' },
];

const t2_imageQcm = [
  { id: 'b2i1', title: 'La fourchette',  subtitle: 'Ŋwàs',    audioUrl: 'la_fourchette',  imageUrl: 'fork'      },
  { id: 'b2i2', title: 'Le feu',         subtitle: 'Hyèé',    audioUrl: 'le_feu_de_bois', imageUrl: 'burn_fire' },
  { id: 'b2i3', title: "L'huile",        subtitle: 'Mòó',     audioUrl: 'l_huile',        imageUrl: 'olive_oil' },
  { id: 'b2i4', title: 'La marmite',     subtitle: 'Hìɓɛ̀ɛ́',  audioUrl: 'la_marmite',     imageUrl: 'flour'     },
  { id: 'b2i5', title: 'Le puits',       subtitle: 'Ɓɛ́ɛ́',     audioUrl: 'le_puits',       imageUrl: null        },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME 3 — La Mode
// ─────────────────────────────────────────────────────────────────────────────
const t3_match = [
  { id: 'b3m1',  title: 'Cet habit',        subtitle: 'I mbɔ̄t ìni',     audioUrl: 'cet_habit' },
  { id: 'b3m2',  title: 'Cette chemise',    subtitle: 'I jɔ̄mbɛ lini',   audioUrl: 'cette_chemise' },
  { id: 'b3m3',  title: 'Ce pantalon',      subtitle: 'I tɔ̀lɔ̀sîs nunu', audioUrl: 'ce_pantalon' },
  { id: 'b3m4',  title: 'Ces caleçons',     subtitle: 'I ŋkāndā unu',   audioUrl: 'ces_calecons' },
  { id: 'b3m5',  title: 'Ce manteau',       subtitle: 'I kodi mbèŋ ìni', audioUrl: 'ce_manteau' },
  { id: 'b3m6',  title: 'Ces costumes',     subtitle: 'Bikōdī bini',    audioUrl: 'ces_costumes' },
  { id: 'b3m7',  title: 'Ces boubous',      subtitle: 'Ɓa ɓùba ɓana',  audioUrl: 'ces_boubous' },
  { id: 'b3m8',  title: 'Cette chaussure',  subtitle: 'I tāmb ini',     audioUrl: 'cette_chaussure' },
  { id: 'b3m9',  title: 'Ce chapeau',       subtitle: 'I tàmba nunu',   audioUrl: 'ce_chapeau' },
];

const t3_write = [
  { id: 'b3w1', title: 'La cravate',  subtitle: 'Lilàŋ lini', audioUrl: 'la_cravate' },
  { id: 'b3w2', title: 'La veste',    subtitle: 'Kodî',       audioUrl: 'la_veste' },
  { id: 'b3w3', title: 'Une chemise', subtitle: 'Sɔdɛ̂',      audioUrl: 'une_chemise' },
  { id: 'b3w4', title: 'Un habit',    subtitle: 'Mbɔt',       audioUrl: 'un_habit' },
];

const t3_imageQcm = [
  { id: 'b3i1', title: 'La veste',      subtitle: 'Kódî',   audioUrl: 'la_veste_e4',   imageUrl: 'suit'    },
  { id: 'b3i2', title: 'Les pantalons', subtitle: 'BiLɔ̂ŋ', audioUrl: 'les_pantalons', imageUrl: 'trouser' },
  { id: 'b3i3', title: 'La chaussure',  subtitle: 'Támb',   audioUrl: 'la_chaussure',  imageUrl: 'shoes'   },
  { id: 'b3i4', title: 'La cravate',    subtitle: 'Lilàŋ lini', audioUrl: 'la_cravate', imageUrl: 'tie'    },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED MAP
// ─────────────────────────────────────────────────────────────────────────────
export const BASSA_EXERCISE_DATA = {
  0: { match: t0_match, write: t0_write, imageQcm: t0_imageQcm },
  1: { match: t1_match, write: t1_write, imageQcm: t1_imageQcm },
  2: { match: t2_match, write: t2_write, imageQcm: t2_imageQcm },
  3: { match: t3_match, write: t3_write, imageQcm: t3_imageQcm },
};

/**
 * Utility to shuffle an array.
 */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Build a Bassa-specific exercise session for a given theme order.
 *
 * @param {number} themeOrder - 0=Famille, 1=Savane, etc.
 * @param {string} uiLang - 'en' or 'fr'
 */
export function buildBassaSession(themeOrder, uiLang = "fr") {
  const data = BASSA_EXERCISE_DATA[themeOrder];
  if (!data) return null;

  const questions = [];

  // Helper to translate a word item
  const translateItem = (item) => ({
    ...item,
    title: getWordDisplay(item.title, uiLang)
  });

  // Get a pool of lesson words to mix in sparingly (Days/Verbs)
  // We use max 3 total to avoid cluttering the theme experience
  const lessonWords = shuffle([...DAYS_POOL, ...VERBS_POOL]).map(translateItem);
  let lessonIdx = 0;

  // 1. MATCH questions (Exercise 1)
  const PAIRS_PER_ROUND = 4;
  const matchTheme = data.match.map(translateItem);
  
  // Inject exactly 1 lesson word into the match pool (at the beginning)
  if (lessonIdx < lessonWords.length) {
    matchTheme.unshift(lessonWords[lessonIdx++]);
  }

  for (let i = 0; i < matchTheme.length; i += PAIRS_PER_ROUND) {
    const group = matchTheme.slice(i, i + PAIRS_PER_ROUND);
    if (group.length >= 2) {
      questions.push({ 
        type: 'match', 
        pairs: group, 
        right: shuffle([...group]) 
      });
    }
  }

  // 2. LISTEN & WRITE (Exercise 2)
  // First, 1 mixed lesson word to keep things familiar
  if (lessonIdx < lessonWords.length) {
    questions.push({ type: 'listen_write', target: lessonWords[lessonIdx++] });
  }
  // Then all theme-specific phrases
  for (const phrase of data.write.map(translateItem)) {
    questions.push({ type: 'listen_write', target: phrase });
  }

  // 3. IMAGE QCM (Exercise 3)
  // First, 1 mixed lesson word as a Text QCM (since lesson words lack images)
  if (lessonIdx < lessonWords.length) {
    const target = lessonWords[lessonIdx++];
    // Distinct options for the mixed QCM
    const others = shuffle(lessonWords.filter(o => o.id !== target.id)).slice(0, 3);
    questions.push({ type: 'text_qcm', target, options: shuffle([target, ...others]) });
  }
  
  // Then all theme-specific image QCMs
  const imgItems = data.imageQcm.filter(i => i.imageUrl).map(translateItem);
  for (const item of imgItems) {
    const distractors = shuffle(imgItems.filter(d => d.id !== item.id)).slice(0, 3);
    const options = shuffle([item, ...distractors]);
    questions.push({ type: 'image_qcm', target: item, options });
  }

  // CRITICAL: NO SHUFFLE at the end.
  // This preserves the sequential logic: Exercise 1 -> Exercise 2 -> Exercise 3 blocks.
  return questions;
}

/**
 * Build a mixed exercise session using foundation Bassa content (Days + Verbs).
 * Used as a gate to unlock Lesson 3 and beyond.
 */
export function buildBassaMixedFoundationSession(uiLang = "fr") {
  const translateItem = (item) => ({
    ...item,
    title: getWordDisplay(item.title, uiLang)
  });

  const days = DAYS_POOL.map(translateItem);
  const verbs = VERBS_POOL.map(translateItem);

  const questions = [];

  // Match 1: 4 days
  const p1 = shuffle(days).slice(0, 4);
  questions.push({ type: 'match', pairs: p1, right: shuffle([...p1]) });

  // Match 2: 4 verbs
  const p2 = shuffle(verbs).slice(0, 4);
  questions.push({ type: 'match', pairs: p2, right: shuffle([...p2]) });

  // Text Selection: Mix of remaining
  const qcmPool = shuffle([...days.slice(4), ...verbs.slice(4)]);
  qcmPool.slice(0, 4).forEach(target => {
    const others = shuffle(qcmPool.filter(x => x.id !== target.id)).slice(0, 3);
    questions.push({ type: 'text_qcm', target, options: shuffle([target, ...others]) });
  });

  // Listen & Write: 2 items
  const writePool = shuffle([...days, ...verbs]);
  writePool.slice(0, 3).forEach(target => {
    questions.push({ type: 'listen_write', target });
  });

  return shuffle(questions);
}

export default {};
