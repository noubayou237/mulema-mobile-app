/**
 * Bassa exercise data — sourced directly from the docx files in:
 *   assets/bassa/themes/tout_les_themes_de_la_langue_bassa/
 *
 * Each theme has three exercise sets that mirror the three docx exercises:
 *   match    → Exercise 1 "Associez chaque élément à leurs traductions"
 *   write    → Exercise 2 "Écrire en langue nationale" (listen & write phrases)
 *   imageQcm → Exercise 3 "Sélectionner la bonne image"
 *
 * audioUrl  values are keys into AUDIOS_MAP (local .wav/.mp3 assets).
 * imageUrl  values are keys into IMAGES_MAP, or null when no matching image exists.
 */

// ─────────────────────────────────────────────────────────────────────────────
// THEME 0 — La Famille (Vie de famille en Bassa)
// ─────────────────────────────────────────────────────────────────────────────
const t0_match = [
  { id: 'b0m1',  title: 'Le papa',          subtitle: 'Itâ',       audioUrl: 'le_papa',         imageUrl: null },
  { id: 'b0m2',  title: 'La maman',         subtitle: 'Inī',       audioUrl: 'la_maman',        imageUrl: null },
  { id: 'b0m3',  title: 'La tante',         subtitle: 'Sità',      audioUrl: 'la_tante',        imageUrl: null },
  { id: 'b0m4',  title: 'Un homme',         subtitle: 'Mùnlom',   audioUrl: 'un_homme_exer1',  imageUrl: null },
  { id: 'b0m5',  title: "L'oncle",          subtitle: 'Nyàndom',  audioUrl: 'l_oncle_exer1',   imageUrl: null },
  { id: 'b0m6',  title: 'Une femme',        subtitle: 'Mùdǎ',     audioUrl: 'une_femme_exer1', imageUrl: null },
  { id: 'b0m7',  title: 'Les grands-parents', subtitle: 'Màjò',   audioUrl: 'les_grands_parents', imageUrl: null },
  { id: 'b0m8',  title: 'Mon frère',        subtitle: 'Mǎn keē', audioUrl: 'mon_frere',        imageUrl: null },
  { id: 'b0m9',  title: 'Les enfants',      subtitle: 'Ɓɔ̀ŋgɛ',  audioUrl: 'les_enfants',      imageUrl: null },
  { id: 'b0m10', title: 'Le bébé',          subtitle: 'Ǹsɛt man', audioUrl: 'le_bebe_exer1',  imageUrl: null },
];

// Exercise 2: phrases to listen to and write in Bassa
const t0_write = [
  { id: 'b0w1', title: 'Bonjour mon ami',       subtitle: 'Mɛ̀ ǹyega',    audioUrl: 'bonjour_mon_ami',          imageUrl: null },
  { id: 'b0w2', title: 'Comment vas-tu ?',       subtitle: 'Ù ŋ́kɛ̀ laa',  audioUrl: 'comment_vastu',            imageUrl: null },
  { id: 'b0w3', title: 'Je vais assez bien',     subtitle: 'Mɛ̀ yè mboo',  audioUrl: 'je_vais_assez_bien_merci', imageUrl: null },
  { id: 'b0w4', title: 'Merci',                  subtitle: 'Mɛ̀ ǹyegà',   audioUrl: 'merci_bassa',              imageUrl: null },
];

// Exercise 3: select the correct image — 4 words with images available
const t0_imageQcm = [
  { id: 'b0i1', title: "L'oncle",   subtitle: 'Nyàndom',  audioUrl: 'l_oncle',   imageUrl: 'uncle'  },
  { id: 'b0i2', title: 'Un bébé',   subtitle: 'Ǹsɛt man', audioUrl: 'le_bebe',  imageUrl: 'baby'   },
  { id: 'b0i3', title: 'Un homme',  subtitle: 'Mùnlom',  audioUrl: 'un_homme',  imageUrl: 'couple' },
  { id: 'b0i4', title: 'Une femme', subtitle: 'Mùdǎ',    audioUrl: 'une_femme', imageUrl: 'aunty'  },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME 1 — La Savane
// ─────────────────────────────────────────────────────────────────────────────
const t1_match = [
  { id: 'b1m1', title: 'Le lion',       subtitle: 'Hɔ́sì',    audioUrl: 'le_lion',    imageUrl: null },
  { id: 'b1m2', title: "L'épervier",    subtitle: 'Hyɔ̀bí',   audioUrl: 'l_epervier', imageUrl: null },
  { id: 'b1m3', title: 'Le poisson',    subtitle: 'Nyɔ̀ɔ́',   audioUrl: 'le_poisson', imageUrl: null },
  { id: 'b1m4', title: 'Les poissons',  subtitle: 'Njèé',     audioUrl: 'les_poissons', imageUrl: null },
  { id: 'b1m5', title: 'Le cheval',     subtitle: 'Cɔ̀bí',    audioUrl: 'le_cheval',  imageUrl: null },
  { id: 'b1m6', title: 'Le bœuf',       subtitle: 'Kóp',      audioUrl: 'le_boeuf',   imageUrl: null },
  { id: 'b1m7', title: 'Le poulet',     subtitle: 'Ǹyògól',  audioUrl: 'le_poulet',  imageUrl: null },
  { id: 'b1m8', title: 'Le serpent',    subtitle: 'Nyàgà',   audioUrl: 'le_serpent', imageUrl: null },
];

// Exercise 2: write phrases
const t1_write = [
  { id: 'b1w1', title: 'Les poissons',  subtitle: 'Cɔ̀bí',       audioUrl: 'les_poissons_e2', imageUrl: null },
  { id: 'b1w2', title: 'Les sangliers', subtitle: 'Ngǒy bìkay', audioUrl: 'les_sangliers',   imageUrl: null },
  { id: 'b1w3', title: "L'éléphant",    subtitle: 'Njɔ̀k',       audioUrl: 'l_elephant',      imageUrl: null },
  // Les abeilles and La sauterelle have audio but no image — included here as listen_write
  { id: 'b1w4', title: 'Les abeilles',  subtitle: 'Nyǒy',       audioUrl: 'les_abeilles',    imageUrl: null },
  { id: 'b1w5', title: 'La sauterelle', subtitle: 'Tátáŋgá',    audioUrl: 'la_sauterelle',   imageUrl: null },
];

// Exercise 3: image QCM — using savane words that have matching local images
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
  { id: 'b2m1', title: 'Le feu',       subtitle: 'Hyèé',        audioUrl: 'le_feu',    imageUrl: null },
  { id: 'b2m2', title: 'La flamme',    subtitle: 'Lìndòmbò',   audioUrl: 'la_flamme', imageUrl: null },
  { id: 'b2m3', title: "L'eau",        subtitle: 'Màlép',       audioUrl: 'l_eau',     imageUrl: null },
  { id: 'b2m4', title: 'Le sel',       subtitle: 'Ɓás',         audioUrl: 'le_sel',    imageUrl: null },
  { id: 'b2m5', title: "L'huile",      subtitle: 'Mòó',         audioUrl: 'l_huile',   imageUrl: null },
  { id: 'b2m6', title: 'Les légumes',  subtitle: 'Bìkáy bí jɛ́', audioUrl: 'les_legumes', imageUrl: null },
];

// Exercise 2: write phrases
const t2_write = [
  { id: 'b2w1', title: "L'eau",        subtitle: 'Màlép',       audioUrl: 'l_eau_e2',       imageUrl: null },
  { id: 'b2w2', title: 'Le poisson',   subtitle: 'Hyɔ̀bí',      audioUrl: 'le_poisson_e2',  imageUrl: null },
  { id: 'b2w3', title: 'Le feu',       subtitle: 'Hyèé',        audioUrl: 'le_feu_e2',      imageUrl: null },
  { id: 'b2w4', title: 'Le gibier',    subtitle: 'Nùgá',        audioUrl: 'le_gibier',      imageUrl: null },
  { id: 'b2w5', title: 'Les légumes',  subtitle: 'Bìkáy bi jɛ́', audioUrl: 'les_legumes_e2', imageUrl: null },
];

// Exercise 3: image QCM — culinary items with matching local images
const t2_imageQcm = [
  { id: 'b2i1', title: 'La fourchette',  subtitle: 'Ŋwàs',    audioUrl: 'la_fourchette',  imageUrl: 'fork'      },
  { id: 'b2i2', title: 'Le feu',         subtitle: 'Hyèé',    audioUrl: 'le_feu_de_bois', imageUrl: 'burn_fire' },
  { id: 'b2i3', title: "L'huile",        subtitle: 'Mòó',     audioUrl: 'l_huile',        imageUrl: 'olive_oil' },
  { id: 'b2i4', title: 'La marmite',     subtitle: 'Hìɓɛ̀ɛ́', audioUrl: 'la_marmite',     imageUrl: 'flour'     },
  // Le puits — no well image; will become a listen_write question
  { id: 'b2i5', title: 'Le puits',       subtitle: 'Ɓɛ́ɛ́',   audioUrl: 'le_puits',       imageUrl: null        },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME 3 — La Mode
// ─────────────────────────────────────────────────────────────────────────────
const t3_match = [
  { id: 'b3m1',  title: 'Cet habit',        subtitle: 'I mbɔ̄t ìni',     audioUrl: 'cet_habit',      imageUrl: null },
  { id: 'b3m2',  title: 'Cette chemise',    subtitle: 'I jɔ̄mbɛ lini',   audioUrl: 'cette_chemise',  imageUrl: null },
  { id: 'b3m3',  title: 'Ce pantalon',      subtitle: 'I tɔ̀lɔ̀sîs nunu', audioUrl: 'ce_pantalon',    imageUrl: null },
  { id: 'b3m4',  title: 'Ces caleçons',     subtitle: 'I ŋkāndā unu',   audioUrl: 'ces_calecons',   imageUrl: null },
  { id: 'b3m5',  title: 'Ce manteau',       subtitle: 'I kodi mbèŋ ìni', audioUrl: 'ce_manteau',    imageUrl: null },
  { id: 'b3m6',  title: 'Ces costumes',     subtitle: 'Bikōdī bini',    audioUrl: 'ces_costumes',   imageUrl: null },
  { id: 'b3m7',  title: 'Ces boubous',      subtitle: 'Ɓa ɓùba ɓana',  audioUrl: 'ces_boubous',    imageUrl: null },
  { id: 'b3m8',  title: 'Cette chaussure',  subtitle: 'I tāmb ini',     audioUrl: 'cette_chaussure', imageUrl: null },
  { id: 'b3m9',  title: 'Ce chapeau',       subtitle: 'I tàmba nunu',   audioUrl: 'ce_chapeau',     imageUrl: null },
];

// Exercise 2: write phrases
const t3_write = [
  { id: 'b3w1', title: 'La cravate',  subtitle: 'Lilàŋ lini', audioUrl: 'la_cravate',  imageUrl: null },
  { id: 'b3w2', title: 'La veste',    subtitle: 'Kodî',       audioUrl: 'la_veste',    imageUrl: null },
  { id: 'b3w3', title: 'Une chemise', subtitle: 'Sɔdɛ̂',      audioUrl: 'une_chemise', imageUrl: null },
  { id: 'b3w4', title: 'Un habit',    subtitle: 'Mbɔt',       audioUrl: 'un_habit',    imageUrl: null },
];

// Exercise 3: image QCM — fashion items with matching local images
const t3_imageQcm = [
  { id: 'b3i1', title: 'La veste',      subtitle: 'Kódî',   audioUrl: 'la_veste_e4',  imageUrl: 'suit'    },
  { id: 'b3i2', title: 'Les pantalons', subtitle: 'BiLɔ̂ŋ', audioUrl: 'les_pantalons', imageUrl: 'trouser' },
  { id: 'b3i3', title: 'La chaussure',  subtitle: 'Támb',   audioUrl: 'la_chaussure', imageUrl: 'shoes'   },
  { id: 'b3i4', title: 'La cravate',    subtitle: 'Lilàŋ lini', audioUrl: 'la_cravate', imageUrl: 'tie'  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Exported map — keyed by theme order (0, 1, 2, 3)
// ─────────────────────────────────────────────────────────────────────────────
export const BASSA_EXERCISE_DATA = {
  0: { match: t0_match, write: t0_write, imageQcm: t0_imageQcm },
  1: { match: t1_match, write: t1_write, imageQcm: t1_imageQcm },
  2: { match: t2_match, write: t2_write, imageQcm: t2_imageQcm },
  3: { match: t3_match, write: t3_write, imageQcm: t3_imageQcm },
};

/**
 * Build a Bassa-specific exercise session for a given theme order.
 *
 * Session structure (docx order maintained):
 *   1. Match questions  — Exercise 1 word pairs, in groups of 3
 *   2. Listen & Write   — Exercise 2 phrases + image-less Exercise 3 words
 *   3. Image QCM        — Exercise 3 words that have a local image
 *
 * Returns null if no data exists for this themeOrder (caller falls back to
 * the generic buildSession).
 */
export function buildBassaSession(themeOrder) {
  const data = BASSA_EXERCISE_DATA[themeOrder];
  if (!data) return null;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const questions = [];

  // ── 1. MATCH questions (Exercise 1) ────────────────────────────────────────
  // Split the word pairs into groups of 3 for the match component.
  const PAIRS_PER_ROUND = 3;
  const pairs = data.match;
  for (let i = 0; i < pairs.length; i += PAIRS_PER_ROUND) {
    const group = pairs.slice(i, i + PAIRS_PER_ROUND);
    if (group.length >= 2) {
      questions.push({ type: 'match', pairs: group, right: shuffle([...group]) });
    } else {
      // Single leftover pair → convert to a text QCM so it's not wasted
      const item = group[0];
      const others = shuffle(pairs.filter((p) => p.id !== item.id));
      const opts   = shuffle([item, ...others.slice(0, 3)]);
      questions.push({ type: 'text_qcm', target: item, options: opts });
    }
  }

  // ── 2. LISTEN & WRITE questions (Exercise 2 + image-less Exercise 3 items) ─
  for (const phrase of data.write) {
    questions.push({ type: 'listen_write', target: phrase });
  }
  // Exercise 3 items without an image are also tested as listen_write
  for (const item of data.imageQcm) {
    if (!item.imageUrl) {
      questions.push({ type: 'listen_write', target: item });
    }
  }

  // ── 3. IMAGE QCM questions (Exercise 3 — items that have a local image) ────
  const imgItems = data.imageQcm.filter((i) => i.imageUrl);
  // Build a shared distractor pool from all image items in this theme
  // (so even a small Exercise 3 set has 4 options to choose from)
  const distPool = imgItems;

  for (const item of imgItems) {
    const distractors = shuffle(distPool.filter((d) => d.id !== item.id)).slice(0, 3);
    const options     = shuffle([item, ...distractors]);
    questions.push({ type: 'image_qcm', target: item, options });
  }

  return questions;
}
