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
  // ── 00 — NIVEAU 1 : FONDATIONS (Jours & Verbes) ─────────────────
  {
    order: 0,
    code: 'fondations',
    name_fr: 'Niveau 1 : Fondations',
    name_local: 'Madóti má Boso',
    icon: 'school-outline',
    color: '#3F51B5',
    locked: false,
    lock_hint: null,
    words: [
      // --- Leçon 1 : Les 7 jours de la semaine ---
      { order: 1, category: 'Les 7 jours de la semaine', word_fr: 'Lundi',    word_local: 'Môsú',    hint: 'M', audio_key: 'lundi' },
      { order: 2, category: 'Les 7 jours de la semaine', word_fr: 'Mardi',    word_local: 'Kwasú',   hint: 'K', audio_key: 'mardi' },
      { order: 3, category: 'Les 7 jours de la semaine', word_fr: 'Mercredi', word_local: 'Mukôsú',  hint: 'M', audio_key: 'mercredi' },
      { order: 4, category: 'Les 7 jours de la semaine', word_fr: 'Jeudi',    word_local: 'Ngisú',   hint: 'N', audio_key: 'jeudi' },
      { order: 5, category: 'Les 7 jours de la semaine', word_fr: 'Vendredi', word_local: 'Ndôsú',   hint: 'N', audio_key: 'vendredi' },
      { order: 6, category: 'Les 7 jours de la semaine', word_fr: 'Samedi',   word_local: 'Esabasú', hint: 'E', audio_key: 'samedi' },
      { order: 7, category: 'Les 7 jours de la semaine', word_fr: 'Dimanche', word_local: 'Etíñá',   hint: 'E', audio_key: 'dimanche' },

      // --- Leçon 2 : Verbe AVOIR ---
      { order: 8,  category: 'Verbe AVOIR', word_fr: "J'ai",           word_local: 'Na ben', hint: 'N', audio_key: 'j_ai' },
      { order: 9,  category: 'Verbe AVOIR', word_fr: 'Tu as',          word_local: 'O ben',  hint: 'O', audio_key: 'tu_as' },
      { order: 10, category: 'Verbe AVOIR', word_fr: 'Il/Elle a',      word_local: 'A ben',  hint: 'A', audio_key: 'il_elle_on_a' },
      { order: 11, category: 'Verbe AVOIR', word_fr: 'Nous avons',      word_local: 'Di ben', hint: 'D', audio_key: 'nous_avons' },
      { order: 12, category: 'Verbe AVOIR', word_fr: 'Vous avez',       word_local: 'Lo ben', hint: 'L', audio_key: 'vous_avez' },
      { order: 13, category: 'Verbe AVOIR', word_fr: 'Ils/Elles ont',   word_local: 'Ba ben', hint: 'B', audio_key: 'ils_elles_ont' },

      // --- Leçon 3 : Verbe ÊTRE ---
      { order: 14, category: 'Verbe ÊTRE', word_fr: 'Je suis',        word_local: "N'e",   hint: 'N', audio_key: 'je_suis' },
      { order: 15, category: 'Verbe ÊTRE', word_fr: 'Tu es',           word_local: 'We',    hint: 'W', audio_key: 'tu_es' },
      { order: 16, category: 'Verbe ÊTRE', word_fr: 'Il/Elle est',     word_local: 'E',     hint: 'E', audio_key: 'il_elle_est' },
      { order: 17, category: 'Verbe ÊTRE', word_fr: 'Nous sommes',     word_local: 'Jé',    hint: 'J', audio_key: 'nous_sommes' },
      { order: 18, category: 'Verbe ÊTRE', word_fr: 'Vous êtes',       word_local: "L'e",   hint: 'L', audio_key: 'vous_etes' },
      { order: 19, category: 'Verbe ÊTRE', word_fr: 'Ils/Elles sont',  word_local: "B'e",   hint: 'B', audio_key: 'ils_elles_sont' },

      // --- Leçon 4 : Les Pronoms Personnels ---
      { order: 20, category: 'Les pronoms personnels', word_fr: 'Moi (je)',             word_local: 'mba',    hint: 'm', audio_key: 'moi' },
      { order: 21, category: 'Les pronoms personnels', word_fr: 'Toi (tu)',             word_local: 'wa',     hint: 'w', audio_key: 'toi' },
      { order: 22, category: 'Les pronoms personnels', word_fr: 'Lui / Elle (il/elle)', word_local: 'mɔ́',     hint: 'm', audio_key: 'lui' },
      { order: 23, category: 'Les pronoms personnels', word_fr: 'Nous',                 word_local: 'bisɔ́',   hint: 'b', audio_key: 'nous' },
      { order: 24, category: 'Les pronoms personnels', word_fr: 'Vous',                 word_local: 'binyɔ́',  hint: 'b', audio_key: 'vous' },
      { order: 25, category: 'Les pronoms personnels', word_fr: 'Eux / Elles (ils/elles)', word_local: 'babó', hint: 'b', audio_key: 'eux' },

      // --- Leçon 5 : Les Chiffres 1-9 en duala ---
      { order: 26, category: 'Les chiffres 1-9 en duala', word_fr: 'Zéro',   word_local: 'tɔ lambo', hint: 't', audio_key: 'zero' },
      { order: 27, category: 'Les chiffres 1-9 en duala', word_fr: 'Un',     word_local: 'ewɔ́',     hint: 'e', audio_key: 'un' },
      { order: 28, category: 'Les chiffres 1-9 en duala', word_fr: 'Deux',   word_local: 'ɓéɓǎ',    hint: 'ɓ', audio_key: 'deux' },
      { order: 29, category: 'Les chiffres 1-9 en duala', word_fr: 'Trois',  word_local: 'ɓélálo',  hint: 'ɓ', audio_key: 'trois' },
      { order: 30, category: 'Les chiffres 1-9 en duala', word_fr: 'Quatre', word_local: 'ɓénɛí',   hint: 'ɓ', audio_key: 'quatre' },
      { order: 31, category: 'Les chiffres 1-9 en duala', word_fr: 'Cinq',   word_local: 'ɓétánu',  hint: 'ɓ', audio_key: 'cinq' },
      { order: 32, category: 'Les chiffres 1-9 en duala', word_fr: 'Six',    word_local: 'mutóɓá',  hint: 'm', audio_key: 'six' },
      { order: 33, category: 'Les chiffres 1-9 en duala', word_fr: 'Sept',   word_local: 'saámbá',  hint: 's', audio_key: 'sept' },
      { order: 34, category: 'Les chiffres 1-9 en duala', word_fr: 'Huit',   word_local: 'lɔɔmbi',  hint: 'l', audio_key: 'huit' },
      { order: 35, category: 'Les chiffres 1-9 en duala', word_fr: 'Neuf',   word_local: 'dibuá',   hint: 'd', audio_key: 'neuf' },

      // --- Leçon 6 : Les couleurs ---
      { order: 36, category: 'Les couleurs', word_fr: 'Noir',   word_local: 'mundo', hint: 'm', audio_key: 'noir' },
      { order: 37, category: 'Les couleurs', word_fr: 'Blanc',  word_local: 'sánga', hint: 's', audio_key: 'blanc' },
      { order: 38, category: 'Les couleurs', word_fr: 'Jaune',  word_local: 'njabi', hint: 'n', audio_key: 'jaune' },
      { order: 39, category: 'Les couleurs', word_fr: 'Orange', word_local: 'epumá', hint: 'e', audio_key: 'orange' },
      { order: 40, category: 'Les couleurs', word_fr: 'Rouge',  word_local: 'jóla',  hint: 'j', audio_key: 'rouge' },
      { order: 41, category: 'Les couleurs', word_fr: 'Bleu',   word_local: 'bulu',  hint: 'b', audio_key: 'bleu' },
      { order: 42, category: 'Les couleurs', word_fr: 'Vert',   word_local: "musono mw'éyadí", hint: 'm', audio_key: 'vert' },
    ],
  },

  // ── 01 — LA FAMILLE ────────────────────────────────────────────────
  {
    order: 1,
    code: 'famille',
    name_fr: 'La Famille',
    name_local: 'Mbia',
    icon: 'people-outline',
    color: '#4CAF50',
    locked: true,
    lock_hint: 'Terminez les verbes pour débloquer',
    words: [
      { order: 1,  category: 'Les membres de la famille', word_fr: 'Le papa',             word_local: 'Papá',              hint: 'P', image_url: null },
      { order: 2,  category: 'Les membres de la famille', word_fr: 'La maman',            word_local: 'Mamá',              hint: 'M', image_url: null },
      { order: 3,  category: 'Les membres de la famille', word_fr: 'La tante paternelle',  word_local: 'Árí á tetɛ́',       hint: 'Á', image_url: 'aunty' },
      { order: 4,  category: 'Les membres de la famille', word_fr: 'La tante maternelle',  word_local: 'Árí á yeyɛ',        hint: 'Á', image_url: 'aunty' },
      { order: 5,  category: 'Les membres de la famille', word_fr: "L'oncle paternel",     word_local: 'Ndómɛ á tetɛ́',     hint: 'N', image_url: 'uncle' },
      { order: 6,  category: 'Les membres de la famille', word_fr: "L'oncle maternel",     word_local: 'Ndómɛ á yeyɛ',      hint: 'N', image_url: 'uncle' },
      { order: 7,  category: 'Les membres de la famille', word_fr: 'Les grands-parents',   word_local: 'Ɓambámbɛ́',         hint: 'Ɓ', image_url: 'grandparents' },
      { order: 8,  category: 'Relations et enfants', word_fr: 'Les amis',             word_local: 'Makɔ́m',            hint: 'M', image_url: 'couple' },
      { order: 9,  category: 'Relations et enfants', word_fr: 'Les enfants',          word_local: 'Ɓána',              hint: 'Ɓ', image_url: 'children' },
      { order: 10, category: 'Relations et enfants', word_fr: 'Le bébé',              word_local: 'Múna á mwɛ̌ŋgɛ́',   hint: 'M', image_url: 'baby' },
    ],
  },

  // ── 02 — LES ANIMAUX ───────────────────────────────────────────────
  {
    order: 2,
    code: 'animaux',
    name_fr: 'Les Animaux',
    name_local: 'Ɓiɓwanjé',
    icon: 'paw-outline',
    color: '#FF9800',
    locked: true,
    lock_hint: 'Terminez La Famille pour débloquer',
    words: [
      { order: 1,  category: 'Les animaux sauvages', word_fr: 'Le lion',        word_local: 'Ŋgila',    hint: 'Ŋ', image_url: 'lion' },
      { order: 2,  category: 'Les animaux sauvages', word_fr: 'La girafe',      word_local: 'Ŋgilóɓa',  hint: 'Ŋ', image_url: null },
      { order: 3,  category: 'Les animaux sauvages', word_fr: "L'éléphant",     word_local: 'Njɔu',     hint: 'N', image_url: 'elephant' },
      { order: 4,  category: 'Les animaux sauvages', word_fr: 'Les singes',     word_local: 'Kéma',     hint: 'K', image_url: 'monkeys' },
      { order: 5,  category: 'Les animaux sauvages', word_fr: "L'épervier",     word_local: 'Wómbé',    hint: 'W', image_url: 'bird' },
      { order: 6,  category: 'Les animaux domestiques et insectes', word_fr: 'Le poisson',     word_local: 'Súe',      hint: 'S', image_url: 'fish' },
      { order: 7,  category: 'Les animaux domestiques et insectes', word_fr: 'Le bœuf',        word_local: 'Nyaka',    hint: 'N', image_url: null },
      { order: 8,  category: 'Les animaux domestiques et insectes', word_fr: 'Le poulet',      word_local: 'Wúɓa',     hint: 'W', image_url: null },
      { order: 9,  category: 'Les animaux domestiques et insectes', word_fr: 'La sauterelle',  word_local: 'Dikélé',   hint: 'D', image_url: null },
      { order: 10, category: 'Les animaux domestiques et insectes', word_fr: 'Les abeilles',   word_local: 'Ndɔ́mbí',  hint: 'N', image_url: null },
    ],
  },

  // ── 03 — LA CUISINE ────────────────────────────────────────────────
  {
    order: 3,
    code: 'cuisine',
    name_fr: 'La Cuisine',
    name_local: 'Mandɛ́ á liyɛ',
    icon: 'restaurant-outline',
    color: '#E91E63',
    locked: true,
    lock_hint: 'Terminez Les Animaux pour débloquer',
    words: [
      { order: 1,  category: 'Le feu et l’eau', word_fr: "L'eau",                   word_local: 'Madíɓá',         hint: 'M', image_url: null },
      { order: 2,  category: 'Le feu et l’eau', word_fr: 'Le feu',                  word_local: 'Wéá',            hint: 'W', image_url: 'fire' },
      { order: 3,  category: 'Ingrédients et saveurs', word_fr: 'Le sel',                  word_local: 'Wáŋga',          hint: 'W', image_url: null },
      { order: 4,  category: 'Ingrédients et saveurs', word_fr: "L'huile",                 word_local: 'Mǔla',           hint: 'M', image_url: 'olive_oil' },
      { order: 5,  category: 'Ingrédients et saveurs', word_fr: 'Le sucre',                word_local: 'Ɓɔmbɔ́',         hint: 'Ɓ', image_url: null },
      { order: 6,  category: 'Ingrédients et saveurs', word_fr: 'Le poisson',              word_local: 'Súe',            hint: 'S', image_url: 'fish' },
      { order: 7,  category: 'Ingrédients et saveurs', word_fr: 'Le gibier',               word_local: 'Nyama',          hint: 'N', image_url: null },
      { order: 8,  category: 'Ingrédients et saveurs', word_fr: 'La farine',               word_local: 'Fláwa',          hint: 'F', image_url: 'flour' },
      { order: 9,  category: 'Ustensiles', word_fr: 'La fourchette',           word_local: 'Mwasó',          hint: 'M', image_url: 'fork' },
      { order: 10, category: 'Ustensiles', word_fr: 'Le pilon et le mortier',  word_local: 'Mbɔlɔki na eɓokí', hint: 'M', image_url: 'multer_pistol' },
    ],
  },

  // ── 04 — LES VÊTEMENTS ─────────────────────────────────────────────
  {
    order: 4,
    code: 'vetements',
    name_fr: 'Les Vêtements',
    name_local: 'Ɓimbɔti',
    icon: 'shirt-outline',
    color: '#9C27B0',
    locked: true,
    lock_hint: 'Terminez La Cuisine pour débloquer',
    words: [
      { order: 1,  category: 'Vêtements et sous-vêtements', word_fr: 'Cet habit',       word_local: 'Ní mbɔ́tí',    hint: 'N', image_url: 'suit' },
      { order: 2,  category: 'Vêtements et sous-vêtements', word_fr: 'Cette chemise',   word_local: 'Ní sɔ́ti',     hint: 'N', image_url: 't_shirt' },
      { order: 3,  category: 'Vêtements et sous-vêtements', word_fr: 'Ce pantalon',     word_local: 'Ní tolosísi',  hint: 'N', image_url: 'trouser' },
      { order: 4,  category: 'Vêtements et sous-vêtements', word_fr: 'Ces caleçons',    word_local: 'Ɓé ɓekúɓɛ',   hint: 'Ɓ', image_url: null },
      { order: 5,  category: 'Vêtements et sous-vêtements', word_fr: 'Ces costumes',    word_local: 'Yí kóti',      hint: 'Y', image_url: 'suit' },
      { order: 6,  category: 'Vêtements et sous-vêtements', word_fr: 'Cette culotte',   word_local: 'Yé ekúɓɛ',     hint: 'Y', image_url: null },
      { order: 7,  category: 'Accessoires et chaussures', word_fr: 'Ces boubous',     word_local: 'Ɓé ɓebuɓá',   hint: 'Ɓ', image_url: null },
      { order: 8,  category: 'Accessoires et chaussures', word_fr: 'Cette chaussure', word_local: 'Yé etámbí',    hint: 'Y', image_url: 'shoes' },
      { order: 9,  category: 'Accessoires et chaussures', word_fr: 'Ce chapeau',      word_local: 'Yé ekótó',     hint: 'Y', image_url: null },
      { order: 10, category: 'Accessoires et chaussures', word_fr: 'La cravate',      word_local: 'Kɔ́la',        hint: 'K', image_url: 'tie' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
export async function main() {

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
