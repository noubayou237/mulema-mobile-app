import { PrismaClient, QuestionType } from '@prisma/client';

/**
 * Crée le contenu pédagogique statique (Langues, Niveaux, Leçons, Exercices, Questions).
 */
export async function seedLanguages(prisma: PrismaClient) {
  console.log('Seeding languages, levels, lessons, and questions...');

  // --- Langue 1: Bassa ---
  await prisma.patrimonialLanguage.create({
    data: {
      name: 'Bassa',
      levels: {
        create: [
          // Level 1 pour Bassa
          {
            levelNumber: 1,
            title: 'Les bases et salutations',
            lessons: {
              create: [
                // Leçon 1.1
                {
                  title: 'Saluer le matin',
                  order: 1,
                  contentUrl: 'https://example.com/video/bassa/salutations',
                  exercises: {
                    create: [
                      {
                        theme: 'Salutations du matin',
                        timeSpent: 0,
                        accuracy: 0,
                        questions: {
                          create: [
                            {
                              content: 'Comment dit-on "Bonjour" en Bassa ?',
                              type: QuestionType.MATCHING,
                              correctAnswer: 'Mè yega',
                              options: ['Mè yega', 'Mbog Liaa', 'A lo yè', 'Yès'],
                            },
                            {
                              content: 'Complétez la phrase : "Comment vas-tu ?" -> "A ___ yè ?"',
                              type: QuestionType.COMPLETE_PHRASE,
                              correctAnswer: 'lo',
                              options: ['lo', 'yega', 'wè', 'gwè'],
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                // Leçon 1.2
                {
                  title: 'Prendre congé',
                  order: 2,
                  contentUrl: 'https://example.com/video/bassa/conge',
                },
              ],
            },
          },
          // Level 2 pour Bassa
          {
            levelNumber: 2,
            title: 'La famille',
            lessons: {
              create: [
                {
                  title: 'Les membres de la famille',
                  order: 1,
                  contentUrl: 'https://example.com/video/bassa/famille',
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Created language "Bassa" with its content.`);

  // --- Langue 2: Duala ---
  await prisma.patrimonialLanguage.create({
    data: {
      name: 'Duala',
      levels: {
        create: [
          {
            levelNumber: 1,
            title: 'Greetings and Basics',
            lessons: {
              create: [{ title: 'Morning Greetings', order: 1 }],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Created language "Duala" with its content.`);
}