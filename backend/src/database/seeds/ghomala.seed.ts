/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Seed Ghomálá : 4 Thèmes principaux                 ║
 * ║  01 — La Famille    (order 0, débloqué)                      ║
 * ║  02 — Les Animaux   (order 1, verrouillé)                    ║
 * ║  03 — La Cuisine    (order 2, verrouillé)                    ║
 * ║  04 — Les Vêtements (order 3, verrouillé)                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Utilise : MulemTheme, MulemWord, MulemExercise
 *  Exécution : npx ts-node --project tsconfig.json src/database/seeds/ghomala.seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────
const THEMES = [
  // ── 00 — NIVEAU 1 : FONDATIONS (Jours & Verbes) ─────────────────
  {
    order: 0,
    code: 'fondations',
    name_fr: 'Niveau 1 : Fondations',
    name_local: 'Lecfo\'o fə́ mto',
    icon: 'book-outline',
    color: '#3F51B5',
    locked: false,
    words: [
      { order: 1, category: 'Les 8 jours de la semaine', word_fr: 'Jour 1 (Lundi)',    word_local: 'Shienku\'u', hint: 'S', audio_key: 'monday_in_bami' },
      { order: 2, category: 'Les 8 jours de la semaine', word_fr: 'Jour 2 (Mardi)',    word_local: 'Dzedze',     hint: 'D', audio_key: 'tuesday' },
      { order: 3, category: 'Les 8 jours de la semaine', word_fr: 'Jour 3 (Mercredi)', word_local: 'Tamdze',     hint: 'T', audio_key: 'wednesday' },
      { order: 4, category: 'Les 8 jours de la semaine', word_fr: 'Jour 4 (Jeudi)',    word_local: 'Seinchou',   hint: 'S', audio_key: 'thursday' },
      { order: 5, category: 'Les 8 jours de la semaine', word_fr: 'Jour 5 (Vendredi)', word_local: 'Gossaha',    hint: 'G', audio_key: 'friday' },
      { order: 6, category: 'Les 8 jours de la semaine', word_fr: 'Jour 6 (Samedi)',   word_local: 'Dzemteh',    hint: 'D', audio_key: 'saturday' },
      { order: 7, category: 'Les 8 jours de la semaine', word_fr: 'Jour 7 (Dimanche)', word_local: 'Dza\'along', hint: 'D', audio_key: 'sunday' },
      { order: 8, category: 'Les 8 jours de la semaine', word_fr: 'Jour 8',           word_local: 'Lecfo\'o',   hint: 'L', audio_key: '8_day' },

      // --- Leçon 2 : Verbe AVOIR ---
      { order: 9,  category: 'Verbe AVOIR', word_fr: "J'ai",         word_local: 'Gâ gə̀',   hint: 'G', audio_key: 'ga_g_j_ai' },
      { order: 10, category: 'Verbe AVOIR', word_fr: 'Tu as',        word_local: 'O gə̀',    hint: 'O', audio_key: 'o_g_tu_as' },
      { order: 11, category: 'Verbe AVOIR', word_fr: 'Il/Elle a',    word_local: 'E gə̀',    hint: 'E', audio_key: 'e_g_il_ou_elle_as' },
      { order: 12, category: 'Verbe AVOIR', word_fr: 'Nous avons',   word_local: 'Pyə gə̀',  hint: 'P', audio_key: 'py_g_nous_avons' },
      { order: 13, category: 'Verbe AVOIR', word_fr: 'Vous avez',    word_local: 'Po gə̀',    hint: 'P', audio_key: 'po_g_vous_avez' },
      { order: 14, category: 'Verbe AVOIR', word_fr: 'Ils/Elles ont', word_local: 'Wap gə̀',  hint: 'W', audio_key: 'wap_g' },

      // --- Leçon 3 : Verbe ÊTRE ---
      { order: 15, category: 'Verbe ÊTRE', word_fr: 'Je suis',        word_local: 'Gâ bə̀',   hint: 'G', audio_key: 'ga_b_je_suis' },
      { order: 16, category: 'Verbe ÊTRE', word_fr: 'Tu es',          word_local: 'O bə̀',    hint: 'O', audio_key: 'o_b_tu_es' },
      { order: 17, category: 'Verbe ÊTRE', word_fr: 'Il/Elle est',    word_local: 'E bə̀',    hint: 'E', audio_key: 'e_b_il_ou_elle_est' },
      { order: 18, category: 'Verbe ÊTRE', word_fr: 'Nous sommes',    word_local: 'Pyə bə̀',  hint: 'P', audio_key: 'py_b_nus_sommes' },
      { order: 19, category: 'Verbe ÊTRE', word_fr: 'Vous êtes',      word_local: 'Po bə̀',    hint: 'P', audio_key: 'po_b_vous_etes' },
      { order: 20, category: 'Verbe ÊTRE', word_fr: 'Ils/Elles sont', word_local: 'Wap bə̀',  hint: 'W', audio_key: 'wap_b_ils_ou_elles_sont' },

      // --- Leçon 4 : Verbe MANGER ---
      { order: 21, category: 'Verbe MANGER', word_fr: 'Je mange',        word_local: 'Gâ mpfǎ',  hint: 'G', audio_key: 'ga_mpfa_je_mange' },
      { order: 22, category: 'Verbe MANGER', word_fr: 'Tu manges',       word_local: 'O mpfǎ',   hint: 'O', audio_key: 'o_mpfa_tu_mange' },
      { order: 23, category: 'Verbe MANGER', word_fr: 'Il/Elle mange',   word_local: 'E mpfǎ',   hint: 'E', audio_key: 'e_mpfa_il_ou_elle_mange' },
      { order: 24, category: 'Verbe MANGER', word_fr: 'Nous mangeons',   word_local: 'Pyə mpfǎ', hint: 'P', audio_key: 'py_mpfa_nous_mangeons' },
      { order: 25, category: 'Verbe MANGER', word_fr: 'Vous mangez',     word_local: 'Po mpfǎ',  hint: 'P', audio_key: 'po_mpfa_vous_mangez' },
      { order: 26, category: 'Verbe MANGER', word_fr: 'Ils/Elles mangent', word_local: 'Wap mpfǎ', hint: 'W', audio_key: 'wap_mpfa_ils_ou_elles_magent' },

      // --- Leçon 5 : Verbe MARCHER ---
      { order: 27, category: 'Verbe MARCHER', word_fr: 'Je marche',        word_local: 'Gâ gì',   hint: 'G', audio_key: 'ga_gi_je_marche' },
      { order: 28, category: 'Verbe MARCHER', word_fr: 'Tu marches',       word_local: 'O gì',    hint: 'O', audio_key: 'o_gi_tu_marche' },
      { order: 29, category: 'Verbe MARCHER', word_fr: 'Il/Elle marche',   word_local: 'E gì',    hint: 'E', audio_key: 'e_gi_il_ou_elle_marche' },
      { order: 30, category: 'Verbe MARCHER', word_fr: 'Nous marchons',    word_local: 'Pyə gì',  hint: 'P', audio_key: 'py_gi_nous_marchons' },
      { order: 31, category: 'Verbe MARCHER', word_fr: 'Vous marchez',     word_local: 'Po gì',    hint: 'P', audio_key: 'po_gi_vous_marchez' },
      { order: 32, category: 'Verbe MARCHER', word_fr: 'Ils/Elles marchent', word_local: 'Wap gì',  hint: 'W', audio_key: 'wap_gi_ils_ou_elles_marchent' },

      // --- Leçon 6 : Verbe ACHETER ---
      { order: 33, category: 'Verbe ACHETER', word_fr: "J'achète",        word_local: 'Gâ jǒ',   hint: 'G', audio_key: 'ga_jo_j_achete' },
      { order: 34, category: 'Verbe ACHETER', word_fr: 'Tu achètes',       word_local: 'O jǒ',    hint: 'O', audio_key: 'o_jo_tu_achete' },
      { order: 35, category: 'Verbe ACHETER', word_fr: 'Il/Elle achète',   word_local: 'E jǒ',    hint: 'E', audio_key: 'e_jo_il_ou_elle_achete' },
      { order: 36, category: 'Verbe ACHETER', word_fr: 'Nous achetons',    word_local: 'Pyə jǒ',  hint: 'P', audio_key: 'py_jo_nous_achetons' },
      { order: 37, category: 'Verbe ACHETER', word_fr: 'Vous achetez',     word_local: 'Po jǒ',    hint: 'P', audio_key: 'po_jo_vous_achetez' },
      { order: 38, category: 'Verbe ACHETER', word_fr: 'Ils/Elles achètent', word_local: 'Wap jǒ',  hint: 'W', audio_key: 'wap_jo_ils_ou_elles_achetent' },
    ],
  },

  // ── 01 — LA FAMILLE ────────────────────────────────────────────────
  {
    order: 1,
    code: 'famille',
    name_fr: 'La Famille',
    name_local: 'Mtâ pə̌',
    icon: 'people-outline',
    color: '#4CAF50',
    locked: true,
    lock_hint: 'Terminez les verbes pour débloquer',
    words: [
      { order: 1,  category: 'Les membres de la famille', word_fr: 'Le papa',             word_local: 'tá',              hint: 't', image_url: null },
      { order: 2,  category: 'Les membres de la famille', word_fr: 'La maman',            word_local: 'má',              hint: 'm', image_url: null },
      { order: 3,  category: 'Les membres de la famille', word_fr: 'La tante paternelle',  word_local: 'fə̂ tâ á yə mjwǐ', hint: 'f', image_url: 'aunty' },
      { order: 4,  category: 'Les membres de la famille', word_fr: 'La tante maternelle',  word_local: 'fə̂ mâ á yə mjwǐ', hint: 'f', image_url: 'aunty' },
      { order: 5,  category: 'Les membres de la famille', word_fr: "L'oncle paternel",     word_local: 'fə̂ tâ á yə mbɛ̂',  hint: 'f', image_url: 'uncle' },
      { order: 6,  category: 'Les membres de la famille', word_fr: "L'oncle maternel",     word_local: 'fə̂ mâ á yə mbɛ̂',  hint: 'f', image_url: 'uncle' },
      { order: 7,  category: 'Les membres de la famille', word_fr: 'Les grands-parents',   word_local: 'mtâ pə̌ pyə gwyə́', hint: 'm', image_url: 'grandparents' },
      { order: 8,  category: 'Les membres de la famille', word_fr: 'Les parents',          word_local: 'mtâ pə̌',          hint: 'm', image_url: 'couple' },
      { order: 10, category: 'Relations et enfants', word_fr: 'Les enfants',          word_local: 'pǒ',              hint: 'p', image_url: 'children' },
      { order: 11, category: 'Relations et enfants', word_fr: 'Le bébé',              word_local: 'mûbwǎ',           hint: 'm', image_url: 'baby' },
      { order: 12, category: 'Relations et enfants', word_fr: 'Les amis',             word_local: 'msǒ',             hint: 'm', image_url: 'couple' },
      { order: 13, category: 'Relations et enfants', word_fr: 'Une famille',          word_local: 'tuŋdyə́',          hint: 't', image_url: 'family' },
      { order: 14, category: 'Genres', word_fr: 'Un homme',             word_local: 'mbɛ̂',             hint: 'm', image_url: 'uncle' },
      { order: 15, category: 'Genres', word_fr: 'Une femme',            word_local: 'mjwǐ',            hint: 'm', image_url: 'aunty' },
      { order: 16, category: 'Les salutations', word_fr: 'Comment vas-tu ?',     word_local: 'Â m gaə̂kə̀ ?',    hint: 'Â', image_url: null },
      { order: 17, category: 'Les salutations', word_fr: 'Merci',                word_local: 'Motəókwâ',        hint: 'M', image_url: null },
    ],
  },

  // ── 02 — LES ANIMAUX ───────────────────────────────────────────────
  {
    order: 2,
    code: 'animaux',
    name_fr: 'Les Animaux',
    name_local: 'Mə̌ŋkɔ̌ mɔ̌',
    icon: 'paw-outline',
    color: '#FF9800',
    locked: true,
    lock_hint: 'Terminez La Famille pour débloquer',
    words: [
      { order: 1,  category: 'Les animaux sauvages', word_fr: 'Le lion',       word_local: "nɔmtə̀mà'", hint: 'n', image_url: 'lion' },
      { order: 2,  category: 'Les animaux sauvages', word_fr: 'Les lions',     word_local: "mnɔmtə̀mà'", hint: 'm', image_url: 'lion' },
      { order: 3,  category: 'Les animaux sauvages', word_fr: "L'éléphant",    word_local: 'sǒ',         hint: 's', image_url: 'elephant' },
      { order: 4,  category: 'Les animaux sauvages', word_fr: 'Les singes',    word_local: 'mŋkɔ̌',       hint: 'm', image_url: 'monkeys' },
      { order: 5,  category: 'Animaux de la ferme et de l’eau', word_fr: 'Le poisson',    word_local: 'gù',         hint: 'g', image_url: 'fish' },
      { order: 6,  category: 'Animaux de la ferme et de l’eau', word_fr: 'Les poissons',  word_local: 'mgù',        hint: 'm', image_url: 'fish' },
      { order: 7,  category: 'Animaux de la ferme et de l’eau', word_fr: 'Le bœuf',       word_local: "na'",        hint: 'n', image_url: null },
      { order: 10, category: 'Animaux de la ferme et de l’eau', word_fr: 'Le poulet',     word_local: 'gɔp̌',        hint: 'g', image_url: null },
      { order: 11, category: 'Animaux de la ferme et de l’eau', word_fr: 'Les poulets',   word_local: 'mgɔp̌',       hint: 'm', image_url: null },
      { order: 12, category: 'Animaux de la ferme et de l’eau', word_fr: 'Les sangliers', word_local: 'mgə́nɔmgǒ',   hint: 'm', image_url: 'pigs' },
      { order: 13, category: 'Les insectes', word_fr: "L'abeille",     word_local: "ŋə̌ŋŋwá'",    hint: 'ŋ', image_url: null },
      { order: 14, category: 'Les insectes', word_fr: 'La sauterelle', word_local: 'gǎm',        hint: 'g', image_url: null },
      { order: 15, category: 'Les insectes', word_fr: 'Le cafard',     word_local: 'bíbíŋ',      hint: 'b', image_url: 'cocroach' },
    ],
  },

  // ── 03 — LA CUISINE ────────────────────────────────────────────────
  {
    order: 3,
    code: 'cuisine',
    name_fr: 'La Cuisine',
    name_local: 'Kə́p yə̌ŋ',
    icon: 'restaurant-outline',
    color: '#E91E63',
    locked: true,
    lock_hint: 'Terminez Les Animaux pour débloquer',
    words: [
      { order: 1,  category: 'Le feu et l’eau', word_fr: 'Le feu',                 word_local: 'mɔ̌k',          hint: 'm', image_url: 'fire' },
      { order: 2,  category: 'Le feu et l’eau', word_fr: 'La flamme',              word_local: 'zhwyəm̌ɔ̌k',      hint: 'z', image_url: 'fire' },
      { order: 3,  category: 'Le feu et l’eau', word_fr: "L'eau",                  word_local: 'shyə',           hint: 's', image_url: null },
      { order: 4,  category: 'Le feu et l’eau', word_fr: 'Le feu de bois',         word_local: 'mɔ̌k ŋkwyə́',     hint: 'm', image_url: 'burn_fire' },
      { order: 5,  category: 'Ingrédients', word_fr: 'Le sel',                 word_local: 'gwɛ̌',            hint: 'g', image_url: null },
      { order: 6,  category: 'Ingrédients', word_fr: "L'huile",                word_local: 'mwaə̌',           hint: 'm', image_url: 'olive_oil' },
      { order: 7,  category: 'Ingrédients', word_fr: 'Le sucre',               word_local: 'tùmtə̀',          hint: 't', image_url: null },
      { order: 8,  category: 'Ingrédients', word_fr: 'La farine',              word_local: 'vémsɛ̂ntɥɔ̀',     hint: 'v', image_url: 'flour' },
      { order: 10, category: 'Ustensiles', word_fr: 'La fourchette',          word_local: "lǔ'mkə́kə́",       hint: 'l', image_url: 'fork' },
      { order: 11, category: 'Ustensiles', word_fr: 'Le pilon et le mortier', word_local: 'kuŋpɔ̌ ba kɔ́p',  hint: 'k', image_url: 'multer_pistol' },
    ],
  },

  // ── 04 — LES VÊTEMENTS ─────────────────────────────────────────────
  {
    order: 4,
    code: 'vetements',
    name_fr: 'Les Vêtements',
    name_local: 'Mdzə́ mɔ̌',
    icon: 'shirt-outline',
    color: '#9C27B0',
    locked: true,
    lock_hint: 'Terminez La Cuisine pour débloquer',
    words: [
      { order: 1,  category: 'Les habits', word_fr: 'Cet habit',               word_local: 'dzə́ yə̌ŋ',        hint: 'd', image_url: 'suit' },
      { order: 2,  category: 'Les habits', word_fr: 'Cette chemise',           word_local: "tənka'dzə́ yə̌ŋ",  hint: 't', image_url: 't_shirt' },
      { order: 3,  category: 'Les habits', word_fr: 'Ce pantalon',             word_local: "tɛ́sho' yə̌ŋ",     hint: 't', image_url: 'trouser' },
      { order: 4,  category: 'Les habits', word_fr: 'Ces costumes',            word_local: 'mcwopdəm mɔ̌',    hint: 'm', image_url: 'suit' },
      { order: 5,  category: 'Les habits', word_fr: 'Cette culotte',           word_local: "kamtɛ́sho' yə̌ŋ",  hint: 'k', image_url: null },
      { order: 6,  category: 'Les habits', word_fr: 'Ces boubous',             word_local: 'msɥɔdzə́ mɔ̌',     hint: 'm', image_url: null },
      { order: 7,  category: 'Les habits', word_fr: 'Ce manteau',              word_local: 'dzə̂bəŋ yə̌ŋ',     hint: 'd', image_url: null },
      { order: 8,  category: 'Les habits', word_fr: 'La veste',                word_local: 'dzə̂msə̀m',         hint: 'd', image_url: 'suit' },
      { order: 9,  category: 'Les habits', word_fr: 'Les pantalons',           word_local: "mtɛsho'",          hint: 'm', image_url: 'trouser' },
      { order: 10, category: 'Les habits', word_fr: 'Le t-shirt',              word_local: 'tíshɔ́t',           hint: 't', image_url: 't_shirt' },
      { order: 11, category: 'Sous-vêtements et accessoires', word_fr: 'Ces caleçons',            word_local: 'mdzə̂cu mɔ̌',      hint: 'm', image_url: null },
      { order: 12, category: 'Sous-vêtements et accessoires', word_fr: 'Ce chapeau',              word_local: "co' yə̌ŋ",         hint: 'c', image_url: null },
      { order: 13, category: 'Sous-vêtements et accessoires', word_fr: 'La cravate',              word_local: 'ŋkwə̂ntúŋ',        hint: 'ŋ', image_url: 'tie' },
      { order: 14, category: 'Les chaussures', word_fr: 'Cette chaussure',         word_local: 'Mtǎp mɔ̌',        hint: 'M', image_url: 'shoes' },
      { order: 15, category: 'Les chaussures', word_fr: 'La chaussure',            word_local: 'mntapə́',           hint: 'm', image_url: 'shoes' },
      { order: 16, category: 'Les chaussures', word_fr: 'Les paires de babouches', word_local: 'mlə̀pâsì',          hint: 'm', image_url: 'ladder_shoes' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
export async function main() {

  // 1. Récupérer ou créer la langue patrimoniale Ghomálá
  let lang = await prisma.patrimonialLanguage.findFirst({
    where: { name: 'Ghomálá' },
  });

  if (!lang) {
    lang = await prisma.patrimonialLanguage.create({ data: { name: 'Ghomálá' } });
  } else {
  }

  // 2. Nettoyer les anciens thèmes Ghomálá (cascade supprime mots + exercices)
  const deleted = await prisma.mulemTheme.deleteMany({
    where: { patrimonialLanguageId: lang.id },
  });
  if (deleted.count > 0) {
  }

  // 3. Insérer les 4 thèmes
  for (const t of THEMES) {
    const theme = await prisma.mulemTheme.create({
      data: {
        patrimonialLanguageId: lang.id,
        order: t.order,
        code: t.code,
        name_fr: t.name_fr,
        name_local: t.name_local,
        icon: t.icon,
        color: t.color,
        locked: t.locked,
        lock_hint: t.lock_hint,
      },
    });

    // 4. Insérer les mots
    for (const w of (t as any).words) {
      await prisma.mulemWord.create({
        data: {
          themeId: theme.id,
          order: w.order,
          category: (w as any).category || null,
          word_fr: w.word_fr,
          word_local: w.word_local,
          hint: w.hint,
          audio_key: (w as any).audio_key || null,
          audio_url: null,
          image_key: w.image_url || null,
          image_url: w.image_url || null,
        },
      });
    }

    // 5. Insérer les 3 exercices standard
    await prisma.mulemExercise.createMany({
      data: [
        { themeId: theme.id, order: 1, type: 'word_match', instruction_fr: 'Relie chaque mot à sa traduction en ghomálá.', instruction_local: 'Sʉ́ʉ dzé à tô' },
        { themeId: theme.id, order: 2, type: 'write', instruction_fr: 'Écris la traduction en ghomálá.', instruction_local: 'Cwoə̀ á ghomálá' },
        { themeId: theme.id, order: 3, type: 'image_select', instruction_fr: 'Sélectionne la bonne image.', instruction_local: 'Pɔ̌ dzə́ yə̌ŋ' },
      ],
    });
  }

}

if (require.main === module) {
  main()
    .catch((e) => { console.error('❌', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
