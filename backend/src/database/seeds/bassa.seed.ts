/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Seed Bassa                                         ║
 * ║  00 — Les 7 jours de la semaine (unlocked)                   ║
 * ║  01 — Les Verbes essentiels    (unlocked after 00)           ║
 * ║  02 — Vie de Famille           (unlocked after 01)           ║
 * ║  03 — La Savane                (unlocked after 02)           ║
 * ║  04 — La Cuisine               (unlocked after 03)           ║
 * ║  05 — La Mode                  (unlocked after 04)           ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  audio_url values are AUDIOS_MAP keys — playAudioUrl() resolves
 *  them to local assets on the frontend automatically.
 *
 *  Run: npx ts-node --project tsconfig.json src/database/seeds/bassa.seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const THEMES = [
  // ── 00 — NIVEAU 1 : FONDATIONS (Jours & Verbes) ─────────────────
  {
    order: 0,
    code: 'fondations',
    name_fr: 'Niveau 1 : Fondations',
    name_local: 'Niveau 1',
    icon: 'star-outline',
    color: '#2196F3',
    locked: false,
    lock_hint: null,
    words: [
      // --- Leçon 1 : Les 7 jours de la semaine ( unlocked ) ---
      { order: 1, category: 'Les 7 jours de la semaine', word_fr: 'Lundi',    word_local: 'ŋgwà njaŋgumba', hint: 'ŋ', audio_url: 'lundi_1',    image_url: null },
      { order: 2, category: 'Les 7 jours de la semaine', word_fr: 'Mardi',    word_local: 'ŋgwà ûm',        hint: 'ŋ', audio_url: 'mardi_1',    image_url: null },
      { order: 3, category: 'Les 7 jours de la semaine', word_fr: 'Mercredi', word_local: 'ŋgwà ŋgê',       hint: 'ŋ', audio_url: 'mercredi_1', image_url: null },
      { order: 4, category: 'Les 7 jours de la semaine', word_fr: 'Jeudi',    word_local: 'ŋgwà mbɔk',      hint: 'ŋ', audio_url: 'jeudi_1',    image_url: null },
      { order: 5, category: 'Les 7 jours de la semaine', word_fr: 'Vendredi', word_local: 'ŋgwà kɔɔ',       hint: 'ŋ', audio_url: 'vendredi_1', image_url: null },
      { order: 6, category: 'Les 7 jours de la semaine', word_fr: 'Samedi',   word_local: 'ŋgwà jôn',       hint: 'ŋ', audio_url: 'samedi_1',   image_url: null },
      { order: 7, category: 'Les 7 jours de la semaine', word_fr: 'Dimanche', word_local: 'ŋgwà nɔŷ',       hint: 'ŋ', audio_url: 'dimanche_1', image_url: null },

      // --- Leçon 2 : Verbe AVOIR ( unlocked ) ---
      { order: 8,  category: 'Verbe AVOIR', word_fr: "J'ai",                 word_local: 'mè gwě',   hint: 'm', audio_url: 'j_aiwav',            image_url: null },
      { order: 9,  category: 'Verbe AVOIR', word_fr: 'Tu as',                word_local: 'Ù gwě',    hint: 'U', audio_url: 'tu_as_1',            image_url: null },
      { order: 10, category: 'Verbe AVOIR', word_fr: 'Il / Elle a',          word_local: 'A gwě',    hint: 'A', audio_url: 'il_ou_elle_a',       image_url: null },
      { order: 11, category: 'Verbe AVOIR', word_fr: 'Nous avons',           word_local: 'Di gwě',   hint: 'D', audio_url: 'nous_avons_1',       image_url: null },
      { order: 12, category: 'Verbe AVOIR', word_fr: 'Vous avez',            word_local: 'Ni gwě',   hint: 'N', audio_url: 'vous_avez_1',        image_url: null },
      { order: 13, category: 'Verbe AVOIR', word_fr: 'Ils / Elles ont',      word_local: 'Ba gwě',   hint: 'B', audio_url: 'ils_ou_elles_ont',   image_url: null },

      // --- Leçon 3 : Verbe ÊTRE ( locked ) ---
      { order: 14, category: 'Verbe ÊTRE', word_fr: 'Je suis',             word_local: 'mè yè',    hint: 'm', audio_url: 'je_suis_1',          image_url: null },
      { order: 15, category: 'Verbe ÊTRE', word_fr: 'Tu es',                word_local: 'Ù yè',     hint: 'U', audio_url: 'tu_es_2',            image_url: null },
      { order: 16, category: 'Verbe ÊTRE', word_fr: 'Il / Elle est',        word_local: 'A yè',     hint: 'A', audio_url: 'il_elle_on_est_1',   image_url: null },
      { order: 17, category: 'Verbe ÊTRE', word_fr: 'Nous sommes',          word_local: 'Di yè',    hint: 'D', audio_url: 'nous_sommes_1',      image_url: null },
      { order: 18, category: 'Verbe ÊTRE', word_fr: 'Vous êtes',            word_local: 'Ni yè',    hint: 'N', audio_url: 'vous_etes_1',        image_url: null },
      { order: 19, category: 'Verbe ÊTRE', word_fr: 'Ils / Elles sont',     word_local: 'Ba yè',    hint: 'B', audio_url: 'ils_elles_sont_1',   image_url: null },

      // --- Leçon 4 : Verbe MANGER ( locked ) ---
      { order: 20, category: 'Verbe MANGER', word_fr: 'Je mange',             word_local: 'mè ŋjé',   hint: 'm', audio_url: 'je_mange',           image_url: null },
      { order: 21, category: 'Verbe MANGER', word_fr: 'Tu manges',            word_local: 'U ŋjé',    hint: 'U', audio_url: 'tu_manges',          image_url: null },
      { order: 22, category: 'Verbe MANGER', word_fr: 'Il / Elle mange',      word_local: 'A ŋjé',    hint: 'A', audio_url: 'il_ou_elle_mange',   image_url: null },
      { order: 23, category: 'Verbe MANGER', word_fr: 'Nous mangeons',        word_local: 'Di ŋjé',   hint: 'D', audio_url: 'nous_mangeons',      image_url: null },
      { order: 24, category: 'Verbe MANGER', word_fr: 'Vous mangez',          word_local: 'Ni ŋjé',   hint: 'N', audio_url: 'vous_mangez',        image_url: null },
      { order: 25, category: 'Verbe MANGER', word_fr: 'Ils / Elles mangent',  word_local: 'Ba ŋjé',   hint: 'B', audio_url: 'ils_ou_elle_mangent', image_url: null },

      // --- Leçon 5 : Verbe ACHETER ( locked ) ---
      { order: 26, category: 'Verbe ACHETER', word_fr: "J'achète",             word_local: 'Mè Ńsɔmb', hint: 'M', audio_url: 'j_achete',           image_url: null },
      { order: 27, category: 'Verbe ACHETER', word_fr: 'Tu achètes',           word_local: 'U Ńsɔmb',  hint: 'U', audio_url: 'tu_achetes',         image_url: null },
      { order: 28, category: 'Verbe ACHETER', word_fr: 'Il / Elle achète',     word_local: 'A Ńsɔmb',  hint: 'A', audio_url: 'il_ou_elle_achete',  image_url: null },
      { order: 29, category: 'Verbe ACHETER', word_fr: 'Nous achetons',        word_local: 'Di Ńsɔmb', hint: 'D', audio_url: 'nous_achetons',      image_url: null },
      { order: 30, category: 'Verbe ACHETER', word_fr: 'Vous achetez',         word_local: 'Ni Ńsɔmb', hint: 'N', audio_url: 'vous_achetez',       image_url: null },
      { order: 31, category: 'Verbe ACHETER', word_fr: 'Ils / Elles achètent', word_local: 'Ba Ńsɔmb', hint: 'B', audio_url: 'ils_ou_elles_achetent', image_url: null },

      // --- Leçon 6 : Verbe MARCHER ( locked ) ---
      { order: 32, category: 'Verbe MARCHER', word_fr: 'Je marche',            word_local: 'mè Níòm',  hint: 'm', audio_url: 'je_marche',          image_url: null },
      { order: 33, category: 'Verbe MARCHER', word_fr: 'Tu marches',           word_local: 'Ù Níòm',   hint: 'U', audio_url: 'tu_marches',         image_url: null },
      { order: 34, category: 'Verbe MARCHER', word_fr: 'Il / Elle marche',     word_local: 'A Níòm',   hint: 'A', audio_url: 'il_ou_elle_marche',  image_url: null },
      { order: 35, category: 'Verbe MARCHER', word_fr: 'Nous marchons',        word_local: 'Di Níòm',  hint: 'D', audio_url: 'nous_marchons',      image_url: null },
      { order: 36, category: 'Verbe MARCHER', word_fr: 'Vous marchez',         word_local: 'Ni Níòm',  hint: 'N', audio_url: 'vous_marchez',       image_url: null },
      { order: 37, category: 'Verbe MARCHER', word_fr: 'Ils / Elles marchent', word_local: 'Ba Níòm',  hint: 'B', audio_url: 'ils_ou_elles_marchent', image_url: null },

      // --- Leçon 7 : Verbe PRENDRE ( locked ) ---
      { order: 38, category: 'Verbe PRENDRE', word_fr: 'Je prends',            word_local: 'Mè ŋýòŋ',  hint: 'M', audio_url: 'je_prends',          image_url: null },
      { order: 39, category: 'Verbe PRENDRE', word_fr: 'Tu prends',            word_local: 'Ù ŋýòŋ',   hint: 'U', audio_url: 'tu_prends',          image_url: null },
      { order: 40, category: 'Verbe PRENDRE', word_fr: 'Il / Elle prend',      word_local: 'A ŋýòŋ',   hint: 'A', audio_url: 'il_ou_elle_prend',   image_url: null },
      { order: 41, category: 'Verbe PRENDRE', word_fr: 'Nous prenons',         word_local: 'Di ŋýòŋ',  hint: 'D', audio_url: 'nous_prenons',       image_url: null },
      { order: 42, category: 'Verbe PRENDRE', word_fr: 'Vous prenez',          word_local: 'Ni ŋýòŋ',  hint: 'N', audio_url: 'vous_prenez',        image_url: null },
      { order: 43, category: 'Verbe PRENDRE', word_fr: 'Ils / Elles prennent', word_local: 'Ba ŋýòŋ',  hint: 'B', audio_url: 'ils_ou_elles_prennent', image_url: null },
    ],
  },

  // ── 01 — VIE DE FAMILLE ────────────────────────────────────────
  {
    order: 1,
    code: 'famille',
    name_fr: 'Vie de Famille',
    name_local: 'Ɓɔŋgɛ biɓè',
    icon: 'people-outline',
    color: '#E91E63',
    locked: true,
    lock_hint: 'Terminez les verbes pour débloquer',
    words: [
      { order: 1,  category: 'Les membres de la famille', word_fr: 'Le papa',            word_local: 'itâ',       hint: 'i', audio_url: 'le_papa',              image_url: null },
      { order: 2,  category: 'Les membres de la famille', word_fr: 'La maman',           word_local: 'inī',       hint: 'i', audio_url: 'la_maman',             image_url: null },
      { order: 3,  category: 'Les membres de la famille', word_fr: 'La tante',           word_local: 'sità',      hint: 's', audio_url: 'la_tante',             image_url: 'aunty' },
      { order: 4,  category: 'Les membres de la famille', word_fr: 'Un homme',           word_local: 'mùnlom',    hint: 'm', audio_url: 'un_homme_exer1',       image_url: 'uncle' },
      { order: 5,  category: 'Les membres de la famille', word_fr: "L'oncle",            word_local: 'nyàndom',   hint: 'n', audio_url: 'l_oncle_exer1',        image_url: 'uncle' },
      { order: 6,  category: 'Les membres de la famille', word_fr: 'Une femme',          word_local: 'mùdǎ',      hint: 'm', audio_url: 'une_femme_exer1',      image_url: 'aunty' },
      { order: 7,  category: 'Les membres de la famille', word_fr: 'Les grands-parents', word_local: 'màjò',      hint: 'm', audio_url: 'les_grands_parents',   image_url: 'grandparents' },
      { order: 8,  category: 'Les membres de la famille', word_fr: 'Mon frère',          word_local: 'măn keē',   hint: 'm', audio_url: 'mon_frere',            image_url: 'uncle' },
      { order: 9,  category: 'Les membres de la famille', word_fr: 'Les enfants',        word_local: 'ɓɔŋgɛ',     hint: 'ɓ', audio_url: 'les_enfants',          image_url: 'children' },
      { order: 10, category: 'Les membres de la famille', word_fr: 'Le bébé',            word_local: 'ǹsɛt man',  hint: 'ǹ', audio_url: 'le_bebe_exer1',        image_url: 'baby' },
      { order: 11, category: 'Les salutations', word_fr: 'Bonjour mon ami.',   word_local: 'Mɛ̀ǹyega',  hint: 'M', audio_url: 'bonjour_mon_ami',      image_url: null },
      { order: 12, category: 'Les salutations', word_fr: 'Comment vas-tu ?',   word_local: 'ù ŋ́kɛ laa', hint: 'ù', audio_url: 'comment_vastu',        image_url: null },
      { order: 13, category: 'Les salutations', word_fr: 'Je vais assez bien.', word_local: 'Mɛ yè mboo', hint: 'M', audio_url: 'je_vais_bien',       image_url: null },
      { order: 14, category: 'Les salutations', word_fr: 'Merci.',             word_local: 'mɛ̀ǹyegà',   hint: 'm', audio_url: 'merci_bassa',          image_url: null },
    ],
  },

  // ── 02 — LA SAVANE ─────────────────────────────────────────────
  {
    order: 2,
    code: 'animaux',
    name_fr: 'La Savane',
    name_local: 'Ɓúk bí savane',
    icon: 'paw-outline',
    color: '#FF9800',
    locked: true,
    lock_hint: 'Terminez Vie de Famille pour débloquer',
    words: [
      { order: 1,  category: 'Les animaux sauvages', word_fr: 'Le lion',        word_local: 'hɔsì',       hint: 'h', audio_url: 'le_lion',        image_url: 'lion' },
      { order: 2,  category: 'Les animaux sauvages', word_fr: "L'épervier",     word_local: 'hyɔbí',      hint: 'h', audio_url: 'l_epervier',     image_url: 'bird' },
      { order: 3,  category: 'Les animaux sauvages', word_fr: 'Le poisson',     word_local: 'nyɔɔ',       hint: 'n', audio_url: 'le_poisson',     image_url: 'fish' },
      { order: 4,  category: 'Les animaux sauvages', word_fr: 'Les poissons',   word_local: 'njèé',       hint: 'n', audio_url: 'les_poissons',   image_url: 'fish' },
      { order: 5,  category: 'Les animaux sauvages', word_fr: 'Le serpent',     word_local: 'nyàgà',      hint: 'n', audio_url: 'le_serpent',     image_url: null },
      { order: 6,  category: 'Les animaux sauvages', word_fr: "L'éléphant",     word_local: 'Njɔk',       hint: 'N', audio_url: 'l_elephant',     image_url: 'elephant' },
      { order: 7,  category: 'Les animaux sauvages', word_fr: 'Les singes',     word_local: 'kóy',        hint: 'k', audio_url: 'les_singes',     image_url: 'monkeys' },
      { order: 8,  category: 'Les insectes', word_fr: 'Les abeilles',   word_local: 'Nyǒy',       hint: 'N', audio_url: 'les_abeilles',   image_url: null },
      { order: 9,  category: 'Les insectes', word_fr: 'La sauterelle',  word_local: 'tátáŋgá',    hint: 't', audio_url: 'la_sauterelle',  image_url: null },
      { order: 10, category: 'Les insectes', word_fr: 'Le cafard',      word_local: 'pépéé',      hint: 'p', audio_url: 'le_cafard',      image_url: 'cocroach' },
      { order: 11, category: 'Les animaux de la ferme', word_fr: 'Le cheval',      word_local: 'cɔbí',       hint: 'c', audio_url: 'le_cheval',      image_url: null },
      { order: 12, category: 'Les animaux de la ferme', word_fr: 'Le bœuf',        word_local: 'kóp',        hint: 'k', audio_url: 'le_boeuf',       image_url: null },
      { order: 13, category: 'Les animaux de la ferme', word_fr: 'Le poulet',      word_local: 'ǹyògól',     hint: 'ǹ', audio_url: 'le_poulet',      image_url: null },
      { order: 14, category: 'Les animaux de la ferme', word_fr: 'Les sangliers',  word_local: 'Ngǒy bìkay', hint: 'N', audio_url: 'les_sangliers',  image_url: 'pigs' },
    ],
  },

  // ── 03 — LA CUISINE ────────────────────────────────────────────
  {
    order: 3,
    code: 'cuisine',
    name_fr: 'La Cuisine',
    name_local: 'Ɓás bí jɛ́',
    icon: 'restaurant-outline',
    color: '#4CAF50',
    locked: true,
    lock_hint: 'Terminez La Savane pour débloquer',
    words: [
      { order: 1,  category: 'Le feu et l’eau', word_fr: 'Le feu',          word_local: 'hyèé',             hint: 'h', audio_url: 'le_feu',         image_url: 'fire' },
      { order: 2,  category: 'Le feu et l’eau', word_fr: 'La flamme',        word_local: 'lìndòmbò',         hint: 'l', audio_url: 'la_flamme',      image_url: 'burn_fire' },
      { order: 3,  category: 'Le feu et l’eau', word_fr: "L'eau",            word_local: 'màlép',            hint: 'm', audio_url: 'l_eau',          image_url: null },
      { order: 4,  category: 'Le feu et l’eau', word_fr: 'Le feu de bois',   word_local: 'hyèé bí ŋkwàs',   hint: 'h', audio_url: 'le_feu_de_bois', image_url: 'fire' },
      { order: 5,  category: 'Les ingrédients', word_fr: 'Le sel',           word_local: 'ɓás',              hint: 'ɓ', audio_url: 'le_sel',         image_url: null },
      { order: 6,  category: 'Les ingrédients', word_fr: "L'huile",          word_local: 'mòó',              hint: 'm', audio_url: 'l_huile',        image_url: 'olive_oil' },
      { order: 7,  category: 'Les ingrédients', word_fr: 'Les légumes',      word_local: 'bìkáy bí jɛ́',    hint: 'b', audio_url: 'les_legumes',    image_url: null },
      { order: 8,  category: 'Les ingrédients', word_fr: 'Le poisson',       word_local: 'Hyɔbí',            hint: 'H', audio_url: 'le_poisson_e2',  image_url: 'fish' },
      { order: 9,  category: 'Les ingrédients', word_fr: 'Le gibier',        word_local: 'Nùgá',             hint: 'N', audio_url: 'le_gibier',      image_url: null },
      { order: 10, category: 'Les ustensiles', word_fr: 'La fourchette',    word_local: 'ŋwàs',             hint: 'ŋ', audio_url: 'la_fourchette',  image_url: 'fork' },
      { order: 11, category: 'Les ustensiles', word_fr: 'La marmite',       word_local: 'Hìɓɛɛ',            hint: 'H', audio_url: 'la_marmite',     image_url: 'multer_pistol' },
      { order: 12, category: 'Les ustensiles', word_fr: 'Le puits',         word_local: 'ɓɛɛ',              hint: 'ɓ', audio_url: 'le_puits',       image_url: null },
    ],
  },

  // ── 04 — LA MODE ───────────────────────────────────────────────
  {
    order: 4,
    code: 'vetements',
    name_fr: 'La Mode',
    name_local: 'Mɛ mbɔt',
    icon: 'shirt-outline',
    color: '#9C27B0',
    locked: true,
    lock_hint: 'Terminez La Cuisine pour débloquer',
    words: [
      { order: 1,  category: 'Les habits', word_fr: 'Cet habit',       word_local: 'i mbɔt ìnī',      hint: 'i', audio_url: 'cet_habit',       image_url: null },
      { order: 2,  category: 'Les habits', word_fr: 'Cette chemise',   word_local: 'i jɔmbɛ lini',    hint: 'i', audio_url: 'cette_chemise',   image_url: null },
      { order: 3,  category: 'Les habits', word_fr: 'Ce pantalon',     word_local: 'i tɔlɔsîs nunu',  hint: 'i', audio_url: 'ce_pantalon',     image_url: 'trouser' },
      { order: 4,  category: 'Les habits', word_fr: 'Ces caleçons',    word_local: 'i ŋkāndā unu',    hint: 'i', audio_url: 'ces_calecons',    image_url: null },
      { order: 5,  category: 'Les habits', word_fr: 'Ce manteau',      word_local: 'i kodi mbèŋ ìni', hint: 'i', audio_url: 'ce_manteau',      image_url: null },
      { order: 6,  category: 'Les habits', word_fr: 'Ces costumes',    word_local: 'bikōdī bini',      hint: 'b', audio_url: 'ces_costumes',    image_url: 'suit' },
      { order: 7,  category: 'Les habits', word_fr: 'Cette chaussure', word_local: 'i tāmb ini',      hint: 'i', audio_url: 'cette_chaussure', image_url: 'shoes' },
      { order: 8,  category: 'Les habits', word_fr: 'Ces boubous',     word_local: 'ɓa ɓùba ɓana',    hint: 'ɓ', audio_url: 'ces_boubous',     image_url: null },
      { order: 9,  category: 'Les habits', word_fr: 'Ce chapeau',      word_local: 'i tàmba nunu',    hint: 'i', audio_url: 'ce_manteau',      image_url: null },
      { order: 10, category: 'Accessoires', word_fr: 'La cravate',      word_local: 'Lilàŋ lini',      hint: 'L', audio_url: 'la_cravate',      image_url: 'tie' },
      { order: 11, category: 'Accessoires', word_fr: 'La veste',        word_local: 'Kodî',             hint: 'K', audio_url: 'la_veste',        image_url: 'suit' },
      { order: 12, category: 'Accessoires', word_fr: 'Une chemise',     word_local: 'Sɔdɛ̂',            hint: 'S', audio_url: 'une_chemise',     image_url: null },
      { order: 13, category: 'Accessoires', word_fr: 'Un habit',        word_local: 'Mbɔt',             hint: 'M', audio_url: 'un_habit',        image_url: null },
      { order: 14, category: 'Pantalons', word_fr: 'Les pantalons',   word_local: 'BiLɔŋ̂',          hint: 'B', audio_url: 'les_pantalons',   image_url: 'trouser' },
      { order: 15, category: 'Pantalons', word_fr: 'La chaussure',    word_local: 'Támb',             hint: 'T', audio_url: 'la_chaussure',    image_url: 'shoes' },
    ],
  },
];

export async function main() {
  let lang = await prisma.patrimonialLanguage.findFirst({
    where: { name: 'Bassa' },
  });

  if (!lang) {
    lang = await prisma.patrimonialLanguage.create({ data: { name: 'Bassa' } });
  }

  await prisma.mulemTheme.deleteMany({
    where: { patrimonialLanguageId: lang.id },
  });

  for (const t of THEMES) {
    const theme = await prisma.mulemTheme.create({
      data: {
        patrimonialLanguageId: lang.id,
        order:      t.order,
        code:       t.code,
        name_fr:    t.name_fr,
        name_local: t.name_local,
        icon:       t.icon,
        color:      t.color,
        locked:     t.locked,
        lock_hint:  t.lock_hint,
      },
    });

    for (const w of (t as any).words) {
      await prisma.mulemWord.create({
        data: {
          themeId: theme.id,
          order: w.order,
          category: (w as any).category || t.name_fr,
          word_fr: w.word_fr,
          word_local: w.word_local,
          hint: w.hint,
          audio_key: (w as any).audio_url || null,
          audio_url: null,
          image_key: (w as any).image_url || null,
          image_url: (w as any).image_url || null,
        },
      });
    }

    await prisma.mulemExercise.createMany({
      data: [
        { themeId: theme.id, order: 1, type: 'word_match', instruction_fr: 'Relie chaque mot à sa traduction en bassa.', instruction_local: 'Át híkìí ɓúk nì ŋgɔbɔl' },
        { themeId: theme.id, order: 2, type: 'write', instruction_fr: 'Écris la traduction en bassa.', instruction_local: 'Tìlá bíní bìɓúk' },
        { themeId: theme.id, order: 3, type: 'image_select', instruction_fr: 'Sélectionne la bonne image.', instruction_local: 'Pɔhɔl tìtîî kìhà' },
      ],
    });
  }

  console.log('✅ Bassa seed complete — 6 themes, ' +
    THEMES.reduce((s, t) => s + t.words.length, 0) + ' words');
}

if (require.main === module) {
  main()
    .catch((e) => { console.error('❌', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
