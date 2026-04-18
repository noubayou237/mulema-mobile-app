import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { LessonService } from '../lesson/lesson.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class ExerciseService {
  constructor(
    private prisma: PrismaService,
    private lessonService: LessonService,
    private progressService: ProgressService,
  ) {}

  //1- Creation d'une lesson
  create(dto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: dto as any,
    });
  }

  //2-Recherche de la liste de lessons
  findByLesson(lessonId: string) {
    return this.prisma.exercise.findMany({
      where: { lessonId },
      include: { questions: true, score: true },
    });
  }

  //3-Recherche d'une lesson
  findOne(id: string) {
    return this.prisma.exercise.findUnique({
      where: { id },
      include: { questions: true, score: true },
    });
  }

  //4-Calcul du score de l'utilisateur apres avoir terminer un exercice
  private calculateScore(accuracy: number, timeSpent: number): number {
    const fast = timeSpent < 120; // 2 minutes = 120s

    if (accuracy === 100) return fast ? 700 : 620;
    if (accuracy === 90) return fast ? 570 : 520;
    if (accuracy === 79) return fast ? 480 : 420;
    if (accuracy === 59) return fast ? 390 : 340;
    return fast ? 270 : 230;
  }

  //4-Terminer un exercice
  async completeExercise(
    exerciseId: string,
    userId: string,
    accuracy: number,
    timeSpent: number,
    themeId?: string, // Ajouté pour le système Mulem
  ) {
    const scoreValue = this.calculateScore(accuracy, timeSpent);

    // Si c'est un thème Mulem et que le score est suffisant, on débloque la suite
    if (themeId && accuracy >= 60) {
      await this.progressService.unlockLessonsAfterExercise(userId, themeId);
    }

    // Récupérer l'exercice pour vérifier s'il est lié à une leçon (Legacy)
    const exercise = await this.findOne(exerciseId);
    if (!exercise && !themeId) throw new NotFoundException('Exercice introuvable');

    if (exercise?.lessonId) {
      await this.lessonService.unlockNextLesson(userId, exercise.lessonId);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update exercise (si existant dans la table Exercise legacy)
      if (exercise) {
        await tx.exercise.update({
          where: { id: exerciseId },
          data: { accuracy, timeSpent },
        });

        // 2. Save score
        await tx.score.create({
          data: {
            scoreValue,
            exerciseId,
          },
        });
      }

      // 3. Add prawns to user
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPrawns: { increment: scoreValue },
        },
      });

      return {
        exerciseId,
        accuracy,
        timeSpent,
        score: scoreValue,
      };
    });
  }
}
