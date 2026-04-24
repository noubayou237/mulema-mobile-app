/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Seed Bassa : 4 Thèmes principaux                   ║
 * ║  00 — Vie de Famille  (order 0, débloqué)                    ║
 * ║  01 — La Savane       (order 1, verrouillé)                  ║
 * ║  02 — La Cuisine      (order 2, verrouillé)                  ║
 * ║  03 — La Mode         (order 3, verrouillé)                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Utilise : MulemTheme, MulemWord, MulemExercise
 *  Exécution : npx ts-node --project tsconfig.json src/database/seeds/bassa.seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const THEMES = [
  // ── 00 — VIE DE FAMILLE ────────────────────────────────────────
  {
    order: 0,
    code: 'famille',
    name_fr: 'Vie de Famille',
    name_local: 'Ɓɔŋgɛ biɓè',
    icon: 'people-outline',
    color: '#E91E63',
    locked: false,
    lock_hint: null,
    words: [
      { order: 1,  word_fr: 'Le papa',           word_local: 'itâ',      hint: 'i', image_url: null },
      { order: 2,  word_fr: 'La maman',           word_local: 'inī',      hint: 'i', image_url: null },
      { order: 3,  word_fr: 'La tante',           word_local: 'sità',     hint: 's', image_url: 'img_family_aunty' },
      { order: 4,  word_fr: 'Un homme',           word_local: 'mùnlom',   hint: 'm', image_url: 'img_family_uncle' },
      { order: 5,  word_fr: "L'oncle",            word_local: 'nyàndom',  hint: 'n', image_url: 'img_family_uncle' },
      { order: 6,  word_fr: 'Une femme',          word_local: 'mùdǎ',     hint: 'm', image_url: 'img_family_aunty' },
      { order: 7,  word_fr: 'Les grands-parents', word_local: 'màjò',     hint: 'm', image_url: 'img_family_grandparents' },
      { order: 8,  word_fr: 'Mon frère',          word_local: 'măn keē',  hint: 'm', image_url: 'img_family_uncle' },
      { order: 9,  word_fr: 'Les enfants',        word_local: 'ɓɔŋgɛ',    hint: 'ɓ', image_url: 'img_family_children' },
      { order: 10, word_fr: 'Le bébé',            word_local: 'ǹsɛt man', hint: 'ǹ', image_url: 'img_family_baby' },
      { order: 11, word_fr: 'Bonjour mon ami.',   word_local: 'Mɛ̀ǹyega',  hint: 'M', image_url: null },
      { order: 12, word_fr: 'Comment vas-tu ?',   word_local: 'ù ŋ́kɛ laa', hint: 'ù', image_url: null },
      { order: 13, word_fr: 'Je vais assez bien.', word_local: 'Mɛ yè mboo', hint: 'M', image_url: null },
      { order: 14, word_fr: 'Merci.',             word_local: 'mɛ̀ǹyegà',   hint: 'm', image_url: null },
      { order: 15, word_fr: 'Un bébé',            word_local: 'ǹsɛt man',  hint: 'ǹ', image_url: 'img_family_baby' },
    ],
  },

  // ── 01 — LA SAVANE ─────────────────────────────────────────────
  {
    order: 1,
    code: 'animaux',
    name_fr: 'La Savane',
    name_local: 'Ɓúk bí savane',
    icon: 'paw-outline',
    color: '#FF9800',
    locked: true,
    lock_hint: 'Terminez Vie de Famille pour débloquer',
    words: [
      { order: 1,  word_fr: 'Le lion',       word_local: 'hɔsì',       hint: 'h', image_url: 'img_animal_lion' },
      { order: 2,  word_fr: "L'épervier",    word_local: 'hyɔbí',      hint: 'h', image_url: 'img_animal_bird' },
      { order: 3,  word_fr: 'Le poisson',    word_local: 'nyɔɔ',       hint: 'n', image_url: 'img_animal_fish' },
      { order: 4,  word_fr: 'Les poissons',  word_local: 'njèé',       hint: 'n', image_url: 'img_animal_fish' },
      { order: 5,  word_fr: 'Le cheval',     word_local: 'cɔbí',       hint: 'c', image_url: null },
      { order: 6,  word_fr: 'Le bœuf',       word_local: 'kóp',        hint: 'k', image_url: null },
      { order: 7,  word_fr: 'Le poulet',     word_local: 'ǹyògól',     hint: 'ǹ', image_url: null },
      { order: 8,  word_fr: 'Le serpent',    word_local: 'nyàgà',      hint: 'n', image_url: null },
      { order: 9,  word_fr: 'Les sangliers', word_local: 'Ngǒy bìkay', hint: 'N', image_url: 'img_animal_pigs' },
      { order: 10, word_fr: "L'éléphant",    word_local: 'Njɔk',       hint: 'N', image_url: 'img_animal_elephant' },
      { order: 11, word_fr: 'Les abeilles',  word_local: 'Nyǒy',       hint: 'N', image_url: null },
      { order: 12, word_fr: 'La sauterelle', word_local: 'tátáŋgá',    hint: 't', image_url: null },
      { order: 13, word_fr: 'Le cafard',     word_local: 'pépéé',      hint: 'p', image_url: 'img_animal_cockroach' },
      { order: 14, word_fr: 'Les singes',    word_local: 'kóy',        hint: 'k', image_url: 'img_animal_monkeys' },
    ],
  },

  // ── 02 — LA CUISINE ────────────────────────────────────────────
  {
    order: 2,
    code: 'cuisine',
    name_fr: 'La Cuisine',
    name_local: 'Ɓás bí jɛ́',
    icon: 'restaurant-outline',
    color: '#4CAF50',
    locked: true,
    lock_hint: 'Terminez La Savane pour débloquer',
    words: [
      { order: 1,  word_fr: 'Le feu',       word_local: 'hyèé',         hint: 'h', image_url: 'img_cooking_fire' },
      { order: 2,  word_fr: 'La flamme',    word_local: 'lìndòmbò',     hint: 'l', image_url: 'img_cooking_fire' },
      { order: 3,  word_fr: "L'eau",        word_local: 'màlép',        hint: 'm', image_url: null },
      { order: 4,  word_fr: 'Le sel',       word_local: 'ɓás',          hint: 'ɓ', image_url: null },
      { order: 5,  word_fr: "L'huile",      word_local: 'mòó',          hint: 'm', image_url: 'img_cooking_oil' },
      { order: 6,  word_fr: 'Les légumes',  word_local: 'bìkáy bí jɛ́', hint: 'b', image_url: null },
      { order: 7,  word_fr: 'Le poisson',   word_local: 'Hyɔbí',        hint: 'H', image_url: 'img_animal_fish' },
      { order: 8,  word_fr: 'Le gibier',    word_local: 'Nùgá',         hint: 'N', image_url: null },
      { order: 9,  word_fr: 'La fourchette', word_local: 'ŋwàs',        hint: 'ŋ', image_url: 'img_cooking_fork' },
      { order: 10, word_fr: 'La marmite',   word_local: 'Hìɓɛɛ',        hint: 'H', image_url: 'img_cooking_mortar' },
      { order: 11, word_fr: 'Le puits',     word_local: 'ɓɛɛ',          hint: 'ɓ', image_url: null },
      { order: 12, word_fr: 'Le feu de bois', word_local: 'hyèé bí ŋkwàs', hint: 'h', image_url: 'img_cooking_bonfire' },
    ],
  },

  // ── 03 — LA MODE ───────────────────────────────────────────────
  {
    order: 3,
    code: 'vetements',
    name_fr: 'La Mode',
    name_local: 'Mɛ mbɔt',
    icon: 'shirt-outline',
    color: '#9C27B0',
    locked: true,
    lock_hint: 'Terminez La Cuisine pour débloquer',
    words: [
      { order: 1,  word_fr: 'Cet habit',       word_local: 'i mbɔt ìnī',       hint: 'i', image_url: 'img_clothing_suit' },
      { order: 2,  word_fr: 'Cette chemise',   word_local: 'i jɔmbɛ lini',     hint: 'i', image_url: 'img_clothing_tshirt' },
      { order: 3,  word_fr: 'Ce pantalon',     word_local: 'i tɔlɔsîs nunu',   hint: 'i', image_url: 'img_clothing_trousers' },
      { order: 4,  word_fr: 'Ces caleçons',    word_local: 'i ŋkāndā unu',     hint: 'i', image_url: null },
      { order: 5,  word_fr: 'Ce manteau',      word_local: 'i kodi mbèŋ ìni',  hint: 'i', image_url: null },
      { order: 6,  word_fr: 'Ces costumes',    word_local: 'bikōdī bini',       hint: 'b', image_url: 'img_clothing_suit' },
      { order: 7,  word_fr: 'Cette culotte',   word_local: 'i hâp ìni',         hint: 'i', image_url: null },
      { order: 8,  word_fr: 'Ces boubous',     word_local: 'ɓa ɓùba ɓana',     hint: 'ɓ', image_url: null },
      { order: 9,  word_fr: 'Cette chaussure', word_local: 'i tāmb ini',        hint: 'i', image_url: 'img_clothing_shoes' },
      { order: 10, word_fr: 'Ce chapeau',      word_local: 'i tàmba nunu',      hint: 'i', image_url: null },
      { order: 11, word_fr: 'La cravate',      word_local: 'Lilàŋ lini',        hint: 'L', image_url: 'img_clothing_tie' },
      { order: 12, word_fr: 'La veste',        word_local: 'Kodî',              hint: 'K', image_url: 'img_clothing_suit' },
      { order: 13, word_fr: 'Une chemise',     word_local: 'Sɔdɛ̂',             hint: 'S', image_url: 'img_clothing_tshirt' },
      { order: 14, word_fr: 'Un habit',        word_local: 'Mbɔt',              hint: 'M', image_url: 'img_clothing_suit' },
      { order: 15, word_fr: 'Les pantalons',   word_local: 'BiLɔŋ̂',            hint: 'B', image_url: 'img_clothing_trousers' },
      { order: 16, word_fr: 'La chaussure',    word_local: 'Támb',              hint: 'T', image_url: 'img_clothing_shoes' },
    ],
  },
];

export async function main() {
  console.log('🌱 Seed Bassa — 4 thèmes principaux\n');

  let lang = await prisma.patrimonialLanguage.findFirst({
    where: { name: 'Bassa' },
  });

  if (!lang) {
    lang = await prisma.patrimonialLanguage.create({ data: { name: 'Bassa' } });
    console.log(`✅ PatrimonialLanguage "Bassa" créée (${lang.id})\n`);
  } else {
    console.log(`ℹ️  PatrimonialLanguage "Bassa" existante (${lang.id})\n`);
  }

  const deleted = await prisma.mulemTheme.deleteMany({
    where: { patrimonialLanguageId: lang.id },
  });
  if (deleted.count > 0) {
    console.log(`🗑️  ${deleted.count} ancien(s) thème(s) supprimé(s)\n`);
  }

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
    console.log(`  📂 T${t.order} — ${t.name_fr}`);

    for (const w of t.words) {
      await prisma.mulemWord.create({
        data: {
          themeId: theme.id,
          order: w.order,
          word_fr: w.word_fr,
          word_local: w.word_local,
          hint: w.hint,
          audio_key: null,
          audio_url: null,
          image_key: w.image_url ?? null,
          image_url: w.image_url ?? null,
        },
      });
    }
    console.log(`     ✅ ${t.words.length} mots`);

    await prisma.mulemExercise.createMany({
      data: [
        { themeId: theme.id, order: 1, type: 'word_match', instruction_fr: 'Relie chaque mot à sa traduction en bassa.', instruction_local: 'Át híkìí ɓúk nì ŋgɔbɔl' },
        { themeId: theme.id, order: 2, type: 'write', instruction_fr: 'Écris la traduction en bassa.', instruction_local: 'Tìlá bíní bìɓúk' },
        { themeId: theme.id, order: 3, type: 'image_select', instruction_fr: 'Sélectionne la bonne image.', instruction_local: 'Pɔhɔl tìtîî kìhà' },
      ],
    });
  }


}

if (require.main === module) {
  main()
    .catch((e) => { console.error('❌', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
