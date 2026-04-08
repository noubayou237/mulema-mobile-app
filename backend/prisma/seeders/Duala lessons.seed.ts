/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Seed Complet : 6 Thèmes de Leçons Duala            ║
 * ║  Extrait de : Les lecons douala.zip                           ║
 * ║  Thèmes :                                                     ║
 * ║   T6  — Les Jours de la Semaine                               ║
 * ║   T7  — Les Pronoms Personnels                                ║
 * ║   T8  — Le Verbe Être                                         ║
 * ║   T9  — Le Verbe Avoir                                        ║
 * ║   T10 — Les Chiffres 1-9                                      ║
 * ║   T11 — Les Couleurs                                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Chaque mot référence un fichier audio .wav
 *  (à uploader sur S3 via le script upload-assets.ts)
 *
 *  Clé audio S3 convention :
 *    duala/{theme_code}/{mot_fr_slug}.wav
 *  Ex : duala/jours/lundi.wav
 */

export interface WordEntry {
  order: number;
  word_fr: string;           // français
  word_duala: string;        // traduction duala
  audio_file: string;        // nom du fichier .wav local (dans le zip)
  audio_s3_key: string;      // clé S3 après upload
  image_s3_key: string;      // clé S3 image (à fournir)
  hint: string;              // première lettre pour exercice écriture
}

export interface ExerciseSeed {
  order: number;
  type: 'word_match' | 'write' | 'image_select';
  instruction_fr: string;
  instruction_duala: string;
}

export interface LessonSeed {
  order: number;
  title_fr: string;
  title_duala: string;
  words: WordEntry[];
  exercises: ExerciseSeed[];
}

export interface ThemeSeed {
  order: number;
  code: string;
  name_fr: string;
  name_duala: string;
  icon: string;
  locked: boolean;
  lock_hint?: string;
  color: string;
  lessons: LessonSeed[];
}

// ══════════════════════════════════════════════════════════════
// Les 3 exercices standards (identiques pour tous les thèmes)
// Le contenu est généré dynamiquement depuis les mots
// ══════════════════════════════════════════════════════════════
const STANDARD_EXERCISES: ExerciseSeed[] = [
  {
    order: 1,
    type: 'word_match',
    instruction_fr: 'Relie chaque mot français à sa traduction en duala.',
    instruction_duala: 'tiŋgɛ́ lambo tɛ́ na ɓetúkwédí ɓáō na duálá',
  },
  {
    order: 2,
    type: 'write',
    instruction_fr: 'Écris la traduction en duala du mot affiché.',
    instruction_duala: 'tilá na duálá',
  },
  {
    order: 3,
    type: 'image_select',
    instruction_fr: "Sélectionne l'image qui correspond au mot duala affiché.",
    instruction_duala: 'pɔsɔ́ duta dí tɛ́ŋgɛ́n',
  },
];

// ══════════════════════════════════════════════════════════════
// HELPER : génère la clé S3 depuis le nom du thème et du mot
// ══════════════════════════════════════════════════════════════
const s3Key = (themeCode: string, fileName: string) =>
  `duala/${themeCode}/${fileName}`;

const imgKey = (themeCode: string, wordFr: string) =>
  `duala/images/${themeCode}/${wordFr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')}.jpg`;

// ══════════════════════════════════════════════════════════════
export const DUALA_LESSONS_SEED: ThemeSeed[] = [

  /* ══════════════════════════════════════════════════════════
     THÈME 6 — LES SEPT JOURS DE LA SEMAINE
     Audio : Les sept jour de la semaine/{Jour}.wav
     ══════════════════════════════════════════════════════════ */
  {
    order: 6,
    code: 'jours',
    name_fr: 'Les Jours de la Semaine',
    name_duala: 'Miɓuú mí esámbá',
    icon: 'calendar-outline',
    locked: false,
    color: '#4CAF50',
    lessons: [
      {
        order: 1,
        title_fr: 'Les sept jours',
        title_duala: 'Miɓuú mí saámbá',
        words: [
          {
            order: 1,
            word_fr: 'Lundi',
            word_duala: 'Mɔsi',
            audio_file: 'Lundi.wav',
            audio_s3_key: s3Key('jours', 'Lundi.wav'),
            image_s3_key: imgKey('jours', 'lundi'),
            hint: 'M',
          },
          {
            order: 2,
            word_fr: 'Mardi',
            word_duala: 'Kwasi',
            audio_file: 'Mardi .wav',
            audio_s3_key: s3Key('jours', 'Mardi.wav'),
            image_s3_key: imgKey('jours', 'mardi'),
            hint: 'K',
          },
          {
            order: 3,
            word_fr: 'Mercredi',
            word_duala: 'Mukɔsi',
            audio_file: 'Mercredi.wav',
            audio_s3_key: s3Key('jours', 'Mercredi.wav'),
            image_s3_key: imgKey('jours', 'mercredi'),
            hint: 'M',
          },
          {
            order: 4,
            word_fr: 'Jeudi',
            word_duala: 'Ngisi',
            audio_file: 'Jeudi.wav',
            audio_s3_key: s3Key('jours', 'Jeudi.wav'),
            image_s3_key: imgKey('jours', 'jeudi'),
            hint: 'N',
          },
          {
            order: 5,
            word_fr: 'Vendredi',
            word_duala: 'Ndɔsi',
            audio_file: 'Vendredi.wav',
            audio_s3_key: s3Key('jours', 'Vendredi.wav'),
            image_s3_key: imgKey('jours', 'vendredi'),
            hint: 'N',
          },
          {
            order: 6,
            word_fr: 'Samedi',
            word_duala: 'Esaba',
            audio_file: 'Samedi.wav',
            audio_s3_key: s3Key('jours', 'Samedi.wav'),
            image_s3_key: imgKey('jours', 'samedi'),
            hint: 'E',
          },
          {
            order: 7,
            word_fr: 'Dimanche',
            word_duala: 'Étina',
            audio_file: 'Dimanche.wav',
            audio_s3_key: s3Key('jours', 'Dimanche.wav'),
            image_s3_key: imgKey('jours', 'dimanche'),
            hint: 'É',
          },
        ],
        exercises: STANDARD_EXERCISES,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════
     THÈME 7 — LES PRONOMS PERSONNELS
     Audio : Les pronoms personnel/{Pronom}.wav
     ══════════════════════════════════════════════════════════ */
  {
    order: 7,
    code: 'pronoms',
    name_fr: 'Les Pronoms Personnels',
    name_duala: 'Ɓesúnjɛ ɓi moyɔndɔ',
    icon: 'person-outline',
    locked: false,
    color: '#2196F3',
    lessons: [
      {
        order: 1,
        title_fr: 'Les pronoms de base',
        title_duala: 'Ɓesúnjɛ ɓi losólé',
        words: [
          {
            order: 1,
            word_fr: 'Moi (je)',
            word_duala: 'mba',
            audio_file: 'Moi.wav',
            audio_s3_key: s3Key('pronoms', 'Moi.wav'),
            image_s3_key: imgKey('pronoms', 'moi'),
            hint: 'm',
          },
          {
            order: 2,
            word_fr: 'Toi (tu)',
            word_duala: 'wa',
            audio_file: 'Toi.wav',
            audio_s3_key: s3Key('pronoms', 'Toi.wav'),
            image_s3_key: imgKey('pronoms', 'toi'),
            hint: 'w',
          },
          {
            order: 3,
            word_fr: 'Lui / Elle (il/elle)',
            word_duala: 'mɔ́',
            audio_file: 'Lui.wav',
            audio_s3_key: s3Key('pronoms', 'Lui.wav'),
            image_s3_key: imgKey('pronoms', 'lui'),
            hint: 'm',
          },
          {
            order: 4,
            word_fr: 'Nous',
            word_duala: 'bisɔ́',
            audio_file: 'Nous.wav',
            audio_s3_key: s3Key('pronoms', 'Nous.wav'),
            image_s3_key: imgKey('pronoms', 'nous'),
            hint: 'b',
          },
          {
            order: 5,
            word_fr: 'Vous',
            word_duala: 'binyɔ́',
            audio_file: 'Vous.wav',
            audio_s3_key: s3Key('pronoms', 'Vous.wav'),
            image_s3_key: imgKey('pronoms', 'vous'),
            hint: 'b',
          },
          {
            order: 6,
            word_fr: 'Eux / Elles (ils/elles)',
            word_duala: 'babó',
            audio_file: 'Eux.wav',
            audio_s3_key: s3Key('pronoms', 'Eux.wav'),
            image_s3_key: imgKey('pronoms', 'eux'),
            hint: 'b',
          },
        ],
        exercises: STANDARD_EXERCISES,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════
     THÈME 8 — LE VERBE ÊTRE
     Audio : Le verbe etre/{forme}.wav
     Conjugaison : Na/O/A/DI/LO/BA + e
     ══════════════════════════════════════════════════════════ */
  {
    order: 8,
    code: 'verbe_etre',
    name_fr: 'Le Verbe Être',
    name_duala: 'Lambo "e" (être)',
    icon: 'language-outline',
    locked: false,
    color: '#9C27B0',
    lessons: [
      {
        order: 1,
        title_fr: 'Conjugaison du verbe être',
        title_duala: 'Mɔnji á lambo "e"',
        words: [
          {
            order: 1,
            word_fr: 'Je suis',
            word_duala: 'Na e',
            audio_file: 'je suis.wav',
            audio_s3_key: s3Key('verbe_etre', 'je_suis.wav'),
            image_s3_key: imgKey('verbe_etre', 'je_suis'),
            hint: 'N',
          },
          {
            order: 2,
            word_fr: 'Tu es',
            word_duala: 'O e',
            audio_file: 'TU ES.wav',
            audio_s3_key: s3Key('verbe_etre', 'TU_ES.wav'),
            image_s3_key: imgKey('verbe_etre', 'tu_es'),
            hint: 'O',
          },
          {
            order: 3,
            word_fr: 'Il / Elle est',
            word_duala: 'A e',
            audio_file: 'IL ELLE EST.wav',
            audio_s3_key: s3Key('verbe_etre', 'IL_ELLE_EST.wav'),
            image_s3_key: imgKey('verbe_etre', 'il_est'),
            hint: 'A',
          },
          {
            order: 4,
            word_fr: 'Nous sommes',
            word_duala: 'DI e',
            audio_file: 'NOUS SOMMES.wav',
            audio_s3_key: s3Key('verbe_etre', 'NOUS_SOMMES.wav'),
            image_s3_key: imgKey('verbe_etre', 'nous_sommes'),
            hint: 'D',
          },
          {
            order: 5,
            word_fr: 'Vous êtes',
            word_duala: 'LO e',
            audio_file: 'VOUS ÊTES.wav',
            audio_s3_key: s3Key('verbe_etre', 'VOUS_ETES.wav'),
            image_s3_key: imgKey('verbe_etre', 'vous_etes'),
            hint: 'L',
          },
          {
            order: 6,
            word_fr: 'Ils / Elles sont',
            word_duala: 'BA e',
            audio_file: 'ILS ELLES SONT.wav',
            audio_s3_key: s3Key('verbe_etre', 'ILS_ELLES_SONT.wav'),
            image_s3_key: imgKey('verbe_etre', 'ils_sont'),
            hint: 'B',
          },
        ],
        exercises: STANDARD_EXERCISES,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════
     THÈME 9 — LE VERBE AVOIR
     Audio : Le verbe avoir/{forme}.wav
     Conjugaison : Na/O/A/DI/LO/BA + bén
     ══════════════════════════════════════════════════════════ */
  {
    order: 9,
    code: 'verbe_avoir',
    name_fr: 'Le Verbe Avoir',
    name_duala: 'Lambo "bén" (avoir)',
    icon: 'hand-right-outline',
    locked: false,
    color: '#FF5722',
    lessons: [
      {
        order: 1,
        title_fr: 'Conjugaison du verbe avoir',
        title_duala: 'Mɔnji á lambo "bén"',
        words: [
          {
            order: 1,
            word_fr: "J'ai",
            word_duala: 'Na bén',
            audio_file: "j'ai.wav",
            audio_s3_key: s3Key('verbe_avoir', 'j_ai.wav'),
            image_s3_key: imgKey('verbe_avoir', 'j_ai'),
            hint: 'N',
          },
          {
            order: 2,
            word_fr: 'Tu as',
            word_duala: 'O bén',
            audio_file: 'tu as.wav',
            audio_s3_key: s3Key('verbe_avoir', 'tu_as.wav'),
            image_s3_key: imgKey('verbe_avoir', 'tu_as'),
            hint: 'O',
          },
          {
            order: 3,
            word_fr: 'Il / Elle a',
            word_duala: 'A bén',
            audio_file: 'il elle  on a.wav',
            audio_s3_key: s3Key('verbe_avoir', 'il_elle_a.wav'),
            image_s3_key: imgKey('verbe_avoir', 'il_a'),
            hint: 'A',
          },
          {
            order: 4,
            word_fr: 'Nous avons',
            word_duala: 'DI bén',
            audio_file: 'nous avons.wav',
            audio_s3_key: s3Key('verbe_avoir', 'nous_avons.wav'),
            image_s3_key: imgKey('verbe_avoir', 'nous_avons'),
            hint: 'D',
          },
          {
            order: 5,
            word_fr: 'Vous avez',
            word_duala: 'LO bén',
            audio_file: 'vous avez.wav',
            audio_s3_key: s3Key('verbe_avoir', 'vous_avez.wav'),
            image_s3_key: imgKey('verbe_avoir', 'vous_avez'),
            hint: 'L',
          },
          {
            order: 6,
            word_fr: 'Ils / Elles ont',
            word_duala: 'BA bén',
            audio_file: 'ils elles ont.wav',
            audio_s3_key: s3Key('verbe_avoir', 'ils_elles_ont.wav'),
            image_s3_key: imgKey('verbe_avoir', 'ils_ont'),
            hint: 'B',
          },
        ],
        exercises: STANDARD_EXERCISES,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════
     THÈME 10 — LES CHIFFRES 1-9
     Audio : Les chiffres 1-9 en duala/{chiffre}.wav
     ══════════════════════════════════════════════════════════ */
  {
    order: 10,
    code: 'chiffres',
    name_fr: 'Les Chiffres 0-9',
    name_duala: 'Mikɔmbá mí duálá',
    icon: 'calculator-outline',
    locked: false,
    color: '#FF9800',
    lessons: [
      {
        order: 1,
        title_fr: 'Les chiffres de 0 à 9',
        title_duala: 'Mikɔmbá mi tɔ lambo tɛ́ dibuá',
        words: [
          {
            order: 1,
            word_fr: 'Zéro',
            word_duala: 'tɔ lambo',
            audio_file: 'zéro.wav',
            audio_s3_key: s3Key('chiffres', 'zero.wav'),
            image_s3_key: imgKey('chiffres', 'zero'),
            hint: 't',
          },
          {
            order: 2,
            word_fr: 'Un',
            word_duala: 'ewɔ́',
            audio_file: 'un.wav',
            audio_s3_key: s3Key('chiffres', 'un.wav'),
            image_s3_key: imgKey('chiffres', 'un'),
            hint: 'e',
          },
          {
            order: 3,
            word_fr: 'Deux',
            word_duala: 'ɓéɓǎ',
            audio_file: 'deux.wav',
            audio_s3_key: s3Key('chiffres', 'deux.wav'),
            image_s3_key: imgKey('chiffres', 'deux'),
            hint: 'ɓ',
          },
          {
            order: 4,
            word_fr: 'Trois',
            word_duala: 'ɓélálo',
            audio_file: 'trois.wav',
            audio_s3_key: s3Key('chiffres', 'trois.wav'),
            image_s3_key: imgKey('chiffres', 'trois'),
            hint: 'ɓ',
          },
          {
            order: 5,
            word_fr: 'Quatre',
            word_duala: 'ɓénɛí',
            audio_file: 'quatre.wav',
            audio_s3_key: s3Key('chiffres', 'quatre.wav'),
            image_s3_key: imgKey('chiffres', 'quatre'),
            hint: 'ɓ',
          },
          {
            order: 6,
            word_fr: 'Cinq',
            word_duala: 'ɓétánu',
            audio_file: 'cinq.wav',
            audio_s3_key: s3Key('chiffres', 'cinq.wav'),
            image_s3_key: imgKey('chiffres', 'cinq'),
            hint: 'ɓ',
          },
          {
            order: 7,
            word_fr: 'Six',
            word_duala: 'mutóɓá',
            audio_file: 'six.wav',
            audio_s3_key: s3Key('chiffres', 'six.wav'),
            image_s3_key: imgKey('chiffres', 'six'),
            hint: 'm',
          },
          {
            order: 8,
            word_fr: 'Sept',
            word_duala: 'saámbá',
            audio_file: 'sept.wav',
            audio_s3_key: s3Key('chiffres', 'sept.wav'),
            image_s3_key: imgKey('chiffres', 'sept'),
            hint: 's',
          },
          {
            order: 9,
            word_fr: 'Huit',
            word_duala: 'lɔɔmbi',
            audio_file: 'huit.wav',
            audio_s3_key: s3Key('chiffres', 'huit.wav'),
            image_s3_key: imgKey('chiffres', 'huit'),
            hint: 'l',
          },
          {
            order: 10,
            word_fr: 'Neuf',
            word_duala: 'dibuá',
            audio_file: 'neuf.wav',
            audio_s3_key: s3Key('chiffres', 'neuf.wav'),
            image_s3_key: imgKey('chiffres', 'neuf'),
            hint: 'd',
          },
        ],
        exercises: STANDARD_EXERCISES,
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════
     THÈME 11 — LES COULEURS
     Audio : Les couleur/{couleur}.wav
     ══════════════════════════════════════════════════════════ */
  {
    order: 11,
    code: 'couleurs',
    name_fr: 'Les Couleurs',
    name_duala: 'Mɔnjɔ mí bilɔŋgɔ',
    icon: 'color-palette-outline',
    locked: false,
    color: '#E91E63',
    lessons: [
      {
        order: 1,
        title_fr: 'Les couleurs de base',
        title_duala: 'Mɔnjɔ mí losólé',
        words: [
          {
            order: 1,
            word_fr: 'Noir',
            word_duala: 'mundo',
            audio_file: 'noir.wav',
            audio_s3_key: s3Key('couleurs', 'noir.wav'),
            image_s3_key: imgKey('couleurs', 'noir'),
            hint: 'm',
          },
          {
            order: 2,
            word_fr: 'Blanc',
            word_duala: 'sánga',
            audio_file: 'blanc.wav',
            audio_s3_key: s3Key('couleurs', 'blanc.wav'),
            image_s3_key: imgKey('couleurs', 'blanc'),
            hint: 's',
          },
          {
            order: 3,
            word_fr: 'Jaune',
            word_duala: 'njabi',
            audio_file: 'jaune.wav',
            audio_s3_key: s3Key('couleurs', 'jaune.wav'),
            image_s3_key: imgKey('couleurs', 'jaune'),
            hint: 'n',
          },
          {
            order: 4,
            word_fr: 'Orange',
            word_duala: 'epumá',
            audio_file: 'orange.wav',  // non présent dans le zip — à enregistrer
            audio_s3_key: s3Key('couleurs', 'orange.wav'),
            image_s3_key: imgKey('couleurs', 'orange'),
            hint: 'e',
          },
          {
            order: 5,
            word_fr: 'Rouge',
            word_duala: 'jóla',
            audio_file: 'rouge .wav',
            audio_s3_key: s3Key('couleurs', 'rouge.wav'),
            image_s3_key: imgKey('couleurs', 'rouge'),
            hint: 'j',
          },
          {
            order: 6,
            word_fr: 'Bleu',
            word_duala: 'bulu',
            audio_file: 'bleu .wav',
            audio_s3_key: s3Key('couleurs', 'bleu.wav'),
            image_s3_key: imgKey('couleurs', 'bleu'),
            hint: 'b',
          },
          {
            order: 7,
            word_fr: 'Vert',
            word_duala: "musono mw'éyadí",
            audio_file: 'vert.wav',
            audio_s3_key: s3Key('couleurs', 'vert.wav'),
            image_s3_key: imgKey('couleurs', 'vert'),
            hint: 'm',
          },
        ],
        exercises: STANDARD_EXERCISES,
      },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   RÉCAPITULATIF
   ══════════════════════════════════════════════════════════════
   T6  Jours de la semaine  : 7 mots  · 7 fichiers audio ✅
   T7  Pronoms personnels   : 6 mots  · 6 fichiers audio ✅
   T8  Verbe être           : 6 mots  · 6 fichiers audio ✅
   T9  Verbe avoir          : 6 mots  · 6 fichiers audio ✅
   T10 Chiffres 0-9         : 10 mots · 10 fichiers audio ✅
   T11 Couleurs             : 7 mots  · 6 fichiers audio (orange manquant)
                     TOTAL  : 42 mots · 41 fichiers audio
   ══════════════════════════════════════════════════════════════ */