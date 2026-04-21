/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Seed Duala : 4 Thèmes principaux                   ║
 * ║  01 — La Famille    (order 0, débloqué)                      ║
 * ║  02 — Les Animaux   (order 1, verrouillé)                    ║
 * ║  03 — La Cuisine    (order 2, verrouillé)                    ║
 * ║  04 — Les Vêtements (order 3, verrouillé)                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Utilise : MulemTheme, MulemWord, MulemExercise
 *  Exécution : npx ts-node --project tsconfig.json src/database/seeds/duala.seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────
const THEMES = [
  // ── 01 — LA FAMILLE ────────────────────────────────────────────────
  {
    order: 0,
    code: 'famille',
    name_fr: 'La Famille',
    name_local: 'Mbia',
    icon: 'people-outline',
    color: '#4CAF50',
    locked: false,
    lock_hint: null,
    words: [
      { order: 1, word_fr: 'Le papa', word_local: 'Papá', hint: 'P' },
      { order: 2, word_fr: 'La maman', word_local: 'Mamá', hint: 'M' },
      { order: 3, word_fr: 'La tante paternelle', word_local: 'Árí á tetɛ́', hint: 'Á' },
      { order: 4, word_fr: 'La tante maternelle', word_local: 'Árí á yeyɛ', hint: 'Á' },
      { order: 5, word_fr: "L'oncle paternel", word_local: 'Ndómɛ á tetɛ́', hint: 'N' },
      { order: 6, word_fr: "L'oncle maternel", word_local: 'Ndómɛ á yeyɛ', hint: 'N' },
      { order: 7, word_fr: 'Les grands-parents', word_local: 'Ɓambámbɛ́', hint: 'Ɓ' },
      { order: 8, word_fr: 'Les amis', word_local: 'Makɔ́m', hint: 'M' },
      { order: 9, word_fr: 'Les enfants', word_local: 'Ɓána', hint: 'Ɓ' },
      { order: 10, word_fr: 'Le bébé', word_local: 'Múna á mwɛ̌ŋgɛ́', hint: 'M' },
    ],
  },

  // ── 02 — LES ANIMAUX ───────────────────────────────────────────────
  {
    order: 1,
    code: 'animaux',
    name_fr: 'Les Animaux',
    name_local: 'Ɓiɓwanjé',
    icon: 'paw-outline',
    color: '#FF9800',
    locked: true,
    lock_hint: 'Terminez La Famille pour débloquer',
    words: [
      { order: 1, word_fr: 'Le lion', word_local: 'Ŋgila', hint: 'Ŋ' },
      { order: 2, word_fr: 'La girafe', word_local: 'Ŋgilóɓa', hint: 'Ŋ' },
      { order: 3, word_fr: 'Le poisson', word_local: 'Súe', hint: 'S' },
      { order: 4, word_fr: 'Le bœuf', word_local: 'Nyaka', hint: 'N' },
      { order: 5, word_fr: 'Le poulet', word_local: 'Wúɓa', hint: 'W' },
      { order: 6, word_fr: "L'éléphant", word_local: 'Njɔu', hint: 'N' },
      { order: 7, word_fr: 'Les singes', word_local: 'Kéma', hint: 'K' },
      { order: 8, word_fr: 'La sauterelle', word_local: 'Dikélé', hint: 'D' },
      { order: 9, word_fr: "L'épervier", word_local: 'Wómbé', hint: 'W' },
      { order: 10, word_fr: 'Les abeilles', word_local: 'Ndɔ́mbí', hint: 'N' },
    ],
  },

  // ── 03 — LA CUISINE ────────────────────────────────────────────────
  {
    order: 2,
    code: 'cuisine',
    name_fr: 'La Cuisine',
    name_local: 'Mandɛ́ á liyɛ',
    icon: 'restaurant-outline',
    color: '#E91E63',
    locked: true,
    lock_hint: 'Terminez Les Animaux pour débloquer',
    words: [
      { order: 1, word_fr: "L'eau", word_local: 'Madíɓá', hint: 'M' },
      { order: 2, word_fr: 'Le feu', word_local: 'Wéá', hint: 'W' },
      { order: 3, word_fr: 'Le sel', word_local: 'Wáŋga', hint: 'W' },
      { order: 4, word_fr: "L'huile", word_local: 'Mǔla', hint: 'M' },
      { order: 5, word_fr: 'Le sucre', word_local: 'Ɓɔmbɔ́', hint: 'Ɓ' },
      { order: 6, word_fr: 'Le poisson', word_local: 'Súe', hint: 'S' },
      { order: 7, word_fr: 'Le gibier', word_local: 'Nyama', hint: 'N' },
      { order: 8, word_fr: 'La farine', word_local: 'Fláwa', hint: 'F' },
      { order: 9, word_fr: 'La fourchette', word_local: 'Mwasó', hint: 'M' },
      { order: 10, word_fr: 'Le pilon et le mortier', word_local: 'Mbɔlɔki na eɓokí', hint: 'M' },
    ],
  },

  // ── 04 — LES VÊTEMENTS ─────────────────────────────────────────────
  {
    order: 3,
    code: 'vetements',
    name_fr: 'Les Vêtements',
    name_local: 'Ɓimbɔti',
    icon: 'shirt-outline',
    color: '#9C27B0',
    locked: true,
    lock_hint: 'Terminez La Cuisine pour débloquer',
    words: [
      { order: 1, word_fr: 'Cet habit', word_local: 'Ní mbɔ́tí', hint: 'N' },
      { order: 2, word_fr: 'Cette chemise', word_local: 'Ní sɔ́ti', hint: 'N' },
      { order: 3, word_fr: 'Ce pantalon', word_local: 'Ní tolosísi', hint: 'N' },
      { order: 4, word_fr: 'Ces caleçons', word_local: 'Ɓé ɓekúɓɛ', hint: 'Ɓ' },
      { order: 5, word_fr: 'Ces costumes', word_local: 'Yí kóti', hint: 'Y' },
      { order: 6, word_fr: 'Cette culotte', word_local: 'Yé ekúɓɛ', hint: 'Y' },
      { order: 7, word_fr: 'Ces boubous', word_local: 'Ɓé ɓebuɓá', hint: 'Ɓ' },
      { order: 8, word_fr: 'Cette chaussure', word_local: 'Yé etámbí', hint: 'Y' },
      { order: 9, word_fr: 'Ce chapeau', word_local: 'Yé ekótó', hint: 'Y' },
      { order: 10, word_fr: 'La cravate', word_local: 'Kɔ́la', hint: 'K' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
export async function main() {
  console.log('🌱 Seed Duala — 4 thèmes principaux\n');

  // 1. Récupérer ou créer la langue patrimoniale Duala
  let lang = await prisma.patrimonialLanguage.findFirst({
    where: { name: 'Duala' },
  });

  if (!lang) {
    lang = await prisma.patrimonialLanguage.create({ data: { name: 'Duala' } });
  } else {
  }

  // 2. Nettoyer les anciens thèmes Duala (cascade supprime mots + exercices)
  const deleted = await prisma.mulemTheme.deleteMany({
    where: { patrimonialLanguageId: lang.id },
  });
  if (deleted.count > 0) {
    console.log(`🗑️  ${deleted.count} ancien(s) thème(s) supprimé(s)\n`);
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

    // 4. Insérer les 10 mots
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

    // 5. Insérer les 3 exercices standard
    await prisma.mulemExercise.createMany({
      data: [
        { themeId: theme.id, order: 1, type: 'word_match', instruction_fr: 'Relie chaque mot à sa traduction duala.', instruction_local: 'tiŋgɛ́ lambo tɛ́ na ɓetúkwédí ɓáō na duálá' },
        { themeId: theme.id, order: 2, type: 'write', instruction_fr: 'Écris la traduction en duala.', instruction_local: 'tilá na duálá' },
        { themeId: theme.id, order: 3, type: 'image_select', instruction_fr: 'Sélectionne la bonne image.', instruction_local: 'pɔsɔ́ duta dí tɛ́ŋgɛ́n' },
      ],
    });
  }


}

if (require.main === module) {
  main()
    .catch((e) => { console.error('❌', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
