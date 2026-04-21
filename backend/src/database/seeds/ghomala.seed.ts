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
  // ── 01 — LA FAMILLE ────────────────────────────────────────────────
  {
    order: 0,
    code: 'famille',
    name_fr: 'La Famille',
    name_local: 'Mtâ pə̌',
    icon: 'people-outline',
    color: '#4CAF50',
    locked: false,
    lock_hint: null,
    words: [
      // E1 — association (10 paires)
      { order: 1, word_fr: 'Le papa', word_local: 'tá', hint: 't' },
      { order: 2, word_fr: 'La maman', word_local: 'má', hint: 'm' },
      { order: 3, word_fr: 'La tante paternelle', word_local: 'fə̂ tâ á yə mjwǐ', hint: 'f' },
      { order: 4, word_fr: 'La tante maternelle', word_local: 'fə̂ mâ á yə mjwǐ', hint: 'f' },
      { order: 5, word_fr: "L'oncle paternel", word_local: 'fə̂ tâ á yə mbɛ̂', hint: 'f' },
      { order: 6, word_fr: "L'oncle maternel", word_local: 'fə̂ mâ á yə mbɛ̂', hint: 'f' },
      { order: 7, word_fr: 'Les grands-parents', word_local: 'mtâ pə̌ pyə gwyə́', hint: 'm' },
      { order: 8, word_fr: 'Les amis', word_local: 'msǒ', hint: 'm' },
      { order: 9, word_fr: 'Les enfants', word_local: 'pǒ', hint: 'p' },
      { order: 10, word_fr: 'Le bébé', word_local: 'mûbwǎ', hint: 'm' },
      // E2 — écriture (mots supplémentaires)
      { order: 11, word_fr: 'Comment vas-tu ?', word_local: 'Â m gaə̂kə̀ ?', hint: 'Â' },
      { order: 12, word_fr: 'Merci', word_local: 'Motəókwâ', hint: 'M' },
      // E3 — sélection image (mots supplémentaires)
      { order: 13, word_fr: 'Les parents', word_local: 'mtâ pə̌', hint: 'm' },
      { order: 14, word_fr: 'Une famille', word_local: 'tuŋdyə́', hint: 't' },
      { order: 15, word_fr: 'Un homme', word_local: 'mbɛ̂', hint: 'm' },
      { order: 16, word_fr: 'Une femme', word_local: 'mjwǐ', hint: 'm' },
    ],
  },

  // ── 02 — LES ANIMAUX ───────────────────────────────────────────────
  {
    order: 1,
    code: 'animaux',
    name_fr: 'Les Animaux',
    name_local: 'Mə̌ŋkɔ̌ mɔ̌',
    icon: 'paw-outline',
    color: '#FF9800',
    locked: true,
    lock_hint: 'Terminez La Famille pour débloquer',
    words: [
      // E1 — association (8 paires du PDF)
      { order: 1, word_fr: 'Le lion', word_local: "nɔmtə̀mà'", hint: 'n' },
      { order: 2, word_fr: 'Les lions', word_local: "mnɔmtə̀mà'", hint: 'm' },
      { order: 3, word_fr: 'Le poisson', word_local: 'gù', hint: 'g' },
      { order: 4, word_fr: 'Les poissons', word_local: 'mgù', hint: 'm' },
      { order: 5, word_fr: "L'huile", word_local: 'mwaə̌', hint: 'm' },
      { order: 6, word_fr: 'Le bœuf', word_local: "na'", hint: 'n' },
      { order: 7, word_fr: 'Le poulet', word_local: 'gɔp̌', hint: 'g' },
      { order: 8, word_fr: 'Les poulets', word_local: 'mgɔp̌', hint: 'm' },
      // E2 — écriture (mots supplémentaires)
      { order: 9, word_fr: 'Les sangliers', word_local: 'mgə́nɔmgǒ', hint: 'm' },
      { order: 10, word_fr: "L'éléphant", word_local: 'sǒ', hint: 's' },
      // E3 — sélection image
      { order: 11, word_fr: "L'abeille", word_local: "ŋə̌ŋŋwá'", hint: 'ŋ' },
      { order: 12, word_fr: 'La sauterelle', word_local: 'gǎm', hint: 'g' },
      { order: 13, word_fr: 'Le cafard', word_local: 'bíbíŋ', hint: 'b' },
      { order: 14, word_fr: 'Les singes', word_local: 'mŋkɔ̌', hint: 'm' },
    ],
  },

  // ── 03 — LA CUISINE ────────────────────────────────────────────────
  {
    order: 2,
    code: 'cuisine',
    name_fr: 'La Cuisine',
    name_local: 'Kə́p yə̌ŋ',
    icon: 'restaurant-outline',
    color: '#E91E63',
    locked: true,
    lock_hint: 'Terminez Les Animaux pour débloquer',
    words: [
      { order: 1, word_fr: 'Le feu', word_local: 'mɔ̌k', hint: 'm' },
      { order: 2, word_fr: 'La flamme', word_local: 'zhwyəm̌ɔ̌k', hint: 'z' },
      { order: 3, word_fr: "L'eau", word_local: 'shyə', hint: 's' },
      { order: 4, word_fr: 'Le sel', word_local: 'gwɛ̌', hint: 'g' },
      { order: 5, word_fr: "L'huile", word_local: 'mwaə̌', hint: 'm' },
      { order: 6, word_fr: 'Le sucre', word_local: 'tùmtə̀', hint: 't' },
      { order: 7, word_fr: 'La farine', word_local: 'vémsɛ̂ntɥɔ̀', hint: 'v' },
      { order: 8, word_fr: 'La fourchette', word_local: "lǔ'mkə́kə́", hint: 'l' },
      { order: 9, word_fr: 'Le feu de bois', word_local: 'mɔ̌k ŋkwyə́', hint: 'm' },
      { order: 10, word_fr: 'Le pilon et le mortier', word_local: 'kuŋpɔ̌ ba kɔ́p', hint: 'k' },
    ],
  },

  // ── 04 — LES VÊTEMENTS ─────────────────────────────────────────────
  {
    order: 3,
    code: 'vetements',
    name_fr: 'Les Vêtements',
    name_local: 'Mdzə́ mɔ̌',
    icon: 'shirt-outline',
    color: '#9C27B0',
    locked: true,
    lock_hint: 'Terminez La Cuisine pour débloquer',
    words: [
      // E1 — association (9 paires du PDF)
      { order: 1, word_fr: 'Cet habit', word_local: 'dzə́ yə̌ŋ', hint: 'd' },
      { order: 2, word_fr: 'Cette chemise', word_local: "tənka'dzə́ yə̌ŋ", hint: 't' },
      { order: 3, word_fr: 'Ce pantalon', word_local: "tɛ́sho' yə̌ŋ", hint: 't' },
      { order: 4, word_fr: 'Ces caleçons', word_local: 'mdzə̂cu mɔ̌', hint: 'm' },
      { order: 5, word_fr: 'Ces costumes', word_local: 'mcwopdəm mɔ̌', hint: 'm' },
      { order: 6, word_fr: 'Cette culotte', word_local: "kamtɛ́sho' yə̌ŋ", hint: 'k' },
      { order: 7, word_fr: 'Ces boubous', word_local: 'msɥɔdzə́ mɔ̌', hint: 'm' },
      { order: 8, word_fr: 'Cette chaussure', word_local: 'Mtǎp mɔ̌', hint: 'M' },
      { order: 9, word_fr: 'Ce chapeau', word_local: "co' yə̌ŋ", hint: 'c' },
      // E2 — écriture
      { order: 10, word_fr: 'La cravate', word_local: 'ŋkwə̂ntúŋ', hint: 'ŋ' },
      { order: 11, word_fr: 'Ce manteau', word_local: 'dzə̂bəŋ yə̌ŋ', hint: 'd' },
      // E3 — sélection image
      { order: 12, word_fr: 'La veste', word_local: 'dzə̂msə̀m', hint: 'd' },
      { order: 13, word_fr: 'Les pantalons', word_local: "mtɛsho'", hint: 'm' },
      { order: 14, word_fr: 'Le t-shirt', word_local: 'tíshɔ́t', hint: 't' },
      { order: 15, word_fr: 'La chaussure', word_local: 'mntapə́', hint: 'm' },
      { order: 16, word_fr: 'Les paires de babouches', word_local: 'mlə̀pâsì', hint: 'm' },
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
    console.log(`✅ PatrimonialLanguage "Ghomálá" créée (${lang.id})\n`);
  } else {
    console.log(`ℹ️  PatrimonialLanguage "Ghomálá" existante (${lang.id})\n`);
  }

  // 2. Nettoyer les anciens thèmes Ghomálá (cascade supprime mots + exercices)
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
    console.log(`  📂 T${t.order} — ${t.name_fr}`);

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
