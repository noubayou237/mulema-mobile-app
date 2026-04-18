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
      // E1 — association (10 paires)
      { order: 1, word_fr: 'Le papa', word_local: 'itâ', hint: 'i' },
      { order: 2, word_fr: 'La maman', word_local: 'inī', hint: 'i' },
      { order: 3, word_fr: 'La tante', word_local: 'sità', hint: 's' },
      { order: 4, word_fr: 'Un homme', word_local: 'mùnlom', hint: 'm' },
      { order: 5, word_fr: "L'oncle", word_local: 'nyàndom', hint: 'n' },
      { order: 6, word_fr: 'Une femme', word_local: 'mùdǎ', hint: 'm' },
      { order: 7, word_fr: 'Les grands-parents', word_local: 'màjò', hint: 'm' },
      { order: 8, word_fr: 'Mon frère', word_local: 'măn keē', hint: 'm' },
      { order: 9, word_fr: 'Les enfants', word_local: 'ɓɔŋgɛ', hint: 'ɓ' },
      { order: 10, word_fr: 'Le bébé', word_local: 'ǹsɛt man', hint: 'ǹ' },
      // E2 — écriture (phrases)
      { order: 11, word_fr: 'Bonjour mon ami.', word_local: 'Mɛ̀ǹyega', hint: 'M' },
      { order: 12, word_fr: 'Comment vas-tu ?', word_local: 'ù ŋ́kɛ laa', hint: 'ù' },
      { order: 13, word_fr: 'Je vais assez bien.', word_local: 'Mɛ yè mboo', hint: 'M' },
      { order: 14, word_fr: 'Merci.', word_local: 'mɛ̀ǹyegà', hint: 'm' },
      // E3 — sélection image
      { order: 15, word_fr: "Un bébé", word_local: 'ǹsɛt man', hint: 'ǹ' },
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
      // E1 — association (8 paires)
      { order: 1, word_fr: 'Le lion', word_local: 'hɔsì', hint: 'h' },
      { order: 2, word_fr: "L'épervier", word_local: 'hyɔbí', hint: 'h' },
      { order: 3, word_fr: 'Le poisson', word_local: 'nyɔɔ', hint: 'n' },
      { order: 4, word_fr: 'Les poissons', word_local: 'njèé', hint: 'n' },
      { order: 5, word_fr: 'Le cheval', word_local: 'cɔbí', hint: 'c' },
      { order: 6, word_fr: 'Le bœuf', word_local: 'kóp', hint: 'k' },
      { order: 7, word_fr: 'Le poulet', word_local: 'ǹyògól', hint: 'ǹ' },
      { order: 8, word_fr: 'Le serpent', word_local: 'nyàgà', hint: 'n' },
      // E2 — écriture
      { order: 9, word_fr: 'Les sangliers', word_local: 'Ngǒy bìkay', hint: 'N' },
      { order: 10, word_fr: "L'éléphant", word_local: 'Njɔk', hint: 'N' },
      // E3 — sélection image
      { order: 11, word_fr: 'Les abeilles', word_local: 'Nyǒy', hint: 'N' },
      { order: 12, word_fr: 'La sauterelle', word_local: 'tátáŋgá', hint: 't' },
      { order: 13, word_fr: 'Le cafard', word_local: 'pépéé', hint: 'p' },
      { order: 14, word_fr: 'Les singes', word_local: 'kóy', hint: 'k' },
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
      // E1 — mots croisés (6 paires)
      { order: 1, word_fr: 'Le feu', word_local: 'hyèé', hint: 'h' },
      { order: 2, word_fr: 'La flamme', word_local: 'lìndòmbò', hint: 'l' },
      { order: 3, word_fr: "L'eau", word_local: 'màlép', hint: 'm' },
      { order: 4, word_fr: 'Le sel', word_local: 'ɓás', hint: 'ɓ' },
      { order: 5, word_fr: "L'huile", word_local: 'mòó', hint: 'm' },
      { order: 6, word_fr: 'Les légumes', word_local: 'bìkáy bí jɛ́', hint: 'b' },
      // E2 — écriture
      { order: 7, word_fr: 'Le poisson', word_local: 'Hyɔbí', hint: 'H' },
      { order: 8, word_fr: 'Le gibier', word_local: 'Nùgá', hint: 'N' },
      // E3 — sélection image
      { order: 9, word_fr: 'La fourchette', word_local: 'ŋwàs', hint: 'ŋ' },
      { order: 10, word_fr: 'La marmite', word_local: 'Hìɓɛɛ', hint: 'H' },
      { order: 11, word_fr: 'Le puits', word_local: 'ɓɛɛ', hint: 'ɓ' },
      { order: 12, word_fr: 'Le feu de bois', word_local: 'hyèé bí ŋkwàs', hint: 'h' },
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
      // E1 — association (10 paires)
      { order: 1, word_fr: 'Cet habit', word_local: 'i mbɔt ìnī', hint: 'i' },
      { order: 2, word_fr: 'Cette chemise', word_local: 'i jɔmbɛ lini', hint: 'i' },
      { order: 3, word_fr: 'Ce pantalon', word_local: 'i tɔlɔsîs nunu', hint: 'i' },
      { order: 4, word_fr: 'Ces caleçons', word_local: 'i ŋkāndā unu', hint: 'i' },
      { order: 5, word_fr: 'Ce manteau', word_local: 'i kodi mbèŋ ìni', hint: 'i' },
      { order: 6, word_fr: 'Ces costumes', word_local: 'bikōdī bini', hint: 'b' },
      { order: 7, word_fr: 'Cette culotte', word_local: 'i hâp ìni', hint: 'i' },
      { order: 8, word_fr: 'Ces boubous', word_local: 'ɓa ɓùba ɓana', hint: 'ɓ' },
      { order: 9, word_fr: 'Cette chaussure', word_local: 'i tāmb ini', hint: 'i' },
      { order: 10, word_fr: 'Ce chapeau', word_local: 'i tàmba nunu', hint: 'i' },
      // E2 — écriture
      { order: 11, word_fr: 'La cravate', word_local: 'Lilàŋ lini', hint: 'L' },
      { order: 12, word_fr: 'La veste', word_local: 'Kodî', hint: 'K' },
      { order: 13, word_fr: 'Une chemise', word_local: 'Sɔdɛ̂', hint: 'S' },
      { order: 14, word_fr: 'Un habit', word_local: 'Mbɔt', hint: 'M' },
      // E3 — sélection image
      { order: 15, word_fr: 'Les pantalons', word_local: 'BiLɔŋ̂', hint: 'B' },
      { order: 16, word_fr: 'La chaussure', word_local: 'Támb', hint: 'T' },
    ],
  },
];

export async function main() {
  console.log('🌱 Seed Bassa — 4 thèmes principaux\n');

  let lang = await prisma.patrimonialLanguage.findFirst({
    where: { name: { contains: 'Bassa', mode: 'insensitive' } },
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
          image_key: null,
          image_url: null,
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
